# Platform API Repository Inventory

## Record status

| Item                       | Value                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| Current review date        | 2026-08-11 (Asia/Manila)                                                                         |
| Historical inspection date | 2026-07-25 (Asia/Manila)                                                                         |
| Milestone                  | API-1 Shared Contracts consumption foundation                                                    |
| API-0 status               | Complete; accepted baseline commit `b93afd444a3e38edc42cb0cb54f44aa780c4d14a`                    |
| API-1 status               | Bounded consumer foundation implemented; final acceptance requires all verification and CI gates |
| Shared Contracts authority | `@kitamo/shared-contracts@0.1.0` at `a380f19f2adcf0557b424461f869aa3d0069e176`                   |
| Production status          | No production implementation exists or is authorized                                             |

This inventory records the repository state found before API-0 files were
created. The Platform API directory was empty and was not a Git repository at
that inspection point. Documentation and API-1 implementation created later do
not change that dated baseline finding.

## Current API-1 inventory

| Field                   | Current evidence                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository              | `kitamo-ph/platform-api` at `/Users/rovs/Documents/KitaMo-ph/platform-api`                                                                                       |
| Remote and branch       | `origin` is `https://github.com/kitamo-ph/platform-api`; `main` tracks `origin/main`                                                                             |
| Pre-mutation baseline   | Local `HEAD`, `origin/main`, and remote `refs/heads/main` all equaled `b93afd444a3e38edc42cb0cb54f44aa780c4d14a`; tracked and untracked worktree state was clean |
| Local handoff           | `.kitamo/STATUS.md` remains ignored by the exact `.kitamo/` rule and is not a durable decision source                                                            |
| Package manager         | npm with a deterministic `package-lock.json`; Platform API is private and is not published                                                                       |
| Runtime/tooling         | Node `>=20.19.4`; CI Node `20.20.0`; strict TypeScript 5.9; ESLint 9; Prettier 3; Vitest                                                                         |
| Source                  | A transport-neutral Shared Contracts boundary under `src/contracts/`; no listener, server, route, handler, or OpenAPI operation                                  |
| Tests                   | Contract conformance, positive/negative fixtures, version rejection, package/public-path, architecture, and pin-failure coverage                                 |
| CI                      | GitHub Actions installs with `npm ci` and runs the complete verification aggregate; no deployment                                                                |
| Shared Contracts source | `https://github.com/kitamo-ph/shared-contracts.git`                                                                                                              |
| Shared Contracts pin    | Commit `a380f19f2adcf0557b424461f869aa3d0069e176`; package `@kitamo/shared-contracts`; version `0.1.0`                                                           |
| Acquisition             | Exact GitHub source archive recorded in manifest, lockfile, and `config/shared-contracts-pin.json`; installed package is built locally and verified before use   |
| Integrity               | Lockfile SHA-512, exact archive URL/commit, package name/version, export keys, runtime metadata, public imports, and prohibited paths are checked fail closed    |
| External services       | None; no Clerk, Supabase, database, queue, webhook, payment, or production credential                                                                            |
| Production behavior     | None; no endpoint, persistence, authentication, authorization, production sync, audit persistence, or deployment                                                 |

The current package foundation resolves the API-0 dependency blocker only for
the accepted public v0.1 surface. It does not resolve merchant-domain,
identity, authorization, persistence, sync-protocol, audit-policy, privacy,
transport, or deployment decisions.

## Historical evidence notation

- **Confirmed** — directly supported by the local inspection or the verified
  GitHub repository metadata.
- **Missing** — searched for but not found.
- **Blocked** — a named missing dependency prevents safe continuation.
- **Proposed** — a recommendation that has not been approved or implemented.
- **Inherited direction** — governance or a preferred direction supplied by
  the bootstrap brief; it is not repository implementation evidence.
- **Unresolved** — the available evidence does not support a safe conclusion.

No item in the historical API-0 inventory was **Approved** unless explicit
approval evidence was identified; none was found during that inspection.
Current API-1 approvals are recorded separately under
`decision-log/decisions/`.

## Historical API-0 repository inventory (2026-07-25)

Every status in the table below describes the state at the original inspection
unless its text explicitly says that it was created during API-0. It is retained
as historical evidence and must not be read as current API-1 state.

