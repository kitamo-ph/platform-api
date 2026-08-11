import {
  assertSupportedContractVersion,
  type SupportedContractVersion,
} from "./shared-contracts.js";

export function requireSupportedContractVersion(value: unknown): SupportedContractVersion {
  assertSupportedContractVersion(value);
  return value;
}
