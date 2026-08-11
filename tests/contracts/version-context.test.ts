import { describe, expect, it } from "vitest";

import {
  AppVersionReferenceSchema,
  ContractMetadataSchema,
  ContractVersionSchema,
  PlatformSchema,
  UnsupportedContractVersionError,
  isSupportedContractVersion,
  parseContractContext,
  requireSupportedContractVersion,
} from "../../src/contracts/index.js";
import {
  FIXTURE_IDS,
  MALFORMED_OR_UNSUPPORTED_CONTRACT_VERSIONS,
  VALID_APP_VERSION_REFERENCE,
} from "../fixtures/contracts.js";

describe("fail-closed contract version policy", () => {
  it("accepts only the exact supported contract version", () => {
    expect(requireSupportedContractVersion("0.1.0")).toBe("0.1.0");
    expect(isSupportedContractVersion("0.1.0")).toBe(true);
  });

  it.each(MALFORMED_OR_UNSUPPORTED_CONTRACT_VERSIONS)("rejects %s", (value) => {
    expect(isSupportedContractVersion(value)).toBe(false);
    expect(() => requireSupportedContractVersion(value)).toThrow(UnsupportedContractVersionError);
  });

  it("distinguishes semantic-version syntax from supported-version policy", () => {
    expect(ContractVersionSchema.safeParse("0.1.1").success).toBe(true);
    expect(isSupportedContractVersion("0.1.1")).toBe(false);
  });

  it.each([undefined, null, true, 1, ""])("rejects non-version input %j", (value) => {
    expect(() => requireSupportedContractVersion(value)).toThrow(UnsupportedContractVersionError);
  });
});

describe("version metadata primitives", () => {
  it("validates the bounded app-version reference and platform registry", () => {
    expect(PlatformSchema.options).toEqual(["android", "web"]);
    expect(AppVersionReferenceSchema.parse(VALID_APP_VERSION_REFERENCE)).toEqual(
      VALID_APP_VERSION_REFERENCE,
    );
    expect(
      ContractMetadataSchema.parse({
        contract_version: "0.1.0",
        schema_version: "contract-context/1",
      }),
    ).toEqual({ contract_version: "0.1.0", schema_version: "contract-context/1" });
  });

  it.each([
    { ...VALID_APP_VERSION_REFERENCE, platform: "ios" },
    { ...VALID_APP_VERSION_REFERENCE, release_channel: "internal" },
    { contract_version: "v0.1.0", schema_version: "contract-context/1" },
    { contract_version: "0.1.0", schema_version: "   " },
    { contract_version: "0.1.0", schema_version: "contract-context/1", latest: true },
  ])("strictly rejects malformed version metadata", (value) => {
    const schema = "version_name" in value ? AppVersionReferenceSchema : ContractMetadataSchema;
    expect(schema.safeParse(value).success).toBe(false);
  });
});

describe("transport-neutral contract context", () => {
  it("parses only contract_version and correlation_id", () => {
    expect(
      parseContractContext({
        contract_version: "0.1.0",
        correlation_id: FIXTURE_IDS.correlation,
      }),
    ).toEqual({
      contract_version: "0.1.0",
      correlation_id: FIXTURE_IDS.correlation,
    });
  });

  it.each([
    null,
    undefined,
    [],
    "0.1.0",
    {},
    { contract_version: "0.1.0" },
    { correlation_id: FIXTURE_IDS.correlation },
    {
      contract_version: "0.1.0",
      correlation_id: FIXTURE_IDS.correlation,
      user_id: FIXTURE_IDS.user,
    },
  ])("rejects a non-exact context shape", (value) => {
    expect(() => parseContractContext(value)).toThrow();
  });

  it.each(MALFORMED_OR_UNSUPPORTED_CONTRACT_VERSIONS)(
    "rejects context contract version %s",
    (contractVersion) => {
      expect(() =>
        parseContractContext({
          contract_version: contractVersion,
          correlation_id: FIXTURE_IDS.correlation,
        }),
      ).toThrow(UnsupportedContractVersionError);
    },
  );

  it.each(["", "   ", `correlation${String.fromCodePoint(1)}fixture`, "x".repeat(201)])(
    "rejects unsafe correlation identifier %j",
    (correlationId) => {
      expect(() =>
        parseContractContext({
          contract_version: "0.1.0",
          correlation_id: correlationId,
        }),
      ).toThrow();
    },
  );
});
