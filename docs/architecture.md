# Platform API Architecture

## Document status

| Item                                 | Status                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| API-1 contract-consumer architecture | Complete for the bounded foundation while verification and CI gates remain green      |
| Framework selection                  | Proposed; approval required                                                           |
| API-0 evidence foundation            | Complete at `b93afd444a3e38edc42cb0cb54f44aa780c4d14a`                                |
| Git repository bootstrap             | Complete on `main`                                                                    |
| API-1 Shared Contracts consumption   | `@kitamo/shared-contracts@0.1.0` pinned to `a380f19f2adcf0557b424461f869aa3d0069e176` |
| HTTP server and routes               | Absent; API-1 remains transport-neutral                                               |
| Production implementation            | Not authorized                                                                        |

This document preserves the API-0 server proposal and records the implemented
API-1 contract-consumer boundary. Only the bounded API-1 decisions recorded in
`decision-log/decisions/` are approved. The future server architecture and
framework remain proposals.

## Historical API-0 evidence baseline (2026-07-25)

- The resolved local path is
  `/Users/rovs/Documents/KitaMo-ph/platform-api`.
- The local directory was empty and was not a Git repository when inspected.
- The expected GitHub repository is
  `https://github.com/kitamo-ph/platform-api`.
- The expected remote exists and is public, but it has no branch refs or
  commits. GitHub names `main` as the default branch, but its HEAD is unborn.
- No existing runtime, framework, package manager, dependency set, application
  code, tests, CI, deployment configuration, persistence configuration, or
  production integration was found in Platform API.
- Shared Contracts had no verified public package export that Platform API
  could consume. API-1 was therefore correctly blocked at that time.

That baseline is historical. Shared Contracts later completed SC-0 through
SC-4 and froze `@kitamo/shared-contracts@0.1.0` at commit
`a380f19f2adcf0557b424461f869aa3d0069e176`, unblocking bounded API-1
consumption but no production operation.

## Current API-1 architecture

API-1 establishes this dependency direction:

```text
Platform API consumers
    -> src/contracts
        -> @kitamo/shared-contracts declared public exports
```

The boundary records the approved repository, commit, package name, and
version; re-exports only reviewed public schemas and types; enforces support for
contract version `0.1.0` only; and parses a minimal contract context containing
only `contract_version` and `correlation_id`.

Structural validation is not identity resolution or authorization. No
identifier in the contract context is treated as an authenticated principal,
membership, role, ownership fact, or authorized scope.

Shared Contracts is acquired through the exact GitHub source archive named in
`config/shared-contracts-pin.json`, `package.json`, and `package-lock.json`.
The installed package copy is built with the consumer's pinned compiler, then
its lock integrity, name, version, export keys, runtime metadata, public import
paths, and prohibited subpaths are checked. An arbitrary sibling checkout is
never the runtime dependency.

A direct Git dependency was rejected because the current producer lifecycle
does not prepare a usable built export surface for that install path and API-1
may not alter the producer. A locally regenerated `npm pack` artifact was
rejected as the authority pin because its bytes differed across the tested
platforms. The reviewed source archive plus local build avoids both failure
modes while retaining normal Node resolution and fail-closed integrity checks.

## Authority boundaries

Platform API may eventually implement approved contracts as trusted server
operations. It must not become a new source of cross-repository or merchant
business meaning.

- Owner–Seller Mobile remains the operational evidence authority for currently
  implemented merchant behavior, including checkout, sales, inventory,
  production, COGS, spoilage, transfers, fixed expenses, and reports.
- The protected profit formula remains:
  `Revenue - Sold COGS - Fixed Costs - Spoilage = Net Profit`.
- Shared Contracts remains the authority for canonical cross-repository
  identifiers, terminology, money, quantities, time, errors, pagination,
  audit and synchronization envelopes, shared enums, versions, and
  compatibility mappings.
