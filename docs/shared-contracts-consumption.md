# Shared Contracts Consumption Evidence

## Current API-1 foundation and API-2 preservation (2026-08-11)

```text
API-0: complete
Shared Contracts SC-0 through SC-4: complete and frozen for this phase
API-1: complete for the bounded Shared Contracts consumer foundation
API-2: transport foundation implemented locally; final acceptance pending
Production API implementation: not authorized
```

The accepted authority is:

| Field                      | Exact value                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Source repository          | `https://github.com/kitamo-ph/shared-contracts.git`                                                      |
| Accepted commit            | `a380f19f2adcf0557b424461f869aa3d0069e176`                                                               |
| Package                    | `@kitamo/shared-contracts`                                                                               |
| Package version            | `0.1.0`                                                                                                  |
| Source archive             | `https://codeload.github.com/kitamo-ph/shared-contracts/tar.gz/a380f19f2adcf0557b424461f869aa3d0069e176` |
| Reviewed archive integrity | `sha512-uLlwo+G8LI6PYl54Br3cunSP20AqXPEQfotq0tMLvDwuvcKw1+LEym1FRbIF0OZ8U8wHjNx6oCAt7neRCuIhMQ==`        |
| Pin record                 | `config/shared-contracts-pin.json`                                                                       |
| Runtime boundary           | `src/contracts/shared-contracts.ts`                                                                      |

This resolves the historical package-absence blocker only. API-2 builds a
transport server around this unchanged boundary, but it does not create
merchant-domain schemas, an authenticated principal, authorization, database
models, production sync, audit persistence, support workflow, or any production
route.

## Reproducible acquisition and build

Shared Contracts is intentionally not published to npm. Platform API uses the
exact GitHub source archive for the accepted commit as its normal npm
dependency. The manifest, lockfile, and pin record must all name the same
archive. `npm ci` verifies and installs the lockfile artifact under
`node_modules/@kitamo/shared-contracts` without reading any sibling checkout.

The archive contains the accepted source and package metadata but not a
prebuilt `dist` directory. `npm run prepare:contracts` therefore performs the
consumer-owned preparation step:

1. enforce Node `>=20.19.4`;
2. validate the pin record shape and exact repository/archive/commit/package/
   version values;
3. validate `package.json` and lockfile v3 resolution and SHA-512 integrity;
4. validate the installed package name, version, and exact export keys;
5. compile only the installed package copy using Platform API's pinned
   TypeScript compiler;
6. validate runtime package metadata;
7. import all 14 approved public paths; and
8. require `ERR_PACKAGE_PATH_NOT_EXPORTED` for the prohibited `src`,
   `compatibility`, `conformance`, `scripts`, `tests`, `docs`, and `generated`
   subpaths.

The build never edits `~/Documents/KitaMo-ph/shared-contracts`. Generated
dependency output remains under ignored `node_modules` and is never committed.
CI runs the same `npm ci` and `npm run verify` workflow from a clean checkout.

### Evaluated alternatives

| Mechanism                                                      | Decision                           | Evidence and reason                                                                                                                                                                                      |
| -------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unpinned branch or `latest`                                    | Rejected                           | Mutable authority; cannot prove the accepted commit or fail closed                                                                                                                                       |
| Arbitrary `../shared-contracts` checkout or `file:` dependency | Rejected                           | Depends on developer-local sibling state and is not CI-safe                                                                                                                                              |
| Direct Git dependency at the commit                            | Rejected                           | The accepted producer uses `prepack`, not a consumer-install `prepare` lifecycle, so the tested flow did not provide a usable built declared export surface; API-1 may not modify the producer to fix it |
| Locally regenerated `npm pack` tarball                         | Rejected as the authority artifact | Although its contents could be consumed, the tarball bytes differed across the tested platforms, so one committed byte-integrity pin would not be reproducible cross-platform                            |
| Exact GitHub source archive plus consumer-local build          | Accepted                           | Immutable commit URL, lockfile integrity, normal Node resolution, no sibling-state dependency, no copied schemas, no producer mutation, and deterministic semantic/package checks                        |

### Fail-closed behavior

Preparation fails on a malformed pin, wrong commit URL, wrong repository,
wrong package name or version, lockfile drift, wrong integrity, absent package,
changed export keys, build failure, runtime metadata mismatch, missing public
path, or newly reachable prohibited subpath. There is no fallback to `main`,
`latest`, another version, an existing sibling, or a locally cached substitute.

## Approved public imports and symbols actually consumed

All imports are centralized in `src/contracts/shared-contracts.ts`.

