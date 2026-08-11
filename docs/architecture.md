# Platform API Architecture

## Document status

| Item                                 | Status                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| API-1 contract-consumer architecture | Complete for the bounded foundation while verification and CI gates remain green       |
| API-2 transport/runtime architecture | Implemented locally; final clean-environment, runtime-smoke, and CI acceptance pending |
| Framework selection                  | Fastify `5.11.3` approved for HTTP transport only                                      |
| API-0 evidence foundation            | Complete at `b93afd444a3e38edc42cb0cb54f44aa780c4d14a`                                 |
| Git repository bootstrap             | Complete on `main`                                                                     |
| API-1 Shared Contracts consumption   | `@kitamo/shared-contracts@0.1.0` pinned to `a380f19f2adcf0557b424461f869aa3d0069e176`  |
| HTTP server                          | Fastify factory and explicit local runtime entrypoint implemented                      |
| Production routes                    | Zero; synthetic routes are registered only by tests                                    |
| Production implementation            | Not authorized                                                                         |

This document preserves the API-0 proposal and implemented API-1 contract
boundary, and records the locally implemented API-2 server foundation. API-2
approval is bounded to transport mechanics. It does not approve merchant
operations, identity, authorization, persistence, synchronization, external
providers, a production runtime, or deployment.

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

## Preserved API-1 architecture

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

## API-2 transport architecture

API-2 implements a small server foundation with explicit dependency direction:

```text
explicit runtime entrypoint
    -> validated immutable configuration
    -> composition/create-app
        -> transport/server
            -> logging, request ID, safe framework errors
            -> contracts boundary
                -> @kitamo/shared-contracts public exports

future application services
    -> framework-independent policies and ports
        <- future infrastructure adapters
```

`src/runtime/start.ts` is the only source location authorized to bind a socket.
`src/composition/create-app.ts` verifies Shared Contracts runtime identity and
constructs the server. `src/transport/` owns Fastify-specific behavior.
`src/contracts/` remains Fastify-independent. Empty application, policy, port,
and infrastructure layers are not fabricated before an approved operation
needs them.

## Framework evaluation

API-2 authorizes resolution of the transport framework independently of the
production hosting target. Framework approval does not approve a listener in
production or any operation.

### Fastify

- **Selected version:** Fastify `5.11.3`, exactly pinned by the manifest and
  lockfile.
- **Runtime model:** Long-lived Node.js HTTP service; serverless suitability
  depends on the eventual adapter and host.
- **Request validation:** Strong schema-hook model; it must invoke verified
  Shared Contracts runtime schemas rather than framework-owned copies.
- **Response validation:** Supports response schemas and hooks; the design must
  fail safely and avoid a parallel schema source.
- **OpenAPI support:** Mature ecosystem integration, contingent on deriving
  documentation from the same approved contracts and operation records.
- **Structured logging:** Built-in structured logging is configured with
  explicit redaction, narrow serializers, and disabled default request logging.
- **Plugin or middleware security:** Encapsulation is useful, but every plugin,
  parser, limit, hook order, and trust boundary requires review.
- **Testability:** Injection, readiness, error, payload, logging, startup, and
  shutdown behavior can be tested without binding a listener.
- **Cold-start behavior:** Generally small for a Node framework; actual startup
  must be measured with approved plugins and contracts.
- **Deployment compatibility:** Good for conventional Node processes;
  serverless/edge compatibility cannot be assumed before target selection.
- **Node/tooling compatibility:** Compatible with Node `>=20.19.4`, CI Node
  `20.20.0`, strict TypeScript 5.9, ESM, Vitest, and the existing Shared
  Contracts preparation flow.
- **Shared Contracts compatibility:** Transport imports the unchanged Platform
  API adapter rather than package internals or copied schemas.
- **Maintenance burden:** One runtime dependency and no speculative plugin
  packages; lifecycle, logging, error hooks, and injection are framework-native.
- **Approval status:** **Approved for Platform API HTTP transport only.**

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