- Admin, Customer Mobile, and Website retain their own UI, projection,
  customer-experience, and public-claims responsibilities.

Platform API must consume verified public Shared Contracts exports. It must not
copy canonical schemas, deep-import package internals, infer contracts from
documentation, or reproduce Owner–Seller Mobile business rules.

## Architectural objective

The recommended shape is one modular service with explicit internal
boundaries. A single deployable keeps the initial operational surface small,
while ports and adapters keep future infrastructure replaceable. This is a
proposal, not authorization to create routes or production behavior.

```text
composition root
├── transport
│   ├── routes
│   ├── request context
│   └── approved contract validation
├── application
│   ├── application services
│   └── policy orchestration
├── ports
│   ├── identity and authorization
│   ├── idempotency and persistence
│   ├── audit
│   └── external integrations
└── adapters
    ├── Shared Contracts boundary
    ├── persistence
    ├── observability
    └── external systems
```

Dependencies point inward. Transport and infrastructure adapters may call the
application layer through declared interfaces; application code must not
depend on HTTP framework objects, database clients, or vendor SDKs.

## Framework evaluation

No framework is approved. Selection belongs in an approved Platform API
decision record after the runtime and deployment target are known. The
evaluations below record every required criterion without treating a feature
claim as approval.

### Fastify

- **Candidate:** Fastify.
- **Runtime model:** Long-lived Node.js HTTP service; serverless suitability
  depends on the eventual adapter and host.
- **Request validation:** Strong schema-hook model; it must invoke verified
  Shared Contracts runtime schemas rather than framework-owned copies.
- **Response validation:** Supports response schemas and hooks; the design must
  fail safely and avoid a parallel schema source.
- **OpenAPI support:** Mature ecosystem integration, contingent on deriving
  documentation from the same approved contracts and operation records.
- **Structured logging:** Built-in structured-logger integration is a good fit;
  redaction and field allowlists still require approval.
- **Plugin or middleware security:** Encapsulation is useful, but every plugin,
  parser, limit, hook order, and trust boundary requires review.
- **Testability:** Injection-based route tests and isolated plugins fit the
  proposed layers.
- **Cold-start behavior:** Generally small for a Node framework; actual startup
  must be measured with approved plugins and contracts.
- **Deployment compatibility:** Good for conventional Node processes;
  serverless/edge compatibility cannot be assumed before target selection.
- **Maintenance burden:** Moderate and lower than assembling lifecycle,
  validation, logging, and test conventions from primitives.
- **Shared Contracts compatibility:** The transport-neutral API-1 adapter proves
  public Zod-backed runtime validation; Fastify integration remains untested and
  unapproved.
- **Recommendation:** Preferred candidate for the smallest modular service.
- **Approval status:** Proposed.

### Hono

- **Candidate:** Hono.
- **Runtime model:** Lightweight web-standard request/response model across
  several runtimes.
- **Request validation:** Adapter ecosystem is available, but exact Zod 4 and
  Shared Contracts behavior must be verified.
- **Response validation:** Would require an explicit approved boundary pattern.
- **OpenAPI support:** Ecosystem support exists; keeping it aligned with runtime
  schemas would need verification.
- **Structured logging:** Requires an explicit logging adapter and lifecycle
  policy.
- **Plugin or middleware security:** A small core helps reviewability, while
  runtime-specific middleware and proxy behavior still need threat review.
- **Testability:** Web-standard handlers are straightforward to test.
- **Cold-start behavior:** Potentially favorable, subject to the selected
  runtime and dependency graph.
- **Deployment compatibility:** Broad, but that flexibility risks prematurely
  selecting an edge/runtime model that has not been approved.
- **Maintenance burden:** Low to moderate; more operational conventions may
  need local definition than with Fastify.
- **Shared Contracts compatibility:** The package runtime surface is verified
  independently of Hono; framework integration remains untested and unapproved.
