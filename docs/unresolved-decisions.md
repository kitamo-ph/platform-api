# Platform API decision register

Current review date: 2026-08-11
Historical inspection date: 2026-07-25
Register scope: API-1/API-2 decisions and remaining gates for future Platform API work

API-0 began from a non-Git Platform API directory and an empty Shared Contracts
repository. Those dated findings remain historical. Platform API is now a Git
repository, and Shared Contracts SC-0 through SC-4 provide the accepted
`@kitamo/shared-contracts@0.1.0` public surface at commit
`a380f19f2adcf0557b424461f869aa3d0069e176`.

API-1 approves the bounded Shared Contracts consumer decisions recorded under
`decision-log/decisions/`. API-2 approves Fastify and the bounded local transport
foundation only. Merchant operations, identity, authorization, persistence,
production sync, audit persistence, privacy, production observability,
production runtime, and deployment decisions below remain Proposed,
Unresolved, or Blocked as stated. API-2 acceptance remains conditional on final
clean-environment, runtime-smoke, Git push, and CI evidence.

## API-ARCH-001 — Server framework

- **Status:** Approved for API-2 transport only
- **Decision:** Fastify `5.11.3` is the Platform API HTTP transport framework.
  The approval covers the server factory, injection testing, framework-level
  logging/errors, and explicit runtime lifecycle only.
- **Durable record:**
  `decision-log/decisions/api-arch-001-fastify-transport.md`.
- **Why it matters:** It controls route composition, boundary validation,
  logging, OpenAPI integration, testability, and shutdown behavior.
- **Current evidence:** Fastify `5.11.3` is exactly pinned and locally
  implemented on the Node 20/TypeScript 5.9/ESM/Vitest foundation. The server
  factory, configuration, logging, safe errors, injection, and shutdown
  boundaries are implemented without a production route or speculative plugin.
- **Remaining limits:** Deployment constraints, production performance and
  capacity evidence, hosting security review, and operation-specific plugin
  policy remain unresolved. The Shared Contracts boundary remains independently
  verified and framework-free.
- **Affected repositories:** `platform-api`; indirectly all future API
  consumers.
- **Contract impact:** The framework must accept Shared Contracts schemas
  without copying or reinterpreting them.
- **Android impact:** Future Android transports depend on stable validation and
  error behavior; no current Android behavior moves to the server.
- **Admin impact:** Future Admin operations would depend on stable validation
  and OpenAPI behavior.
- **Customer impact:** None now; future Customer APIs require a separately
  approved operation.
- **Website impact:** None now; a public Website API is outside scope.
- **Security impact:** Plugin trust, body limits, request parsing, headers, and
  error exposure depend on this choice.
- **Privacy impact:** Logging and error defaults must avoid sensitive payloads.
- **Persistence impact:** Persistence must remain behind ports regardless of
  framework.
- **Sync impact:** No sync ownership or mutation is authorized.
- **Offline impact:** No change to Android offline authority.
- **Rejected alternatives:** Hono, Express, and a locally assembled Node
  HTTP-only shell add no demonstrated advantage for this bounded transport and
  would increase local conventions or maintenance.
- **Required approvers:** Platform API milestone owner for the bounded transport;
  deployment and security owners remain required for production hosting.
- **Blocking milestones:** None for the API-2 transport foundation. Every
  production operation and deployment remains independently blocked.

## API-ARCH-002 — Runtime and deployment target

- **Status:** Unresolved for production runtime and deployment
- **Decision needed:** Approve the production Node support policy, process
  model, hosting target, binding/proxy policy, and runtime limits. API-1 fixes
  ESM, Node `>=20.19.4`, and CI Node `20.20.0`; API-2 adds an explicit local
  long-lived-process startup/shutdown model only.
- **Why it matters:** These constraints determine framework compatibility,
  cold starts, shutdown, observability, and connection management.
- **Current evidence:** The local runtime validates configuration, constructs
  and prepares Fastify before binding, uses loopback-safe local behavior, handles
  `SIGINT`/`SIGTERM`, and closes Fastify cleanly. `NODE_ENV=production` fails
  closed because no production deployment policy exists. No deployment file or
  public binding is approved.
- **Missing evidence:** Approved host, support window, regional/data-residency
  needs, scaling model, and operational ownership.