Hono and Express remain evaluated alternatives, not selected frameworks. No
material Fastify incompatibility was found for the bounded API-2 foundation, so
API-2 approves Fastify without authorizing another framework, an operation, or
deployment.

## API-2 stack

| Concern            | Selection                                                                    | Current status                                                             |
| ------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Runtime            | Node `>=20.19.4`, with Node `20.20.0` in CI                                  | Local process foundation implemented; production runtime target unresolved |
| Language           | TypeScript 5.9 with strict checking                                          | Approved for API-1                                                         |
| HTTP framework     | Fastify `5.11.3`                                                             | Approved for transport only                                                |
| Package manager    | npm with a committed lockfile                                                | Approved for API-1                                                         |
| Runtime validation | Shared Contracts' exported Zod runtime schemas                               | Implemented at the contract adapter; no local canonical schemas            |
| Linting            | ESLint 9 flat configuration                                                  | Implemented for API-1                                                      |
| Formatting         | Prettier 3                                                                   | Implemented for API-1                                                      |
| Shared Contracts   | Exact source archive for `@kitamo/shared-contracts@0.1.0` at accepted commit | Implemented and pinned; no unpinned branch or `latest`                     |
| Validation         | Narrow parsing and fail-closed version enforcement at the contract boundary  | Implemented for API-1 primitives; no request/response operation schemas    |
| Testing            | Vitest contract, transport/lifecycle, compatibility, and architecture tests  | Implemented locally; final acceptance pending                              |
| Logging            | Fastify structured logs with narrow serializers and credential redaction     | Implemented for the API-2 transport; provider/retention unresolved         |
| OpenAPI            | Derive from approved operation records and approved public contracts         | Not installed; no operations approved                                      |
| Persistence        | Access only through application ports                                        | Technology unresolved                                                      |
| Deployment         | No target selected                                                           | Deferred pending approval                                                  |

This table authorizes the named transport foundation only. It authorizes no
package publication, endpoint, database, deployment, provider, or integration.

## Component responsibilities

### Application composition

`createApp` is the composition root. It checks the accepted Shared Contracts
runtime identity before constructing Fastify. It neither loads process-global
configuration nor starts a listener. Startup validates configuration before
calling it and fails closed when configuration or the contract dependency is
invalid.

The composition root contains no merchant business rule and registers no
production-facing operation.

### Route boundary

Production source registers **zero routes**. Synthetic `/__test__/ok`,
`/__test__/throw`, `/__test__/payload`, `/__test__/proxy`,
`/__test__/headers`, `/__test__/redaction`, and `/__test__/log-exception`
routes are registered only from transport tests against isolated server
instances. They are not exported, registered by the composition root, or
present in the runtime route surface.

A future approved route will be a transport adapter and may:

1. establish an approved request context;
2. validate the request against an approved public request contract;
3. call one application service;
4. map an approved application result to an approved response contract; and
5. validate the response before transmission.

Routes must not define business meaning, query persistence directly, call
external systems directly, or create local substitutes for missing contracts.
A compiling route is not evidence that an operation is approved.

### Request context

API-2 request context contains only Fastify's bounded internal request ID and
framework timing. `requestIdHeader=false` means untrusted inbound headers cannot
select it. The generator produces `req_` plus a random UUID, bounded to 40
characters, and the response exposes it as `x-request-id` for local operational
tracing.

The internal request ID is structurally validated through `CorrelationIdSchema`
when emitted in the framework error envelope, but this does not establish the
final cross-system correlation-generation policy. It is not a credential,
principal, merchant ID, membership, role, ownership fact, or authorized scope.
Future headers and client claims remain untrusted until separately approved.

### Contract adapters

A narrow adapter boundary under `src/contracts/` is the only place where
Platform API imports Shared Contracts. It:

- uses documented public import paths only;
- pins and reports the consumed package version or approved distribution commit;
- exposes no contract that is absent from the public export;
- preserves approved structured errors and field-level violations;
- exposes no Android compatibility mapping because none is public; and
- tests runtime and type-level consumer suitability.

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
and API-2 emits no production audit event.