| Field                              | Evidence status                                     | Inventory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inspection date                    | Confirmed                                           | 2026-07-25, Asia/Manila                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Repository name                    | Confirmed                                           | `kitamo-ph/platform-api` is the expected repository identity.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Resolved local path                | Confirmed                                           | `/Users/rovs/Documents/KitaMo-ph/platform-api`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Expected remote                    | Confirmed                                           | `https://github.com/kitamo-ph/platform-api`                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Actual remote                      | Missing locally                                     | The local directory had no `.git` directory and therefore no configured remote. The expected public GitHub repository was verified independently, but it was not connected to the local directory.                                                                                                                                                                                                                                                                                                |
| Git initialization state           | Confirmed                                           | The local directory was not a Git repository. It must not be initialized, replaced, or connected without the required authorization.                                                                                                                                                                                                                                                                                                                                                              |
| Default branch                     | Confirmed with qualification                        | GitHub reports the default branch name as `main`, but no branch ref or commit exists. This is an unborn remote HEAD, not an inspectable `main` branch.                                                                                                                                                                                                                                                                                                                                            |
| Current branch                     | Missing                                             | No local Git repository or branch existed.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| HEAD                               | Missing locally and remotely                        | There was no local HEAD commit. The public remote had no commits or branch refs.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Worktree state                     | Confirmed with qualification                        | No Git worktree existed, so it cannot be described as clean or dirty. The directory itself was empty and contained no existing work to overwrite at inspection.                                                                                                                                                                                                                                                                                                                                   |
| Existing files                     | Confirmed                                           | None at the baseline inspection. API-0 documentation and ignore files are bounded bootstrap deliverables created after that inspection.                                                                                                                                                                                                                                                                                                                                                           |
| Existing architecture              | Missing at baseline                                 | There was no application architecture or implementation. `docs/architecture.md` now records a proposed modular-service direction only.                                                                                                                                                                                                                                                                                                                                                            |
| Package manager                    | Unresolved                                          | No `package.json`, lockfile, or package-manager declaration existed. npm and pnpm were installed locally, but tool availability does not select a package manager. The bootstrap brief prefers npm as an inherited direction.                                                                                                                                                                                                                                                                     |
| Runtime                            | Confirmed locally; unselected for the repository    | Node.js `v20.20.2`, npm `10.8.2`, Corepack `0.34.6`, and pnpm `9.15.9` were installed. Yarn was absent. No repository runtime pin or CI runtime existed.                                                                                                                                                                                                                                                                                                                                          |
| Framework                          | Missing                                             | No server framework was installed or selected. Fastify is an inherited preferred direction and a proposal in the architecture document, not an approved choice.                                                                                                                                                                                                                                                                                                                                   |
| Dependencies                       | Missing                                             | No package manifest, lockfile, installed dependency declaration, or application dependency was found.                                                                                                                                                                                                                                                                                                                                                                                             |
| Test framework                     | Missing                                             | No test framework was configured. Vitest is an inherited preferred direction only.                                                                                                                                                                                                                                                                                                                                                                                                                |
| Existing tests                     | Missing                                             | No source, test, fixture, or conformance-test files existed.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CI                                 | Missing                                             | No `.github/workflows` directory or other CI configuration existed.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Deployment files                   | Missing                                             | No deployment target or deployment configuration existed. Production deployment configuration is outside the authorized scope.                                                                                                                                                                                                                                                                                                                                                                    |
| Environment configuration          | Missing                                             | No `.env`, environment example, runtime configuration, or production value existed. No real credentials were inspected or authorized.                                                                                                                                                                                                                                                                                                                                                             |
| Instruction files                  | Confirmed                                           | The API-0/API-1 bootstrap brief was read in full. The required parent-workspace search found no applicable `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, or `CONTRIBUTING.md` for Platform API, the KitaMo parent workspace, or Shared Contracts. `website/AGENTS.md` was read only to confirm that it is scoped to the sibling Website repository. Dependency `CONTRIBUTING.md` files under another repository's `node_modules` were outside this repository's instruction scope. No conflict was found. |
| Status file                        | Missing at baseline; Confirmed created for API-0    | `.kitamo/` and `.kitamo/STATUS.md` did not exist at inspection. API-0 created `.kitamo/STATUS.md` as a local handoff and added the exact `.kitamo/` rule to `.gitignore`. The status file is not the sole record of any durable decision. Because the local directory remains non-Git, Git itself cannot demonstrate ignore behavior until the authorized Git bootstrap occurs.                                                                                                                   |
| Shared Contracts source            | Confirmed as locally inspectable documentation only | `/Users/rovs/Documents/KitaMo-ph/shared-contracts` was a non-Git directory containing only `docs/preflight/workspace-inventory.md`. Its public GitHub repository was verified as empty.                                                                                                                                                                                                                                                                                                           |
| Shared Contracts version or commit | Missing                                             | There was no package version, release, Git commit, branch ref, package export, source entry point, or distribution artifact to identify.                                                                                                                                                                                                                                                                                                                                                          |
| Known consumers                    | Unresolved as implemented consumers                 | No code or route establishes a current consumer. The inherited ecosystem boundary identifies Owner–Seller Mobile, Admin, Customer Mobile, and Website as affected repositories with their own authority areas. They are not evidence of a live Platform API integration.                                                                                                                                                                                                                          |
| Known external services            | Missing                                             | No external service dependency was configured. Clerk, Supabase, payment systems, uploads, webhooks, queues, and cloud resources are explicit non-goals, not current dependencies.                                                                                                                                                                                                                                                                                                                 |
| Persistence status                 | Missing / not implemented                           | No database, schema, migration, persistence adapter, transaction boundary, or persistence decision existed. Persistence technology and ownership remain unresolved.                                                                                                                                                                                                                                                                                                                               |
| Authentication status              | Missing / not implemented                           | No credential verification or identity-provider integration existed. Production authentication is outside this milestone.                                                                                                                                                                                                                                                                                                                                                                         |
| Authorization status               | Missing / not implemented                           | No authorization policy, membership resolution, role resolution, or stall-scope authorization existed. These require explicit decisions and contract evidence.                                                                                                                                                                                                                                                                                                                                    |
| Synchronization status             | Blocked / not implemented                           | No synchronization contract, mutation, ownership decision, or implementation existed. Production synchronization is outside this milestone.                                                                                                                                                                                                                                                                                                                                                       |
| Audit status                       | Blocked / not implemented                           | No public Shared Contracts audit envelope, audit persistence decision, or audit producer existed. Operational logging must not be substituted for an audit contract.                                                                                                                                                                                                                                                                                                                              |
| Security status                    | Confirmed foundation-only                           | No secrets were present because the baseline directory contained no files. No production security controls, authentication, authorization, rate limiting, CORS policy, retention policy, or deployment hardening existed. This repository is not production-ready.                                                                                                                                                                                                                                |
| Observed risks                     | Confirmed                                           | Local and remote Git are not connected; the remote has an unborn HEAD; all Shared Contracts public exports are missing; tool availability could be mistaken for an approved stack; documentation could be mistaken for implementation; and absent security, persistence, identity, and reliability decisions prevent production work.                                                                                                                                                             |
| Observed blockers                  | Confirmed                                           | API-1 cannot safely consume Shared Contracts because there is no public import path, package version, commit, schema export, runtime validator, test, fixture, or approved distribution mechanism. Git initialization or remote connection also requires authority not established by the inspection.                                                                                                                                                                                             |
| Evidence limitations               | Confirmed                                           | The baseline local directory contained no implementation evidence. GitHub metadata proves the public repositories exist and are empty but supplies no commit or branch content. Shared Contracts documentation is not an implemented export. No consumer integration, runtime behavior, package build, test, CI run, or deployment could be inspected.                                                                                                                                            |

## Historical API-0 remote evidence

The expected public Platform API repository was verified through the GitHub
connector:

- the repository exists and is public;
- GitHub reports repository size `0`;
- GitHub reports the default branch name `main`;
- no branch refs or commits exist;
- remote HEAD is unborn;
- pull access is available; and
- authentication did not block the metadata inspection.

This evidence does not establish local Git identity. The local directory has
no remote, and it must not be initialized or connected merely because the
public repository is empty.

## Historical API-0 Shared Contracts dependency result

The local Shared Contracts workspace is not a Git repository and contains only
a preflight inventory document. Its public repository is empty. Documentation,
a roadmap, or a filename is not a public export, package release, runtime
schema, or compatibility guarantee.

Every Shared Contracts area required by the API-0 brief is therefore
**Missing**:

| Required contract area                                      | Evidence status | Consumer result                                                |
| ----------------------------------------------------------- | --------------- | -------------------------------------------------------------- |
| Contract version                                            | Missing         | No version can be selected, negotiated, accepted, or rejected. |
| Opaque identifiers                                          | Missing         | Platform API must not define a local canonical format.         |
| Business identifiers                                        | Missing         | Platform API must not define a local canonical format.         |
| Stall identifiers                                           | Missing         | Platform API must not define a local canonical format.         |
| User identifiers                                            | Missing         | Platform API must not define a local canonical format.         |
| Device identifiers                                          | Missing         | Platform API must not define a local canonical format.         |
| Timestamps                                                  | Missing         | No canonical timestamp schema or runtime validator exists.     |
| Timezone                                                    | Missing         | No canonical timezone schema or policy exists.                 |
| Currency                                                    | Missing         | No canonical currency export exists.                           |
| Money                                                       | Missing         | No canonical representation or precision contract exists.      |
| Decimal quantity                                            | Missing         | Precision and serialization remain unavailable.                |
| Units                                                       | Missing         | No canonical unit enum or schema exists.                       |
| Pagination                                                  | Missing         | No public request or response envelope exists.                 |
| Structured errors                                           | Missing         | Platform API must not invent a production error envelope.      |
| Field-level violations                                      | Missing         | No canonical validation-violation representation exists.       |
| Audit envelope                                              | Missing         | Audit production is blocked.                                   |
| Correlation identifiers                                     | Missing         | No canonical public identifier export exists.                  |
| Idempotency identifiers                                     | Missing         | No canonical public identifier export exists.                  |
| Synchronization envelope                                    | Missing         | Synchronization operations are blocked.                        |
| Synchronization result                                      | Missing         | Synchronization result handling is blocked.                    |
| App-version policy                                          | Missing         | Supported and unsupported version behavior is unresolved.      |
| Membership references                                       | Missing         | Identity and authorization flows are blocked.                  |
| Role references                                             | Missing         | Authorization-policy inputs are blocked.                       |
| Android `branch` to canonical `stall` compatibility mapping | Missing         | No translation may be implemented or inferred.                 |

There is no package name, version, Git commit, public import path, test, fixture,
runtime dependency, or consumer-suitability evidence to record for any row.
API-1 must stop rather than create a local substitute, copy a schema, or
deep-import an internal file.

## Authority boundaries

These are inherited governance boundaries, not implementation claims:

- Owner–Seller Mobile remains the evidence and operational authority for
  currently implemented merchant behavior.
- The protected profit formula remains
  `Revenue - Sold COGS - Fixed Costs - Spoilage = Net Profit`.
- Shared Contracts remains the authority for canonical cross-repository
  identifiers, terminology, money, quantities, units, time, versions, errors,
  pagination, audit, synchronization, shared enums, and compatibility
  mappings.
- Platform API may eventually implement approved contracts as trusted server
  operations, but this milestone authorizes no production behavior.
- Admin, Customer Mobile, and Website retain their own workflow, experience,
  projection, and public-claims responsibilities.

Platform API must not copy Shared Contracts schemas, reinterpret merchant
semantics, or treat a proposal as approval.

## Historical API-0 classifications

| Classification                  | Items                                                                                                                                                                                                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmed repository evidence   | Empty non-Git local baseline; empty public remote with unborn HEAD; installed local tool versions; absence of package, framework, source, tests, CI, deployment, environment, integration, and persistence files.                                                                                  |
| Inherited governance directions | Authority boundaries; Node.js, TypeScript, npm, Zod, ESLint, Prettier, Vitest, and a minimal framework as preferred areas for evaluation; explicit production non-goals.                                                                                                                           |
| Proposed                        | A strict TypeScript modular service, with Fastify as the current framework recommendation and explicit contract, application, policy, port, adapter, observability, and shutdown boundaries.                                                                                                       |
| Unresolved                      | Git initialization and local-to-remote connection; final runtime and deployment target; package manager; framework approval; package-consumption method; identity, authorization, persistence, idempotency, audit, synchronization, CORS, rate limiting, logging, retention, and version policies. |
| Blocked                         | API-1 package consumption, contract conformance tests, production errors, audit, synchronization, compatibility mapping, and every contract-dependent endpoint.                                                                                                                                    |

## Historical API-0 safe bootstrap recommendation

1. Keep API-0 limited to durable evidence, governance, and unresolved-decision
   records.
2. Do not initialize Git or connect the local directory to the public remote
   without explicit authorization for that action.
3. Do not install a framework or dependency until the runtime, package
   manager, framework, and deployment constraints are approved.
4. Require Shared Contracts to provide an approved, versioned, inspectable
   public distribution with runtime-capable exports and tests before API-1.
5. Do not create production routes, payloads, persistence, identity,
   authorization, audit, or synchronization behavior while their contracts
   and decisions are missing.
6. Resume API-1 only after the exact package version or commit, public import
   paths, compatibility guarantees, and consumer-suitability evidence can be
   recorded.

## Historical API-0 verification evidence

The local inspection used read-only commands including:

```bash
pwd
git rev-parse --show-toplevel 2>/dev/null || true
git status --short --branch 2>/dev/null || true
git remote -v 2>/dev/null || true
git branch --show-current 2>/dev/null || true
git rev-parse HEAD 2>/dev/null || true
git log --oneline --decorate -10 2>/dev/null || true
find . -maxdepth 3 -type f \
  ! -path './.git/*' \
  ! -path './node_modules/*' \
  | sort
node --version
npm --version
corepack --version
pnpm --version
yarn --version
```

The baseline file search returned no files. Unsuppressed Git diagnostics
reported that the directory was not a Git repository. No install, build,
test, formatter, migration, remote mutation, commit, push, package
publication, deployment, or cloud-resource change was performed.