- **Affected repositories:** `platform-api`; CI and operations.
- **Contract impact:** Runtime must execute the approved Shared Contracts
  package and its runtime validators.
- **Android impact:** Future endpoint availability and compatibility only.
- **Admin impact:** Future endpoint availability and compatibility only.
- **Customer impact:** Future endpoint availability and compatibility only.
- **Website impact:** None until a Website API is approved.
- **Security impact:** Patch cadence, process isolation, TLS termination, and
  secret handling depend on the target.
- **Privacy impact:** Region and log/storage placement remain unknown.
- **Persistence impact:** Connection and transaction models cannot be selected
  before the target is known.
- **Sync impact:** No sync runtime is authorized.
- **Offline impact:** No change to local offline behavior.
- **Options:** Long-lived Node service; approved serverless Node target;
  containerized Node service.
- **Safest current recommendation:** Retain the verified API-1 tooling and API-2
  lifecycle boundary, and defer production hosting, public binding, proxy,
  scaling, and orchestration decisions.
- **Required approvers:** Platform API architect, operations owner, security
  owner, and privacy owner where residency is affected.
- **Blocking milestones:** Production deployment, persistence, or external
  integration.

## API-CONTRACT-001 — Shared Contracts package-consumption method

- **Status:** Approved for API-1
- **Decision:** Consume the exact GitHub source archive for
  `@kitamo/shared-contracts@0.1.0` at
  `a380f19f2adcf0557b424461f869aa3d0069e176`, validate its lock integrity and
  metadata, and build the installed copy with the consumer's pinned compiler.
- **Durable record:**
  `decision-log/decisions/api-contract-001-package-consumption.md`.
- **Why it changed:** SC-4 supplied an accepted package, version, public export
  map, runtime schemas, tests, and immutable commit.
- **Rejected alternatives:** Unpinned branch/latest; arbitrary sibling/file
  dependency; direct Git dependency without a usable built install surface;
  and a locally regenerated pack whose bytes differed across tested platforms.
- **Remaining limits:** Approval covers the API-1 package foundation only. It
  does not approve a producer change, package publication, merchant contracts,
  production operations, or cross-repository compatibility mappings.

## API-CONTRACT-002 — Contract-version negotiation

- **Status:** Approved for the API-1 boundary; transport negotiation remains
  unresolved
- **Decision:** Consume `ContractVersionSchema` and the package support
  utilities directly; support only `0.1.0`; reject malformed or unsupported
  values without fallback or coercion.
- **Durable record:**
  `decision-log/decisions/api-contract-002-version-enforcement.md`.
- **Current evidence:** Shared Contracts exports the canonical version grammar,
  `CURRENT_CONTRACT_VERSION`, `SUPPORTED_CONTRACT_VERSIONS`, and fail-closed
  assertion helpers.
- **Still unresolved:** Header/media-type/envelope placement, client upgrade
  recovery, and HTTP error mapping belong to a later transport or operation
  decision.
- **Blocking milestones:** Any production operation whose transport version
  negotiation is not separately approved.

## API-CONTRACT-003 — Outbound response validation

- **Status:** Blocked
- **Decision needed:** Define which response boundaries receive runtime
  validation and how validation failures are handled and observed.
- **Why it matters:** TypeScript alone cannot prove emitted runtime payloads
  conform to shared schemas.
- **Current evidence:** API-1 proves public primitive schemas and a
  transport-neutral adapter. API-2 maps bounded framework failures through safe
  structured-error semantics, but it has no merchant route or merchant response
  schema to validate.
- **Missing evidence:** Public response schemas, performance budgets, error
  policy, sampling policy if any, and framework integration.
- **Affected repositories:** `shared-contracts`, `platform-api`, and all future
  consumers.
- **Contract impact:** Cannot validate a response that has no canonical schema.
- **Android impact:** Prevents assurance of future response conformance.
- **Admin impact:** Prevents assurance of future response conformance.
- **Customer impact:** Prevents assurance of future response conformance.
- **Website impact:** None until public operations are approved.
- **Security impact:** Failure details must not leak internal data.
- **Privacy impact:** Validation should prevent accidental extra fields.
- **Persistence impact:** Adapter output must be validated outside persistence.
- **Sync impact:** Sync-result validation is blocked by its missing contract.
- **Offline impact:** No current offline behavior changes.
- **Options:** Validate every response; validate by environment; validate
  selected high-risk boundaries, subject to evidence.