| Public package path                    | Symbols consumed or re-exported by the Platform API boundary                                                                                                                                                                                                                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@kitamo/shared-contracts`             | `PUBLIC_EXPORT_PATHS`, `SHARED_CONTRACTS_PACKAGE_NAME`, `SHARED_CONTRACTS_VERSION`                                                                                                                                                                                                                                                                    |
| `@kitamo/shared-contracts/common`      | `NonEmptyStringSchema`, `SafeDisplayTextSchema`, `PrivacyClassSchema` and their inferred types                                                                                                                                                                                                                                                        |
| `@kitamo/shared-contracts/identifiers` | `EntityIdSchema`, `BusinessIdSchema`, `StallIdSchema`, `UserIdSchema`, `DeviceIdSchema`, `ProblemReportIdSchema`, `AuditEventIdSchema`, `SyncEventIdSchema`, `AppVersionIdSchema`, `CorrelationIdSchema` and their inferred types                                                                                                                     |
| `@kitamo/shared-contracts/businesses`  | `BusinessReferenceSchema`, `BusinessReference`                                                                                                                                                                                                                                                                                                        |
| `@kitamo/shared-contracts/stalls`      | `StallReferenceSchema`, `StallReference`                                                                                                                                                                                                                                                                                                              |
| `@kitamo/shared-contracts/time`        | `UtcInstantSchema`, `CalendarDateSchema`, `IanaTimezoneSchema`, `DEFAULT_BUSINESS_TIMEZONE`, `TemporalSemanticFieldSchema` and their inferred types                                                                                                                                                                                                   |
| `@kitamo/shared-contracts/money`       | `CurrencyCodeSchema`, `MoneyMinorAmountSchema`, `NonNegativeMoneyMinorAmountSchema`, `HighPrecisionDecimalSchema`, `MoneyValueSchema`, `NonNegativeMoneyValueSchema` and their inferred types                                                                                                                                                         |
| `@kitamo/shared-contracts/units`       | `SignedQuantityDecimalSchema`, `NonNegativeQuantityDecimalSchema`, `KnownPhysicalUnitCodeSchema`, `PackagingUnitCodeSchema`, `UnitReferenceSchema`, `QuantityWithUnitSchema` and their inferred types                                                                                                                                                 |
| `@kitamo/shared-contracts/versions`    | `ContractVersionSchema`, `SchemaVersionSchema`, `CURRENT_CONTRACT_VERSION`, `SUPPORTED_CONTRACT_VERSIONS`, `isSupportedContractVersion`, `assertSupportedContractVersion`, `UnsupportedContractVersionError`, `PlatformSchema`, `AppVersionNameSchema`, `AppVersionCodeSchema`, `AppVersionReferenceSchema`, `ContractMetadataSchema` and their types |
| `@kitamo/shared-contracts/pagination`  | `PageSizeSchema`, `OpaqueCursorSchema`, `PaginationRequestSchema`, `PaginationMetadataSchema`, `createPaginatedResultSchema` and their types                                                                                                                                                                                                          |
| `@kitamo/shared-contracts/errors`      | `StructuredErrorCodeSchema`, `FieldIssueSchema`, `StructuredErrorSchema` and their types                                                                                                                                                                                                                                                              |
| `@kitamo/shared-contracts/sync`        | `SyncEventNameSchema`, `SyncEventSchema` and their types                                                                                                                                                                                                                                                                                              |
| `@kitamo/shared-contracts/audit`       | `AuditOutcomeSchema`, `AuditEventSchema` and their types                                                                                                                                                                                                                                                                                              |
| `@kitamo/shared-contracts/support`     | `ProblemReportCategoryCodeSchema`, `ProblemReportStatusCodeSchema`, `ProblemReportReferenceSchema` and their types                                                                                                                                                                                                                                    |

Platform API does not deep-import Shared Contracts source, compatibility,
conformance, generated, script, test, or documentation files. Those artifacts
may be inspected read-only as governance evidence but are not runtime
dependencies.

## Current 24-area consumption matrix

Every row below is evaluated against package version `0.1.0` and accepted SC
commit `a380f19f2adcf0557b424461f869aa3d0069e176`.

| Contract area                                       | Classification                          | Exact public path and symbol(s)                                                                                                                           | Version / SC commit                                  | Platform API adapter and tests                                                | Limitation or blocker                                                                                                       |
| --------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Contract version                                    | **Confirmed**                           | `@kitamo/shared-contracts/versions`: `ContractVersionSchema`, `CURRENT_CONTRACT_VERSION`, `SUPPORTED_CONTRACT_VERSIONS`, `assertSupportedContractVersion` | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | `requireSupportedContractVersion`; valid, malformed, and unsupported fixtures | Only `0.1.0` is supported; production HTTP negotiation remains an operation decision                                        |
| Opaque identifiers                                  | **Confirmed with limits**               | `@kitamo/shared-contracts/identifiers`: `EntityIdSchema` and branded ID schemas                                                                           | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Re-export through adapter; valid/invalid/round-trip tests                     | No generation, prefix parsing, UUID assumption, or entity inference                                                         |
| Business identifiers                                | **Confirmed**                           | `@kitamo/shared-contracts/identifiers`: `BusinessIdSchema`; `@kitamo/shared-contracts/businesses`: `BusinessReferenceSchema`                              | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Public adapter and business-reference fixtures                                | Structural scope only; no ownership or authorization                                                                        |
| Stall identifiers                                   | **Confirmed with limits**               | `@kitamo/shared-contracts/identifiers`: `StallIdSchema`; `@kitamo/shared-contracts/stalls`: `StallReferenceSchema`                                        | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Public adapter and stall-reference fixtures; source scan rejects `branch_id`  | No Android `branch` conversion or authorization semantics                                                                   |
| User identifiers                                    | **Limited**                             | `@kitamo/shared-contracts/identifiers`: `UserIdSchema`                                                                                                    | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Structural schema tests only                                                  | No Clerk mapping, canonical identity resolution, membership, or trust                                                       |
| Device identifiers                                  | **Limited**                             | `@kitamo/shared-contracts/identifiers`: `DeviceIdSchema`                                                                                                  | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Structural schema tests only                                                  | Device ID is not authenticated ownership or sync authority                                                                  |
| Timestamps                                          | **Confirmed**                           | `@kitamo/shared-contracts/time`: `UtcInstantSchema`, `CalendarDateSchema`, `TemporalSemanticFieldSchema`                                                  | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Canonical `Z`, invalid offset/non-date, and date-vs-instant fixtures          | No Android historical-date migration                                                                                        |
| Timezone                                            | **Confirmed**                           | `@kitamo/shared-contracts/time`: `IanaTimezoneSchema`, `DEFAULT_BUSINESS_TIMEZONE`                                                                        | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | `Asia/Manila` and invalid-zone tests                                          | No silent timezone default at an operation boundary                                                                         |
| Currency                                            | **Limited**                             | `@kitamo/shared-contracts/money`: `CurrencyCodeSchema`                                                                                                    | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Uppercase three-letter syntax tests                                           | ISO-4217-shaped syntax only; no local currency registry or policy                                                           |
| Money                                               | **Limited**                             | `@kitamo/shared-contracts/money`: minor-amount and money-value schemas                                                                                    | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Integer/minor-unit positive and negative fixtures                             | Wire primitives only; no REAL migration, rounding, price, profit, COGS, or arithmetic                                       |
| Decimal quantity                                    | **Limited**                             | `@kitamo/shared-contracts/units`: signed/non-negative quantity schemas; `@kitamo/shared-contracts/money`: `HighPrecisionDecimalSchema`                    | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Precision/grammar tests                                                       | Serialization only; no stock math or business calculation                                                                   |
| Units                                               | **Limited**                             | `@kitamo/shared-contracts/units`: unit-code, reference, and quantity-with-unit schemas                                                                    | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Current `g`, `kg`, and packaging-registry tests                               | Bounded registry only; no aliases, local vocabulary expansion, or conversion                                                |
| Pagination                                          | **Limited**                             | `@kitamo/shared-contracts/pagination`: request, page-size, opaque-cursor, metadata, result helper                                                         | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Bounds, opacity, and `has_more`/`next_cursor` invariant tests                 | Cursor encoding, stable ordering, expiry, filtering, and lifecycle are operation-specific                                   |
| Structured errors                                   | **Limited**                             | `@kitamo/shared-contracts/errors`: `StructuredErrorCodeSchema`, `StructuredErrorSchema`                                                                   | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Contract cases plus bounded framework-error mapping tests                     | API-2 maps only framework failures; operation-specific HTTP mapping and localization remain blocked                         |
| Field-level violations                              | **Confirmed with limits**               | `@kitamo/shared-contracts/errors`: `FieldIssueSchema`                                                                                                     | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Path/code/message and strictness fixtures                                     | Used only inside the shared error boundary; no competing envelope                                                           |
| Audit envelope                                      | **Limited**                             | `@kitamo/shared-contracts/audit`: `AuditOutcomeSchema`, `AuditEventSchema`                                                                                | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Positive/negative audit fixtures                                              | Metadata shape only; actor/role authority, event policy, persistence, integrity, access, and retention blocked              |
| Correlation identifiers                             | **Confirmed**                           | `@kitamo/shared-contracts/identifiers`: `CorrelationIdSchema`                                                                                             | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Contract-context and identifier tests                                         | Fastify request IDs are local operational context, not canonical correlation generation, identity, or authorization         |
| Idempotency identifiers                             | **Missing / blocked**                   | No declared v0.1 public symbol                                                                                                                            | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | No substitute adapter or fake fixture                                         | Key contract, scoping, persistence, fingerprint, replay, retention, and conflicts remain unresolved                         |
| Sync envelope                                       | **Limited**                             | `@kitamo/shared-contracts/sync`: `SyncEventNameSchema`, `SyncEventSchema`                                                                                 | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Four-name and strict envelope fixtures                                        | Operational event metadata only; not upload/pull, batch, retry, acknowledgement, conflict resolution, or authority protocol |
| Sync result                                         | **Missing / blocked**                   | No declared v0.1 public result symbol                                                                                                                     | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | No local result schema                                                        | Production outcome/checkpoint/conflict/retry semantics remain unresolved                                                    |
| App-version policy                                  | **Limited primitives / policy blocked** | `@kitamo/shared-contracts/versions`: app-version schemas, `PlatformSchema`, contract support utilities                                                    | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | App-version grammar plus contract fail-closed tests                           | No minimum/supported client policy, channel rollout, grace period, spoofing policy, or remediation behavior                 |
| Membership references                               | **Missing / blocked**                   | No declared v0.1 public symbol                                                                                                                            | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | No local membership model                                                     | Membership authority, lifecycle, scope, revocation, and persistence remain unresolved                                       |
| Role references                                     | **Missing / blocked**                   | No canonical role registry or reference export; `AuditEventSchema.actor_role` is only a bounded token                                                     | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | Architecture tests prevent invented role schemas                              | Audit token must not be promoted into an authorization model                                                                |
| Android `branch` to canonical `stall` compatibility | **Missing from runtime / blocked**      | No declared public package path; compatibility evidence is internal governance material                                                                   | `0.1.0` / `a380f19f2adcf0557b424461f869aa3d0069e176` | No runtime adapter; canonical source scan rejects `branch_id`                 | Equivalence, source versions, migration, unknown values, and runtime mapping remain unapproved/unexported                   |

### Test evidence paths

- `tests/contracts/public-surface.test.ts` — exact package/version/commit,
  runtime exports, all declared public paths, and prohibited subpaths.
- `tests/contracts/version-context.test.ts` — exact supported version,
  malformed/unsupported fail-closed cases, app-version primitives, and the
  minimal contract context.
- `tests/contracts/primitives.test.ts` — common values, opaque IDs, time,
  money, decimals, quantities, and the bounded unit registry.
- `tests/contracts/operational.test.ts` — business/stall references,
  pagination, structured errors/field issues, limited sync, audit, and support
  shapes.
- `tests/fixtures/contracts.ts` — fictional positive and negative consumer
  fixtures.
- `tests/compatibility/pin-policy.test.ts` — wrong commit/version/integrity,
  absent package entry, malformed export map, and package/runtime drift.
- `tests/architecture/foundation.test.ts` and API-2 architecture coverage —
  adapter-only Shared Contracts imports, no deep or source-relative import, no
  copied Zod schemas, canonical stall terminology, layer-restricted Fastify and
  listener use, zero production routes, and no auth/persistence/cloud
  dependencies.

## Intentionally unavailable merchant areas

The v0.1 public package intentionally exports no runtime request/response
contracts for sales, sale items, products, inventory, ingredients, recipes,
production, COGS, fixed costs, refunds, voids, corrections, subscriptions,
payments, customer orders, loyalty, or memberships. Platform API creates no
local substitute for them. Any operation depending on them remains blocked.

## Historical API-0 evidence marker

Everything below this marker records the dependency state observed on
2026-07-25, when Shared Contracts was empty and API-1 was blocked. It is kept to
preserve the evidence trail. Statements below such as “current,” “absent,” or
“none” are historical unless explicitly labelled otherwise; the current
authority and matrix are the sections above.

Inspection date: 2026-07-25
Inspection timezone: Asia/Manila
Platform API repository: `/Users/rovs/Documents/KitaMo-ph/platform-api`
Shared Contracts local source: `/Users/rovs/Documents/KitaMo-ph/shared-contracts`
Inferred and verified public remote: `https://github.com/kitamo-ph/shared-contracts`

## Historical API-0 outcome

**API-1 is blocked. Platform API can safely consume no Shared Contracts
contract or export.**

The local Shared Contracts directory is not a Git repository and is not a
package. It contains one evidence document and no package manifest, source
entry point, schema, export declaration, build output, declaration file, test,
fixture, compatibility mapping, release, or publish configuration. The public
GitHub repository exists but is empty and has no branch ref, commit, tag,
release, workflow, or remote HEAD.

There are:

- no **Confirmed** Shared Contracts contracts or exports;
- no **Published** Shared Contracts contracts or exports; and
- no **Approved** Shared Contracts contracts or exports.

