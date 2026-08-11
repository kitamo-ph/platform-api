import { isDeepStrictEqual } from "node:util";

export const APPROVED_SHARED_CONTRACTS = Object.freeze({
  repository: "https://github.com/kitamo-ph/shared-contracts.git",
  sourceArchiveUrl:
    "https://codeload.github.com/kitamo-ph/shared-contracts/tar.gz/a380f19f2adcf0557b424461f869aa3d0069e176",
  commit: "a380f19f2adcf0557b424461f869aa3d0069e176",
  packageName: "@kitamo/shared-contracts",
  packageVersion: "0.1.0",
  lockIntegrity:
    "sha512-uLlwo+G8LI6PYl54Br3cunSP20AqXPEQfotq0tMLvDwuvcKw1+LEym1FRbIF0OZ8U8wHjNx6oCAt7neRCuIhMQ==",
  packageExportKeys: Object.freeze([
    ".",
    "./common",
    "./identifiers",
    "./businesses",
    "./stalls",
    "./time",
    "./money",
    "./units",
    "./versions",
    "./pagination",
    "./errors",
    "./sync",
    "./audit",
    "./support",
  ]),
  prohibitedSubpaths: Object.freeze([
    "src",
    "compatibility",
    "conformance",
    "scripts",
    "tests",
    "docs",
    "generated",
  ]),
});

export const EXPECTED_PIN_KEYS = Object.freeze([
  "repository",
  "sourceArchiveUrl",
  "commit",
  "packageName",
  "packageVersion",
  "lockIntegrity",
  "packageExportKeys",
  "publicImportPaths",
  "prohibitedSubpaths",
]);