- **Recommendation:** Alternative if an edge-style or web-standard runtime is
  later approved.
- **Approval status:** Not approved.

### Express

- **Candidate:** Express.
- **Runtime model:** Long-lived Node.js middleware pipeline.
- **Request validation:** Requires explicit validator middleware and strict
  integration discipline.
- **Response validation:** Not a strong default; an application-owned boundary
  must be built and tested.
- **OpenAPI support:** Available through external tooling, with a higher risk of
  runtime/documentation drift.
- **Structured logging:** Requires explicit middleware, correlation, and
  redaction composition.
- **Plugin or middleware security:** Large middleware ecosystem increases
  dependency and ordering review burden.
- **Testability:** Mature testing tools exist, though lifecycle conventions are
  application-owned.
- **Cold-start behavior:** Generally acceptable for a small Node service;
  measure the actual middleware graph.
- **Deployment compatibility:** Broad support on conventional Node platforms.
- **Maintenance burden:** Moderate to high because validation, error,
  lifecycle, observability, and shutdown patterns need more assembly.
- **Shared Contracts compatibility:** The package runtime surface is verified
  independently of Express; framework integration remains untested and
  unapproved.
- **Recommendation:** Viable fallback, not the preferred foundation.
- **Approval status:** Not approved.

Fastify is recommended because it best supports a narrow transport layer and
the required lifecycle concerns without an enterprise framework. This
recommendation remains **Proposed** and must not be encoded as an Approved
decision.

## Proposed stack

| Concern            | Proposal                                                                     | Current status                                                                  |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Runtime            | Node `>=20.19.4`, with Node `20.20.0` in CI                                  | Approved for the API-1 tooling foundation; production runtime target unresolved |
| Language           | TypeScript 5.9 with strict checking                                          | Approved for API-1                                                              |
| HTTP framework     | Fastify                                                                      | Proposed                                                                        |
| Package manager    | npm with a committed lockfile                                                | Approved for API-1                                                              |
| Runtime validation | Shared Contracts' exported Zod runtime schemas                               | Implemented at the contract adapter; no local canonical schemas                 |
| Linting            | ESLint 9 flat configuration                                                  | Implemented for API-1                                                           |
| Formatting         | Prettier 3                                                                   | Implemented for API-1                                                           |
| Shared Contracts   | Exact source archive for `@kitamo/shared-contracts@0.1.0` at accepted commit | Implemented and pinned; no unpinned branch or `latest`                          |
| Validation         | Narrow parsing and fail-closed version enforcement at the contract boundary  | Implemented for API-1 primitives; no request/response operation schemas         |
| Testing            | Vitest contract-consumer, compatibility, fixture, and architecture tests     | Implemented for API-1                                                           |
| Logging            | Structured server logs with explicit redaction and correlation support       | Proposed                                                                        |
| OpenAPI            | Derive from approved operation records and approved public contracts         | Proposed; no operations approved                                                |
| Persistence        | Access only through application ports                                        | Technology unresolved                                                           |
| Deployment         | No target selected                                                           | Deferred pending approval                                                       |

This table is an evaluation baseline. It authorizes no installation, package
publication, endpoint, database, deployment, or integration.

## Component responsibilities

### Application composition

One composition root should construct the server, application services, ports,
and adapters. It should be the only location that selects concrete
infrastructure. Startup must validate configuration before opening a listener
and must fail closed when a required security or contract dependency is
unavailable.

The composition root must not contain merchant business rules. Until the
Shared Contracts and operation gates are satisfied, it must not expose
production-facing operations.

### Route boundary

Routes are transport adapters. A route may:

1. establish an approved request context;
2. validate the request against an approved public request contract;
3. call one application service;
4. map an approved application result to an approved response contract; and
5. validate the response before transmission.

Routes must not define business meaning, query persistence directly, call
external systems directly, or create local substitutes for missing contracts.
A compiling route is not evidence that an operation is approved.

