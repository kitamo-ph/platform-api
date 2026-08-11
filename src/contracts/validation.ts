import {
  CorrelationIdSchema,
  type CorrelationId,
  type SupportedContractVersion,
} from "./shared-contracts.js";
import { requireSupportedContractVersion } from "./contract-version.js";

export interface ContractContext {
  readonly contract_version: SupportedContractVersion;
  readonly correlation_id: CorrelationId;
}

export function parseContractContext(value: unknown): ContractContext {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Contract context must be an object.");
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (
    keys.length !== 2 ||
    !Object.hasOwn(record, "contract_version") ||
    !Object.hasOwn(record, "correlation_id")
  ) {
    throw new TypeError("Contract context must contain only contract_version and correlation_id.");
  }

  return {
    contract_version: requireSupportedContractVersion(record["contract_version"]),
    correlation_id: CorrelationIdSchema.parse(record["correlation_id"]),
  };
}
