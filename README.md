# KitaMo Platform API

> **Contract-consumer foundation only:** this repository has no HTTP server,
> routes, production endpoint, persistence, authentication, Clerk, Supabase,
> production synchronization, or deployment configuration. API-1 does not make
> it a production service.

## Current status

| Area                | Status                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| API-0               | Complete; the 2026-07-25 repository and dependency evidence is preserved as historical baseline material                                        |
| API-1               | Shared Contracts consumption foundation implemented; acceptance requires all local, clean-environment, and GitHub Actions gates to remain green |
| Package/tooling     | npm, Node `>=20.19.4`, CI Node `20.20.0`, strict TypeScript 5.9, ESLint 9, Prettier 3, and Vitest                                               |
| Shared Contracts    | `@kitamo/shared-contracts@0.1.0`, pinned to source commit `a380f19f2adcf0557b424461f869aa3d0069e176`                                            |
| Contract boundary   | Transport-neutral adapter under `src/contracts/`; declared package exports only                                                                 |
| Contract versions   | `0.1.0` only; malformed and unsupported versions fail closed                                                                                    |
| Tests and CI        | Contract conformance, architecture, fixture, build, secret, and dependency-audit gates; no deployment job                                       |
| Server framework    | Not selected; Fastify remains an API-0 proposal for a later milestone                                                                           |
| Production behavior | None                                                                                                                                            |

API-1 proves that Platform API can acquire, build, resolve, validate, and test
the approved Shared Contracts package reproducibly. It does not approve an
operation. A route compiling or a schema parsing does not authorize an
endpoint.

## Shared Contracts authority and pin

The canonical cross-repository authority consumed here is:

```text
repository: https://github.com/kitamo-ph/shared-contracts.git
commit:     a380f19f2adcf0557b424461f869aa3d0069e176
package:    @kitamo/shared-contracts
version:    0.1.0
```

The pin is recorded in `config/shared-contracts-pin.json`, `package.json`, and
`package-lock.json`. Platform API never resolves an unpinned branch or
`latest`.

Shared Contracts is not published to npm. `npm ci` installs GitHub's source
archive for the exact accepted commit through normal Node package resolution.
`npm run prepare:contracts` then:

1. validates the repository, archive URL, commit, package name, version,
   declared export keys, lockfile URL, and lockfile SHA-512 integrity;
2. builds the installed package copy with Platform API's pinned TypeScript
   compiler;
3. validates runtime package metadata;
4. imports every approved public path; and
5. proves prohibited internal subpaths remain unavailable.

The process does not read or build an arbitrary `../shared-contracts` checkout.
It does not edit Shared Contracts and it commits no generated dependency
directory.

A direct Git dependency was evaluated and rejected because the accepted
producer package does not prepare a usable built export surface during that
installation flow, and API-1 may not add a producer-side `prepare` script. A
locally regenerated `npm pack` artifact was also rejected as the authority pin:
its tarball bytes were not stable across the tested platforms. The accepted
source archive has one reviewed lockfile integrity value, while its installed
copy is built locally and its package/runtime identity is checked before use.

Any absent archive, changed integrity, mismatched package identity or version,
changed export map, wrong commit URL, failed build, unavailable public path, or
unexpectedly importable internal path fails closed.

See
[`docs/shared-contracts-consumption.md`](docs/shared-contracts-consumption.md)
for the complete mechanism, import surface, 24-area matrix, limitations, and
historical API-0 evidence.

## Contract boundary

Canonical application imports flow in one direction:

```text
Platform API consumer
    -> src/contracts
        -> @kitamo/shared-contracts declared public paths
```

`src/contracts/` may re-export approved public schemas, record package
evidence, enforce the supported contract version, and provide narrow
Platform API parsing helpers. It must not copy, broaden, weaken, or reinterpret
Shared Contracts schemas.

Runtime code may import only:

```text
@kitamo/shared-contracts
@kitamo/shared-contracts/common
@kitamo/shared-contracts/identifiers
@kitamo/shared-contracts/businesses
@kitamo/shared-contracts/stalls
@kitamo/shared-contracts/time
@kitamo/shared-contracts/money
@kitamo/shared-contracts/units
@kitamo/shared-contracts/versions
@kitamo/shared-contracts/pagination
@kitamo/shared-contracts/errors
@kitamo/shared-contracts/sync
@kitamo/shared-contracts/audit
@kitamo/shared-contracts/support
```

Imports from `src/**`, `compatibility/**`, `conformance/**`, `tests/**`,
`scripts/**`, documentation, generated internals, or any undeclared package
subpath are prohibited runtime dependencies.

## Development

Prerequisites:

- Node.js `>=20.19.4`;
- npm `10.8.2` or the compatible npm version recorded by the lockfile; and
- network access to the exact GitHub source archive during a clean install.

