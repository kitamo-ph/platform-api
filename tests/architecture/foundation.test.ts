import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const sourceRoot = resolve(root, "src");
const boundaryPath = "src/contracts/shared-contracts.ts";
const sourceExtension = /\.(?:[cm]?[jt]sx?)$/u;

const APPROVED_PACKAGE_IMPORTS = [
  "@kitamo/shared-contracts",
  "@kitamo/shared-contracts/common",
  "@kitamo/shared-contracts/identifiers",
  "@kitamo/shared-contracts/businesses",
  "@kitamo/shared-contracts/stalls",
  "@kitamo/shared-contracts/time",
  "@kitamo/shared-contracts/money",
  "@kitamo/shared-contracts/units",
  "@kitamo/shared-contracts/versions",
  "@kitamo/shared-contracts/pagination",
  "@kitamo/shared-contracts/errors",
  "@kitamo/shared-contracts/sync",
  "@kitamo/shared-contracts/audit",
  "@kitamo/shared-contracts/support",
] as const;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return entry.isFile() && sourceExtension.test(entry.name) ? [path] : [];
    })
    .sort();
}

const sources = sourceFiles(sourceRoot).map((absolutePath) => ({
  path: relative(root, absolutePath),
  text: readFileSync(absolutePath, "utf8"),
}));

function sharedContractSpecifiers(text: string): string[] {
  return [
    ...text.matchAll(
      /(?:\bfrom\s+|\bimport\s+(?!\()|\b(?:import|require(?:\.resolve)?)\s*\(\s*)["'`](@kitamo\/shared-contracts(?:\/[^"'`]*)?)["'`]/gu,
    ),
  ].map((match) => match[1] ?? "");
}

describe("Shared Contracts architecture boundary", () => {
  it("allows direct package imports only in the single contract boundary", () => {
    const packageImports = sources.flatMap(({ path, text }) =>
      sharedContractSpecifiers(text).map((specifier) => ({ path, specifier })),
    );

    expect(new Set(packageImports.map(({ path }) => path))).toEqual(new Set([boundaryPath]));
    expect(packageImports.map(({ specifier }) => specifier)).toEqual(APPROVED_PACKAGE_IMPORTS);
  });

  it.each([
    'import "@kitamo/shared-contracts/errors";',
    'await import("@kitamo/shared-contracts/errors");',
    'export * from "@kitamo/shared-contracts/errors";',
  ])("recognizes side-effect, dynamic, and re-export package references", (source) => {
    expect(sharedContractSpecifiers(source)).toEqual(["@kitamo/shared-contracts/errors"]);
  });

  it("allows no Shared Contracts package import outside the boundary", () => {
    for (const source of sources.filter(({ path }) => path !== boundaryPath)) {
      expect(sharedContractSpecifiers(source.text), source.path).toEqual([]);
    }
  });

  it("prohibits deep, source-relative, compatibility, discovery, and generated imports", () => {
    const prohibited =
      /@kitamo\/shared-contracts\/(?:src|compatibility|conformance|scripts|tests|docs|generated)(?:\/|["'])|(?:\.\.\/)+shared-contracts|owner-seller-mobile|compatibility\/android/iu;
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(prohibited);
    }
  });

  it("does not define a second Zod or canonical Schema source", () => {
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(/\bfrom\s+["']zod["']/u);
      expect(source.text, source.path).not.toMatch(
        /\bz\.(?:object|string|number|enum|union|array)\s*\(/u,
      );
      expect(source.text, source.path).not.toMatch(/\b(?:export\s+)?const\s+\w+Schema\s*=/u);
    }
  });

  it("uses canonical stall terminology throughout production source", () => {
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(/\bbranches?\b|\bbranch_id\b/iu);
    }
  });
});

describe("API-1 remains transport, identity, persistence, and cloud neutral", () => {
  it("contains no server, route, HTTP listener, auth, database, queue, or cloud implementation", () => {
    const prohibitedCode = [
      /\blisten\s*\(/iu,
      /\b(?:app|router|server)\.(?:delete|get|patch|post|put|route|use)\s*\(/iu,
      /["'`]\/api\//u,
      /\b(?:Fastify|Express|Hono|Supabase|Clerk|Prisma|Drizzle|Kysely|Sequelize|PostgreSQL|Redis|OAuth|JWT)\b/iu,
      /\b(?:webhook|queue|migration|route|handler|controller)s?\b/iu,
    ];

    for (const source of sources) {
      for (const expression of prohibitedCode) {
        expect(source.text, `${source.path}: ${String(expression)}`).not.toMatch(expression);
      }
      expect(source.path).not.toMatch(/\/(?:routes?|handlers?|controllers?|http|server)\//iu);
    }
  });

  it("does not install a framework, auth provider, database, or cloud client", () => {
    const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const dependencyNames = [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ];
    const prohibitedDependency =
      /^(?:fastify|express|hono|@supabase\/|@clerk\/|@prisma\/|prisma$|drizzle|kysely|sequelize|pg$|postgres$|redis$|ioredis$|jsonwebtoken$|jose$)/u;
    expect(dependencyNames.filter((name) => prohibitedDependency.test(name))).toEqual([]);
  });
});