- **Safest current recommendation:** Plan for validation at every approved
  external boundary; decide exceptions only with measured evidence.
- **Required approvers:** Platform API architect, security owner, and Shared
  Contracts owner.
- **Blocking milestones:** Any production response contract.

## API-AUTH-001 — External-to-internal identity mapping

- **Status:** Unresolved
- **Decision needed:** Define trusted identity-provider subject resolution to
  canonical internal user identity, including lifecycle and failure behavior.
- **Why it matters:** Authentication verification is not the same as identity,
  membership, or authorization.
- **Current evidence:** `UserIdSchema` now validates opaque structure, but no
  identity provider integration, trusted external-subject mapping, or identity
  store exists. Clerk integration is explicitly outside this task.
- **Missing evidence:** Provider choice, canonical user ID, linking rules,
  merge/recovery rules, revocation, tenant/stall boundaries, and audit policy.
- **Affected repositories:** `shared-contracts`, `platform-api`, Android,
  Admin, Customer Mobile.
- **Contract impact:** User ID structure is available; identity resolution and
  membership references remain missing.
- **Android impact:** Existing seller identity semantics must not be replaced
  or guessed.
- **Admin impact:** Admin identity and privilege resolution remains undefined.
- **Customer impact:** Customer identity remains undefined.
- **Website impact:** No website authentication is authorized.
- **Security impact:** Account takeover, confused-deputy, and cross-tenant risks
  are material.
- **Privacy impact:** Identity linkage and retention require review.
- **Persistence impact:** A mapping store may be required but is not designed.
- **Sync impact:** Actor identity for sync requests is undefined.
- **Offline impact:** Reauthentication and queued-action behavior is undefined.
- **Options:** Provider-subject mapping table; approved direct canonical claim;
  brokered identity service.
- **Safest current recommendation:** Keep authentication, identity resolution,
  membership, and authorization as separate future ports and fail closed.
- **Required approvers:** Security, privacy, Platform API, and relevant product
  identity owners.
- **Blocking milestones:** Authenticated operations, audit actor attribution,
  and synchronization.

## API-AUTH-002 — Membership model

- **Status:** Unresolved
- **Decision needed:** Define membership subject, organization/stall scope,
  lifecycle, status, invitation, suspension, and revocation semantics.
- **Why it matters:** Business access cannot be authorized from a role string
  without a scoped membership.
- **Current evidence:** Membership references and role references are missing
  from Shared Contracts; no server persistence exists.
- **Missing evidence:** Canonical model, ownership authority, scope hierarchy,
  lifecycle events, source of truth, and compatibility needs.
- **Affected repositories:** `shared-contracts`, `platform-api`, Android,
  Admin, Customer Mobile.
- **Contract impact:** Membership and role contracts must precede API payloads.
- **Android impact:** Current merchant/stall behavior must be inspected by its
  owners before mapping.
- **Admin impact:** Admin projections and privileges depend on the model.
- **Customer impact:** Customer membership, if any, must not be inferred from
  merchant membership.
- **Website impact:** None currently.
- **Security impact:** Incorrect scoping enables cross-stall access.
- **Privacy impact:** Membership exposes relationships between people and
  businesses.
- **Persistence impact:** Lifecycle and revocation likely require durable state.
- **Sync impact:** Membership changes may affect queued authorization.
- **Offline impact:** Offline access after revocation requires an explicit
  policy.
- **Options:** Organization membership with stall grants; direct stall
  membership; policy-derived membership.
- **Safest current recommendation:** Do not encode membership locally; request
  a cross-repository decision and canonical references first.
- **Required approvers:** Shared Contracts, Platform API, Android, Admin,
  security, and privacy owners.
- **Blocking milestones:** Authorization, seller/admin operations, and
  membership administration.

## API-AUTHZ-001 — Authorization-policy representation

- **Status:** Unresolved
- **Decision needed:** Define policy inputs, named actions/resources, scope,
  denial behavior, policy versioning, and decision audit data.
