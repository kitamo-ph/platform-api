import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(import.meta.dirname, "..");
const scannerPath = "scripts/check-secrets.mjs";

export const STATIC_SECRET_PATTERNS = Object.freeze([
  {
    name: "private key",
    expression: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/u,
  },
  {
    name: "GitHub token",
    expression: /\b(?:gh[oprsu]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/u,
  },
  {
    name: "provider secret key",
    expression:
      /\b(?:sk_(?:live|test)_[A-Za-z0-9_-]{16,}|sk-(?:proj|svcacct)-[A-Za-z0-9_-]{16,}|sb_secret_[A-Za-z0-9_-]{16,})\b/u,
  },
  { name: "AWS access key", expression: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/u },
  { name: "Google API key", expression: /\bAIza[0-9A-Za-z_-]{30,}\b/u },
  {
    name: "JSON Web Token",
    expression: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  },
  { name: "authorization bearer token", expression: /\bBearer\s+[A-Za-z0-9._~-]{20,}\b/u },
  {
    name: "credential-bearing service URL",
    expression: /\b(?:mysql|postgres|postgresql|redis):\/\/[^:\s/]+:[^@\s/]+@/iu,
  },
]);

const sensitiveKey =
  /(?:^|_)(?:API_?KEY|AUTH_?TOKEN|CLIENT_?SECRET|CREDENTIALS?|PASSWORD|PASSWD|PRIVATE_?KEY|SECRET|SERVICE_?ROLE(?:_?KEY)?|TOKEN)(?:_|$)/u;
const safeValue =
  /^(?:|change[-_]?me|example|fake|not[-_]?set|placeholder|redacted|replace[-_]?me|synthetic|test|todo|your[-_])(?:$|[-_])/iu;

/** @param {string} key */
function normalizeKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/gu, "$1_$2")
    .replace(/[^A-Za-z0-9]+/gu, "_")
    .toUpperCase();
}

/** @param {string} value */
function normalizeValue(value) {
  return value
    .trim()
    .replace(/[,;]$/u, "")
    .trim()
    .replace(/^(?:["'`])|(?:["'`])$/gu, "")
    .trim();
}

/** @param {string} value */
function isReferenceOrPlaceholder(value) {
  return (
    value.length < 12 ||
    safeValue.test(value) ||
    /^(?:process\.env\.|Deno\.env\.|import\.meta\.env\.|\$\{|\{\{|<[^>]+>$)/u.test(value)
  );
}

/**
 * Scan one text file without requiring it to have a recognized extension.
 *
 * @param {string} file
 * @param {string} content
 * @returns {string[]}
 */
export function scanContent(file, content) {
  if (content.includes("\0")) return [];

  const findings = [];
  for (const pattern of STATIC_SECRET_PATTERNS) {
    if (pattern.expression.test(content)) findings.push(`${file}: ${pattern.name}`);
  }

  for (const line of content.split(/\r?\n/u)) {
    const assignment = line.match(
      /^\s*(?:export\s+)?(?:(?:const|let|var)\s+)?["']?([A-Za-z][A-Za-z0-9_.-]*)["']?\s*(?::|=)\s*(.+?)\s*$/u,
    );
    if (!assignment) continue;

    const key = normalizeKey(assignment[1] ?? "");
    const value = normalizeValue(assignment[2] ?? "");
    const explicitlyPublic = /(?:^|_)(?:ANON|PUBLIC|PUBLISHABLE)(?:_|$)/u.test(key);
    if (sensitiveKey.test(key) && !explicitlyPublic && !isReferenceOrPlaceholder(value)) {
      findings.push(`${file}: assigned secret in ${key}`);
    }
  }

  return [...new Set(findings)];
}

async function main() {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "utf8" },
  );
  const files = output
    .split("\0")
    .filter(Boolean)
    .filter((file) => file !== scannerPath);
  const findings = [];

  for (const file of files) {
    let content;
    try {
      content = await readFile(resolve(root, file), "utf8");
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        continue;
      }
      throw error;
    }
    findings.push(...scanContent(file, content));
  }

  if (findings.length > 0) {
    throw new Error(`Potential secrets found:\n${findings.join("\n")}`);
  }

  console.log(`Secret scan passed for ${files.length} Platform API files.`);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
