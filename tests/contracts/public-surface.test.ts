import { createRequire } from "node:module";

import * as audit from "@kitamo/shared-contracts/audit";
import * as businesses from "@kitamo/shared-contracts/businesses";
import * as common from "@kitamo/shared-contracts/common";
import * as errors from "@kitamo/shared-contracts/errors";
import * as identifiers from "@kitamo/shared-contracts/identifiers";
import * as money from "@kitamo/shared-contracts/money";
import * as pagination from "@kitamo/shared-contracts/pagination";
import * as root from "@kitamo/shared-contracts";
import * as stalls from "@kitamo/shared-contracts/stalls";
import * as support from "@kitamo/shared-contracts/support";
import * as sync from "@kitamo/shared-contracts/sync";
import * as time from "@kitamo/shared-contracts/time";
import * as units from "@kitamo/shared-contracts/units";
import * as versions from "@kitamo/shared-contracts/versions";
import { describe, expect, it } from "vitest";

import {
  SHARED_CONTRACTS_APPROVED_COMMIT,
  SHARED_CONTRACTS_APPROVED_PACKAGE,
  SHARED_CONTRACTS_APPROVED_VERSION,
  assertSharedContractsRuntimeIdentity,
} from "../../src/contracts/package-evidence.js";

const EXPECTED_EXPORT_KEYS = [
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
] as const;

const PUBLIC_MODULES = [
  [
    "@kitamo/shared-contracts",
    root,
    ["PUBLIC_EXPORT_PATHS", "SHARED_CONTRACTS_PACKAGE_NAME", "SHARED_CONTRACTS_VERSION"],
  ],
  [
    "@kitamo/shared-contracts/common",
    common,
    ["NonEmptyStringSchema", "PrivacyClassSchema", "SafeDisplayTextSchema"],
  ],
  [
    "@kitamo/shared-contracts/identifiers",
    identifiers,
    [
      "AppVersionIdSchema",
      "AuditEventIdSchema",
      "BusinessIdSchema",
      "CorrelationIdSchema",
      "DeviceIdSchema",
      "EntityIdSchema",
      "ProblemReportIdSchema",
      "StallIdSchema",
      "SyncEventIdSchema",
      "UserIdSchema",
    ],
  ],
  ["@kitamo/shared-contracts/businesses", businesses, ["BusinessReferenceSchema"]],
  ["@kitamo/shared-contracts/stalls", stalls, ["StallReferenceSchema"]],
  [
    "@kitamo/shared-contracts/time",
    time,
    [
      "CalendarDateSchema",
      "DEFAULT_BUSINESS_TIMEZONE",
      "IanaTimezoneSchema",
      "TemporalSemanticFieldSchema",
      "UtcInstantSchema",
    ],
  ],
  [
    "@kitamo/shared-contracts/money",
    money,
    [
      "CurrencyCodeSchema",
      "HighPrecisionDecimalSchema",
      "MoneyMinorAmountSchema",
      "MoneyValueSchema",
      "NonNegativeMoneyMinorAmountSchema",
      "NonNegativeMoneyValueSchema",
    ],
  ],
  [
    "@kitamo/shared-contracts/units",
    units,
    [
      "KnownPhysicalUnitCodeSchema",
      "NonNegativeQuantityDecimalSchema",
      "PackagingUnitCodeSchema",
      "QuantityWithUnitSchema",
      "SignedQuantityDecimalSchema",
      "UnitReferenceSchema",
    ],
  ],
  [
    "@kitamo/shared-contracts/versions",
    versions,
    [
      "AppVersionCodeSchema",
      "AppVersionNameSchema",
      "AppVersionReferenceSchema",
      "CURRENT_CONTRACT_VERSION",
      "ContractMetadataSchema",
      "ContractVersionSchema",
      "PlatformSchema",
      "SUPPORTED_CONTRACT_VERSIONS",
      "SchemaVersionSchema",
      "UnsupportedContractVersionError",
      "assertSupportedContractVersion",
      "isSupportedContractVersion",
    ],
  ],
  [
    "@kitamo/shared-contracts/pagination",
    pagination,
    [
      "OpaqueCursorSchema",
      "PageSizeSchema",
      "PaginationMetadataSchema",
      "PaginationRequestSchema",
      "createPaginatedResultSchema",
    ],
  ],
  [
    "@kitamo/shared-contracts/errors",
    errors,
    ["FieldIssueSchema", "StructuredErrorCodeSchema", "StructuredErrorSchema"],
  ],
  ["@kitamo/shared-contracts/sync", sync, ["SyncEventNameSchema", "SyncEventSchema"]],
  ["@kitamo/shared-contracts/audit", audit, ["AuditEventSchema", "AuditOutcomeSchema"]],
  [
    "@kitamo/shared-contracts/support",
    support,
    [
      "ProblemReportCategoryCodeSchema",
      "ProblemReportReferenceSchema",
      "ProblemReportStatusCodeSchema",
    ],
  ],
] as const;

const PROHIBITED_SUBPATHS = [
  "src",
  "compatibility",
  "conformance",
  "scripts",
  "tests",
  "docs",
  "generated",
];
const require = createRequire(import.meta.url);

function errorCode(error: unknown): unknown {
  if (typeof error === "object" && error !== null && "code" in error) {
    return error.code;
  }
  return undefined;
}

describe("approved Shared Contracts package surface", () => {
  it("records the exact accepted package, version, and source commit", () => {
    expect(SHARED_CONTRACTS_APPROVED_PACKAGE).toBe("@kitamo/shared-contracts");
    expect(SHARED_CONTRACTS_APPROVED_VERSION).toBe("0.1.0");
    expect(SHARED_CONTRACTS_APPROVED_COMMIT).toBe("a380f19f2adcf0557b424461f869aa3d0069e176");
    expect(root.SHARED_CONTRACTS_PACKAGE_NAME).toBe(SHARED_CONTRACTS_APPROVED_PACKAGE);
    expect(root.SHARED_CONTRACTS_VERSION).toBe(SHARED_CONTRACTS_APPROVED_VERSION);
    expect(root.PUBLIC_EXPORT_PATHS).toEqual(EXPECTED_EXPORT_KEYS);
  });

  it("fails closed when runtime package identity drifts", () => {
    expect(() => assertSharedContractsRuntimeIdentity()).not.toThrow();
    expect(() => assertSharedContractsRuntimeIdentity("@kitamo/wrong", "0.1.0")).toThrow(
      "Shared Contracts runtime identity does not match the approved API pin.",
    );
    expect(() => assertSharedContractsRuntimeIdentity("@kitamo/shared-contracts", "0.1.1")).toThrow(
      "Shared Contracts runtime identity does not match the approved API pin.",
    );
  });

  it.each(PUBLIC_MODULES)("imports %s with its exact runtime exports", (_path, module, keys) => {
    expect(Object.keys(module).sort()).toEqual([...keys].sort());
  });

  it.each(PROHIBITED_SUBPATHS)("fails closed for prohibited package path %s", (subpath) => {
    let failure: unknown;
    try {
      require.resolve(`@kitamo/shared-contracts/${subpath}`);
    } catch (error) {
      failure = error;
    }
    expect(errorCode(failure)).toBe("ERR_PACKAGE_PATH_NOT_EXPORTED");
  });
});
