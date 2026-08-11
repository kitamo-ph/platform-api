import { describe, expect, it } from "vitest";

import {
  AppVersionIdSchema,
  AuditEventIdSchema,
  BusinessIdSchema,
  CalendarDateSchema,
  CorrelationIdSchema,
  CurrencyCodeSchema,
  DEFAULT_BUSINESS_TIMEZONE,
  DeviceIdSchema,
  EntityIdSchema,
  HighPrecisionDecimalSchema,
  IanaTimezoneSchema,
  KnownPhysicalUnitCodeSchema,
  MoneyMinorAmountSchema,
  MoneyValueSchema,
  NonEmptyStringSchema,
  NonNegativeMoneyMinorAmountSchema,
  NonNegativeMoneyValueSchema,
  NonNegativeQuantityDecimalSchema,
  PackagingUnitCodeSchema,
  PrivacyClassSchema,
  ProblemReportIdSchema,
  QuantityWithUnitSchema,
  SafeDisplayTextSchema,
  SignedQuantityDecimalSchema,
  StallIdSchema,
  SyncEventIdSchema,
  TemporalSemanticFieldSchema,
  UnitReferenceSchema,
  UserIdSchema,
  UtcInstantSchema,
  type BusinessId,
} from "../../src/contracts/index.js";

const IDENTIFIER_VALIDATORS = [
  ["entity", (value: unknown) => EntityIdSchema.safeParse(value).success],
  ["business", (value: unknown) => BusinessIdSchema.safeParse(value).success],
  ["stall", (value: unknown) => StallIdSchema.safeParse(value).success],
  ["user", (value: unknown) => UserIdSchema.safeParse(value).success],
  ["device", (value: unknown) => DeviceIdSchema.safeParse(value).success],
  ["problem report", (value: unknown) => ProblemReportIdSchema.safeParse(value).success],
  ["audit event", (value: unknown) => AuditEventIdSchema.safeParse(value).success],
  ["sync event", (value: unknown) => SyncEventIdSchema.safeParse(value).success],
  ["app version", (value: unknown) => AppVersionIdSchema.safeParse(value).success],
  ["correlation", (value: unknown) => CorrelationIdSchema.safeParse(value).success],
] as const;

describe("common and opaque identifier primitives", () => {
  it("validates safe bounded text and privacy classifications", () => {
    expect(NonEmptyStringSchema.parse("synthetic")).toBe("synthetic");
    expect(SafeDisplayTextSchema.parse("Synthetic display text")).toBe("Synthetic display text");
    expect(PrivacyClassSchema.options).toEqual([
      "public",
      "internal",
      "merchant_operational",
      "personal",
      "sensitive",
      "secret_prohibited",
    ]);
    expect(NonEmptyStringSchema.safeParse("   ").success).toBe(false);
    expect(SafeDisplayTextSchema.safeParse(`unsafe${String.fromCodePoint(1)}text`).success).toBe(
      false,
    );
  });

  it.each(IDENTIFIER_VALIDATORS)("treats %s identifiers as opaque", (_name, validate) => {
    expect(validate("fixture-id:not-a-uuid")).toBe(true);
    expect(validate("")).toBe(false);
    expect(validate("   ")).toBe(false);
    expect(validate(`fixture${String.fromCodePoint(1)}id`)).toBe(false);
    expect(validate("x".repeat(201))).toBe(false);
  });

  it("preserves the branded identifier declaration boundary", () => {
    const businessId: BusinessId = BusinessIdSchema.parse("business_fixture_001");
    expect(businessId).toBe("business_fixture_001");
  });
});

