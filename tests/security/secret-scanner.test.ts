import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { scanContent } from "../../scripts/check-secrets.mjs";

describe("secret scanner", () => {
  it.each([
    ["identity.pem", ["-----BEGIN PRI", "VATE KEY-----\nfixture-material"].join("")],
    [".env", ["CLERK_SECRET", "_KEY=sk_", "test_abcdefghijklmnopqrstuvwxyz"].join("")],
    [
      ".env.local",
      ["SUPABASE_SERVICE_ROLE_KEY=eyJabcdefghijk", ".abcdefghijklmnop", ".abcdefghijklmnop"].join(
        "",
      ),
    ],
    ["settings", ["AUTH_", "TOKEN=fixture-token-value-12345"].join("")],
    ["config.json", ['"client_', 'secret": "fixture-client-secret-12345"'].join("")],
    ["database.env", ["DATABASE_PASS", "WORD=fixture-password-12345"].join("")],
    ["lock.txt", ["Authorization: Bea", "rer fixtureBearerTokenValue123456789"].join("")],
    [
      "service.env",
      ["DATABASE_URL=postgre", "sql://service:fixture-password@db.invalid/app"].join(""),
    ],
  ])("detects a credential in extension-agnostic file %s", (file, content) => {
    expect(scanContent(file, content)).not.toEqual([]);
  });

  it.each([
    [".env.example", "CLERK_SECRET_KEY=replace-me"],
    [".env.example", "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}"],
    ["config.ts", "const authToken = process.env.AUTH_TOKEN;"],
    [".env.example", "PUBLIC_SUPABASE_ANON_KEY=synthetic-public-value"],
  ])("allows a non-secret placeholder in %s", (file, content) => {
    expect(scanContent(file, content)).toEqual([]);
  });

  it("scans the lockfile without flagging the reviewed dependency graph", () => {
    const lockfile = readFileSync(resolve(import.meta.dirname, "../../package-lock.json"), "utf8");
    expect(scanContent("package-lock.json", lockfile)).toEqual([]);
  });
});
