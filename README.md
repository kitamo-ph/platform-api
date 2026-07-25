# KitaMo Platform API

> **Foundation only:** this repository does not contain a server, production
> endpoint, package, database, authentication integration, synchronization
> implementation, or deployment configuration. Do not use it as a production
> service.

## Purpose

Platform API is intended to implement approved Shared Contracts as trusted
server operations. Its future responsibilities may include boundary
validation, authentication verification, identity resolution, authorization,
idempotency, application orchestration, transaction coordination, persistence
adapters, audit-event production, and server observability.

Those capabilities are not implemented or authorized by the current
milestone. This repository must consume canonical meaning from verified Shared
Contracts public exports; it must not invent or duplicate that meaning.

## Current status

| Area | Status |
| --- | --- |
| Current milestone | API-0 repository bootstrap and evidence inventory |
| Local baseline | Confirmed empty and non-Git at inspection |
| Expected GitHub repository | Confirmed public and empty, with an unborn HEAD and no branch refs or commits |
| Application code | Missing |
| Package manager | npm is proposed; no manifest or lockfile exists and no choice is approved |
| Runtime selection | Node `>=20.19.4` with Node `20.20.0` in CI is proposed; no repository version is pinned |
| Server framework | Missing; Fastify is proposed, not approved |
| Shared Contracts consumption | Blocked; all required public exports are missing |
| API-1 validation shell | Blocked |
| Tests and CI | Missing |
| Production behavior | None |

The expected public remote is
`https://github.com/kitamo-ph/platform-api`. GitHub reports `main` as its
default branch name, but `main` does not yet exist as a branch ref. The local
directory was not initialized or connected to that remote during preflight.

## Authority boundaries

- **Owner–Seller Mobile** remains the evidence and operational authority for
  currently implemented merchant behavior, including checkout, sales,
  inventory, production, COGS, spoilage, transfers, fixed expenses, and
  reports.
- The protected formula remains:
  `Revenue - Sold COGS - Fixed Costs - Spoilage = Net Profit`.
- **Shared Contracts** owns canonical cross-repository identifiers,
  terminology, money, quantities, units, timestamps, timezones, versions,
  structured errors, pagination, audit and synchronization envelopes, shared
  enums, and compatibility mappings.
- **Platform API** may implement approved contracts as trusted server
  operations, but it may not copy schemas, deep-import internal contract
  modules, redefine merchant semantics, or treat proposals as approval.
- **Admin**, **Customer Mobile**, and **Website** retain their own workflow,
  experience, projection, and public-claims responsibilities.

## Current milestone

API-0 records repository evidence, authority boundaries, architecture
proposals, endpoint governance, and unresolved decisions. It creates no
production behavior.

API-1 may begin only when Shared Contracts supplies verified public exports
through an identifiable approved version or commit. The local Shared Contracts
workspace is non-Git and contains only a preflight inventory document; its
public repository is empty. All 24 contract areas required by the bootstrap
brief are missing, so API-1 is blocked.

## Prerequisites

The current repository is documentation-only. Reviewing it requires:

- access to this local workspace;
- access to the verified GitHub repository metadata when remote identity must
  be rechecked; and
- no production credentials.

The inspected workstation had Node.js `v20.20.2`, npm `10.8.2`, Corepack
`0.34.6`, and pnpm `9.15.9`; Yarn was absent. These installed tools are
environment evidence only. They are not repository prerequisites or proof
that a package manager, runtime, or framework has been selected.

## Available commands

There is no `package.json`, so there are no npm, build, lint, format,
typecheck, test, start, or development commands.

The following read-only preflight commands can be used to inspect the local
state:

```bash
pwd
git rev-parse --show-toplevel 2>/dev/null || true
git status --short --branch 2>/dev/null || true
git remote -v 2>/dev/null || true
git branch --show-current 2>/dev/null || true
git rev-parse HEAD 2>/dev/null || true
find . -maxdepth 3 -type f \
  ! -path './.git/*' \
  ! -path './node_modules/*' \
  | sort
node --version 2>/dev/null || true
```

Until Git initialization or remote connection is explicitly authorized, Git
commands that require a repository are expected to report that this directory
is not a Git repository.

## Development status

No application can be installed, started, built, tested, or deployed from the
current repository. There are:

- no package or dependencies;
- no source files or routes;
- no runtime or response validation;
- no Shared Contracts imports;
- no compatibility adapters;
- no persistence or migrations;
- no authentication or authorization;
- no audit or synchronization behavior;
- no tests or CI; and
- no deployment or production environment configuration.

A compiling route, passing test, generated OpenAPI document, or documented
proposal would not by itself prove that an operation is approved.

## Documentation map

- [`docs/repository-inventory.md`](docs/repository-inventory.md) — baseline
  local, remote, runtime, dependency, and blocker evidence.
- [`docs/architecture.md`](docs/architecture.md) — proposed smallest safe
  modular-service architecture; no framework approval.
- [`docs/endpoint-governance.md`](docs/endpoint-governance.md) — evidence and
  approval record required before any future operation.
- [`docs/shared-contracts-consumption.md`](docs/shared-contracts-consumption.md)
  — Shared Contracts evidence, consumption matrix, and dependency gate.
- [`docs/unresolved-decisions.md`](docs/unresolved-decisions.md) — Platform API
  decision register.
- [`decision-log/README.md`](decision-log/README.md) — durable decision
  identifiers, statuses, required fields, and approval rules.
- `.kitamo/STATUS.md` — local ignored handoff state; never the sole record of a
  durable architectural decision.

The presence of a documentation path does not imply that its decisions are
approved or its described capabilities are implemented.

## Security and production warning

Do not add real credentials, production environment values, service-role
secrets, tokens, private keys, or customer and merchant data. No
authentication, identity resolution, authorization, rate limiting, CORS,
privacy retention, audit persistence, or security-hardening implementation
exists.

Do not connect to Clerk, Supabase, payment systems, file storage, webhooks,
queues, event buses, or other production services. Do not run migrations,
change cloud resources, deploy, publish a package, or expose an endpoint from
this foundation.

## Non-goals

The current work does not include:

- final framework, runtime, deployment, or persistence approval;
- production HTTP operations or OpenAPI publication;
- merchant, Admin, Customer, or Website APIs;
- Android schema mirroring or cloud-authority transfer;
- checkout, inventory, recipe, production, COGS, spoilage, fixed-cost, or
  other merchant synchronization;
- Clerk, Supabase, RLS, identity-provider, or database integration;
- persistent idempotency, audit storage, queues, webhooks, or event buses;
- payments, billing, loyalty, ordering, uploads, or public integrations;
- package publication, deployment, DNS changes, cloud-resource changes,
  production migrations, commits, or pushes.

## Next safe action

Keep API-0 evidence current and obtain the missing Shared Contracts public
distribution and approvals. Before API-1, record the exact package version or
Git commit, public import paths, runtime validation support, tests, fixtures,
compatibility behavior, and consumer suitability.

Until then, do not create substitute schemas, deep imports, production
payloads, routes, or compatibility mappings.