Install and verify:

```bash
npm ci
npm run verify
```

Available quality commands:

```bash
npm run prepare:contracts
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run check:contracts
npm run check:architecture
npm run security:secrets
npm run audit
npm run verify
```

`verify` reacquires or verifies the installed contract boundary, then runs the
format, lint, strict typecheck, full test, explicit contract and architecture
suites, build, extension-agnostic secret scan, and high-severity npm audit
gates. The named suites are independently required even though the full test
run also discovers them.

## What is consumable

API-1 consumes foundational public primitives for package metadata, bounded
text/privacy classes, opaque identifiers, business/stall references, time,
money wire values, decimal quantities, the current bounded unit registry,
contract/app version values, pagination metadata, structured errors, field
issues, the four limited sync event names and event shape, limited audit-event
metadata, and the limited ProblemReport reference.

These exports do not establish authenticated identity, authorization,
membership, canonical roles, persistence, audit retention, cursor lifecycle,
money calculations, unit conversion, production synchronization, support
workflow, or production app-version policy.

> Structural validation is not identity resolution or authorization.

## Still blocked

API-1 intentionally provides no runtime contracts or operations for sales,
sale items, products, inventory, ingredients, recipes, production, COGS, fixed
costs, refunds, voids, corrections, subscriptions, payments, customer orders,
loyalty, memberships, a canonical role model, a complete identity model, or a
complete production synchronization protocol.

The following remain independently unresolved or blocked:

- HTTP framework approval and server/transport design;
- every production operation record;
- Clerk or other credential verification and external-to-canonical user
  mapping;
- membership, role, authorization, and stall-scope policy;
- persistence technology, RLS, migrations, transactions, and idempotency
  storage;
- rate limiting, CORS, observability provider, and production secret handling;
- audit persistence, access, retention, and failure policy;
- synchronization ownership, upload/pull, retries, acknowledgements, batches,
  conflicts, tombstones, cloud versions, and Android queue mapping;
- production support workflow and data retention;
- deployment and production external integrations; and
- Android `branch` to canonical `stall` runtime conversion, because the v0.1
  package does not export that compatibility mapping.

Canonical Platform API code uses `stall` and `stall_id`; it does not introduce
`branch_id`.

## Authority boundaries

- **Owner–Seller Mobile** remains the operational evidence authority for
  implemented merchant behavior.
- The protected formula remains
  `Revenue - Sold COGS - Fixed Costs - Spoilage = Net Profit`.
- **Shared Contracts** owns canonical cross-repository contract meaning.
- **Platform API** owns this consumer boundary and may later implement only
  separately approved operations.
- **Admin**, **Customer Mobile**, and **Website** retain their workflow,
  experience, projection, and public-claims responsibilities.

## Historical API-0 baseline

On 2026-07-25 the local Platform API path was empty and non-Git, the public
remote had no refs, and Shared Contracts had no package, source exports, commit,
tests, fixtures, or distribution. API-0 correctly recorded API-1 as blocked.
That finding remains historical evidence; it is not the current dependency
state.

Platform API was then initialized and its accepted API-0 evidence was published
at commit `b93afd444a3e38edc42cb0cb54f44aa780c4d14a`. Shared Contracts subsequently
completed SC-0 through SC-4 and froze the accepted v0.1 package at
`a380f19f2adcf0557b424461f869aa3d0069e176`, unblocking only this bounded API-1
consumer foundation.

## Documentation map

- [`docs/repository-inventory.md`](docs/repository-inventory.md) — current
  inventory plus preserved API-0 baseline.
- [`docs/architecture.md`](docs/architecture.md) — transport-neutral API-1
  contract boundary and later server proposal.
- [`docs/endpoint-governance.md`](docs/endpoint-governance.md) — evidence and
  approval required before any future operation.
- [`docs/shared-contracts-consumption.md`](docs/shared-contracts-consumption.md)
  — pin mechanism, public symbols, matrix, limitations, and historical evidence.
- [`docs/unresolved-decisions.md`](docs/unresolved-decisions.md) — decisions that
  remain open after API-1.
- [`decision-log/`](decision-log/) — durable approved API-1 decisions and
  decision rules.
- `.kitamo/STATUS.md` — ignored local handoff state; never the sole record of a
  durable decision.

## Security and production warning

Do not add real credentials, production environment values, service-role
secrets, tokens, private keys, passwords, or customer and merchant data. Do not
connect to Clerk, Supabase, payment systems, file storage, webhooks, queues, or
event buses. Do not run production migrations, publish a package, deploy, or
expose an endpoint from API-1.

## Next gate

After API-1 is accepted locally and in GitHub Actions, the recommended next
milestone is **API-2 — Server Runtime and Transport Foundation**. API-2 requires
its own authorization and must not infer approval for merchant endpoints or
production integrations.