### Observability

API-2 uses Fastify's structured logger with default request logging disabled.
The request serializer emits only internal ID and method, the response serializer
only status, and the error serializer redacts message and stack. Logs record
bounded lifecycle events, status, and elapsed time without URL, query, headers,
request body, response body, support diagnostics, financial data, or merchant
payloads.

Redaction covers authorization, cookie, set-cookie, proxy-authorization,
`x-api-key`, password, secret, token, API-key, and service-role-key paths,
including nested request/response header forms. Production provider, sampling,
access, retention, region, metrics, and traces remain unresolved. Operational
logs are not canonical audit, and no liveness endpoint exists.

### Errors

API-2's central Fastify error boundary validates its bounded response through
Shared Contracts `StructuredErrorSchema`. Unknown routes produce `404` /
`NOT_FOUND` / `Route not found.`. Whitelisted `FST_ERR_VALIDATION`,
`FST_ERR_CTP_EMPTY_JSON_BODY`, `FST_ERR_CTP_INVALID_JSON_BODY`, and
`FST_ERR_CTP_INVALID_CONTENT_LENGTH` failures produce `400` /
`VALIDATION_ERROR` / `Request validation failed.`;
`FST_ERR_CTP_INVALID_MEDIA_TYPE` produces `415` / `VALIDATION_ERROR` with the
same safe message; `FST_ERR_CTP_BODY_TOO_LARGE` for bodies over 65,536 bytes
produces `413` / `VALIDATION_ERROR` /
`Request body exceeds the permitted size.`; and unhandled failures produce
`500` / `UNKNOWN` / `Internal server error.`. Once graceful drain begins,
requests that reach the instance produce `503` / `SERVICE_UNAVAILABLE` /
`Service temporarily unavailable.` through the same validated boundary instead
of Fastify's built-in closing payload.

Responses contain only code, bounded safe message, the validated internal
request ID as `correlation_id`, and no `field_issues`. The drain response alone
is `retryable: true`; every other API-2 framework response is `retryable:
false`. They expose no exception class, framework validation details, stack,
file path, SQL/provider response,
environment value, original payload, route registry, or arbitrary metadata.
Operation-specific mappings and response contracts remain blocked.

### OpenAPI

OpenAPI should describe only approved operations and verified public request
and response contracts. It must be generated or checked from the same
authoritative operation metadata and contracts used at runtime. It must not
become a parallel source of canonical meaning.

No empty placeholder operation, speculative payload, or unapproved
authentication scheme should be published. A valid OpenAPI document does not
constitute operation approval.

### Testing

The implemented and future test layers are:

- architecture tests for dependency direction and prohibited deep imports;
- contract-consumer tests for public imports and runtime validation;
- application-service unit tests using port fakes;
- policy tests, including denial and boundary cases;
- transport tests for request and response validation;
- adapter integration tests against non-production test resources;
- shutdown and configuration-failure tests; and
- compatibility tests backed by approved Shared Contracts fixtures.

API-2 adds construction/readiness, test-only injection, success/exception,
not-found, malformed JSON, unsupported content, oversized body, request-ID,
logging redaction, import-without-listen, configuration failure, startup, and
idempotent shutdown coverage. Tests may demonstrate implementation behavior,
but they cannot supply missing product semantics or approval. Merchant-domain
and production-operation tests remain blocked because their contracts and
operation records do not exist.

### Configuration

`loadRuntimeConfig` validates the process environment once and returns an
`Object.freeze`d value:

| Variable    | Accepted API-2 value                                            | Default     |
| ----------- | --------------------------------------------------------------- | ----------- |
| `NODE_ENV`  | `development` or `test`; `production` and unknown values reject | development |
| `HOST`      | literal `127.0.0.1` or `::1`; DNS names reject                  | `127.0.0.1` |
| `PORT`      | decimal integer `1` through `65535`                             | `3000`      |
| `LOG_LEVEL` | `fatal`, `error`, `warn`, `info`, `debug`, `trace`, or `silent` | `info`      |