All 24 contract areas required by the API-0/API-1 brief are **Missing**. The
repository-state facts in this report are confirmed evidence; they are not
confirmed contract artifacts.

No import, adapter, duplicate schema, compatibility transformation, package
dependency, or contract conformance test may be added until an approved,
implemented, inspectable public export and an exact consumable version or
commit exist.

## Evidence taxonomy

Every artifact in this report uses one of the following statuses:

| Status            | Meaning                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Confirmed**     | Implemented, inspectable, and supported by repository evidence.                       |
| **Published**     | Available through an identifiable package release or approved distribution mechanism. |
| **Approved**      | Formally approved but not necessarily implemented or published.                       |
| **Proposed**      | Documented proposal awaiting approval.                                                |
| **Deferred**      | Intentionally postponed.                                                              |
| **Blocked**       | Cannot proceed because of a named dependency.                                         |
| **Deprecated**    | Still present but marked for retirement.                                              |
| **Missing**       | Required but not found.                                                               |
| **Unresolved**    | Conflicting or insufficient evidence.                                                 |
| **Not inspected** | Unavailable or outside the completed inspection.                                      |

A roadmap entry, task instruction, future authorization, filename, prose-only
concept, source file excluded from package exports, unbuilt package,
unpublished package name, draft mapping, or proposed version is not evidence
of an implemented public contract.

## Historical API-0 exact source state

### Local Shared Contracts directory

| Item                                 | Evidence                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| Resolved path                        | `/Users/rovs/Documents/KitaMo-ph/shared-contracts`                                    |
| Git repository                       | No; `.git` is absent and Git repository commands return no repository state           |
| Local remote                         | None                                                                                  |
| Current branch                       | None                                                                                  |
| HEAD commit                          | None                                                                                  |
| Package version                      | None                                                                                  |
| Package name                         | None                                                                                  |
| Public import paths                  | None                                                                                  |
| Runtime dependencies                 | None                                                                                  |
| Development dependencies             | None                                                                                  |
| Source entry points                  | None                                                                                  |
| Public export declarations           | None                                                                                  |
| Schemas and mappings                 | None                                                                                  |
| Tests and fixtures                   | None                                                                                  |
| CI and publishing                    | None                                                                                  |
| Tracked declarations or distribution | None; there is no Git repository and neither declaration nor distribution files exist |
| Applicable instruction files         | None                                                                                  |
| Files present                        | `docs/preflight/workspace-inventory.md` only                                          |
| Evidence-file digest                 | SHA-256 `7c206768c9973a6e5036450176d1c3332970c62c62f7e6c793a9c4607830fdc4`            |

The sole document records that the directory was empty and non-Git before the
document was created. It explicitly defers Android domain and persistence
discovery, requires approval before Shared Contracts bootstrap work, and
describes the future toolchain and canonical `stall` naming only as proposals.
It contains no machine-readable contract definition.

### Public remote

The public GitHub repository at
`https://github.com/kitamo-ph/shared-contracts` was inspected read-only.

| Item                                    | Evidence |
| --------------------------------------- | -------- |
| Repository exists                       | Yes      |
| Visibility                              | Public   |
| Repository metadata default-branch name | `main`   |
| Actual branches                         | None     |
| Remote HEAD                             | None     |
| Commits                                 | None     |
| Tags                                    | None     |
| Releases                                | None     |
| GitHub Actions workflows                | None     |
| Repository size                         | `0`      |

GitHub's `default_branch: main` metadata does not establish an actual `main`
branch. The remote has no refs, so there is no branch or commit that Platform
API could pin.

### Distribution checks and limitations

- The public npm search for `kitamo` returned no packages.
- The conventional but locally undeclared package name
  `@kitamo-ph/shared-contracts` returned npm `E404`.
- No local evidence establishes that conventional name as the intended package
  name, so it must not be adopted by assumption.
- Listing packages owned by the GitHub account required a token with
  `read:packages` and was unavailable. Private or access-controlled GitHub
  Packages are therefore **Not inspected**.
- No identifiable approved distribution mechanism was found.

The absence of local package identity, together with the empty public remote,
is sufficient to block consumption regardless of whether an undisclosed
private package exists.

## Historical API-0 evidence summary

| Evidence category               | Result                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Confirmed contracts or exports  | None                                                                                                      |
| Published contracts or exports  | None                                                                                                      |
| Approved contracts or exports   | None                                                                                                      |
| Proposed contract artifacts     | None; tooling and naming directions are proposals, not contracts                                          |
| Deferred evidence               | Android domain and persistence discovery                                                                  |
| Blocked work                    | Shared Contracts bootstrap pending its approval gate; API-1 consumption pending public exports and a pin  |
| Deprecated contracts or exports | None                                                                                                      |
| Missing contracts or exports    | All 24 required areas                                                                                     |
| Unresolved matters              | Package identity, export names, contract shapes and semantics, version policy, and compatibility approval |
| Not inspected evidence          | Access-controlled GitHub Packages and the explicitly deferred Android implementation discovery            |

## Required contract/export evidence record

Before Platform API marks any Shared Contracts contract as **Confirmed**, its
consumption record must contain all of the following:

```text
Contract or export:
Public import path:
Source file:
Package version:
Git branch:
Git commit:
Export status:
Runtime dependency:
Consumer suitability:
Tests found:
Limitations:
```

The current record for every required contract is:

```text
Contract or export: See the individual matrix row
Public import path: None
Source file: None
Package version: None
Git branch: None
Git commit: None
Export status: Missing
Runtime dependency: None
Consumer suitability: Unsafe to consume; production use blocked
Tests found: None
Limitations: No implementation, public export, version, or machine-readable semantics exist
```

An export is not public merely because a future source file exists. A future
record must verify that the package export map exposes the import path and that
the pinned artifact actually contains it.

## Historical API-0 Shared Contracts consumption matrix

Expected exports below are described by responsibility only. No symbol,
subpath, field name, or package name is inferred.

