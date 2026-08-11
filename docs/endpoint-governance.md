# Platform API Endpoint Governance

## Status and purpose

This document defines the evidence and approval record required for every
future Platform API operation. It governs proposals; it does not authorize an
endpoint or production behavior.

Historical API-0 evidence at 2026-07-25 was:

- the local Platform API repository began as an empty, non-Git directory;
- the expected remote is empty and has an unborn HEAD;
- no Platform API operation exists or is approved;
- no verified Shared Contracts public package export was available for
  Platform API consumption; and
- API-1 was blocked.

Current API-1 evidence at 2026-08-11 is:

- API-0 is complete at
  `b93afd444a3e38edc42cb0cb54f44aa780c4d14a`;
- Shared Contracts SC-0 through SC-4 are accepted and frozen for this phase;
- `@kitamo/shared-contracts@0.1.0` is available at accepted commit
  `a380f19f2adcf0557b424461f869aa3d0069e176`;
- Platform API has a transport-neutral, public-export-only contract boundary;
- no Platform API operation exists or is approved; and
- no HTTP route, framework, listener, OpenAPI operation, authentication,
  persistence, cloud integration, production sync, or deployment exists.

**A route that compiles, starts, responds, passes tests, or appears in OpenAPI
is not sufficient evidence that the operation is approved.**

## Governing principles

1. Every operation needs one complete, reviewable operation record before a
   production-facing route is implemented.
2. Request, response, error, identifier, version, and envelope contracts must
   come from verified Shared Contracts public exports.
3. Documentation, roadmap text, internal source files, deep imports, or copied
   schemas are not public contract evidence.
4. Authentication, identity resolution, authorization, membership, role, and
   stall scope are distinct decisions and must be recorded separately.
5. Unknown or missing evidence fails closed. It must be recorded as a blocker,
   not filled with an invented default.
6. Implementation state and approval state are separate. Code and tests do not
   confer approval.
7. A change to a governed field requires review of the operation record and
   may require renewed cross-repository approval.

## Required operation record

Every future operation record must contain all fields below. `None` is valid
only when supported by evidence and rationale; `TBD` is a blocker, not a
completed field.

| Field                           | Required content                                                                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operation ID                    | Stable, unique Platform API identifier. The identifier format must be approved before use and must not reuse another repository's decision IDs.                                  |
| Purpose                         | One narrowly stated outcome and the evidence that the outcome belongs in Platform API. Avoid capability or roadmap claims.                                                       |
| Consumer                        | Every known consumer repository or approved external caller, including the expected request context and compatibility obligations.                                               |
| Request contract                | Exact Shared Contracts public import path, exported symbol, runtime validation capability, source evidence, and version. Locally copied or deep-imported schemas are prohibited. |
| Response contract               | Exact Shared Contracts public import path, exported symbol, runtime validation capability, source evidence, and version. Include success variants only when approved.            |
| Contract version                | Version source, negotiation location, supported range, selection rules, and evidence tying the operation to that version.                                                        |
| Authentication                  | Approved credential-verification mechanism, trust boundary, failure behavior, and referenced security decision. Authentication must not be inferred from route placement.        |
| Identity resolution             | Approved mapping from verified external identity to canonical internal user or actor references, including ambiguity and failure behavior.                                       |
| Authorization policy            | Named, approved policy; required inputs; decision owner; denial behavior; and tests. Authentication alone is not authorization.                                                  |
| Business scope                  | The approved business boundary of the operation and the authority evidence for it. Platform API must not redefine merchant semantics.                                            |
| Stall scope                     | How canonical stall scope is resolved and authorized. Any Android `branch` compatibility mapping must cite a verified Shared Contracts public export.                            |
| Idempotency policy              | Whether required; key contract; caller and operation scope; persistence; retention; replay result; concurrency behavior; and mismatch or conflict response.                      |
| Audit behavior                  | Approved event classification, Shared Contracts audit envelope, actor and target references, emission timing, failure behavior, persistence, access, and retention.              |
| Error behavior                  | Exact public structured-error and field-violation exports, transport-status mapping, safe internal-error mapping, and disclosure limits.                                         |
| Rate-limit behavior             | Whether required; subject and scope; budget; window; storage; distributed behavior; response contract; headers; exemptions; and approval source.                                 |
| Transaction boundary            | Atomic work, consistency expectation, ordering, concurrency control, rollback or compensation behavior, and retry ownership.                                                     |
| Persistence dependencies        | Every required store or repository port, data ownership, migration owner, transaction participation, retention, and failure behavior.                                            |
| External dependencies           | Every outbound system or service, purpose, data classification, credentials, timeouts, retry policy, circuit behavior, fallback, and test strategy.                              |
| Observability                   | Stable operation name, correlation propagation, safe logs, metrics, traces, alert conditions, redaction, sampling, and prohibited data.                                          |
| Privacy classification          | Data classes handled, collection necessity, minimization, purpose, access, retention, deletion, residency constraints, and required privacy review.                              |
| Backward-compatibility behavior | Supported consumer and contract versions, additive-change expectations, deprecation policy, migration path, and compatibility tests.                                             |
| Unsupported-version behavior    | Detection point, fail-closed response, exact approved error contract, telemetry, and consumer recovery guidance. Never silently reinterpret.                                     |
| Open decisions                  | Every unresolved Platform API or cross-repository decision ID, owner, missing evidence, and whether it blocks implementation or release.                                         |
| Approval status                 | Status, named approving authority or authorities, approval evidence, date, conditions, expiration or revalidation trigger, and implementation/release limits.                    |