/** @param {string} message @returns {never} */
function fail(message) {
  throw new Error(`Shared Contracts policy violation: ${message}`);
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {Record<string, unknown>}
 */
function requireRecord(value, label) {
  if (!isRecord(value)) {
    fail(`${label} must be an object`);
  }
  return value;
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {string}
 */
function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${label} must be a non-empty string`);
  }
  return value;
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {string[]}
 */
function requireUniqueStrings(value, label) {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || item.length === 0) ||
    new Set(value).size !== value.length
  ) {
    fail(`${label} must be a non-empty array of unique strings`);
  }
  return value;
}

/** @param {unknown} pinValue */
export function assertPin(pinValue) {
  const pin = requireRecord(pinValue, "pin");
  const keys = Object.keys(pin).sort();
  if (!isDeepStrictEqual(keys, [...EXPECTED_PIN_KEYS].sort())) {
    fail(`pin fields differ from the approved shape: ${keys.join(", ")}`);
  }

  const repository = requireNonEmptyString(pin["repository"], "pin.repository");
  const sourceArchiveUrl = requireNonEmptyString(pin["sourceArchiveUrl"], "pin.sourceArchiveUrl");
  const commit = requireNonEmptyString(pin["commit"], "pin.commit");
  const packageName = requireNonEmptyString(pin["packageName"], "pin.packageName");
  const packageVersion = requireNonEmptyString(pin["packageVersion"], "pin.packageVersion");
  const lockIntegrity = requireNonEmptyString(pin["lockIntegrity"], "pin.lockIntegrity");
  const packageExportKeys = requireUniqueStrings(pin["packageExportKeys"], "pin.packageExportKeys");
  const publicImportPaths = requireUniqueStrings(pin["publicImportPaths"], "pin.publicImportPaths");
  const prohibitedSubpaths = requireUniqueStrings(
    pin["prohibitedSubpaths"],
    "pin.prohibitedSubpaths",
  );

  if (!/^[0-9a-f]{40}$/u.test(commit)) {
    fail("pin.commit must be a full lowercase SHA-1 commit identifier");
  }
  if (!sourceArchiveUrl.endsWith(`/tar.gz/${commit}`)) {
    fail("pin.sourceArchiveUrl must end with the exact approved commit");
  }
  if (repository !== APPROVED_SHARED_CONTRACTS.repository) {
    fail("pin.repository is not the approved canonical repository");
  }
  if (packageName !== APPROVED_SHARED_CONTRACTS.packageName) {
    fail("pin.packageName is not the approved package identity");
  }
  if (!/^\d+\.\d+\.\d+$/u.test(packageVersion)) {
    fail("pin.packageVersion must be an exact semantic version");
  }
  if (!lockIntegrity.startsWith("sha512-")) {
    fail("pin.lockIntegrity must be an sha512 Subresource Integrity value");
  }
  if (commit !== APPROVED_SHARED_CONTRACTS.commit) {
    fail(`pin.commit is not the accepted commit ${APPROVED_SHARED_CONTRACTS.commit}`);
  }
  if (sourceArchiveUrl !== APPROVED_SHARED_CONTRACTS.sourceArchiveUrl) {
    fail("pin.sourceArchiveUrl is not the accepted immutable archive");
  }
  if (packageVersion !== APPROVED_SHARED_CONTRACTS.packageVersion) {
    fail(
      `pin.packageVersion is not the accepted version ${APPROVED_SHARED_CONTRACTS.packageVersion}`,
    );
  }
  if (lockIntegrity !== APPROVED_SHARED_CONTRACTS.lockIntegrity) {
    fail("pin.lockIntegrity is not the reviewed archive integrity");
  }
  if (!isDeepStrictEqual(packageExportKeys, APPROVED_SHARED_CONTRACTS.packageExportKeys)) {
    fail("pin.packageExportKeys differs from the frozen public surface");
  }
  if (!isDeepStrictEqual(prohibitedSubpaths, APPROVED_SHARED_CONTRACTS.prohibitedSubpaths)) {
    fail("pin.prohibitedSubpaths differs from the reviewed denylist");
  }
  if (packageExportKeys.length !== publicImportPaths.length) {
    fail("package export and import-path counts differ");
  }
  if (packageExportKeys[0] !== "." || publicImportPaths[0] !== packageName) {
    fail("the first export and import path must describe the package root");
  }
  for (let index = 1; index < packageExportKeys.length; index += 1) {
    if (`${packageName}/${packageExportKeys[index]?.slice(2)}` !== publicImportPaths[index]) {
      fail(`export ${String(packageExportKeys[index])} does not map to its public import path`);
    }
  }

  return {
    repository,
    sourceArchiveUrl,
    commit,
    packageName,
    packageVersion,
    lockIntegrity,
    packageExportKeys,
    publicImportPaths,
    prohibitedSubpaths,
  };
}

/**
 * @param {unknown} manifestValue
 * @param {unknown} pinValue
 */
export function assertManifestDependency(manifestValue, pinValue) {
  const manifest = requireRecord(manifestValue, "package.json");
  const pin = assertPin(pinValue);
  const dependencies = requireRecord(manifest["dependencies"], "package.json dependencies");
  const actual = dependencies[pin.packageName];
  if (actual !== pin.sourceArchiveUrl) {
    fail(
      `package.json must pin ${pin.packageName} to ${pin.sourceArchiveUrl}; received ${String(actual)}`,
    );
  }
}

/**
 * @param {unknown} lockValue
 * @param {unknown} pinValue
 */
export function assertLockfile(lockValue, pinValue) {
  const lock = requireRecord(lockValue, "package-lock.json");
  const pin = assertPin(pinValue);
  if (lock["lockfileVersion"] !== 3) {
    fail(
      `package-lock.json must use lockfileVersion 3; received ${String(lock["lockfileVersion"])}`,
    );
  }

  const packages = requireRecord(lock["packages"], "package-lock.json packages");
  const root = requireRecord(packages[""], "package-lock.json root package");
  const rootDependencies = requireRecord(
    root["dependencies"],
    "package-lock.json root dependencies",
  );
  if (rootDependencies[pin.packageName] !== pin.sourceArchiveUrl) {
    fail("package-lock.json root dependency does not match the approved source archive");
  }

  const installed = requireRecord(
    packages[`node_modules/${pin.packageName}`],
    `package-lock.json ${pin.packageName} entry`,
  );
  if (installed["version"] !== pin.packageVersion) {
    fail(
      `package-lock.json version is ${String(installed["version"])}; expected ${pin.packageVersion}`,
    );
  }
  if (installed["resolved"] !== pin.sourceArchiveUrl) {
    fail("package-lock.json resolved URL does not match the approved source archive");
  }
  if (installed["integrity"] !== pin.lockIntegrity) {
    fail("package-lock.json integrity does not match the reviewed archive");
  }
}

/**
 * @param {unknown} packageValue
 * @param {unknown} pinValue
 */
export function assertInstalledPackage(packageValue, pinValue) {
  const packageMetadata = requireRecord(packageValue, "installed package metadata");
  const pin = assertPin(pinValue);
  if (packageMetadata["name"] !== pin.packageName) {
    fail(
      `installed package name is ${String(packageMetadata["name"])}; expected ${pin.packageName}`,
    );
  }
  if (packageMetadata["version"] !== pin.packageVersion) {
    fail(
      `installed package version is ${String(packageMetadata["version"])}; expected ${pin.packageVersion}`,
    );
  }
  const exportsMap = requireRecord(packageMetadata["exports"], "installed package exports");
  const actualExportKeys = Object.keys(exportsMap);
  if (!isDeepStrictEqual(actualExportKeys, pin.packageExportKeys)) {
    fail(`installed exports differ from the reviewed surface: ${actualExportKeys.join(", ")}`);
  }
}

/**
 * @param {unknown} runtimeValue
 * @param {unknown} pinValue
 */
export function assertRuntimeMetadata(runtimeValue, pinValue) {
  const runtime = requireRecord(runtimeValue, "runtime package metadata");
  const pin = assertPin(pinValue);
  if (runtime["SHARED_CONTRACTS_PACKAGE_NAME"] !== pin.packageName) {
    fail("runtime package name does not match the approved package identity");
  }
  if (runtime["SHARED_CONTRACTS_VERSION"] !== pin.packageVersion) {
    fail("runtime package version does not match the approved package version");
  }
  if (!isDeepStrictEqual(runtime["PUBLIC_EXPORT_PATHS"], pin.packageExportKeys)) {
    fail("runtime public export paths differ from the reviewed surface");
  }
}