- **Why it matters:** Roles alone are insufficient evidence that an operation
  is permitted.
- **Current evidence:** No roles, memberships, policy contracts, identity
  resolution, or approved operations exist.
- **Missing evidence:** Business resource taxonomy, ownership rules, admin
  privilege model, separation-of-duties needs, and policy authority.
- **Affected repositories:** `shared-contracts`, `platform-api`, Android,
  Admin, Customer Mobile.
- **Contract impact:** Role and membership references are missing; operation
  policies cannot be published.
- **Android impact:** Existing local capability semantics must not be moved
  without evidence.
- **Admin impact:** Privileged workflows require explicit policy approval.
- **Customer impact:** Customer resource access requires a distinct policy.
- **Website impact:** Public access, if any, needs explicit operation records.
- **Security impact:** Central fail-closed authorization and least privilege are
  required.
- **Privacy impact:** Policies must enforce purpose and data-scope limits.
- **Persistence impact:** Policy data and decision evidence may need storage.
- **Sync impact:** Authorization time for queued writes is undefined.
- **Offline impact:** Local/offline authorization and later server rejection
  need an approved reconciliation policy.
- **Options:** Code policies; declarative policy engine; capability grants;
  hybrid approach.
- **Safest current recommendation:** Define operation-specific policy ports,
  default deny, and add no role-to-permission shortcut.
- **Required approvers:** Security, Platform API, and affected product/domain
  owners.
- **Blocking milestones:** Every non-public production operation.

## API-IDEMPOTENCY-001 — Persistent idempotency

- **Status:** Unresolved
- **Decision needed:** Define key contract, scope, uniqueness, request
  fingerprinting, storage, retention, replay result, conflicts, and transaction
  coupling.
- **Why it matters:** Retries must not duplicate approved mutations.
- **Current evidence:** The v0.1 package has structured errors and opaque ID
  primitives but no public idempotency-key contract. Persistence, mutation
  operations, and transaction technology are all absent.
- **Missing evidence:** Canonical identifier, client retry behavior, operation
  taxonomy, durability target, retention, privacy classification, and recovery
  semantics.
- **Affected repositories:** `shared-contracts`, `platform-api`, Android,
  Admin, Customer Mobile.
- **Contract impact:** The idempotency identifier and operation semantics remain
  missing; shared structured errors alone do not resolve them.
- **Android impact:** Offline retries and replay semantics are especially
  sensitive.
- **Admin impact:** Retried privileged actions require deterministic results.
- **Customer impact:** Retried customer mutations require separate approval.
- **Website impact:** None currently.
- **Security impact:** Key guessing, cross-user collisions, and payload mismatch
  must fail safely.
- **Privacy impact:** Stored fingerprints and results need minimization and
  retention rules.
- **Persistence impact:** Requires durable state within the operation
  transaction boundary.
- **Sync impact:** Must not be conflated with sync item identifiers.
- **Offline impact:** Must handle delayed and repeated submissions explicitly.
- **Options:** Per-operation durable record; transactional inbox; approved
  provider-backed store.
- **Safest current recommendation:** Do not implement in memory or claim
  idempotency until operation and persistence decisions exist.
- **Required approvers:** Platform API architect, data owner, security owner,
  privacy owner, and affected client owners.
- **Blocking milestones:** Any retryable production mutation.

## API-SYNC-001 — Synchronization ownership

- **Status:** Blocked
- **Decision needed:** Define which system owns sync orchestration, entity
  authority, conflict detection/resolution, ordering, retries, tombstones, and
  reconciliation.
- **Why it matters:** Adding a transport envelope does not establish business
  authority or correct offline conflict behavior.
- **Current evidence:** Owner–Seller Mobile remains the authority for
  implemented offline operations. Shared Contracts exports four event names
  and a limited `SyncEventSchema`, but no production sync request/result,
  acknowledgement, batch, retry, conflict-resolution, tombstone, or authority
  protocol. No server sync mutation is authorized.
- **Missing evidence:** Approved Android operational discovery, production sync
  request/result/protocol contracts, per-entity ownership, conflict rules,
  deletion semantics, versioning, and security policy.
- **Affected repositories:** `shared-contracts`, `platform-api`,
  `owner-seller-mobile`; potentially Admin and Customer Mobile.
