# Platform API decision log

This directory records durable Platform API architecture and governance
decisions. A task, roadmap item, proposal, or compiling implementation is not
an approved decision.

## Decision identifiers

Use a Platform API-owned identifier:

```text
API-<AREA>-<three-digit sequence>
```

Examples include `API-ARCH-001`, `API-CONTRACT-001`,
`API-SECURITY-001`, and `API-SYNC-001`. Do not reuse identifiers owned by
another repository.

## Statuses

- **Proposed** — a concrete option is documented and awaits the required
  approvals.
- **Approved** — the named approvers have explicitly accepted the decision,
  with approval evidence recorded in the decision.
- **Deferred** — intentionally postponed with a reconsideration condition.
- **Blocked** — a named dependency prevents a decision or implementation.
- **Deprecated** — retained temporarily but marked for retirement.
- **Superseded** — replaced by a later approved Platform API decision.
- **Rejected** — considered and explicitly declined.

Only explicit approval evidence may move a decision to **Approved**. Absence of
an objection is not approval.

## Required decision fields

Every decision record must contain:

```text
ID
Title
Status
Date
Owners
Required approvers
Approval evidence
Context
Decision
Rationale
Alternatives
Consequences
Security impact
Privacy impact
Persistence impact
Compatibility impact
Affected repositories
Implementation gate
Verification
Reconsideration conditions
Supersedes
Superseded by
```

Use one Markdown file per decision in `decisions/`, named with the lower-case
identifier and a short slug, for example:

```text
decisions/api-contract-001-package-consumption.md
```

## Approval and cross-repository escalation

A decision may be approved only by the owners responsible for every affected
authority boundary. Platform API owners may approve internal implementation
details that do not change shared meaning. A change to canonical contracts,
Android operational semantics, Admin projections, Customer behavior, Website
claims, security, privacy, identity, or data ownership must be escalated to the
corresponding repository or domain owner before implementation.

If a decision requires another repository to change, its Platform API record
stays **Proposed** or **Blocked** until the external approval and dependency are
identifiable. Platform API must not manufacture a local substitute for a
missing Shared Contracts decision.

## Superseded decisions

Approved history is immutable. Do not rewrite an old decision to make a new
choice appear historical. Create a new decision, set its `Supersedes` field,
and update the old record's status to **Superseded** with a `Superseded by`
link. Retain both records.

## API-1 approved decisions

| ID                 | Decision                                            | Scope                                              |
| ------------------ | --------------------------------------------------- | -------------------------------------------------- |
| `API-CONTRACT-001` | Exact source-archive package consumption            | Consumer acquisition/build/integrity only          |
| `API-CONTRACT-002` | Fail-closed support for contract version `0.1.0`    | Transport-neutral version boundary only            |
| `API-CONTRACT-005` | Declared public imports only                        | Prohibits internal/deep runtime dependencies       |
| `API-CONTRACT-006` | Narrow adapter; no copied schemas                   | `src/contracts/` consumer boundary                 |
| `API-CONTRACT-007` | API-1 is not an operation milestone                 | No endpoints or production integrations            |
| `API-ARCH-003`     | API-1 remains transport-neutral                     | Does not approve Fastify or another framework      |
| `API-AUTH-003`     | Structural validation is not identity/authorization | No principal, membership, role, or trust inference |

`API-CONTRACT-003` retains its existing meaning, outbound response validation,
and remains blocked for production operations. `API-CONTRACT-004` retains its
existing meaning, production application-version policy, and remains blocked.
Their IDs are not repurposed by API-1.