API-2 has no credential configuration. `NODE_ENV=production` fails with a safe
configuration error before server construction or binding because no
production deployment policy is approved. Production profiles, credential
sources, secret delivery, and rotation remain unresolved.

### Graceful shutdown

`startRuntime` loads configuration, verifies Shared Contracts through the
composition root, constructs Fastify, awaits readiness, registers `SIGTERM` and
`SIGINT`, and only then calls the single authorized `listen()` with the validated
loopback host and port. Any failure disposes signal handlers, closes the server,
and is rethrown. Direct runtime startup writes exactly
`{"level":"error","event":"runtime.startup_failed"}` to standard error and
sets exit code `1`; it exposes no rejected value or exception detail.

The shutdown controller is instance-scoped and idempotent. On explicit shutdown
or either signal it first marks that instance as draining and then calls
`server.close()`. Already admitted work follows Fastify's close semantics;
requests that reach the draining instance receive the bounded shared `503`
response. The controller then removes signal handlers. A shutdown failure sets
exit code `1`. No DB pool, queue, worker, audit buffer, global resource registry,
or external client is invented. Deployment-specific timeouts and orchestration
remain unresolved.

## Security posture

The architecture is fail-closed:

- missing contracts block contract-dependent operations;
- missing identity or authorization evidence denies access;
- missing idempotency persistence blocks operations that require it;
- unknown contract versions follow an approved unsupported-version response,
  not best-effort interpretation;
- sensitive configuration is mandatory rather than silently defaulted; and
- no production capability is exposed merely because infrastructure starts.

The server uses a 65,536-byte transport body limit, normal JSON parsing only,
removes Fastify's `text/plain` parser, rejects prototype/constructor poisoning,
disallows error-handler override, removes `server` and `x-powered-by` response
headers, ignores inbound request-ID selection, and sets `trustProxy=false`.
CORS and rate limiting are not installed. Multipart, XML, form-data, binary
uploads, cookies, sessions, OpenAPI, and authentication parsers/plugins are
absent.

Support-report retention, production logging/provider policy, proxy topology,
CORS, rate limiting, and privacy classifications still require explicit
decisions before production use.

## Current non-goals

The API-2 foundation does not authorize:

- production endpoints or payloads;
- recreation or movement of Owner–Seller Mobile business logic;
- copied or locally invented Shared Contracts schemas;
- deep imports from Shared Contracts internals;
- authentication, identity, membership, or authorization implementations;
- production idempotency, synchronization, audit, or persistence;
- database selection, schemas, migrations, or transaction behavior;
- external service integrations;
- a production host, public bind, trusted proxy, CORS, or rate-limit policy;
- deployment, npm publication, or production migrations;
- real credentials or production data; or
- promises to Admin, Customer Mobile, Website, or other consumers.

## Verification gates

API-2 acceptance requires:

1. preservation of the exact API-1 archive, commit, package version, export map,
   lock integrity, public-import, and fail-closed version gates;
2. exact Fastify pin and passing construction, injection, error, logging,
   configuration, listener, startup, and shutdown tests;
3. architecture proof that Fastify remains in approved layers, only the runtime
   entrypoint listens, and production source registers zero routes;
4. reproducible `npm ci` plus `npm run verify` in a clean environment and a
   loopback-only runtime smoke with no process left running;
5. secret and dependency-audit gates, no auth/database/cloud/sync/deployment
   artifact, and unchanged Shared Contracts, Android, and Admin repositories;
   and
6. green final GitHub Actions evidence.

Until those final gates pass, API-2 is implemented locally but not complete.
After API-2, each future operation still requires a complete record in
`docs/endpoint-governance.md`, explicit approval, and closure of its security,
privacy, persistence, audit, transport, reliability, and compatibility
blockers. The approved transport architecture is not operation approval.