- **Contract impact:** Limited operational event metadata is consumable; the
  production sync envelope/result and protocol remain missing.
- **Android impact:** High; current local operations and protected financial
  semantics must not be reinterpreted.
- **Admin impact:** Server projections cannot imply authority over merchant
  state without a decision.
- **Customer impact:** Customer-originated state interaction is undefined.
- **Website impact:** None currently.
- **Security impact:** Replay, spoofing, cross-stall access, and conflict abuse
  require controls.
- **Privacy impact:** Sync may replicate personal or merchant data across
  devices and server storage.
- **Persistence impact:** Durable inbox/outbox, versions, conflicts, and
  tombstones may be required.
- **Sync impact:** This is the controlling decision.
- **Offline impact:** Defines preservation, rejection, and recovery for queued
  local work.
- **Options:** Android-authoritative replication; server-authoritative model;
  entity-specific authority; explicitly limited backup/export.
- **Safest current recommendation:** Keep all sync mutations blocked and use
  owner-approved Android evidence plus new Shared Contracts design work only
  through a separately authorized milestone.
- **Required approvers:** Android product/domain owners, Shared Contracts
  owner, Platform API architect, security, privacy, and data owners.
- **Blocking milestones:** Any sync endpoint, cloud-authority transfer, or
  merchant state mutation.

## API-DATA-001 — Persistence technology

- **Status:** Unresolved
- **Decision needed:** Select storage technology, transaction guarantees,
  availability target, tenancy isolation, backup/recovery, and operational
  ownership.
- **Why it matters:** Data semantics and reliability cannot be retrofitted
  safely after operations are published.
- **Current evidence:** No persistence code, schema, migration, deployment
  target, production operation, or approved data model exists.
- **Missing evidence:** Workload, data classification, volume, consistency,
  recovery objectives, residency, cost, and operating model.
- **Affected repositories:** `platform-api`; all future data-owning consumers.
- **Contract impact:** Canonical contracts must remain independent of a
  database representation.
- **Android impact:** A server database must not silently replace SQLite or
  local authority.
- **Admin impact:** Admin projections require separately approved sources.
- **Customer impact:** Customer records require distinct privacy and ownership
  decisions.
- **Website impact:** No Website persistence is authorized.
- **Security impact:** Isolation, encryption, credentials, and access paths
  depend on the choice.
- **Privacy impact:** Residency, deletion, retention, and backup behavior are
  material.
- **Persistence impact:** This is the controlling technology decision.
- **Sync impact:** Sync design may impose transactional/versioning needs.
- **Offline impact:** Server durability does not define offline authority.
- **Options:** Managed relational database; approved document/key-value store;
  operation-specific storage behind ports.
- **Safest current recommendation:** Define operation/data requirements first;
  keep persistence behind ports and add no vendor client.
- **Required approvers:** Platform API architect, data, security, privacy, and
  operations owners.
- **Blocking milestones:** Database schema, migrations, production mutations,
  and Supabase or other vendor integration.

## API-DATA-002 — Migration ownership

- **Status:** Unresolved
- **Decision needed:** Define who authors, reviews, executes, observes, and
  rolls back database migrations and contract-related data migrations.
- **Why it matters:** Application deployment and durable schema change must
  have an accountable, recoverable sequence.
- **Current evidence:** No database, schema, migration tooling, deployment
  pipeline, or production access exists.
- **Missing evidence:** Persistence choice, environments, ownership, backward
  compatibility window, backup policy, and rollback constraints.
- **Affected repositories:** `platform-api`; operations and any approved data
  consumers.
- **Contract impact:** Contract changes may require data migration but cannot
  dictate storage schemas.
- **Android impact:** Android SQLite migrations remain Android-owned and are
  not copied to Platform API.
- **Admin impact:** Projection migrations require source ownership clarity.
- **Customer impact:** Customer data migrations require privacy review.
- **Website impact:** None currently.
- **Security impact:** Migration privileges must be isolated and audited.
- **Privacy impact:** Backfills, deletions, and backups require handling rules.
- **Persistence impact:** Direct and substantial.
- **Sync impact:** Version transitions must preserve in-flight/offline data.
- **Offline impact:** Client upgrade and server migration ordering may interact.
- **Options:** Repository-owned migrations in controlled CI/CD; dedicated data
  operations workflow; approved managed migration service.