| Contract area                                               | Required Platform API use                                                       | Expected Shared Contracts export                                                             | Actual public export | Evidence status | Version or commit | Compatibility concerns                                                                                                                      | Platform API adapter needed                                           | Tests available | Consumer repositories affected                                                               | Blocking decision                                                                                      | Recommended next action                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------- | --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Contract version                                            | Negotiate and fail closed on unsupported breaking contract versions             | A public machine-readable contract-version definition and runtime validation surface         | None                 | **Missing**     | None / none       | No version syntax, compatibility range, negotiation location, or breaking-change policy exists                                              | Undetermined; do not create a local version contract                  | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`, `website`                 | Shared Contracts versioning approval and Platform API consumption/version-negotiation approval         | Approve and publish a version contract with compatibility tests before adding version helpers                            |
| Opaque identifiers                                          | Preserve identifiers without parsing or semantic reinterpretation               | A public opaque-identifier contract and runtime validation surface                           | None                 | **Missing**     | None / none       | Representation, normalization, length, and cross-type substitution rules are absent                                                         | Undetermined; do not introduce a canonical local identifier type      | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | Canonical identifier representation and validation                                                     | Discover existing evidence, approve semantics, export, and test the contract                                             |
| Business identifiers                                        | Address a business consistently across server and clients                       | A public business-identifier contract and runtime validation surface                         | None                 | **Missing**     | None / none       | Relationship to external identity, membership, and stall ownership is unresolved                                                            | Undetermined; no production identity adapter                          | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | Canonical business identity and external-to-internal mapping                                           | Approve the identifier contract and identity boundary before use                                                         |
| Stall identifiers                                           | Enforce canonical stall scope without treating Android terminology as canonical | A public stall-identifier contract and runtime validation surface                            | None                 | **Missing**     | None / none       | Android may use `branch`; no approved mapping or identity equivalence exists                                                                | Undetermined; no `branch` conversion is permitted                     | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | Canonical stall identity and separately approved Android compatibility mapping                         | Approve/export the stall identifier, then decide mapping from inspected Android evidence                                 |
| User identifiers                                            | Resolve authenticated actors to canonical users                                 | A public user-identifier contract and runtime validation surface                             | None                 | **Missing**     | None / none       | Identity-provider identifiers must not be assumed to equal canonical user identifiers                                                       | Undetermined; production identity mapping is out of scope             | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | External-to-internal identity mapping and canonical user identity                                      | Approve/export the identifier before authentication or authorization integration                                         |
| Device identifiers                                          | Correlate offline clients and synchronization safely                            | A public device-identifier contract and runtime validation surface                           | None                 | **Missing**     | None / none       | Device lifecycle, rotation, trust, privacy, and ownership semantics are absent                                                              | Undetermined; do not generate a canonical local format                | None            | `platform-api`, `owner-seller-mobile`, `customer-mobile`                                     | Device identity lifecycle and sync ownership                                                           | Approve/export a privacy-reviewed device identifier contract                                                             |
| Timestamps                                                  | Validate canonical instants at transport and audit boundaries                   | A public timestamp contract with runtime validation                                          | None                 | **Missing**     | None / none       | UTC requirements, accepted syntax, precision, offsets, and serialization are absent                                                         | Undetermined; do not declare an alternate timestamp format            | None            | All consumer repositories                                                                    | Timestamp representation and precision                                                                 | Approve/export the timestamp contract with acceptance and rejection fixtures                                             |
| Timezone                                                    | Preserve the business or user timezone independently from an instant            | A public timezone contract with runtime validation                                           | None                 | **Missing**     | None / none       | IANA-zone use, invalid/obsolete zones, fallback behavior, and ownership are absent                                                          | Undetermined; no canonical fallback may be invented                   | None            | All consumer repositories                                                                    | Canonical timezone representation and fallback policy                                                  | Approve/export timezone semantics and preservation tests                                                                 |
| Currency                                                    | Identify currencies without silent defaults or coercion                         | A public currency contract with runtime validation                                           | None                 | **Missing**     | None / none       | Supported currencies, code standard, case, and unsupported-currency behavior are absent                                                     | Undetermined; no default currency adapter                             | None            | All consumer repositories                                                                    | Currency representation and supported-value policy                                                     | Approve/export currency semantics and rejection behavior                                                                 |
| Money                                                       | Preserve monetary values exactly across transport boundaries                    | A public money contract with runtime validation                                              | None                 | **Missing**     | None / none       | Amount representation, precision, currency coupling, bounds, rounding, and arithmetic ownership are unresolved                              | Undetermined; do not define a local canonical money schema            | None            | All consumer repositories                                                                    | Money representation and precision; protected merchant financial semantics remain outside Platform API | Approve/export transport semantics without moving Android profit or accounting behavior                                  |
| Decimal quantity                                            | Preserve non-integer quantities without binary-floating-point loss              | A public decimal-quantity contract with runtime validation                                   | None                 | **Missing**     | None / none       | Encoding, scale, precision, sign, bounds, and arithmetic rules are absent                                                                   | Undetermined; do not coerce to a locally selected number format       | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | Decimal representation and precision                                                                   | Approve/export exact quantity representation with precision fixtures                                                     |
| Units                                                       | Interpret quantities only with approved unit meaning                            | A public units contract or approved shared unit enumeration with runtime validation          | None                 | **Missing**     | None / none       | Canonical values, aliases, conversions, dimension compatibility, and unknown-unit handling are absent                                       | Undetermined; do not redeclare a local canonical enum                 | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | Unit vocabulary and conversion ownership                                                               | Discover Android evidence, approve/export the vocabulary, and reject unknowns                                            |
| Pagination                                                  | Return list boundaries and continuation state consistently                      | A public pagination request and response contract with runtime validation                    | None                 | **Missing**     | None / none       | Cursor versus offset, limits, ordering stability, terminal state, and invalid-token behavior are absent                                     | Undetermined; no production pagination envelope                       | None            | `platform-api`, `admin`, `customer-mobile`, potentially `website`                            | Pagination model and compatibility policy                                                              | Approve/export one pagination contract with boundary fixtures                                                            |
| Structured errors                                           | Produce machine-readable failures shared by consumers                           | A public structured-error contract with runtime validation                                   | None                 | **Missing**     | None / none       | Codes, HTTP relationship, retryability, localization, details, and unknown-code behavior are absent                                         | Undetermined; internal errors must not be exposed as canonical        | None            | All consumer repositories                                                                    | Error taxonomy, disclosure rules, and versioning                                                       | Approve/export an error contract after security and privacy review                                                       |
| Field-level violations                                      | Report validation failures without leaking inappropriate input                  | A public field-violation contract with runtime validation                                    | None                 | **Missing**     | None / none       | Field path syntax, multiple violations, codes, messages, ordering, and redaction are absent                                                 | Undetermined; no local canonical violation shape                      | None            | `platform-api`, `admin`, `customer-mobile`, `website`                                        | Violation path/code and privacy rules                                                                  | Approve/export the violation contract with redaction and malformed-input tests                                           |
| Audit envelope                                              | Emit approved audit context around trusted operations                           | A public audit-envelope contract with runtime validation                                     | None                 | **Missing**     | None / none       | Actor, subject, action, time, correlation, version, retention, and redaction semantics are absent                                           | Undetermined; no production audit producer or persistence             | None            | `platform-api`, `admin`, `owner-seller-mobile`                                               | Audit event model, persistence, retention, and privacy                                                 | Approve/export the envelope before designing audit persistence                                                           |
| Correlation identifiers                                     | Trace one operation across boundaries without exposing secrets                  | A public correlation-identifier contract with runtime validation                             | None                 | **Missing**     | None / none       | Generation authority, propagation, cardinality, logging, trust, and disclosure are absent                                                   | Undetermined; internal tracing must not be called canonical           | None            | All consumer repositories                                                                    | Correlation propagation and logging policy                                                             | Approve/export an identifier contract and observability handling rules                                                   |
| Idempotency identifiers                                     | Detect replay of approved mutations safely                                      | A public idempotency-identifier contract with runtime validation                             | None                 | **Missing**     | None / none       | Scope, generation, uniqueness, retention, reuse, hashing, and conflict behavior are absent                                                  | Undetermined; persistent idempotency is out of scope                  | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | Idempotency key contract and persistent idempotency policy                                             | Approve/export the identifier only alongside operation and retention decisions                                           |
| Sync envelope                                               | Validate synchronization requests and provenance                                | A public synchronization-envelope contract with runtime validation                           | None                 | **Missing**     | None / none       | Authority, entity/version semantics, ordering, causality, retry, deletion, conflict, and offline behavior are absent                        | Undetermined; no sync adapter or mutation                             | None            | `platform-api`, `owner-seller-mobile`, `customer-mobile`, `admin`                            | Sync ownership and compatibility model                                                                 | Complete approved Android discovery and cross-repository sync decisions before export                                    |
| Sync result                                                 | Return explicit synchronization outcomes and conflicts                          | A public synchronization-result contract with runtime validation                             | None                 | **Missing**     | None / none       | Success/partial/conflict/retry outcomes, per-item results, error coupling, and checkpoint behavior are absent                               | Undetermined; no local canonical result                               | None            | `platform-api`, `owner-seller-mobile`, `customer-mobile`, `admin`                            | Sync result semantics and conflict ownership                                                           | Approve/export together with the sync envelope and end-to-end fixtures                                                   |
| App-version policy                                          | Accept, warn, or reject client versions consistently                            | A public app-version policy contract with runtime validation                                 | None                 | **Missing**     | None / none       | Version syntax, platform/channel scope, minimum/supported ranges, grace periods, and failure behavior are absent                            | Undetermined; fail closed where a required policy cannot be evaluated | None            | All consumer repositories                                                                    | App-version authority and unsupported-version behavior                                                 | Approve/export the policy and platform-specific conformance cases                                                        |
| Membership references                                       | Associate a user with approved business/stall scope                             | A public membership-reference contract with runtime validation                               | None                 | **Missing**     | None / none       | Membership identity, subject, scope, lifecycle, status, and external-provider relationship are absent                                       | Undetermined; no production membership model                          | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | Membership model and identity resolution                                                               | Approve/export only after identity and authorization boundaries are decided                                              |
| Role references                                             | Carry an approved role reference without embedding local policy                 | A public role-reference contract or approved shared role enumeration with runtime validation | None                 | **Missing**     | None / none       | Vocabulary, scope, assignment, inheritance, evolution, and relationship to authorization policy are absent                                  | Undetermined; do not redeclare a canonical enum                       | None            | `platform-api`, `owner-seller-mobile`, `admin`, `customer-mobile`                            | Role representation and authorization-policy ownership                                                 | Approve/export role references separately from server authorization implementation                                       |
| Android `branch` to canonical `stall` compatibility mapping | Translate legacy Android evidence explicitly and reject unsupported values      | A public approved compatibility mapping with source/target version evidence                  | None                 | **Missing**     | None / none       | The only evidence is proposed canonical naming; equivalence, field mapping, versions, unknown values, and migration behavior are unapproved | No adapter is permitted until the mapping is approved and exported    | None            | `platform-api`, `owner-seller-mobile`, `admin`; downstream customer behavior may be affected | Cross-repository mapping approval based on inspected Android implementation                            | Complete deferred Android discovery, record the decision, export/test the mapping, then add an internal explicit adapter |

## Historical API-0 package-consumption mechanism evaluation

No package-consumption mechanism is selected.

| Permitted mechanism          | Evidence status | Current evidence                                                                                 | Safety result                                                 |
| ---------------------------- | --------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Published package dependency | **Blocked**     | No declared package identity, version, exports, tag, or release; conventional npm name is absent | Cannot pin or import an identifiable artifact                 |
| npm workspace dependency     | **Blocked**     | No root workspace configuration and no Shared Contracts `package.json`                           | There is no workspace package to resolve                      |
| Local `file:` dependency     | **Blocked**     | The local directory is not a package and contains no source or exports                           | A `file:` entry would create a fragile non-package dependency |
| Git commit dependency        | **Blocked**     | The public remote is empty and has no commit or ref                                              | There is no immutable commit to pin                           |
| TypeScript project reference | **Blocked**     | No Shared Contracts `tsconfig`, source tree, declarations, or build graph exists                 | There is no TypeScript project to reference                   |

A package-consumption decision remains unresolved until Shared Contracts has an
approved package identity and public export surface. Platform API must not
modify Shared Contracts to make consumption possible and must not use a deep
import or an unbuilt filesystem path merely to make compilation succeed.

## Historical API-0 missing-contract dependency report

The entries below are intentionally separate. Similar-looking concepts have
different semantics, authority, security, privacy, persistence, migration, or
offline impacts and are therefore not grouped.

### 1. Contract version

- **Use case:** Negotiate compatible contract behavior and reject unsupported
  breaking versions.
- **Required contract:** Machine-readable contract version and compatibility
  policy.
- **Why existing exports are insufficient:** No export, package version,
  source, or release exists.
- **Required fields:** Unresolved; an approved representation must identify the
  contract version and any compatibility information needed at the boundary.
- **Required semantics:** Syntax, comparison, compatibility ranges,
  negotiation location, malformed-version handling, and fail-closed behavior.
- **Android impact:** The mobile app cannot declare or negotiate a verified
  shared contract version.
- **Admin impact:** Admin cannot rely on a stable shared payload version.
- **Customer impact:** Customer clients cannot distinguish supported from
  unsupported payloads.
- **Website impact:** Public API claims cannot cite a supported contract
  version.
- **Security impact:** Permissive fallback could accept unknown breaking
  payloads.
- **Privacy impact:** A version must not cause fallback to less restrictive
  payload handling.
- **Persistence impact:** Persisted payload/version provenance cannot be
  designed canonically.
- **Migration impact:** No upgrade or backward-compatibility sequence is
  defined.
- **Offline impact:** Queued offline payload compatibility cannot be evaluated.
- **Proposed Shared Contracts action:** Approve, implement, test, export, and
  release the version contract.
- **Platform API temporary behavior:** No temporary canonical representation;
  expose no production payload and fail the API-1 gate.
- **Production blocked:** Yes, for versioned cross-repository operations.
- **Required approvers:** Unresolved; Shared Contracts authority and all
  affected consumer owners must follow the cross-repository approval process.

### 2. Opaque identifiers

- **Use case:** Preserve identifiers without interpretation.
- **Required contract:** Opaque identifier representation and validator.
- **Why existing exports are insufficient:** No identifier export exists.
- **Required fields:** Unresolved; the value representation and any type
  discriminator require approval.
- **Required semantics:** Opacity, equality, normalization, bounds, generation
  authority, and cross-type misuse rejection.
- **Android impact:** Existing identifiers cannot be proven transport-safe.
- **Admin impact:** UI projections could accidentally normalize or parse IDs.
- **Customer impact:** Customer references could drift from canonical IDs.
- **Website impact:** No current direct use is established.
- **Security impact:** Type confusion can cross authorization scopes.
- **Privacy impact:** Identifier exposure and linkability rules are undefined.
- **Persistence impact:** Storage type and uniqueness constraints are
  unresolved.
- **Migration impact:** Existing values cannot be migrated without source
  evidence.
- **Offline impact:** Offline-generated or cached values lack approved rules.
- **Proposed Shared Contracts action:** Discover existing evidence and publish
  an approved opaque identifier contract with fixtures.
- **Platform API temporary behavior:** Preserve internal test strings only when
  necessary and never expose them as canonical.
- **Production blocked:** Yes, for operations requiring shared identifiers.
- **Required approvers:** Shared Contracts authority and affected identity/data
  owners; exact approvers unresolved.

### 3. Business identifiers

- **Use case:** Address the canonical business boundary.
- **Required contract:** Business identifier representation and validator.
- **Why existing exports are insufficient:** No business identifier exists.
- **Required fields:** Unresolved; canonical value and namespace evidence are
  required.
- **Required semantics:** Identity authority, lifecycle, uniqueness, relation
  to membership and stalls, and external-ID mapping.
- **Android impact:** Local business ownership cannot be safely mapped.
- **Admin impact:** Business-scoped administration lacks a canonical key.
- **Customer impact:** Business-facing discovery or ordering cannot share an
  approved reference.
- **Website impact:** Public business references must not imply a canonical
  format.
- **Security impact:** Incorrect mapping could authorize across businesses.
- **Privacy impact:** External identifiers may expose provider or account
  information.
- **Persistence impact:** Business foreign keys and uniqueness are unresolved.
- **Migration impact:** No mapping from existing records is approved.
- **Offline impact:** Offline ownership/scope references may not match server
  identity.
- **Proposed Shared Contracts action:** Approve the business identity boundary
  and export its identifier contract.
- **Platform API temporary behavior:** No production identity mapping.
- **Production blocked:** Yes, for business-scoped operations.
- **Required approvers:** Shared Contracts, Platform API, Android, and Admin
  authority owners; exact approvers unresolved.

### 4. Stall identifiers

- **Use case:** Address and authorize canonical stall scope.
- **Required contract:** Stall identifier representation and validator.
- **Why existing exports are insufficient:** No stall export exists, and prose
  naming guidance is not a contract.
- **Required fields:** Unresolved; canonical stall value and namespace require
  approval.
- **Required semantics:** Identity, lifecycle, business relationship, scope,
  and explicit treatment of Android `branch` evidence.
- **Android impact:** Android `branch` values cannot be assumed equivalent.
- **Admin impact:** Admin's canonical `stall` terminology lacks a shared
  machine-readable identity.
- **Customer impact:** Stall-facing operations cannot share a trusted scope.
- **Website impact:** Public stall references have no approved representation.
- **Security impact:** Incorrect equivalence could authorize the wrong stall.
- **Privacy impact:** Stall/business relationships may expose merchant data.
- **Persistence impact:** Stall keys and relations are unresolved.
- **Migration impact:** Legacy `branch` records cannot be mapped safely.
- **Offline impact:** Offline branch-scoped operations cannot be reconciled to
  server stall scope.
- **Proposed Shared Contracts action:** Approve/export the stall identifier and
  decide compatibility separately.
- **Platform API temporary behavior:** No `branch` rename or coercion.
- **Production blocked:** Yes, for stall-scoped operations.
- **Required approvers:** Shared Contracts, Android, Admin, and Platform API
  authority owners; exact approvers unresolved.

### 5. User identifiers

- **Use case:** Resolve a trusted actor to a canonical user.
- **Required contract:** User identifier representation and validator.
- **Why existing exports are insufficient:** No user identifier exists.
- **Required fields:** Unresolved; canonical value and any provider reference
  separation require approval.
- **Required semantics:** Identity authority, lifecycle, provider mapping,
  merge/recovery behavior, and disclosure.
- **Android impact:** Local users cannot be mapped to a verified server user.
- **Admin impact:** Admin actors and targets lack canonical shared references.
- **Customer impact:** Customer identity cannot be represented canonically.
- **Website impact:** Public account flows cannot rely on a shared identifier.
- **Security impact:** Provider-ID confusion can cause account takeover or
  cross-user authorization.
- **Privacy impact:** User identifiers are linkable personal data.
- **Persistence impact:** User keys and provider mappings are unresolved.
- **Migration impact:** Existing identities lack an approved reconciliation
  path.
- **Offline impact:** Local actor references cannot be trusted as server
  identity.
- **Proposed Shared Contracts action:** Approve/export the identifier after the
  identity-resolution decision.
- **Platform API temporary behavior:** No production identity-provider adapter.
- **Production blocked:** Yes, for authenticated user operations.
- **Required approvers:** Shared Contracts, identity/security, Platform API,
  and affected client owners; exact approvers unresolved.

### 6. Device identifiers

- **Use case:** Correlate offline clients and synchronization provenance.
- **Required contract:** Device identifier representation and validator.
- **Why existing exports are insufficient:** No device identifier exists.
- **Required fields:** Unresolved; identifier value and any lifecycle metadata
  require approval.
- **Required semantics:** Issuance, rotation, ownership, trust, revocation,
  collision handling, and disclosure.
- **Android impact:** Existing device state cannot be mapped canonically.
- **Admin impact:** Device support/diagnostics cannot rely on a shared ID.
- **Customer impact:** Customer sync devices lack approved identity.
- **Website impact:** No current direct use is established.
- **Security impact:** Spoofed device identity could affect sync or replay
  controls.
- **Privacy impact:** Persistent device IDs enable tracking and require
  retention limits.
- **Persistence impact:** Device records and ownership relations are
  unresolved.
- **Migration impact:** Existing device values lack rotation/mapping rules.
- **Offline impact:** This contract is foundational to offline provenance and
  replay handling.
- **Proposed Shared Contracts action:** Approve a privacy-reviewed lifecycle and
  export the contract.
- **Platform API temporary behavior:** Do not generate a purported canonical
  device ID.
- **Production blocked:** Yes, for device-aware synchronization.
- **Required approvers:** Shared Contracts, security/privacy, Android,
  Customer, and Platform API owners; exact approvers unresolved.

### 7. Timestamps

- **Use case:** Exchange canonical instants.
- **Required contract:** Timestamp representation and validator.
- **Why existing exports are insufficient:** No timestamp export exists.
- **Required fields:** Unresolved; the serialized instant representation
  requires approval.
- **Required semantics:** UTC/offset policy, syntax, precision, bounds,
  normalization, and malformed-value rejection.
- **Android impact:** Local timestamps cannot be proven round-trip compatible.
- **Admin impact:** Ordering and reporting may drift.
- **Customer impact:** User-visible event times may be misordered.
- **Website impact:** Public timestamps may be inconsistent.
- **Security impact:** Replay, expiry, and audit checks can be weakened by
  ambiguous time.
- **Privacy impact:** Precision and retention may reveal activity patterns.
- **Persistence impact:** Storage precision and normalization are unresolved.
- **Migration impact:** Existing timestamp formats cannot be normalized safely.
- **Offline impact:** Queue ordering and conflict detection depend on exact
  timestamp semantics.
- **Proposed Shared Contracts action:** Export an approved timestamp schema with
  UTC and malformed-value fixtures.
- **Platform API temporary behavior:** Do not expose an alternate canonical
  timestamp.
- **Production blocked:** Yes, for shared time-bearing payloads.
- **Required approvers:** Shared Contracts and affected repository owners;
  security input for expiry/audit uses.

### 8. Timezone

- **Use case:** Preserve business or user timezone separately from an instant.
- **Required contract:** Timezone representation and validator.
- **Why existing exports are insufficient:** No timezone export exists.
- **Required fields:** Unresolved; canonical zone representation requires
  approval.
- **Required semantics:** Accepted database/standard, obsolete zones, fallback,
  ownership, and daylight-saving behavior.
- **Android impact:** Local reporting timezone cannot be reconciled safely.
- **Admin impact:** Business reporting windows may differ.
- **Customer impact:** User-facing local time can be wrong.
- **Website impact:** Public business hours or dates may be wrong.
- **Security impact:** Time-window policy checks can differ by zone.
- **Privacy impact:** User timezone can be location-adjacent personal data.
- **Persistence impact:** Zone storage and defaults are unresolved.
- **Migration impact:** Legacy/default zones lack an approved mapping.
- **Offline impact:** Offline day boundaries and report windows may drift.
- **Proposed Shared Contracts action:** Approve/export timezone semantics and
  preservation fixtures.
- **Platform API temporary behavior:** No silent timezone default.
- **Production blocked:** Yes, where behavior depends on local time.
- **Required approvers:** Shared Contracts and affected product/data owners;
  exact approvers unresolved.

### 9. Currency

- **Use case:** Identify the currency associated with monetary values.
- **Required contract:** Currency representation and validator.
- **Why existing exports are insufficient:** No currency export or supported
  value set exists.
- **Required fields:** Unresolved; the code/value representation requires
  approval.
- **Required semantics:** Standard, case, supported values, unknown values,
  defaults, and evolution.
- **Android impact:** Local monetary records cannot be proven compatible.
- **Admin impact:** Aggregation and display may silently combine currencies.
- **Customer impact:** Price meaning may be incorrect.
- **Website impact:** Public price claims may be ambiguous.
- **Security impact:** Invalid currency coercion can alter transaction meaning.
- **Privacy impact:** No distinct direct impact established beyond transaction
  data handling.
- **Persistence impact:** Currency columns and constraints are unresolved.
- **Migration impact:** Existing implicit/default currencies need an approved
  migration.
- **Offline impact:** Offline transactions must retain their original currency.
- **Proposed Shared Contracts action:** Approve/export currency values and
  unsupported-value behavior.
- **Platform API temporary behavior:** Do not choose or default a canonical
  currency.
- **Production blocked:** Yes, for shared monetary payloads.
- **Required approvers:** Shared Contracts, merchant-domain, Admin, Customer,
  and Platform API owners; exact approvers unresolved.

### 10. Money

- **Use case:** Preserve exact monetary transport values.
- **Required contract:** Money representation and validator.
- **Why existing exports are insufficient:** No money schema exists.
- **Required fields:** At minimum an exact amount representation and currency
  reference are needed; names, types, precision, and constraints are unresolved.
- **Required semantics:** Precision, scale or minor-unit rules, bounds, sign,
  currency coupling, rounding ownership, and serialization.
- **Android impact:** Merchant amounts and protected financial evidence cannot
  be safely transported.
- **Admin impact:** Financial projections could lose precision or meaning.
- **Customer impact:** Prices and totals could be corrupted.
- **Website impact:** Public monetary information could be misstated.
- **Security impact:** Coercion or overflow can change transaction values.
- **Privacy impact:** Monetary data is sensitive merchant/customer data.
- **Persistence impact:** Amount storage types and constraints are unresolved.
- **Migration impact:** Existing representations cannot be converted without
  approved precision evidence.
- **Offline impact:** Offline values must round-trip exactly.
- **Proposed Shared Contracts action:** Approve/export transport semantics while
  preserving Android authority over profit and accounting behavior.
- **Platform API temporary behavior:** No local canonical money schema or
  business arithmetic.
- **Production blocked:** Yes, for all monetary operations.
- **Required approvers:** Shared Contracts, Android merchant-domain authority,
  security/data, and affected consumers; exact approvers unresolved.

### 11. Decimal quantity

- **Use case:** Preserve exact non-integer quantities.
- **Required contract:** Decimal quantity representation and validator.
- **Why existing exports are insufficient:** No quantity schema exists.
- **Required fields:** Unresolved; exact value representation and any scale
  metadata require approval.
- **Required semantics:** Precision, scale, bounds, sign, normalization,
  serialization, and arithmetic ownership.
- **Android impact:** Inventory and recipe quantities could lose precision.
- **Admin impact:** Inventory projections may drift.
- **Customer impact:** Quantity-facing availability or ordering could be wrong.
- **Website impact:** No current direct use is established.
- **Security impact:** Malformed or extreme values can affect resource controls.
- **Privacy impact:** Merchant operational quantities may be sensitive.
- **Persistence impact:** Exact storage type is unresolved.
- **Migration impact:** Existing decimal formats need evidence-backed mapping.
- **Offline impact:** Offline calculations and later sync require exact
  round-tripping.
- **Proposed Shared Contracts action:** Approve/export an exact representation
  with precision and rejection fixtures.
- **Platform API temporary behavior:** Do not coerce to JavaScript number as a
  canonical representation.
- **Production blocked:** Yes, for quantity-bearing operations.
- **Required approvers:** Shared Contracts, Android domain, Admin, Customer,
  and Platform API owners; exact approvers unresolved.

### 12. Units

- **Use case:** Give quantity values approved measurement meaning.
- **Required contract:** Unit vocabulary/contract and validator.
- **Why existing exports are insufficient:** No unit schema, enumeration, or
  mapping exists.
- **Required fields:** Unresolved; canonical unit value and any dimension
  information require approval.
- **Required semantics:** Vocabulary, aliases, conversions, dimensions,
  unknowns, evolution, and display separation.
- **Android impact:** Existing inventory/recipe unit values require discovery.
- **Admin impact:** Aggregation could combine incompatible units.
- **Customer impact:** Displayed quantities may be misleading.
- **Website impact:** Public unit claims could drift.
- **Security impact:** Invalid conversions can alter business operations.
- **Privacy impact:** Merchant recipe/inventory details may be sensitive.
- **Persistence impact:** Unit values and conversion records are unresolved.
- **Migration impact:** Legacy aliases need approved mappings.
- **Offline impact:** Offline values must retain their original unit and
  conversion meaning.
- **Proposed Shared Contracts action:** Discover Android evidence, approve the
  vocabulary, export it, and test unknown rejection.
- **Platform API temporary behavior:** Do not redeclare a canonical unit enum.
- **Production blocked:** Yes, for unit-bearing operations.
- **Required approvers:** Shared Contracts, Android domain, Admin, Customer,
  and Platform API owners; exact approvers unresolved.

### 13. Pagination

- **Use case:** Bound and continue list retrieval consistently.
- **Required contract:** Pagination request and response envelopes.
- **Why existing exports are insufficient:** No pagination export exists.
- **Required fields:** Unresolved; input boundary, continuation state, returned
  items metadata, and terminal-state representation require approval.
- **Required semantics:** Cursor/offset model, limits, ordering stability,
  invalid/expired state, filtering coupling, and versioning.
- **Android impact:** Synced/listed records cannot share continuation behavior.
- **Admin impact:** Admin tables cannot rely on a server envelope.
- **Customer impact:** Customer lists cannot paginate consistently.
- **Website impact:** Future public lists lack an approved format.
- **Security impact:** Unbounded or forgeable pagination can enable abuse or
  data probing.
- **Privacy impact:** Cursors must not leak internal identifiers or filters.
- **Persistence impact:** Query ordering/index requirements are unresolved.
- **Migration impact:** Future cursor changes need a compatibility policy.
- **Offline impact:** Resume/checkpoint behavior may interact with cached lists.
- **Proposed Shared Contracts action:** Approve/export one pagination model with
  boundary and invalid-token fixtures.
- **Platform API temporary behavior:** No production pagination envelope.
- **Production blocked:** Yes, for shared paginated operations.
- **Required approvers:** Shared Contracts, Platform API, Admin, Customer, and
  security/privacy owners as applicable.

### 14. Structured errors

- **Use case:** Return machine-readable failures.
- **Required contract:** Structured error envelope and validator.
- **Why existing exports are insufficient:** No error schema or code taxonomy
  exists.
- **Required fields:** Unresolved; stable code, safe message/details, and
  correlation/version information may be needed but require approval.
- **Required semantics:** Code ownership, HTTP mapping, retryability, unknown
  codes, localization, nested causes, and redaction.
- **Android impact:** Offline/retry behavior cannot classify failures.
- **Admin impact:** UI error handling cannot depend on stable codes.
- **Customer impact:** Customer messaging and retries are undefined.
- **Website impact:** Public errors lack a safe format.
- **Security impact:** Internal details could leak; incorrect retry behavior
  could amplify abuse.
- **Privacy impact:** Error details may expose submitted or stored data.
- **Persistence impact:** Operational/error persistence and retention are
  unresolved.
- **Migration impact:** Code evolution needs backward compatibility.
- **Offline impact:** Queued operations need deterministic retry/conflict
  classification.
- **Proposed Shared Contracts action:** Approve/export a redaction-reviewed
  error taxonomy and envelope.
- **Platform API temporary behavior:** Keep internal errors internal; expose no
  production error payload.
- **Production blocked:** Yes, for approved production operations.
- **Required approvers:** Shared Contracts, security/privacy, Platform API, and
  affected consumer owners.

### 15. Field-level violations

- **Use case:** Report invalid fields safely and consistently.
- **Required contract:** Field-level violation contract and validator.
- **Why existing exports are insufficient:** No violation schema exists.
- **Required fields:** Unresolved; field reference, stable violation code, and
  safe details require approval.
- **Required semantics:** Path syntax, arrays/nesting, multiplicity, ordering,
  localization, unknown fields, and redaction.
- **Android impact:** Form/offline validation cannot align with server results.
- **Admin impact:** Admin forms cannot map violations reliably.
- **Customer impact:** Customer forms cannot show stable field errors.
- **Website impact:** Public forms cannot rely on an approved shape.
- **Security impact:** Paths/details can expose internal schema or policy.
- **Privacy impact:** Echoed invalid values can leak personal data.
- **Persistence impact:** No direct canonical persistence is established;
  logging/retention still needs limits.
- **Migration impact:** Field renames require compatibility behavior.
- **Offline impact:** Local and server validation may disagree.
- **Proposed Shared Contracts action:** Approve/export path, code, and redaction
  semantics with fixtures.
- **Platform API temporary behavior:** No local canonical violation envelope.
- **Production blocked:** Yes, for operations returning field violations.
- **Required approvers:** Shared Contracts, security/privacy, Platform API, and
  affected UI owners.

### 16. Audit envelope

- **Use case:** Produce approved audit-event context for trusted operations.
- **Required contract:** Audit envelope and validator.
- **Why existing exports are insufficient:** No audit schema exists.
- **Required fields:** Unresolved; actor, action, subject/scope, time,
  correlation, version, outcome, and safe metadata require formal review.
- **Required semantics:** Event authority, immutability, sequencing, redaction,
  retention, clock behavior, and compatibility.
- **Android impact:** Local operational evidence cannot map to canonical audit
  events.
- **Admin impact:** Privileged actions lack a shared audit format.
- **Customer impact:** Customer actions may eventually require audited context.
- **Website impact:** No current direct use is established.
- **Security impact:** Incomplete or forgeable audit data weakens
  accountability.
- **Privacy impact:** Audit events can contain durable personal and merchant
  data.
- **Persistence impact:** Audit store, immutability, access, and retention are
  undecided.
- **Migration impact:** Event-schema evolution and backfill are unresolved.
- **Offline impact:** Offline event provenance and later ingestion need explicit
  rules.
- **Proposed Shared Contracts action:** Approve/export the envelope after audit,
  security, privacy, and retention decisions.
- **Platform API temporary behavior:** No production audit event or persistence.
- **Production blocked:** Yes, for operations requiring audit evidence.
- **Required approvers:** Shared Contracts, security/privacy, data retention,
  Platform API, Android, and Admin owners.

### 17. Correlation identifiers

- **Use case:** Trace one operation across service and client boundaries.
- **Required contract:** Correlation identifier representation and validator.
- **Why existing exports are insufficient:** No correlation identifier exists.
- **Required fields:** Unresolved; identifier value and propagation context
  require approval.
- **Required semantics:** Generation authority, trust, propagation, replacement,
  fan-out, cardinality, logging, and disclosure.
- **Android impact:** Client reports and operations cannot be linked canonically.
- **Admin impact:** Admin actions cannot be traced end-to-end consistently.
- **Customer impact:** Support diagnostics lack a shared reference.
- **Website impact:** Future public requests lack a safe trace reference.
- **Security impact:** User-supplied values can cause log injection or trace
  confusion.
- **Privacy impact:** Correlation across contexts can increase linkability.
- **Persistence impact:** Log/audit storage and retention are unresolved.
- **Migration impact:** Format changes need propagation compatibility.
- **Offline impact:** Offline requests need rules for creation and replay.
- **Proposed Shared Contracts action:** Approve/export the identifier alongside
  observability and privacy rules.
- **Platform API temporary behavior:** Internal trace values must not be called
  canonical or exposed as a shared contract.
- **Production blocked:** Yes, where a shared correlation contract is required.
- **Required approvers:** Shared Contracts, observability, security/privacy,
  Platform API, and affected client owners.

### 18. Idempotency identifiers

- **Use case:** Identify a retry of the same approved operation.
- **Required contract:** Idempotency identifier representation and validator.
- **Why existing exports are insufficient:** No idempotency identifier exists.
- **Required fields:** Unresolved; identifier value and operation/scope binding
  require approval.
- **Required semantics:** Generation, scope, uniqueness, reuse, expiry,
  persistence, conflict, hashing, and disclosure.
- **Android impact:** Offline/retried mutations cannot carry an approved key.
- **Admin impact:** Retried privileged actions lack deterministic replay
  protection.
- **Customer impact:** Retried customer actions could duplicate effects.
- **Website impact:** Future public mutations would lack replay semantics.
- **Security impact:** Weak scoping can replay another user's or operation's
  request.
- **Privacy impact:** Stored keys may link user activity and request bodies.
- **Persistence impact:** Durable key/result storage is required but out of
  scope and undecided.
- **Migration impact:** Retention and schema evolution are unresolved.
- **Offline impact:** This contract is central to safe queued retries.
- **Proposed Shared Contracts action:** Approve/export only with the Platform
  idempotency policy and operation semantics.
- **Platform API temporary behavior:** No persistent idempotency or production
  mutation.
- **Production blocked:** Yes, for operations requiring idempotency.
- **Required approvers:** Shared Contracts, Platform API, security/privacy, and
  affected mutation owners.

### 19. Sync envelope

- **Use case:** Carry synchronization provenance and payload boundaries.
- **Required contract:** Synchronization envelope and validator.
- **Why existing exports are insufficient:** No sync envelope exists, and
  Android sync evidence was explicitly deferred.
- **Required fields:** Unresolved; source/device, entity identity/type, version
  or causal state, operation, payload, time, and correlation needs require
  discovery and approval.
- **Required semantics:** Authority, ordering, causality, deletion, retry,
  conflict, batching, compatibility, and unknown entities.
- **Android impact:** Offline operations cannot be transported without
  redefining Android authority.
- **Admin impact:** Admin views/actions cannot assume synchronized state.
- **Customer impact:** Customer state cannot safely participate in sync.
- **Website impact:** No current direct use is established.
- **Security impact:** Forged scope/entity/version could corrupt server state.
- **Privacy impact:** Envelopes may aggregate sensitive merchant/customer data.
- **Persistence impact:** Sync state, checkpoints, and transaction boundaries
  are undecided.
- **Migration impact:** Entity/version migration and replay are unresolved.
- **Offline impact:** This is a foundational offline contract.
- **Proposed Shared Contracts action:** Complete approved Android discovery and
  cross-repository sync decisions before implementing/exporting.
- **Platform API temporary behavior:** No sync mutation or local canonical
  envelope.
- **Production blocked:** Yes, for synchronization.
- **Required approvers:** Shared Contracts, Android operational authority,
  Platform API, Admin/Customer as affected, security/privacy, and data owners.

### 20. Sync result

- **Use case:** Return explicit synchronization outcomes.
- **Required contract:** Synchronization result and validator.
- **Why existing exports are insufficient:** No sync result exists and no
  approved sync semantics exist.
- **Required fields:** Unresolved; overall and per-item outcome, accepted
  version/checkpoint, conflict/retry data, and safe error references may be
  needed.
- **Required semantics:** Atomicity, partial success, conflict, retryability,
  checkpoint advancement, ordering, and error coupling.
- **Android impact:** Offline queues cannot know what to acknowledge or retry.
- **Admin impact:** Sync health/conflicts cannot be projected consistently.
- **Customer impact:** Customer retries/conflicts lack deterministic behavior.
- **Website impact:** No current direct use is established.
- **Security impact:** Ambiguous results can cause replay or state corruption.
- **Privacy impact:** Per-item errors may reveal inaccessible entity state.
- **Persistence impact:** Checkpoint/result retention and transactions are
  undecided.
- **Migration impact:** Result-version compatibility is unresolved.
- **Offline impact:** Queue acknowledgment and conflict resolution depend on it.
- **Proposed Shared Contracts action:** Approve/export with the sync envelope
  and end-to-end fixtures.
- **Platform API temporary behavior:** No sync response or mutation.
- **Production blocked:** Yes, for synchronization.
- **Required approvers:** Same cross-repository authorities required for the
  sync envelope; exact approvers unresolved.

### 21. App-version policy

- **Use case:** Decide whether a client version is supported.
- **Required contract:** App-version policy request/result and validator.
- **Why existing exports are insufficient:** No app-version policy exists.
- **Required fields:** Unresolved; client platform/channel/version and policy
  outcome/range information require approval.
- **Required semantics:** Version syntax, platform/channel scope, minimum and
  supported versions, warn/reject behavior, grace periods, and offline expiry.
- **Android impact:** The seller app cannot receive an approved support policy.
- **Admin impact:** Admin version compatibility cannot be evaluated.
- **Customer impact:** Customer app compatibility cannot be evaluated.
- **Website impact:** Public support claims cannot cite canonical policy.
- **Security impact:** Old vulnerable clients may remain accepted.
- **Privacy impact:** Client-version telemetry retention/disclosure is
  unresolved.
- **Persistence impact:** Policy storage and rollout history are undecided.
- **Migration impact:** Rollout and rollback behavior are unresolved.
- **Offline impact:** Cached policy and long-offline clients need explicit
  behavior.
- **Proposed Shared Contracts action:** Approve/export policy semantics and
  platform-specific fixtures.
- **Platform API temporary behavior:** Do not claim support; fail closed where
  evaluation is required.
- **Production blocked:** Yes, for operations requiring version enforcement.
- **Required approvers:** Shared Contracts, release/security, and all affected
  application owners.

### 22. Membership references

- **Use case:** Reference a user's approved business or stall relationship.
- **Required contract:** Membership reference and validator.
- **Why existing exports are insufficient:** No membership contract exists.
- **Required fields:** Unresolved; membership identity, user, scope, status, and
  lifecycle references require approval.
- **Required semantics:** Creation authority, activation/revocation, scope,
  uniqueness, role relationship, provider mapping, and history.
- **Android impact:** Local owner/seller relationships cannot map to server
  membership.
- **Admin impact:** Membership administration lacks a canonical reference.
- **Customer impact:** Any customer-business relationship must remain distinct
  unless approved.
- **Website impact:** No current direct use is established.
- **Security impact:** Incorrect membership mapping directly affects
  authorization.
- **Privacy impact:** Membership reveals personal-business relationships.
- **Persistence impact:** Membership tables, history, and constraints are
  undecided.
- **Migration impact:** Existing users/roles lack an approved mapping.
- **Offline impact:** Revocation and stale offline membership require rules.
- **Proposed Shared Contracts action:** Approve identity/membership semantics,
  then implement and export the reference.
- **Platform API temporary behavior:** No production membership model.
- **Production blocked:** Yes, for membership-scoped authorization.
- **Required approvers:** Shared Contracts, identity/security, Android, Admin,
  Customer as affected, and Platform API owners.

### 23. Role references

- **Use case:** Carry an approved role reference without embedding server
  authorization policy in clients.
- **Required contract:** Role reference or approved shared role vocabulary and
  validator.
- **Why existing exports are insufficient:** No role contract or enumeration
  exists.
- **Required fields:** Unresolved; role value/identity and scope reference
  require approval.
- **Required semantics:** Vocabulary, assignment authority, scope, lifecycle,
  inheritance, unknown values, and separation from authorization policy.
- **Android impact:** Seller/owner terminology cannot be promoted without
  discovery and approval.
- **Admin impact:** Admin role UI cannot assume a canonical enum.
- **Customer impact:** Customer roles must not be conflated with merchant/admin
  roles.
- **Website impact:** No current direct use is established.
- **Security impact:** Role drift or client-side policy can grant excess access.
- **Privacy impact:** Roles expose organizational relationships and privilege.
- **Persistence impact:** Role assignment and history are undecided.
- **Migration impact:** Existing role values need explicit compatibility.
- **Offline impact:** Stale roles and revocation need fail-safe behavior.
- **Proposed Shared Contracts action:** Approve/export references while keeping
  authorization policy server-owned.
- **Platform API temporary behavior:** No canonical local enum or production
  authorization.
- **Production blocked:** Yes, for role-referenced operations.
- **Required approvers:** Shared Contracts, security/authorization, Android,
  Admin, Customer as affected, and Platform API owners.

### 24. Android `branch` to canonical `stall` compatibility mapping

- **Use case:** Translate inspected Android compatibility evidence to canonical
  `stall` meaning explicitly.
- **Required contract:** Approved, versioned compatibility mapping and runtime
  validator/transformation surface.
- **Why existing exports are insufficient:** No mapping exists. The sole
  document's proposed naming direction is not an approved mapping, and Android
  domain/persistence discovery was deferred.
- **Required fields:** Unresolved; source version/field/value, target
  version/field/value, applicability, and unsupported-value outcome require
  evidence and approval.
- **Required semantics:** Exact equivalence, scope, source and target versions,
  absent/unknown values, reversibility, migration, and rejection behavior.
- **Android impact:** Renaming without discovery could corrupt branch identity
  or scope.
- **Admin impact:** Admin's canonical `stall` projections could be joined to the
  wrong Android entity.
- **Customer impact:** Downstream stall-facing behavior may target the wrong
  merchant location.
- **Website impact:** Public stall terminology must not imply data equivalence.
- **Security impact:** A wrong mapping can cross authorization boundaries.
- **Privacy impact:** A wrong mapping can expose another stall's merchant data.
- **Persistence impact:** Key relationships and compatibility storage are
  unresolved.
- **Migration impact:** Legacy `branch` data migration is entirely unresolved.
- **Offline impact:** Existing offline branch-scoped records and queued
  operations require deterministic compatibility.
- **Proposed Shared Contracts action:** Complete approved Android discovery,
  record a cross-repository decision, then implement/export/test the mapping.
- **Platform API temporary behavior:** No rename, coercion, deep import, or
  compatibility adapter.
- **Production blocked:** Yes, for any behavior depending on branch/stall
  equivalence.
- **Required approvers:** Shared Contracts authority, Android operational
  authority, Platform API, Admin, security/privacy, and other affected consumer
  owners; exact approvers unresolved.

## Historical API-0 API-1 stop gate

The following brief stop conditions are present:

- Shared Contracts public exports are absent.
- Every required contract is missing.
- The package name, package version, public import paths, and runtime
  dependencies are undefined.
- Contract-version behavior is unresolved.
- Money and quantity precision are unresolved.
- Android `branch` semantics and the `branch` to `stall` mapping are
  unapproved.
- Any package-consumption mechanism would require inventing or modifying the
  Shared Contracts package state.
- No immutable branch, commit, package release, or approved distribution can be
  pinned.

Therefore:

```text
API-1 status: Blocked at verification gate
Contracts safely consumable: None
Selected consumption mechanism: None
Package dependency: None
Public exports consumed: None
Deep imports: None
Local duplicate canonical schemas: None
Compatibility adapters: None
Production behavior permitted by this evidence: None
```

API-1 may resume only after Shared Contracts provides approved and implemented
machine-readable contracts through verified public exports, with an exact
version or commit and applicable tests. Resumption also requires the relevant
semantic and cross-repository decisions, especially version negotiation,
money/quantity precision, identity/membership/role authority, synchronization
ownership, and Android compatibility.

## Historical API-0 blocked contract coverage

No conformance test should be written for a contract that does not exist.

| Intended coverage                                 | Status      | Blocking evidence                                    |
| ------------------------------------------------- | ----------- | ---------------------------------------------------- |
| Package public import paths                       | **Blocked** | No package or export map                             |
| Absence of deep-import dependency                 | **Blocked** | No supported public import exists to test            |
| Accepted contract versions                        | **Blocked** | Contract-version syntax/policy is missing            |
| Unsupported-version rejection                     | **Blocked** | Compatibility and rejection policy is missing        |
| Malformed-version rejection                       | **Blocked** | Version validator is missing                         |
| Runtime request schema acceptance/rejection       | **Blocked** | No request schema exports exist                      |
| Runtime response schema acceptance/rejection      | **Blocked** | No response schema exports exist                     |
| Opaque identifier preservation                    | **Blocked** | Identifier contract is missing                       |
| Business/stall/user/device identifier conformance | **Blocked** | All four identifier contracts are missing            |
| UTC timestamp handling                            | **Blocked** | Timestamp contract is missing                        |
| Timezone preservation                             | **Blocked** | Timezone contract is missing                         |
| Currency preservation                             | **Blocked** | Currency contract is missing                         |
| Exact money/minor-unit preservation               | **Blocked** | Money representation and precision are unresolved    |
| Decimal quantity precision                        | **Blocked** | Quantity representation and precision are unresolved |
| Unit validation                                   | **Blocked** | Unit vocabulary/contract is missing                  |
| Pagination envelope conformance                   | **Blocked** | Pagination contract is missing                       |
| Structured-error conformance                      | **Blocked** | Error contract is missing                            |
| Field-level violation conformance                 | **Blocked** | Violation contract is missing                        |
| Audit-envelope conformance                        | **Blocked** | Audit contract is missing                            |
| Correlation identifier conformance                | **Blocked** | Correlation contract is missing                      |
| Idempotency identifier conformance                | **Blocked** | Idempotency contract is missing                      |
| Sync-envelope conformance                         | **Blocked** | Sync envelope and ownership are missing              |
| Sync-result conformance                           | **Blocked** | Sync result and outcome semantics are missing        |
| App-version policy conformance                    | **Blocked** | App-version policy is missing                        |
| Membership and role reference conformance         | **Blocked** | Both contracts and authority decisions are missing   |
| Android `branch` to canonical `stall` mapping     | **Blocked** | Mapping is missing and unapproved                    |

## Historical API-0 recommended next action

Keep Platform API at the documentation-only verification gate. Coordinate with
the Shared Contracts authority to complete its approved bootstrap and deferred
Android evidence discovery. For each needed contract, require a formal
cross-repository decision where semantics cross authority boundaries, a public
runtime-validatable export, export-map verification, source and package tests,
and an immutable package version or Git commit. Re-run this inventory before
selecting a consumption mechanism.

No change to Shared Contracts or any other repository is authorized or required
from Platform API at this gate.
