import { describe, expect, it } from "vitest";

import {
  AuditEventSchema,
  AuditOutcomeSchema,
  BusinessReferenceSchema,
  FieldIssueSchema,
  OpaqueCursorSchema,
  PageSizeSchema,
  PaginationMetadataSchema,
  PaginationRequestSchema,
  ProblemReportReferenceSchema,
  StallReferenceSchema,
  StructuredErrorCodeSchema,
  StructuredErrorSchema,
  SyncEventNameSchema,
  SyncEventSchema,
  createPaginatedResultSchema,
} from "../../src/contracts/index.js";
import {
  VALID_AUDIT_EVENT,
  VALID_BUSINESS_REFERENCE,
  VALID_PROBLEM_REPORT_REFERENCE,
  VALID_STALL_REFERENCE,
  VALID_STRUCTURED_ERROR,
  VALID_SYNC_EVENT,
} from "../fixtures/contracts.js";

const STRUCTURED_ERROR_CODES = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "CONFLICT",
  "STALE_DATA",
  "TIMEOUT",
  "SERVICE_UNAVAILABLE",
  "MAINTENANCE",
  "UNSUPPORTED_CONTRACT_VERSION",
  "UNKNOWN",
] as const;

const SYNC_EVENT_NAMES = [
  "sync.started",
  "sync.completed",
  "sync.failed",
  "sync.conflict_detected",
] as const;

describe("business and stall references", () => {
  it("validates minimal canonical references", () => {
    expect(BusinessReferenceSchema.parse(VALID_BUSINESS_REFERENCE)).toEqual(
      VALID_BUSINESS_REFERENCE,
    );
    expect(StallReferenceSchema.parse(VALID_STALL_REFERENCE)).toEqual(VALID_STALL_REFERENCE);
  });

  it.each([
    { ...VALID_BUSINESS_REFERENCE, branch_id: "legacy_location_fixture" },
    { ...VALID_BUSINESS_REFERENCE, currency_code: "php" },
    { ...VALID_BUSINESS_REFERENCE, timezone: "UTC" },
    { ...VALID_STALL_REFERENCE, branch_id: "legacy_location_fixture" },
    { stall_id: "stall_fixture_001" },
  ])("strictly rejects invalid or legacy reference fields", (value) => {
    const schema =
      "currency_code" in value || "timezone" in value
        ? BusinessReferenceSchema
        : StallReferenceSchema;
    expect(schema.safeParse(value).success).toBe(false);
  });
});

describe("pagination primitives", () => {
  it.each([1, 25, 100])("accepts bounded page size %i", (pageSize) => {
    expect(PageSizeSchema.parse(pageSize)).toBe(pageSize);
  });

  it.each([0, 101, 1.5])("rejects invalid page size %s", (pageSize) => {
    expect(PageSizeSchema.safeParse(pageSize).success).toBe(false);
  });

  it("keeps cursors opaque and enforces the next-cursor invariant", () => {
    expect(OpaqueCursorSchema.parse("opaque:cursor:not-decoded")).toBe("opaque:cursor:not-decoded");
    expect(PaginationRequestSchema.parse({ page_size: 25, cursor: "opaque_fixture" })).toEqual({
      page_size: 25,
      cursor: "opaque_fixture",
    });
    expect(PaginationMetadataSchema.parse({ next_cursor: null, has_more: false })).toEqual({
      next_cursor: null,
      has_more: false,
    });
    expect(
      PaginationMetadataSchema.parse({ next_cursor: "opaque_fixture", has_more: true }),
    ).toEqual({ next_cursor: "opaque_fixture", has_more: true });
    expect(PaginationMetadataSchema.safeParse({ next_cursor: null, has_more: true }).success).toBe(
      false,
    );
    expect(
      PaginationMetadataSchema.safeParse({ next_cursor: "opaque_fixture", has_more: false })
        .success,
    ).toBe(false);
    expect(OpaqueCursorSchema.safeParse("").success).toBe(false);
  });

  it("builds a strict transport-neutral paginated result", () => {
    const schema = createPaginatedResultSchema(BusinessReferenceSchema);
    const value = {
      items: [VALID_BUSINESS_REFERENCE],
      pagination: { next_cursor: null, has_more: false },
    };
    expect(schema.parse(value)).toEqual(value);
    expect(schema.safeParse({ ...value, total_count: 1 }).success).toBe(false);
  });
});