- **Safest current recommendation:** Defer until persistence and operational
  ownership are approved; never run production migrations from local setup.
- **Required approvers:** Data owner, Platform API architect, operations,
  security, and privacy owners.
- **Blocking milestones:** First database schema and every production data
  migration.

## API-AUDIT-001 — Audit-event persistence

- **Status:** Blocked
- **Decision needed:** Define the production audit event policy,
  event-time/actor/subject authority, tamper resistance, storage, retention,
  access, export, and failure behavior around the limited shared shape.
- **Why it matters:** Application logs are not a substitute for durable
  security and business audit evidence.
- **Current evidence:** Shared Contracts exports a limited `AuditEventSchema`,
  but identity, authorization, persistence, operation, and privacy policies are
  absent.
- **Missing evidence:** Required event policy, authoritative actor resolution,
  retention, legal/privacy basis, access model, integrity requirements, and
  storage.
- **Affected repositories:** `shared-contracts`, `platform-api`, Android,
  Admin, Customer Mobile.
- **Contract impact:** A limited audit shape and correlation ID are consumable;
  durable audit policy and persistence remain blocked.
- **Android impact:** Local event evidence must not be relabeled as server audit
  without owner-approved semantics.
- **Admin impact:** Privileged operations need strong actor and reason evidence.
- **Customer impact:** Customer data access/change auditing requires privacy
  review.
- **Website impact:** None currently.
- **Security impact:** Audit gaps and tampering would weaken incident response.
- **Privacy impact:** Audit records can contain persistent personal metadata.
- **Persistence impact:** Requires durable, access-controlled storage and
  retention.
- **Sync impact:** Sync actor/device/correlation evidence is undefined.
- **Offline impact:** Event time versus server receipt time needs a canonical
  model.
- **Options:** Append-only database records; managed audit store; approved
  event sink with durable guarantees.
- **Safest current recommendation:** Use the shared limited shape only for
  conformance; define the event policy before choosing storage; fail an
  operation if its required audit write cannot meet the approved guarantee.
- **Required approvers:** Shared Contracts, Platform API, security, privacy,
  data, and affected product owners.
- **Blocking milestones:** Audited production operations and privileged Admin
  operations.

## API-RELIABILITY-001 — Operational logging

- **Status:** Proposed for production; the bounded API-2 local baseline is
  approved separately under `API-TRANSPORT-008`
- **Decision:** Use Fastify structured operational logs with bounded severity,
  safe request identifiers, default credential/header redaction, and no request
  or response body logging. Operational logs are not canonical audit.
- **Durable record:**
  `decision-log/decisions/api-transport-008-redacted-operational-logging.md`.
- **Decision still needed:** Approve production sampling, retention, sinks,
  access, regional placement, and incident ownership.
- **Why it matters:** Useful diagnosis must not expose credentials, personal
  data, or merchant payloads.
- **Current evidence:** API-2 implements framework-native structured logging and
  tests redaction. `CorrelationIdSchema` remains consumable through the contract
  boundary, while Fastify request IDs remain internal operational identifiers.
  No provider, deployment, or production retention policy exists.
- **Missing evidence:** Hosting/log sink, correlation propagation policy,
  privacy classification, retention, support process, and cost limits.
- **Affected repositories:** `platform-api`; operations and support.
- **Contract impact:** Correlation identifiers and structured errors are
  available primitives; logging policy remains Platform API-owned.
- **Android impact:** Cross-system correlation is unavailable.
- **Admin impact:** Privileged action diagnosis needs careful redaction.
- **Customer impact:** Customer request logs may contain personal metadata.
- **Website impact:** None currently.
- **Security impact:** Never log secrets/tokens; protect integrity and access.
- **Privacy impact:** Minimize identifiers and define retention/deletion.
- **Persistence impact:** Operational logs must remain separate from domain
  persistence and audit records.
- **Sync impact:** Batch/item correlation requires canonical identifiers.
- **Offline impact:** Client-generated timestamps and identifiers need clear
  trust rules.
- **Options:** Framework-native structured logger; OpenTelemetry-compatible
  abstraction; approved managed log adapter.