### Request context

The request context should carry only reviewed operational facts needed by the
approved operation, such as a correlation identifier, resolved contract
version, authenticated principal reference, authorized membership or role
references, canonical stall scope, and request timing.

Each field requires a verified source and lifecycle. Headers or client claims
must not be treated as resolved identity, authorization, membership, role, or
stall scope. Raw credentials and unnecessary personal data must not be copied
into context or logs.

### Contract adapters

A narrow adapter boundary under `src/contracts/` is the only place where
Platform API imports Shared Contracts. It:

- use documented public import paths only;
- pin and report the consumed package version or approved distribution commit;
- expose no contract that is absent from the public export;
- preserve approved structured errors and field-level violations;
- exposes no Android compatibility mapping because none is public; and
- test runtime and type-level consumer suitability.

The Android `branch` to canonical `stall` mapping must remain blocked until a
verified Shared Contracts compatibility export exists. Platform API must not
invent that mapping.

### Application services

Application services should coordinate one approved use case at a time. They
may invoke policies and ports, but must remain independent of HTTP,
persistence, and vendor implementations. They must not recreate Owner–Seller
Mobile semantics or turn roadmap intent into server behavior.

### Policies

Authorization, version support, idempotency, privacy, and other cross-cutting
decisions should be represented by explicit policies referenced from each
operation record. A policy needs an approved source, inputs, outputs,
failure behavior, and tests. Missing policy evidence must block the operation;
permissive defaults are not acceptable.

### Ports

Ports define the application-facing capabilities that future adapters may
provide. Each port should be narrow, operation-driven, and free of vendor
types. Candidate areas include identity resolution, authorization,
idempotency, persistence, audit, time, identifier generation, and external
integrations. Candidate ports are not permission to implement those
capabilities.

### Authentication and identity

Authentication verification, external-to-internal identity mapping,
membership resolution, and role resolution are separate concerns. Their
mechanisms and authoritative stores are unresolved. Until approved:

- no credential format is assumed;
- no external identity is treated as an internal user;
- no membership or role is inferred; and
- no authenticated production route is exposed.

### Authorization

Authorization must be explicit per operation and default to denial. It should
evaluate an approved principal, membership or role evidence, operation, and
business or stall scope. Route presence, authentication success, or possession
of an identifier is never sufficient authorization.

The policy representation and source of truth require approval before
implementation.

### Idempotency

Each mutating operation must declare whether idempotency is required, its key
contract, scope, retention period, replay behavior, conflict behavior, and
persistent storage boundary. In-memory idempotency is not sufficient for
production operations. No idempotency scheme is currently approved.

### Persistence isolation

Persistence technology, data ownership, migration ownership, transaction
strategy, and recovery expectations remain unresolved. Future repositories
must be accessed only through application ports. Transport handlers and
contract objects must not become persistence models.

No production database, schema, migration, or seed data is authorized in the
current milestone.

### External integrations

External services must be represented by narrow ports and disabled unless an
approved operation explicitly needs them. Each integration requires decisions
for credentials, timeouts, retries, circuit behavior, privacy, audit,
observability, and test doubles. No production integration is authorized.

### Audit

The limited `AuditEventSchema` is consumable for contract conformance. Audit
production still depends on approved decisions for authoritative actor/role
resolution, event classification, persistence, retention, access, privacy, and
failure behavior. Operational logs are not a substitute for an audit record,
and API-1 emits no production audit event.

### Observability

The proposed baseline is structured, redacted logs; correlation propagation;
service health signals; request duration and outcome metrics; and
operation-level traces where approved. Observability must use stable operation
identifiers and must not expose credentials, raw tokens, unnecessary personal
data, private architecture, or merchant-sensitive payloads.

Exact tooling and retention are unresolved. A liveness signal must not imply
that dependencies, contracts, or production readiness have been verified.

### Errors

