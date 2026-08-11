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

function fastifySpecifiers(text: string): string[] {
  return [
    ...text.matchAll(
      /(?:\bfrom\s+|\bimport\s+(?!\()|\b(?:import|require(?:\.resolve)?)\s*\(\s*)["'`](fastify|@fastify\/[^"'`]+)["'`]/gu,
    ),
  ].map((match) => match[1] ?? "");
}

const listenerCall = /\blisten\s*\(|\[\s*["'`]listen["'`]\s*\]\s*\(/u;
const routeRegistration =
  /\.\s*(?:all|delete|get|head|options|patch|post|put|register|route|use)\s*\(/iu;
const bracketRouteRegistration =
  /\[\s*["'`](?:all|delete|get|head|options|patch|post|put|register|route|use)["'`]\s*\]\s*\(/iu;

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

describe("API-2 transport and runtime architecture", () => {
  it("confines Fastify to transport, composition, and runtime layers", () => {
    const allowedLayers = /^src\/(?:transport|composition|runtime)\//u;
    for (const source of sources) {
      const fastifyReferences = fastifySpecifiers(source.text);
      if (fastifyReferences.length > 0) {
        expect(source.path, source.path).toMatch(allowedLayers);
        expect(
          fastifyReferences.every((specifier) => specifier === "fastify"),
          source.path,
        ).toBe(true);
      }
      if (/^src\/(?:application|policies|ports|contracts|config)\//u.test(source.path)) {
        expect(source.text, source.path).not.toMatch(/\bFastify\b|["'`]@?fastify/u);
        expect(source.text, source.path).not.toMatch(
          /["'`](?:\.\.\/)+(?:transport|composition|runtime)(?:\/|["'`])|["'`](?:\.\.\/)+index(?:\.[cm]?[jt]sx?)?["'`]/u,
        );
      }
    }
  });

  it.each([
    'import "fastify";',
    'await import("fastify");',
    'const framework = require("fastify");',
    'require.resolve("@fastify/cors");',
  ])("recognizes ESM and CommonJS Fastify references", (source) => {
    expect(fastifySpecifiers(source)).toHaveLength(1);
  });

  it("permits the network listener only in the explicit runtime entrypoint", () => {
    const listenerSources = sources.filter(({ text }) => listenerCall.test(text));
    expect(listenerSources.map(({ path }) => path)).toEqual(["src/runtime/start.ts"]);
    expect(listenerSources[0]?.text).toMatch(/isDirectRuntimeInvocation\(import\.meta\.url\)/u);
    for (const source of sources.filter(({ path }) => path !== "src/runtime/start.ts")) {
      expect(source.text, source.path).not.toMatch(/\b(?:runRuntimeMain|startRuntime)\s*\(/u);
    }
  });

  it.each([
    "server.listen({ port: 3000 });",
    'server["listen"]({ port: 3000 });',
    "const { listen } = server; listen({ port: 3000 });",
  ])("recognizes direct, bracketed, and destructured listener calls", (source) => {
    expect(source).toMatch(listenerCall);
  });

  it("contains no production operation, merchant route, or test-only route registration", () => {
    const prohibitedRouteLiteral = /["'`]\/(?:__test__|api|health|ready|metrics)(?:\/|["'`])/iu;

    for (const source of sources) {
      const routeCandidateText = source.text.replace(/\bReflect\.get\s*\(/gu, "");
      expect(routeCandidateText, source.path).not.toMatch(routeRegistration);
      expect(routeCandidateText, source.path).not.toMatch(bracketRouteRegistration);
      expect(source.text, source.path).not.toMatch(prohibitedRouteLiteral);
      expect(source.path, source.path).not.toMatch(/\/(?:routes?|handlers?|controllers?)\//iu);
    }
  });

  it.each([
    'transport.post("/merchant", handler);',
    'transport["route"]({ method: "GET", url: path });',
    "instance.register(plugin);",
  ])("recognizes route and plugin registration regardless of variable name", (source) => {
    expect(routeRegistration.test(source) || bracketRouteRegistration.test(source)).toBe(true);
  });

  it("keeps identity, persistence, queue, and cloud integrations absent", () => {
    const prohibitedCode =
      /\b(?:Express|Hono|Supabase|Clerk|Prisma|Drizzle|Kysely|Sequelize|PostgreSQL|Redis|OAuth|JWT|webhook|migration|BullMQ|RabbitMQ|Kafka)\b/iu;
    const prohibitedAuthorityHeader =
      /["'`](?:user_id|role|business_id|stall_id|authorization)["'`]\s*:/iu;
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(prohibitedCode);
      expect(source.text, source.path).not.toMatch(prohibitedAuthorityHeader);
    }
  });

  it("pins only Fastify as the approved transport dependency", () => {
    const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const dependencyNames = [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ];
    expect(manifest.dependencies?.["fastify"]).toBe("5.11.3");
    expect(dependencyNames.filter((name) => /^(?:fastify|@fastify\/)/u.test(name))).toEqual([
      "fastify",
    ]);

    const prohibitedDependency =
      /^(?:express|hono|@supabase\/|@clerk\/|@prisma\/|prisma$|drizzle|kysely|sequelize|typeorm$|mongoose$|mongodb$|mysql2$|pg$|postgres$|redis$|ioredis$|bullmq$|amqplib$|kafkajs$|jsonwebtoken$|jose$|swagger|openapi|@aws-sdk\/|firebase)/u;
    expect(dependencyNames.filter((name) => prohibitedDependency.test(name))).toEqual([]);
  });

  it("locks the fail-closed transport defaults in production source", () => {
    const serverFactory = sources.find(({ path }) => path === "src/transport/server.ts")?.text;
    const runtimeConfig = sources.find(({ path }) => path === "src/config/runtime-config.ts")?.text;
    expect(serverFactory).toContain("bodyLimit: TRANSPORT_BODY_LIMIT_BYTES");
    expect(serverFactory).toContain("trustProxy: false");
    expect(serverFactory).toContain("requestIdHeader: false");
    expect(serverFactory).toContain("return503OnClosing: false");
    expect(serverFactory).toContain('decorate("beginTransportDrain"');
    expect(serverFactory).toContain('removeContentTypeParser("text/plain")');
    expect(runtimeConfig).toContain('candidate === "production"');
    expect(runtimeConfig).toContain('value ?? "127.0.0.1"');
  });
});
