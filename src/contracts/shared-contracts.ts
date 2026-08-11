export {
  PUBLIC_EXPORT_PATHS,
  SHARED_CONTRACTS_PACKAGE_NAME,
  SHARED_CONTRACTS_VERSION,
} from "@kitamo/shared-contracts";

export {
  NonEmptyStringSchema,
  PrivacyClassSchema,
  SafeDisplayTextSchema,
  type NonEmptyString,
  type PrivacyClass,
  type SafeDisplayText,
} from "@kitamo/shared-contracts/common";

export {
  AppVersionIdSchema,
  AuditEventIdSchema,
  BusinessIdSchema,
  CorrelationIdSchema,
  DeviceIdSchema,
  EntityIdSchema,
  ProblemReportIdSchema,
  StallIdSchema,
  SyncEventIdSchema,
  UserIdSchema,
  type AppVersionId,
  type AuditEventId,
  type BusinessId,
  type CorrelationId,
  type DeviceId,
  type EntityId,
  type ProblemReportId,
  type StallId,
  type SyncEventId,
  type UserId,
} from "@kitamo/shared-contracts/identifiers";

export {
  BusinessReferenceSchema,
  type BusinessReference,
} from "@kitamo/shared-contracts/businesses";
export { StallReferenceSchema, type StallReference } from "@kitamo/shared-contracts/stalls";

export {
  CalendarDateSchema,
  DEFAULT_BUSINESS_TIMEZONE,
  IanaTimezoneSchema,
  TemporalSemanticFieldSchema,
  UtcInstantSchema,
  type CalendarDate,
  type IanaTimezone,
  type TemporalSemanticField,
  type UtcInstant,
} from "@kitamo/shared-contracts/time";

export {
  CurrencyCodeSchema,
  HighPrecisionDecimalSchema,
  MoneyMinorAmountSchema,
  MoneyValueSchema,
  NonNegativeMoneyMinorAmountSchema,
  NonNegativeMoneyValueSchema,
  type CurrencyCode,
  type HighPrecisionDecimal,
  type MoneyMinorAmount,
  type MoneyValue,
  type NonNegativeMoneyMinorAmount,
  type NonNegativeMoneyValue,
} from "@kitamo/shared-contracts/money";

export {
  KnownPhysicalUnitCodeSchema,
  NonNegativeQuantityDecimalSchema,
  PackagingUnitCodeSchema,
  QuantityWithUnitSchema,
  SignedQuantityDecimalSchema,
  UnitReferenceSchema,
  type KnownPhysicalUnitCode,
  type NonNegativeQuantityDecimal,
  type PackagingUnitCode,
  type QuantityWithUnit,
  type SignedQuantityDecimal,
  type UnitReference,
} from "@kitamo/shared-contracts/units";

export {
  AppVersionCodeSchema,
  AppVersionNameSchema,
  AppVersionReferenceSchema,
  CURRENT_CONTRACT_VERSION,
  ContractMetadataSchema,
  ContractVersionSchema,
  PlatformSchema,
  SUPPORTED_CONTRACT_VERSIONS,
  SchemaVersionSchema,
  UnsupportedContractVersionError,
  assertSupportedContractVersion,
  isSupportedContractVersion,
  type AppVersionCode,
  type AppVersionName,
  type AppVersionReference,
  type ContractMetadata,
  type ContractVersion,
  type Platform,
  type SchemaVersion,
  type SupportedContractVersion,
} from "@kitamo/shared-contracts/versions";

export {
  OpaqueCursorSchema,
  PageSizeSchema,
  PaginationMetadataSchema,
  PaginationRequestSchema,
  createPaginatedResultSchema,
  type OpaqueCursor,
  type PageSize,
  type PaginationMetadata,
  type PaginationRequest,
} from "@kitamo/shared-contracts/pagination";

export {
  FieldIssueSchema,
  StructuredErrorCodeSchema,
  StructuredErrorSchema,
  type FieldIssue,
  type StructuredError,
  type StructuredErrorCode,
} from "@kitamo/shared-contracts/errors";

export {
  SyncEventNameSchema,
  SyncEventSchema,
  type SyncEvent,
  type SyncEventName,
} from "@kitamo/shared-contracts/sync";

export {
  AuditEventSchema,
  AuditOutcomeSchema,
  type AuditEvent,
  type AuditOutcome,
} from "@kitamo/shared-contracts/audit";

export {
  ProblemReportCategoryCodeSchema,
  ProblemReportReferenceSchema,
  ProblemReportStatusCodeSchema,
  type ProblemReportCategoryCode,
  type ProblemReportReference,
  type ProblemReportStatusCode,
} from "@kitamo/shared-contracts/support";