Public errors for a future approved operation must use the verified Shared
Contracts `StructuredErrorSchema` and `FieldIssueSchema`. Internal errors
should be classified and mapped at
the transport boundary without leaking stack traces, infrastructure details,
or sensitive values.

API-1 verifies those shared schemas but defines no competing envelope and no
HTTP status mapping. Fail-closed package/bootstrap errors remain internal
operational failures.

### OpenAPI

OpenAPI should describe only approved operations and verified public request
and response contracts. It must be generated or checked from the same
authoritative operation metadata and contracts used at runtime. It must not
become a parallel source of canonical meaning.

No empty placeholder operation, speculative payload, or unapproved
authentication scheme should be published. A valid OpenAPI document does not
constitute operation approval.

### Testing

The proposed test layers are:

- architecture tests for dependency direction and prohibited deep imports;
- contract-consumer tests for public imports and runtime validation;
- application-service unit tests using port fakes;
- policy tests, including denial and boundary cases;
- transport tests for request and response validation;
- adapter integration tests against non-production test resources;
- shutdown and configuration-failure tests; and
- compatibility tests backed by approved Shared Contracts fixtures.

Tests may demonstrate implementation behavior, but they cannot supply missing
product semantics or approval. API-1 tests cover the accepted public primitive
surface; merchant-domain and production-operation tests remain blocked because
their contracts and operation records do not exist.

### Configuration

Configuration should be typed, validated once at startup, and passed into the
composition root. Required production values must not have insecure defaults.
Secrets must come from an approved secret mechanism, remain out of source and
logs, and never use real values in this milestone.

Environment variable names, deployment profiles, credential sources, and
rotation processes remain unresolved and should not be invented in the
foundation.

### Graceful shutdown

On a termination signal, the future service should:

1. stop accepting new requests;
2. allow bounded in-flight work to finish;
3. stop background work and outbound activity;
4. flush approved audit and observability buffers;
5. close external and persistence adapters; and
6. exit non-zero if shutdown cannot complete safely.

Timeouts, orchestration signals, and readiness behavior must match the
eventually approved deployment target. No target is currently selected.

## Security posture

The architecture is fail-closed:

- missing contracts block contract-dependent operations;
- missing identity or authorization evidence denies access;
- missing idempotency persistence blocks operations that require it;
- unknown contract versions follow an approved unsupported-version response,
  not best-effort interpretation;
- sensitive configuration is mandatory rather than silently defaulted; and
- no production capability is exposed merely because infrastructure starts.

CORS, rate limiting, support-report retention, operational logging, and
privacy classifications require explicit decisions before production use.

## Current non-goals

This foundation does not authorize:

- production endpoints or payloads;
- recreation or movement of Owner–Seller Mobile business logic;
- copied or locally invented Shared Contracts schemas;
- deep imports from Shared Contracts internals;
- authentication, identity, membership, or authorization implementations;
- production idempotency, synchronization, audit, or persistence;
- database selection, schemas, migrations, or transaction behavior;
- external service integrations;
- deployment, npm publication, or production migrations;
- real credentials or production data; or
- promises to Admin, Customer Mobile, Website, or other consumers.

## Verification gates

API-1 acceptance requires:

1. exact source archive, commit, package version, export map, and lock integrity
   verification;
2. reproducible `npm ci` plus `npm run verify` in a clean environment;
3. public-import, declaration, positive/negative fixture, unsupported-version,
   deep-import, architecture, secret, and dependency-audit checks;
4. no copied schema, server, route, framework, persistence, authentication,
   cloud, production sync, or deployment artifact; and
5. unchanged Shared Contracts, Android, and Admin repositories.

After API-1, each future operation still requires a complete record in
`docs/endpoint-governance.md`, explicit approval, and closure of its security,
privacy, persistence, audit, transport, reliability, and compatibility
blockers. The proposed server architecture is not approved by API-1.
