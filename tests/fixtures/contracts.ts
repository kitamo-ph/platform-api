export const FIXTURE_IDS = {
  appVersion: "app_version_fixture_001",
  auditEvent: "audit_fixture_001",
  business: "business_fixture_001",
  correlation: "correlation_fixture_001",
  device: "device_fixture_001",
  entity: "entity_fixture_001",
  problemReport: "problem_report_fixture_001",
  stall: "stall_fixture_001",
  syncEvent: "sync_fixture_001",
  user: "user_fixture_001",
} as const;

export const VALID_BUSINESS_REFERENCE = {
  business_id: FIXTURE_IDS.business,
  display_name: "Synthetic Manila Store",
  timezone: "Asia/Manila",
  currency_code: "PHP",
} as const;

export const VALID_STALL_REFERENCE = {
  stall_id: FIXTURE_IDS.stall,
  business_id: FIXTURE_IDS.business,
  display_name: "Synthetic Training Stall",
} as const;

export const VALID_APP_VERSION_REFERENCE = {
  version_name: "0.9.0-internal",
  version_code: "90001",
  platform: "android",
} as const;

export const VALID_STRUCTURED_ERROR = {
  code: "NOT_FOUND",
  message: "The synthetic record was not found.",
  correlation_id: FIXTURE_IDS.correlation,
  retryable: false,
} as const;

export const VALID_SYNC_EVENT = {
  event_id: FIXTURE_IDS.syncEvent,
  event_name: "sync.started",
  occurred_at: "2026-08-11T00:00:00Z",
  correlation_id: FIXTURE_IDS.correlation,
  business_id: FIXTURE_IDS.business,
  stall_id: FIXTURE_IDS.stall,
  device_id: FIXTURE_IDS.device,
  app_version: VALID_APP_VERSION_REFERENCE,
  contract_version: "0.1.0",
} as const;

export const VALID_AUDIT_EVENT = {
  audit_event_id: FIXTURE_IDS.auditEvent,
  actor_user_id: FIXTURE_IDS.user,
  actor_role: "support_admin",
  action: "support.report_viewed",
  target_type: "problem_report",
  target_id: FIXTURE_IDS.problemReport,
  outcome: "success",
  occurred_at: "2026-08-11T00:00:01Z",
  correlation_id: FIXTURE_IDS.correlation,
  business_id: FIXTURE_IDS.business,
  stall_id: FIXTURE_IDS.stall,
  device_id: FIXTURE_IDS.device,
  app_version_code: "90001",
} as const;

export const VALID_PROBLEM_REPORT_REFERENCE = {
  problem_report_id: FIXTURE_IDS.problemReport,
  business_id: FIXTURE_IDS.business,
  stall_id: FIXTURE_IDS.stall,
  device_id: FIXTURE_IDS.device,
  app_version: VALID_APP_VERSION_REFERENCE,
  category_code: "app_stability",
  status_code: "received",
  reported_at: "2026-08-11T00:00:02Z",
  summary: "Synthetic low-memory validation report.",
} as const;

export const MALFORMED_OR_UNSUPPORTED_CONTRACT_VERSIONS = [
  "v0.1.0",
  "0.1",
  "latest",
  "*",
  "foo",
  "0.1.1",
  "0.2.0",
  "1.0.0",
] as const;