- **Safest current recommendation:** Preserve the bounded structured/redacted
  baseline and select a production sink, access policy, and retention only after
  hosting and privacy approval.
- **Required approvers:** Platform API, operations, security, and privacy
  owners.
- **Blocking milestones:** Production observability and support operations.

## API-SECURITY-001 — CORS policy

- **Status:** Unresolved
- **Decision needed:** Define which browser origins, methods, headers,
  credentials, and preflight caching are allowed per environment and operation.
- **Why it matters:** Browser reachability is an explicit trust boundary, not a
  default framework setting.
- **Current evidence:** API-2 intentionally installs no CORS plugin and exposes
  no production route. No production domains, browser operation, environment
  topology, or authentication scheme is approved.
- **Missing evidence:** Approved consumer origins, deployment domains,
  credential strategy, environment separation, and threat model.
- **Affected repositories:** `platform-api`, Admin, Website; potentially
  browser-based support tooling.
- **Contract impact:** None to canonical payload meaning; it affects transport
  exposure.
- **Android impact:** Native Android is not governed by browser CORS.
- **Admin impact:** Future Admin browser access requires an exact allowlist.
- **Customer impact:** Customer Mobile native access is not enabled by CORS.
- **Website impact:** No public Website API is authorized.
- **Security impact:** Wildcard or reflective origins can expose authenticated
  operations.
- **Privacy impact:** Cross-origin access can disclose personal or merchant
  data.
- **Persistence impact:** None directly.
- **Sync impact:** None directly; browser sync is not approved.
- **Offline impact:** None directly.
- **Options:** No CORS; environment-specific exact allowlist; approved gateway
  enforcement plus application checks.
- **Safest current recommendation:** Default to no browser cross-origin access;
  add exact origins only for approved browser consumers.
- **Required approvers:** Security, Platform API, and each affected browser
  consumer owner.
- **Blocking milestones:** Any browser-consumed production operation.

## API-SECURITY-002 — Rate limiting

- **Status:** Unresolved
- **Decision needed:** Define rate-limit keys, scopes, quotas, bursts,
  exemptions, distributed enforcement, errors, headers, and incident override.
- **Why it matters:** Limits protect availability and abuse surfaces but can
  also reject legitimate offline retries or shared-network users.
- **Current evidence:** API-2 intentionally installs no rate-limit plugin. A
  structured error primitive and bounded body limit exist, but no operation
  inventory, identity, traffic profile, deployment topology, distributed store,
  or production sync behavior exists.
- **Missing evidence:** Threat model, capacity targets, client retry policy,
  trusted proxy rules, tenancy keys, and support process.
- **Affected repositories:** `platform-api` and every future consumer.
- **Contract impact:** Rate-limit error behavior requires canonical structured
  errors and possibly retry metadata.
- **Android impact:** Offline replay and intermittent connectivity need
  operation-aware policies.
- **Admin impact:** Privileged bulk operations need explicit quotas.
- **Customer impact:** Shared devices/networks must not create unfair lockout.
- **Website impact:** Public operations, if approved, need stronger abuse
  controls.
- **Security impact:** Availability, brute-force, enumeration, and resource
  abuse controls are material.
- **Privacy impact:** IP/device/user keys and retention require review.
- **Persistence impact:** Distributed counters may require external state.
- **Sync impact:** Batch and item limits must preserve safe retry behavior.
- **Offline impact:** Retry guidance and idempotency must align with limits.
- **Options:** Gateway enforcement; application plugin; distributed limiter;
  layered per-operation controls.
- **Safest current recommendation:** Require a limit policy in each operation
  record; choose enforcement only after topology and identity are approved.
- **Required approvers:** Security, operations, Platform API, privacy, and
  affected client owners.
- **Blocking milestones:** Public/authentication operations and production
  traffic.

## API-CONTRACT-004 — Application-version policy

- **Status:** Blocked
- **Decision needed:** Define client version representation, minimum/supported
  versions, platform/channel scope, enforcement, grace periods, and user-safe
  remediation.
- **Why it matters:** Contract compatibility and security upgrade enforcement
  must be predictable, especially for offline clients.