describe("structured errors", () => {
  it("validates a strict field-level issue inside the shared error envelope", () => {
    const fieldIssue = {
      path: ["body", "amount_minor"],
      code: "invalid",
      message: "The synthetic amount is invalid.",
    } as const;

    expect(FieldIssueSchema.parse(fieldIssue)).toEqual(fieldIssue);
    expect(
      StructuredErrorSchema.parse({ ...VALID_STRUCTURED_ERROR, field_issues: [fieldIssue] }),
    ).toEqual({ ...VALID_STRUCTURED_ERROR, field_issues: [fieldIssue] });
    expect(FieldIssueSchema.safeParse({ ...fieldIssue, internal_value: "redacted" }).success).toBe(
      false,
    );
  });

  it("freezes and parses every approved error code", () => {
    expect(StructuredErrorCodeSchema.options).toEqual(STRUCTURED_ERROR_CODES);
    for (const code of STRUCTURED_ERROR_CODES) {
      expect(StructuredErrorSchema.parse({ ...VALID_STRUCTURED_ERROR, code }).code).toBe(code);
    }
  });

  it.each([
    { ...VALID_STRUCTURED_ERROR, code: "DATABASE_ERROR" },
    { code: "UNKNOWN", message: "Synthetic failure.", retryable: false },
    { code: "UNKNOWN", message: "Synthetic failure.", correlation_id: "corr_fixture" },
    { ...VALID_STRUCTURED_ERROR, auth_token: "redacted" },
    { ...VALID_STRUCTURED_ERROR, stack: "synthetic-internal-detail" },
    {
      ...VALID_STRUCTURED_ERROR,
      field_issues: [{ path: [], code: "invalid", message: "Synthetic field issue." }],
    },
  ])("strictly rejects unsafe error fixture", (value) => {
    expect(StructuredErrorSchema.safeParse(value).success).toBe(false);
  });
});

describe("limited sync event contract", () => {
  it("freezes the four accepted event names and validates the limited envelope", () => {
    expect(SyncEventNameSchema.options).toEqual(SYNC_EVENT_NAMES);
    for (const eventName of SYNC_EVENT_NAMES) {
      expect(SyncEventSchema.parse({ ...VALID_SYNC_EVENT, event_name: eventName }).event_name).toBe(
        eventName,
      );
    }
  });

  it.each([
    { ...VALID_SYNC_EVENT, event_name: "sync.retrying" },
    { ...VALID_SYNC_EVENT, contract_version: "v0.1.0" },
    { ...VALID_SYNC_EVENT, payload: { synthetic: true } },
    { ...VALID_SYNC_EVENT, branch_id: "legacy_location_fixture" },
  ])("rejects unsupported sync behavior", (value) => {
    expect(SyncEventSchema.safeParse(value).success).toBe(false);
  });
});

describe("limited audit event contract", () => {
  it("validates the approved event projection and outcome tokens", () => {
    expect(AuditOutcomeSchema.options).toEqual(["success", "denied", "failed"]);
    expect(AuditEventSchema.parse(VALID_AUDIT_EVENT)).toEqual(VALID_AUDIT_EVENT);
  });

  it.each([
    { ...VALID_AUDIT_EVENT, outcome: "pending" },
    { ...VALID_AUDIT_EVENT, actor_role: "Support Admin" },
    { ...VALID_AUDIT_EVENT, before_state: { synthetic: true } },
    { ...VALID_AUDIT_EVENT, raw_ip: "192.0.2.1" },
  ])("rejects unsupported audit data", (value) => {
    expect(AuditEventSchema.safeParse(value).success).toBe(false);
  });
});

describe("limited problem-report reference", () => {
  it("validates the bounded support reference", () => {
    expect(ProblemReportReferenceSchema.parse(VALID_PROBLEM_REPORT_REFERENCE)).toEqual(
      VALID_PROBLEM_REPORT_REFERENCE,
    );
  });

  it.each([
    { ...VALID_PROBLEM_REPORT_REFERENCE, category_code: "App Stability" },
    { ...VALID_PROBLEM_REPORT_REFERENCE, diagnostics: { synthetic: true } },
    { ...VALID_PROBLEM_REPORT_REFERENCE, assigned_admin: "user_fixture_admin_001" },
    { ...VALID_PROBLEM_REPORT_REFERENCE, summary: "x".repeat(181) },
  ])("rejects unsupported support workflow data", (value) => {
    expect(ProblemReportReferenceSchema.safeParse(value).success).toBe(false);
  });
});
