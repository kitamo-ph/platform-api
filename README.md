# KitaMo Platform API

> **Transport foundation only:** this repository has a Fastify server factory
> and an explicit local runtime entrypoint, but its production route surface is
> intentionally empty. It has no merchant endpoint, persistence,
> authentication, Clerk, Supabase, production synchronization, or deployment
> configuration. API-2 does not make it a production service.

## Current status

| Area                | Status                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| API-0               | Complete; the 2026-07-25 repository and dependency evidence is preserved as historical baseline material                                  |
| API-1               | **Complete** for the bounded Shared Contracts consumption foundation                                                                      |
| API-2               | Transport foundation implemented locally; acceptance remains conditional on final clean-environment verification and green GitHub Actions |
| Package/tooling     | npm, Node `>=20.19.4`, CI Node `20.20.0`, strict TypeScript 5.9, ESLint 9, Prettier 3, and Vitest                                         |
| Shared Contracts    | `@kitamo/shared-contracts@0.1.0`, pinned to source commit `a380f19f2adcf0557b424461f869aa3d0069e176`                                      |
| Contract boundary   | Transport-neutral adapter under `src/contracts/`; declared package exports only                                                           |
| Contract versions   | `0.1.0` only; malformed and unsupported versions fail closed                                                                              |
| Tests and CI        | Contract, transport/lifecycle, architecture, build, secret, and dependency-audit gates; no deployment job                                 |
| Server framework    | Fastify `5.11.3`, approved for Platform API HTTP transport only                                                                           |
| Route surface       | **Zero production or merchant routes**; synthetic routes exist only in tests                                                              |
| Production behavior | None; `NODE_ENV=production` startup and deployment remain unsupported and fail closed                                                     |

API-1 proves that Platform API can acquire, build, resolve, validate, and test
the approved Shared Contracts package reproducibly. API-2 adds only the server,
configuration, logging, safe-error, startup, and shutdown boundaries needed to
host future approved operations. Neither milestone approves an operation. A
framework existing, a route compiling, or a schema parsing does not authorize
an endpoint.

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

Runtime and contract dependencies flow in one direction:

```text
explicit runtime entrypoint
    -> composition root
        -> Fastify transport
            -> src/contracts
                -> @kitamo/shared-contracts declared public paths

future application services and ports
    -> framework-independent interfaces
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

## API-2 transport boundary

Fastify `5.11.3` is approved as the HTTP transport framework only. It does not
authorize an operation, production host, deployment topology, provider,
database, identity system, or merchant behavior. The production server factory
registers safe transport defaults and **no route**. Tests register only the
synthetic `/__test__/ok`, `/__test__/throw`, `/__test__/payload`,
`/__test__/proxy`, `/__test__/headers`, `/__test__/redaction`, and
`/__test__/log-exception` routes on isolated instances; those strings and
registrations do not exist in production source.

Importing the package, server factory, composition root, or runtime helpers
never binds a socket. Only the explicit runtime entrypoint may call `listen()`.
Configuration is parsed once into an immutable value before construction, and
production startup is rejected because no production deployment policy is
approved. Ordinary local execution binds only to the configured loopback host.

| Variable    | Accepted values                                              | Default     |
| ----------- | ------------------------------------------------------------ | ----------- |
| `NODE_ENV`  | `development`, `test`; production/unknown values reject      | development |
| `HOST`      | literal `127.0.0.1` or `::1`; DNS names reject               | `127.0.0.1` |
| `PORT`      | integer `1..65535`                                           | `3000`      |
| `LOG_LEVEL` | `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent` | `info`      |

The transport uses bounded request IDs for operational tracing. They are not
credentials, merchant identifiers, authenticated principals, or the final
cross-system correlation-generation policy. Shared `CorrelationId` values still
pass through `src/contracts/`. Structured logs redact authorization, cookie,
set-cookie, proxy-authorization, and API-key fields and do not log request or
response bodies by default. Operational logging is not canonical audit.

Unknown routes, malformed or validation-invalid input, bodies over 65,536
bytes, unexpected failures, and requests observed after instance-scoped drain
begins are mapped to bounded Shared Contracts `NOT_FOUND`, `VALIDATION_ERROR`,
`UNKNOWN`, and `SERVICE_UNAVAILABLE` semantics without stack traces, paths,
provider details, payloads, field issues, or arbitrary metadata. Normal JSON is
the only body format; the core `text/plain` parser is removed. Trust proxy is
disabled. CORS, rate limiting, multipart, XML, form-data, uploads, OpenAPI,
authentication, and persistence plugins are absent.

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
npm start
npm run check:contracts
npm run check:architecture
npm run check:transport
npm run security:secrets
npm run audit
npm run verify
```

`verify` prepares and verifies the lockfile-installed contract boundary, then
runs format, lint, strict typecheck, the full suite (including transport and
lifecycle tests), explicit contract, architecture, and transport suites, build,
extension-agnostic secret scan, and high-severity npm audit gates. The named
suites are independently required even though the full test run also discovers
them.

`npm start` is an explicit compiled-runtime command, not a development import
side effect. Run `npm run build` first. It accepts only the loopback-safe
configuration above, and it intentionally rejects `NODE_ENV=production`.

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

- production runtime target, hosting, proxy topology, deployment, and secret
  delivery;
- every production operation record;
- Clerk or other credential verification and external-to-canonical user
  mapping;
- membership, role, authorization, and stall-scope policy;
- persistence technology, RLS, migrations, transactions, and idempotency
  storage;
- rate limiting, CORS, observability provider/retention, and production secret
  handling;
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
- [`docs/architecture.md`](docs/architecture.md) — API-1 contract boundary and
  the locally implemented API-2 transport/runtime foundation.
- [`docs/endpoint-governance.md`](docs/endpoint-governance.md) — evidence and
  approval required before any future operation.
- [`docs/shared-contracts-consumption.md`](docs/shared-contracts-consumption.md)
  — pin mechanism, public symbols, matrix, limitations, and historical evidence.
- [`docs/unresolved-decisions.md`](docs/unresolved-decisions.md) — decisions that
  remain open after the bounded API-2 implementation.
- [`decision-log/`](decision-log/) — durable approved API-1/API-2 decisions and
  decision rules.
- `.kitamo/STATUS.md` — ignored local handoff state; never the sole record of a
  durable decision.

## Security and production warning

Do not add real credentials, production environment values, service-role
secrets, tokens, private keys, passwords, or customer and merchant data. Do not
connect to Clerk, Supabase, payment systems, file storage, webhooks, queues, or
event buses. Do not run production migrations, publish a package, deploy, or
add/expose a production endpoint under API-2.

## Next gate

Only after API-2 passes final local, clean-environment, runtime-smoke, push, and
GitHub Actions gates is the recommended next milestone **API-3 — Identity,
Authorization and Trusted Request Context Foundation**. API-3 must not begin
until authoritative external-identity, canonical-user, membership, role, and
authorization decisions are available; missing authority is a blocker, not
permission to invent a local model.