- **Current evidence:** Shared Contracts exports app-version value/reference
  primitives and a canonical contract-version support check. It does not export
  a production minimum/supported client-version policy; current client release
  policies were not approved for this milestone.
- **Missing evidence:** Owning authority, Android/Admin/Customer version
  sources, release channels, compatibility matrix, and error behavior.
- **Affected repositories:** `shared-contracts`, `platform-api`, Android,
  Admin, Customer Mobile; Website for any public status wording.
- **Contract impact:** Version value schemas and
  `UNSUPPORTED_CONTRACT_VERSION` exist; rollout and enforcement policy is
  missing.
- **Android impact:** Forced-update/offline recovery must respect release
  reality and local data safety.
- **Admin impact:** Web build/version compatibility needs its own representation.
- **Customer impact:** Customer Mobile version enforcement needs separate
  approval.
- **Website impact:** Public support claims must be evidence-backed.
- **Security impact:** Old vulnerable clients may require blocking; spoofed
  versions must not grant trust.
- **Privacy impact:** Version/device metadata collection must be minimized.
- **Persistence impact:** Policy/config storage and rollout history may be
  needed.
- **Sync impact:** Delayed payloads from older clients need a compatibility
  path.
- **Offline impact:** Enforcement must define behavior when a client cannot
  update immediately.
- **Options:** Server configuration against a canonical schema; signed policy;
  deployment-provided policy adapter.
- **Safest current recommendation:** Do not invent headers or semver rules;
  request the Shared Contracts policy and cross-client approval.
- **Required approvers:** Shared Contracts, Platform API, Android, Admin,
  Customer Mobile, security, and release owners.
- **Blocking milestones:** Production client-version enforcement and release
  compatibility behavior; API-1 contract-version enforcement is independently
  resolved by `API-CONTRACT-002`.

## API-PRIVACY-001 — Support-report data retention

- **Status:** Unresolved
- **Decision needed:** Define support-report purpose, fields, consent/notice,
  collection path, access, retention, deletion, export, and incident handling.
- **Why it matters:** Diagnostic reports can combine identifiers, device data,
  logs, and business information.
- **Current evidence:** Shared Contracts exports a limited
  `ProblemReportReferenceSchema`; no upload contract, endpoint, storage, privacy
  classification, support workflow, or retention policy exists.
- **Missing evidence:** Approved use case, data inventory, legal/privacy basis,
  minimization, user controls, authorized support roles, and storage location.
- **Affected repositories:** `shared-contracts`, `platform-api`, Android,
  Admin/support tooling, Customer Mobile if in scope.
- **Contract impact:** The limited shared reference may be validated, but a
  collection/request contract and approved workflow are required before
  external collection.
- **Android impact:** Existing problem-report behavior must be inspected and
  approved before server collection.
- **Admin impact:** Support access and redaction need explicit policy.
- **Customer impact:** Customer diagnostics must not inherit merchant rules.
- **Website impact:** Public support/privacy wording requires approved claims.
- **Security impact:** Reports may leak secrets, tokens, internal state, or
  sensitive operational details.
- **Privacy impact:** Direct and substantial; minimization and short retention
  are required.
- **Persistence impact:** Encrypted storage, deletion, access logs, and backups
  may be required.
- **Sync impact:** Support reports must not become an undeclared sync channel.
- **Offline impact:** Local report queueing, user review, and expiry need
  definition.
- **Options:** User-reviewed redacted upload; local export for manual support;
  narrowly scoped approved diagnostic endpoint.
- **Safest current recommendation:** Collect nothing server-side until a
  privacy-reviewed schema and workflow are approved; prefer user-controlled
  export during discovery.
- **Required approvers:** Privacy, security, support, Platform API, and affected
  client/product owners.
- **Blocking milestones:** Any support-report upload, retention, or support
  portal.

## Register-level coordination

The Shared Contracts package/Git-bootstrap blockers are resolved for API-1, and
the local server/transport choice is resolved for API-2. The remaining blockers
are operation- and production-specific: merchant contracts, identity and
authorization, persistence and idempotency, audit policy/storage, privacy,
production sync, production observability, runtime/deployment topology, CORS,
and rate limiting.

No production milestone should begin from this register. Each decision that
crosses an authority boundary must be promoted into a durable decision record
only after the named approvers provide identifiable evidence.