describe("time primitives", () => {
  it("accepts canonical UTC instants, calendar dates, and IANA zones", () => {
    expect(UtcInstantSchema.parse("2026-08-11T00:00:00Z")).toBe("2026-08-11T00:00:00Z");
    expect(UtcInstantSchema.parse("2026-08-11T00:00:00.123Z")).toBe("2026-08-11T00:00:00.123Z");
    expect(CalendarDateSchema.parse("2024-02-29")).toBe("2024-02-29");
    expect(IanaTimezoneSchema.parse("Asia/Manila")).toBe("Asia/Manila");
    expect(DEFAULT_BUSINESS_TIMEZONE).toBe("Asia/Manila");
    expect(TemporalSemanticFieldSchema.parse("business_date")).toBe("business_date");
  });

  it.each([
    "2026-02-30T00:00:00Z",
    "2026-08-11T00:00:00",
    "2026-08-11T08:00:00+08:00",
    "2026-08-11",
  ])("rejects noncanonical instant %s", (value) => {
    expect(UtcInstantSchema.safeParse(value).success).toBe(false);
  });

  it("keeps calendar dates separate and verifies timezone registry values", () => {
    expect(CalendarDateSchema.safeParse("2025-02-29").success).toBe(false);
    expect(CalendarDateSchema.safeParse("2026-08-11T00:00:00Z").success).toBe(false);
    expect(IanaTimezoneSchema.safeParse("UTC").success).toBe(false);
    expect(IanaTimezoneSchema.safeParse("Asia/Not_A_Zone").success).toBe(false);
  });
});

describe("money, quantity, and bounded unit primitives", () => {
  it("validates currency syntax, safe minor units, and decimal strings", () => {
    expect(CurrencyCodeSchema.parse("PHP")).toBe("PHP");
    expect(MoneyMinorAmountSchema.parse(-12_500)).toBe(-12_500);
    expect(NonNegativeMoneyMinorAmountSchema.parse(12_500)).toBe(12_500);
    expect(HighPrecisionDecimalSchema.parse("12.345678901234")).toBe("12.345678901234");
    expect(MoneyValueSchema.parse({ amount_minor: 12_500, currency_code: "PHP" })).toEqual({
      amount_minor: 12_500,
      currency_code: "PHP",
    });
    expect(NonNegativeMoneyValueSchema.parse({ amount_minor: 0, currency_code: "PHP" })).toEqual({
      amount_minor: 0,
      currency_code: "PHP",
    });
  });

  it.each([
    [CurrencyCodeSchema, "php"],
    [CurrencyCodeSchema, "PH"],
    [MoneyMinorAmountSchema, 12.5],
    [MoneyMinorAmountSchema, Number.MAX_SAFE_INTEGER + 1],
    [NonNegativeMoneyMinorAmountSchema, -1],
    [HighPrecisionDecimalSchema, 1.5],
    [HighPrecisionDecimalSchema, "1.1234567890123"],
    [MoneyValueSchema, { amount_minor: 12_500 }],
    [MoneyValueSchema, { amount_minor: 12_500, currency_code: "PHP", decimal: "125.00" }],
  ] as const)("rejects an unsafe money value", (schema, value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });

  it("accepts only the reviewed quantity and unit vocabulary", () => {
    expect(SignedQuantityDecimalSchema.parse("-1.250000")).toBe("-1.250000");
    expect(NonNegativeQuantityDecimalSchema.parse("2.500000")).toBe("2.500000");
    expect(KnownPhysicalUnitCodeSchema.options).toEqual(["g", "kg"]);
    expect(PackagingUnitCodeSchema.options).toEqual(["bottle", "case", "pack", "sachet", "tray"]);
    expect(
      QuantityWithUnitSchema.parse({
        quantity: "2.500000",
        unit: { category: "physical", code: "kg" },
      }),
    ).toEqual({ quantity: "2.500000", unit: { category: "physical", code: "kg" } });
  });

  it.each([
    [SignedQuantityDecimalSchema, 1.5],
    [NonNegativeQuantityDecimalSchema, "-0.1"],
    [UnitReferenceSchema, { category: "physical", code: "mL" }],
    [UnitReferenceSchema, { category: "packaging", code: "box" }],
    [
      QuantityWithUnitSchema,
      { quantity: "1", unit: { category: "physical", code: "kg" }, extra: true },
    ],
  ] as const)("rejects an unsupported quantity or unit value", (schema, value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});