## Approval status

The approval field must use one of these states:

| Status     | Meaning                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proposed   | The operation record is being evaluated. No production implementation or exposure is authorized.                                                             |
| Blocked    | Named missing evidence or decision prevents approval or safe implementation.                                                                                 |
| Approved   | Explicit approval evidence exists from every required authority, with conditions recorded. Approval is never inferred from silence, code, tests, or a merge. |
| Deprecated | An approved retirement or replacement path exists. Existing compatibility and removal conditions remain enforceable.                                         |

An operation's implementation may separately be absent, prototyped, tested, or
deployed. Those descriptions must never replace its approval status.

No current Platform API operation may be marked `Approved` from the available
evidence.

## Operation record template

Use this structure for every proposed operation:

```text
Operation ID:
Purpose:
Consumer:
Request contract:
Response contract:
Contract version:
Authentication:
Identity resolution:
Authorization policy:
Business scope:
Stall scope:
Idempotency policy:
Audit behavior:
Error behavior:
Rate-limit behavior:
Transaction boundary:
Persistence dependencies:
External dependencies:
Observability:
Privacy classification:
Backward-compatibility behavior:
Unsupported-version behavior:
Open decisions:
Approval status:
Approval evidence:
Approvers:
Approval conditions:
Revalidation triggers:
```

The supporting evidence should include repository path or public import path,
version or commit, test or fixture path, and decision reference as applicable.
A field should link to its authority rather than restating canonical semantics
locally.

## Contract gate

An operation is blocked unless all public contract dependencies are:

- implemented and inspectable;
- exported through a documented public entry point;
- versioned through an identifiable approved distribution mechanism;
- usable at runtime where runtime validation is required;
- covered by relevant tests and fixtures;
- compatible with the intended consumer versions; and
- free of unresolved mappings that Platform API would otherwise need to
  invent.

The presence of a TypeScript type alone does not prove runtime suitability.
Source excluded from package exports is not consumable evidence. A proposed
package name or version is not a published contract.

The accepted v0.1 package now satisfies the package-level contract gate for its
documented foundational primitives. It does not provide merchant-domain
request/response contracts, membership or canonical role models, complete
identity semantics, a production sync result/protocol, or a public Android
`branch` compatibility adapter. An operation depending on those areas remains
`Blocked`, as does any operation missing its independent identity,
authorization, persistence, audit, privacy, reliability, or approval evidence.

## Identity and access gate

Before approval, the record must demonstrate:

1. how credentials are verified;
2. how a verified external identity becomes a canonical actor;
3. how membership and role references are resolved;
4. how business and canonical stall scope are established;
5. which authorization policy makes the decision;
6. how denial and ambiguous identity are represented; and
7. how security-relevant outcomes are audited without exposing secrets.

Client-provided user, membership, role, business, branch, or stall identifiers
are claims, not resolved authority. Missing evidence denies the operation.

## Reliability and data gate

Mutating operations require explicit decisions for idempotency persistence,
transaction boundaries, concurrency, retries, audit failure, and recovery.
Operations that read or write durable data require an approved persistence
owner, migration owner, privacy classification, retention policy, and
authorization scope.

In-memory substitutes are not production evidence for persistent
idempotency, transactions, audit, or synchronization.

## Compatibility gate

The operation record must identify affected consumer repositories and the
contract versions they can use. Compatibility behavior must be tested using
approved fixtures or consumer evidence.

In particular, Platform API must not translate Android `branch` values into
canonical `stall` values until Shared Contracts exposes an approved,
inspectable compatibility mapping through a public import path.

Unsupported versions must fail through the approved structured-error contract.
Best-effort parsing, silent field dropping, or unrecorded coercion is
prohibited.

## OpenAPI and route registration

OpenAPI is a projection of approved operation records and verified public
contracts. It is not a source of product meaning or approval.

A route may be registered for production exposure only when:

- its operation record is complete;
- its approval status is `Approved`;
- approval conditions are satisfied;
- required public contracts are verified;
- referenced security, privacy, persistence, audit, and reliability decisions
  are approved;
- request and response validation use the approved contracts;
- negative, authorization, compatibility, and failure tests pass; and
- the generated OpenAPI description matches the approved record.

Health or internal operational routes, if later approved, still require an
operation record appropriate to their exposure and information-disclosure
risk.

## Change control

Review and, where required, reapprove an operation when any of the following
changes:

- purpose, consumer, or business or stall scope;
- request, response, error, or contract version;
- authentication, identity resolution, or authorization;
- idempotency, audit, rate limits, or transaction behavior;
- persistence or external dependencies;
- observability or privacy classification;
- backward compatibility or unsupported-version behavior; or
- an approval condition, dependency status, or open decision.

Breaking changes require an approved versioning and consumer migration plan.
Emergency changes do not waive documentation, audit, security, privacy, or
follow-up approval requirements.

## Current gate result

API-1 contract consumption is no longer blocked by package absence. Production
operations remain **Blocked / not approved**:

- there are no approved operation records;
- merchant-domain request/response contracts are intentionally absent;
- runtime, framework, identity, authorization, persistence, idempotency,
  audit, rate-limit, versioning, and deployment decisions remain unapproved;
  and
- production behavior is outside the authorized milestone.

The bounded safe next gate, after API-1 verification and CI acceptance, is
API-2 server runtime and transport foundation under separate authorization.
API-2 must not create a production-facing operation without a complete record
and explicit approval under this document.
