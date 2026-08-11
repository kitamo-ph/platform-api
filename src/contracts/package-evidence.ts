import { SHARED_CONTRACTS_PACKAGE_NAME, SHARED_CONTRACTS_VERSION } from "./shared-contracts.js";

export const SHARED_CONTRACTS_APPROVED_COMMIT = "a380f19f2adcf0557b424461f869aa3d0069e176" as const;
export const SHARED_CONTRACTS_APPROVED_PACKAGE = "@kitamo/shared-contracts" as const;
export const SHARED_CONTRACTS_APPROVED_VERSION = "0.1.0" as const;

export function assertSharedContractsRuntimeIdentity(
  packageName: string = SHARED_CONTRACTS_PACKAGE_NAME,
  packageVersion: string = SHARED_CONTRACTS_VERSION,
): void {
  if (
    packageName !== SHARED_CONTRACTS_APPROVED_PACKAGE ||
    packageVersion !== SHARED_CONTRACTS_APPROVED_VERSION
  ) {
    throw new Error("Shared Contracts runtime identity does not match the approved API pin.");
  }
}
