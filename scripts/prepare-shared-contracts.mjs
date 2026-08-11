import { execFileSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  assertInstalledPackage,
  assertLockfile,
  assertManifestDependency,
  assertPin,
  assertRuntimeMetadata,
} from "./shared-contracts-policy.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @param {string} relativePath @returns {Promise<unknown>} */
async function readJson(relativePath) {
  const content = await readFile(join(root, relativePath), "utf8");
  return JSON.parse(content);
}

function assertSupportedNode() {
  const [major = 0, minor = 0, patch = 0] = process.versions.node
    .split(".")
    .map((value) => Number.parseInt(value, 10));
  const supported = major > 20 || (major === 20 && (minor > 19 || (minor === 19 && patch >= 4)));
  if (!supported) {
    throw new Error(`Node ${process.versions.node} is unsupported; expected >=20.19.4`);
  }
}

/** @param {ReturnType<typeof assertPin>} pin */
async function assertPublicImports(pin) {
  for (const importPath of pin.publicImportPaths) {
    await import(importPath);
  }

  for (const subpath of pin.prohibitedSubpaths) {
    const importPath = `${pin.packageName}/${subpath}`;
    try {
      await import(importPath);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ERR_PACKAGE_PATH_NOT_EXPORTED"
      ) {
        continue;
      }
      throw error;
    }
    throw new Error(`Prohibited Shared Contracts path unexpectedly imported: ${importPath}`);
  }
}

assertSupportedNode();

const pinValue = await readJson("config/shared-contracts-pin.json");
const manifest = await readJson("package.json");
const lockfile = await readJson("package-lock.json");
const installedPackage = await readJson("node_modules/@kitamo/shared-contracts/package.json");
const pin = assertPin(pinValue);

assertManifestDependency(manifest, pin);
assertLockfile(lockfile, pin);
assertInstalledPackage(installedPackage, pin);

const installedPackageRoot = join(root, "node_modules", "@kitamo", "shared-contracts");
await rm(join(installedPackageRoot, "dist"), { force: true, recursive: true });

const tscExecutable = join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsc.cmd" : "tsc",
);
execFileSync(tscExecutable, ["-p", join(installedPackageRoot, "tsconfig.build.json")], {
  cwd: root,
  stdio: "inherit",
});

const runtime = await import(pin.packageName);
assertRuntimeMetadata(runtime, pin);
await assertPublicImports(pin);

const installedPackageUrl = pathToFileURL(join(installedPackageRoot, "package.json"));
console.log(
  `Prepared ${pin.packageName}@${pin.packageVersion} from ${pin.commit} (${installedPackageUrl.href}).`,
);
