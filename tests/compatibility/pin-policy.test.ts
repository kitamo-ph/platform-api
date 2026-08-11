import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertInstalledPackage,
  assertLockfile,
  assertManifestDependency,
  assertPin,
  assertRuntimeMetadata,
} from "../../scripts/shared-contracts-policy.mjs";

const root = resolve(import.meta.dirname, "../..");

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(resolve(root, relativePath), "utf8")) as unknown;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function cloneRecord(value: unknown, label: string): Record<string, unknown> {
  return record(structuredClone(value), label);
}

const canonicalPin = readJson("config/shared-contracts-pin.json");
const manifest = readJson("package.json");
const lockfile = readJson("package-lock.json");
const installedPackage = readJson("node_modules/@kitamo/shared-contracts/package.json");

describe("Shared Contracts pin policy", () => {
  it("accepts the checked-in manifest, lock, installed metadata, and runtime metadata", async () => {
    expect(() => assertPin(canonicalPin)).not.toThrow();
    expect(() => assertManifestDependency(manifest, canonicalPin)).not.toThrow();
    expect(() => assertLockfile(lockfile, canonicalPin)).not.toThrow();
    expect(() => assertInstalledPackage(installedPackage, canonicalPin)).not.toThrow();

    const runtime = (await import("@kitamo/shared-contracts")) as Record<string, unknown>;
    expect(() => assertRuntimeMetadata(runtime, canonicalPin)).not.toThrow();
  });

  it("rejects a different source commit even when its archive URL is internally consistent", () => {
    const pin = cloneRecord(canonicalPin, "pin");
    const wrongCommit = "b380f19f2adcf0557b424461f869aa3d0069e176";
    pin["commit"] = wrongCommit;
    pin["sourceArchiveUrl"] =
      `https://codeload.github.com/kitamo-ph/shared-contracts/tar.gz/${wrongCommit}`;
    expect(() => assertPin(pin)).toThrow(/accepted.*commit|commit.*accepted/iu);
  });

  it("rejects a different package version even when it is valid semver", () => {
    const pin = cloneRecord(canonicalPin, "pin");
    pin["packageVersion"] = "0.1.1";
    expect(() => assertPin(pin)).toThrow(/accepted.*version|version.*accepted/iu);
  });

  it("rejects a manifest dependency pinned to another commit", () => {
    const changedManifest = cloneRecord(manifest, "manifest");
    const dependencies = record(changedManifest["dependencies"], "dependencies");
    dependencies["@kitamo/shared-contracts"] =
      "https://codeload.github.com/kitamo-ph/shared-contracts/tar.gz/b380f19f2adcf0557b424461f869aa3d0069e176";
    expect(() => assertManifestDependency(changedManifest, canonicalPin)).toThrow(
      /package\.json must pin/iu,
    );
  });

  it("rejects a missing installed-package lock entry", () => {
    const changedLock = cloneRecord(lockfile, "lockfile");
    const packages = record(changedLock["packages"], "packages");
    delete packages["node_modules/@kitamo/shared-contracts"];
    expect(() => assertLockfile(changedLock, canonicalPin)).toThrow(/entry|must be an object/iu);
  });

  it("rejects the wrong lock integrity", () => {
    const changedLock = cloneRecord(lockfile, "lockfile");
    const packages = record(changedLock["packages"], "packages");
    const installed = record(
      packages["node_modules/@kitamo/shared-contracts"],
      "installed lock entry",
    );
    installed["integrity"] = "sha512-syntheticWrongIntegrityValue";
    expect(() => assertLockfile(changedLock, canonicalPin)).toThrow(/integrity/iu);
  });

  it("rejects malformed or incomplete installed exports", () => {
    const malformed = cloneRecord(installedPackage, "installed package");
    malformed["exports"] = "./dist/index.js";
    expect(() => assertInstalledPackage(malformed, canonicalPin)).toThrow(/exports.*object/iu);

    const incomplete = cloneRecord(installedPackage, "installed package");
    const exportsMap = record(incomplete["exports"], "exports");
    delete exportsMap["./support"];
    expect(() => assertInstalledPackage(incomplete, canonicalPin)).toThrow(/exports differ/iu);
  });

  it("rejects installed and runtime package identity drift", () => {
    const changedPackage = cloneRecord(installedPackage, "installed package");
    changedPackage["version"] = "0.1.1";
    expect(() => assertInstalledPackage(changedPackage, canonicalPin)).toThrow(/version/iu);

    const runtime = {
      SHARED_CONTRACTS_PACKAGE_NAME: "@kitamo/shared-contracts",
      SHARED_CONTRACTS_VERSION: "0.1.1",
      PUBLIC_EXPORT_PATHS: record(canonicalPin, "pin")["packageExportKeys"],
    };
    expect(() => assertRuntimeMetadata(runtime, canonicalPin)).toThrow(/runtime package version/iu);
  });
});
