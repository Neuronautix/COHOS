# COHOS Backlog

Last updated: 2026-07-08

## Repository Inspection

OS-000 started from an effectively empty repository:

- Git repository exists with an unborn `main` branch and no commits.
- `origin` is configured as `https://github.com/Neuronautix/COHOS.git`.
- The remote had no branch heads at initial inspection.
- No package manager files, source files, CI configuration, docs, license, or tests exist yet.
- Local tooling detected: Node.js 24.18.0, pnpm 11.10.0, GitHub CLI 2.95.0.
- GitHub CLI authentication is available for the current user.
- The first OS-000 branch push made the ticket branch the temporary GitHub default branch because no `main` branch existed.
- Repository bootstrap then created `main` from the validated OS-000 commit and set `main` as the default branch.

Initial constraints:

- Product name is COHOS.
- Do not introduce forbidden legacy names in product code, documentation, package names, routes, seed data, examples, or generated identifiers.
- Apache-2.0 is the default license unless a license is added before OS-001.
- Human participant examples must be synthetic and pseudonymized.
- Backend remains the source of truth for frontend data once API endpoints exist.

## Dependency And Parallelization Plan

Default execution mode is one active implementation branch until the workspace, domain package, and database package are stable.

Ticket coupling:

- Independent: OS-000, OS-020 after architecture decisions exist, OS-021 after root tooling exists.
- Weakly coupled: OS-010, OS-011, OS-012 after domain contracts exist.
- Strongly coupled: OS-001 through OS-009, OS-013 through OS-018.
- Blocked by prior contracts: API modules before domain schemas, web pages before API contracts, database seed data before database schema.

Safe parallel work after OS-003:

- Documentation updates for already implemented packages.
- Connector skeleton work once shared connector/domain boundaries exist.
- ISA export tests once domain entities are stable.
- UI shell work once API route contracts are written.

Unsafe parallel work:

- Database schema and API implementation in separate branches before schema review.
- Audit/event semantics before subject and facility domain schemas exist.
- Frontend pages before endpoint contracts exist.
- Package renames once imports are shared across packages.

## Ticket Status Summary

| ID     | Title                                                  | Status            | Complexity | Coupling         |
| ------ | ------------------------------------------------------ | ----------------- | ---------- | ---------------- |
| OS-000 | Repository inspection and backlog initialization       | Completed locally | XS         | Independent      |
| OS-001 | Monorepo skeleton and workspace tooling                | Completed locally | M          | Strongly coupled |
| OS-002 | Shared domain schemas and subject profile model        | Completed locally | L          | Strongly coupled |
| OS-003 | Database schema and synthetic seed data                | Completed locally | L          | Strongly coupled |
| OS-004 | API application skeleton and health endpoint           | Completed locally | M          | Strongly coupled |
| OS-005 | Subject API module                                     | Completed locally | M          | Strongly coupled |
| OS-006 | Facility and housing API module                        | Completed locally | M          | Strongly coupled |
| OS-007 | Investigation, study, and assay API module             | Pending           | M          | Strongly coupled |
| OS-008 | Event and audit model                                  | Pending           | L          | Strongly coupled |
| OS-009 | Welfare and environmental rule engine                  | Pending           | M          | Weakly coupled   |
| OS-010 | ISA-JSON export skeleton                               | Pending           | M          | Weakly coupled   |
| OS-011 | Connector interfaces and Metadatapp connector skeleton | Pending           | M          | Weakly coupled   |
| OS-012 | QR token and scan workflow skeleton                    | Pending           | M          | Weakly coupled   |
| OS-013 | Web app shell and navigation                           | Pending           | M          | Strongly coupled |
| OS-014 | Subject list, detail, and model-specific views         | Pending           | M          | Strongly coupled |
| OS-015 | Facility layout and housing detail views               | Pending           | M          | Strongly coupled |
| OS-016 | Investigation, study, and assay views                  | Pending           | M          | Strongly coupled |
| OS-017 | Welfare, alerts, and reports views                     | Pending           | M          | Strongly coupled |
| OS-018 | Connector settings and export UI                       | Pending           | M          | Weakly coupled   |
| OS-019 | Test suite hardening                                   | Pending           | M          | Weakly coupled   |
| OS-020 | Documentation completion                               | Pending           | M          | Weakly coupled   |
| OS-021 | CI and release-readiness cleanup                       | Pending           | M          | Weakly coupled   |

## Tickets

### OS-000: Repository inspection and backlog initialization

- Objective: Inspect the repository, document current constraints, and initialize a dependency-aware backlog.
- Scope: Repository status, local tooling, remote status, backlog structure, ticket decomposition, parallelization guidance.
- Affected files/modules: `docs/backlog.md`.
- Acceptance criteria:
  - Repository state is recorded.
  - Initial tickets include objective, scope, files, acceptance criteria, dependencies, complexity, token budget, model, effort, and token strategy.
  - Ticket dependency and parallelization policy is documented.
  - No forbidden legacy names are introduced.
- Dependencies/blockers: None.
- Estimated complexity: XS.
- Estimated token budget: 6k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Inspect only top-level repository state and tool availability; avoid rereading unchanged files; record decisions in this file for later tickets.
- Branch: `chore/OS-000-repository-inspection-backlog-initialization`.
- Validation target: `git status`, documentation review, forbidden-name scan.
- Status: Completed locally.
- Validation performed:
  - `git status --short --branch`
  - Documentation review of `docs/backlog.md`
  - Forbidden legacy name scan
- Validation result: Passed local validation. Root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` are not available until OS-001 creates workspace tooling.
- Push result: Branch pushed to `origin/chore/OS-000-repository-inspection-backlog-initialization`.
- PR result: PR creation was blocked because the remote had no separate `main` base branch or base SHA.
- Merge result: No PR merge occurred for OS-000. Repository bootstrap established `main` directly from the OS-000 commit so normal PR flow can begin with OS-001.
- Risks: First-ticket bootstrap required a nonstandard flow because the remote started with no branch heads.

### OS-001: Monorepo skeleton and workspace tooling

- Objective: Create the TypeScript pnpm monorepo foundation.
- Scope: Root package manifest, pnpm workspace, TypeScript base config, ESLint, Prettier, Vitest config, package directories, app directories, root scripts.
- Affected files/modules: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.*`, `.prettierrc`, `.gitignore`, `apps/*`, `packages/*`.
- Acceptance criteria:
  - `pnpm install` succeeds.
  - Root scripts exist for `lint`, `typecheck`, `test`, `build`, and `format`.
  - Workspace package names use COHOS naming.
  - Empty packages can typecheck or have explicit placeholder configs.
- Dependencies/blockers: OS-000.
- Estimated complexity: M.
- Estimated token budget: 12k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Generate minimal workspace files; avoid framework scaffolding that adds unused code; defer implementation details to package tickets.
- Branch: `chore/OS-001-monorepo-skeleton-workspace-tooling`.
- Validation performed:
  - `pnpm install`
  - `pnpm format`
  - `pnpm format:check`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - Forbidden legacy name scan
- Validation result: Passed locally after adding package-local build output directories and ignoring the Next-managed `next-env.d.ts` file in Prettier.
- Risks: Framework and tool versions were resolved from the live registry into `pnpm-lock.yaml`; future compatibility is pinned by the lockfile but should be watched in CI.
- Review result: Self-review passed; subagent OS-001 architecture review confirmed scope should remain infrastructure-only.

### OS-002: Shared domain schemas and subject profile model

- Objective: Define shared Zod schemas and TypeScript types for core subject and metadata entities.
- Scope: Subject discriminated union, species schema with NCBITaxon support, profile modules, research metadata entity schemas, facility entity schemas, exported type helpers.
- Affected files/modules: `packages/domain/src/**`, `packages/domain/package.json`, domain tests.
- Acceptance criteria:
  - Subject profile schemas cover human participant, rodent subject, zebrafish batch, farm animal, and generic subject models.
  - Human subject schema defaults to pseudonymized identifiers and avoids directly identifying fields.
  - Animal schemas include NCBITaxon identifier fields where practical.
  - Vitest tests cover discriminated union validation and profile-specific constraints.
- Dependencies/blockers: OS-001.
- Estimated complexity: L.
- Estimated token budget: 20k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: High.
- Token-optimization strategy: Keep schemas focused on MVP fields; centralize shared primitives; use tests to encode required behavior instead of verbose comments.
- Branch: `feat/OS-002-shared-domain-schemas-subject-profile-model`.
- Validation performed:
  - `pnpm --filter @cohos/domain typecheck`
  - `pnpm --filter @cohos/domain build`
  - `pnpm test -- packages/domain/src/index.test.ts`
  - Full root validation before PR
- Validation result: Passed local package-level and full root validation.
- Risks: Generic metadata remains intentionally extensible and can carry sensitive context if future APIs do not constrain usage; API and UI tickets must treat it as potentially sensitive.
- Review result: Self-review passed locally; subagent OS-002 schema review confirmed required coverage and data-protection risks.

### OS-003: Database schema and synthetic seed data

- Objective: Add Prisma PostgreSQL schema and synthetic seed data aligned with domain contracts.
- Scope: Core MVP models, relations, indexes, append-only audit table, event tables, seed records for all subject models.
- Affected files/modules: `packages/db/prisma/schema.prisma`, `packages/db/src/**`, `packages/db/package.json`, seed scripts, db tests where practical.
- Acceptance criteria:
  - Prisma schema validates.
  - Seed data is synthetic, pseudonymized, and covers each subject model.
  - No directly identifying human participant examples exist.
  - Schema captures subject, profile, facility, investigation/study/assay, event, audit, connector, and QR MVP entities.
- Dependencies/blockers: OS-001, OS-002.
- Estimated complexity: L.
- Estimated token budget: 24k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: High.
- Token-optimization strategy: Model coherent MVP first; defer deep normalization and migrations to follow-up tickets; keep seed data compact.
- Branch: `feat/OS-003-database-schema-synthetic-seed-data`.
- Validation performed:
  - `pnpm --filter @cohos/db prisma:validate`
  - `pnpm --filter @cohos/db typecheck`
  - `pnpm --filter @cohos/db build`
  - `pnpm test -- packages/db/src/seed-data.test.ts`
  - Full root validation before PR
- Validation result: Passed local package-level and full root validation.
- Risks: Prisma 7 requires generated client output before TypeScript and lint checks; root scripts now generate the db client before those checks and generated files are ignored.
- Review result: Self-review passed locally; subagent OS-003 database review confirmed the seed data should stay compact, synthetic, and not implement derived event state.

### OS-004: API application skeleton and health endpoint

- Objective: Create the NestJS API app with baseline configuration and health endpoint.
- Scope: API package setup, application bootstrap, validation pipe, config module, health route, basic test.
- Affected files/modules: `apps/api/src/**`, `apps/api/package.json`, API tsconfig and test config.
- Acceptance criteria:
  - API app starts locally.
  - `GET /health` returns a stable health payload.
  - Request validation uses shared domain conventions where applicable.
  - `pnpm typecheck`, `pnpm test`, and `pnpm build` include the API app.
- Dependencies/blockers: OS-001.
- Estimated complexity: M.
- Estimated token budget: 14k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Use NestJS defaults sparingly; implement only health and shared app wiring; defer feature modules.
- Branch: `feat/OS-004-api-skeleton-health-endpoint`.
- Validation performed:
  - `pnpm --filter @cohos/api typecheck`
  - `pnpm --filter @cohos/api build`
  - `pnpm test -- apps/api/src/health/health.service.test.ts`
  - Built API smoke test against `GET /health` on a temporary local port
  - Vitest HTTP route test for `GET /health`
  - Full root validation before PR
- Validation result: Passed local package-level, HTTP smoke, and full root validation.
- Risks: API persistence and domain feature modules are intentionally deferred to OS-005 and later tickets.
- Review result: Self-review passed locally; subagent OS-004 review confirmed scope should remain health/bootstrap only and requested the committed HTTP route test.

### OS-005: Subject API module

- Objective: Implement subject endpoints backed by shared domain contracts.
- Scope: Subject list/detail/create/update where appropriate, profile-specific validation, pseudonymized display fields, in-memory or Prisma-backed service depending on OS-003 readiness.
- Affected files/modules: `apps/api/src/subjects/**`, `packages/domain/src/**`, API tests.
- Acceptance criteria:
  - Endpoints exist for listing, reading, and creating subjects.
  - DTO validation aligns with domain schemas.
  - Human participant responses expose pseudonymized codes only.
  - Tests cover all profile variants.
- Dependencies/blockers: OS-002, OS-004; prefer OS-003 before persistence.
- Estimated complexity: M.
- Estimated token budget: 18k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Reuse domain schemas for DTOs; keep persistence adapter narrow; avoid duplicating validation rules.
- Branch: `feat/OS-005-subject-api-module`.
- Validation performed:
  - `pnpm --filter @cohos/api typecheck`
  - `pnpm --filter @cohos/api build`
  - `pnpm test -- apps/api/src/subjects/subjects.controller.test.ts`
  - Full root validation before PR
- Validation result: Passed local API package and full root validation.
- Risks: Subjects are served from an in-memory service seeded with synthetic fixtures; Prisma persistence wiring is deferred behind the service boundary.
- Review result: Self-review passed locally. Subagent OS-005 review found a human pseudonymization blocker; fixed before merge by enforcing human `subjectCode` to match `profile.pseudonymizedSubjectCode` in API and domain validation.

### OS-006: Facility and housing API module

- Objective: Implement facility, room, rack, housing unit, cage, and tank API endpoints.
- Scope: Facility hierarchy read endpoints, housing detail, current occupant summaries, environmental observation hooks.
- Affected files/modules: `apps/api/src/facilities/**`, `packages/domain/src/facility/**`, API tests.
- Acceptance criteria:
  - Facility hierarchy can be queried.
  - Housing detail includes cage or tank type and current subject or batch references.
  - Contracts support later transfer and environmental events.
- Dependencies/blockers: OS-002, OS-003, OS-004.
- Estimated complexity: M.
- Estimated token budget: 16k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Keep hierarchy endpoints read-focused initially; defer complex location mutation to event/audit ticket.
- Branch: `feat/OS-006-facility-housing-api-module`.
- Validation performed:
  - `pnpm --filter @cohos/domain typecheck`
  - `pnpm --filter @cohos/domain build`
  - `pnpm --filter @cohos/api typecheck`
  - `pnpm test -- apps/api/src/facilities/facilities.controller.test.ts packages/domain/src/index.test.ts`
  - Full root validation before PR
- Validation result: Passed local API/domain focused validation and full root validation.
- Risks: Facility and housing data are served from in-memory synthetic fixtures; Prisma persistence and transfer/environmental mutation paths remain deferred to later event/audit work.
- Review result: Self-review passed locally. Subagent OS-006 review found a PR packaging blocker because new facility files were untracked and a non-blocking pasture occupant coverage gap; fixed before PR by explicitly staging the new module and adding pasture detail coverage.

### OS-007: Investigation, study, and assay API module

- Objective: Implement research metadata endpoints using COHOS vocabulary aligned with Metadatapp concepts.
- Scope: Investigation, study, assay/procedure endpoints, subject/cohort association contracts, connected resource link reads.
- Affected files/modules: `apps/api/src/research/**`, `packages/domain/src/research/**`, API tests.
- Acceptance criteria:
  - Investigation, study, and assay endpoints use domain schemas.
  - API vocabulary presents investigation/study/assay first while documenting project/experiment/procedure equivalence.
  - Connected resource links are represented for external provenance.
- Dependencies/blockers: OS-002, OS-003, OS-004.
- Estimated complexity: M.
- Estimated token budget: 16k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Implement concise CRUD-like reads and creates; defer advanced workflow planning.

### OS-008: Event and audit model

- Objective: Implement regulated operational events and append-only audit records.
- Scope: Transfer events, mortality events, welfare observations, environmental observations, derived state helpers, audit event service and safeguards.
- Affected files/modules: `packages/audit/src/**`, `packages/domain/src/events/**`, `apps/api/src/events/**`, `packages/db/prisma/schema.prisma`, tests.
- Acceptance criteria:
  - Events derive current housing, alive/deceased status, batch count, and alert flags where relevant.
  - Audit events are append-only in normal application logic.
  - Audit payloads use hashes or redacted snapshots.
  - Tests cover mortality and transfer-derived state.
- Dependencies/blockers: OS-002, OS-003, OS-004, OS-005, OS-006.
- Estimated complexity: L.
- Estimated token budget: 26k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: High.
- Token-optimization strategy: Build pure derived-state functions first; keep API mutation paths narrow; avoid generalized workflow engines.

### OS-009: Welfare and environmental rule engine

- Objective: Create configurable rule evaluation for welfare, mortality, environmental thresholds, and cumulative harm placeholders.
- Scope: Rule engine primitives, threshold config schemas, alert generation, tests.
- Affected files/modules: `packages/rules/src/**`, `packages/domain/src/alerts/**`, tests.
- Acceptance criteria:
  - Welfare observations can generate alerts.
  - Mortality threshold rules work for individual and batch contexts.
  - Environmental threshold rules are configurable.
  - Documentation avoids encoding jurisdiction-specific law as fact.
- Dependencies/blockers: OS-002; benefits from OS-008.
- Estimated complexity: M.
- Estimated token budget: 18k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: High.
- Token-optimization strategy: Implement pure functions and small fixtures; defer admin UI and jurisdiction profiles.

### OS-010: ISA-JSON export skeleton

- Objective: Implement the first ISA-compatible JSON export mapping.
- Scope: Mapping functions for organization, investigation, study, assay, subject/source, sample, dataset, connected links, tests, limitations docs.
- Affected files/modules: `packages/isa/src/**`, `docs/isa-mapping.md`, tests.
- Acceptance criteria:
  - Export returns stable ISA-like JSON shape from domain objects.
  - Tests cover investigation, study, assay, subject, sample, dataset, and connected link mapping.
  - Known gaps and future ISA-Tab, RO-Crate, and JSON-LD work are documented.
- Dependencies/blockers: OS-002.
- Estimated complexity: M.
- Estimated token budget: 20k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: High.
- Token-optimization strategy: Define a narrow exported shape with explicit limitations; avoid full ISA standard coverage in MVP.

### OS-011: Connector interfaces and Metadatapp connector skeleton

- Objective: Add connector contracts and a Metadatapp connector skeleton without real credentials.
- Scope: Connector interface, config schemas, credential reference model, health check placeholder, push/pull signatures, error model, mapping notes.
- Affected files/modules: `packages/connectors/src/**`, `docs/connector-design.md`, tests.
- Acceptance criteria:
  - Connector interface is typed and implementation-agnostic.
  - Metadatapp skeleton compiles and requires no live credentials.
  - Credential handling is by reference, not raw secret storage in code.
  - Failure modes are documented.
- Dependencies/blockers: OS-001, OS-002; benefits from OS-010.
- Estimated complexity: M.
- Estimated token budget: 16k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Define interfaces and typed placeholders only; avoid speculative API details.

### OS-012: QR token and scan workflow skeleton

- Objective: Implement typed QR token and quick action scan contracts.
- Scope: Token schema, target entity typing, expiry and revocation semantics, scan route contract, quick action intent types, tests.
- Affected files/modules: `packages/qr/src/**`, `packages/domain/src/qr/**`, `apps/api/src/qr/**`, `docs/qr-workflows.md`.
- Acceptance criteria:
  - QR tokens include purpose, target type, target id, expiry, revocation status, and created metadata.
  - Permanent unrestricted tokens are not supported.
  - Scan contract can drive future UI quick actions.
  - Tests cover expiry and revocation behavior.
- Dependencies/blockers: OS-002, OS-004.
- Estimated complexity: M.
- Estimated token budget: 16k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: High.
- Token-optimization strategy: Implement deterministic token validation utilities first; defer QR image generation and auth integration.

### OS-013: Web app shell and navigation

- Objective: Create the Next.js web app shell with navigation for MVP areas.
- Scope: App setup, layout, navigation, TanStack Query provider, basic API client, shared UI package usage.
- Affected files/modules: `apps/web/src/**`, `apps/web/package.json`, `packages/ui/src/**`.
- Acceptance criteria:
  - Web app runs locally.
  - Navigation includes dashboard, subjects, facility, investigations, welfare, reports, connectors, QR scan, and admin settings.
  - Shell uses COHOS vocabulary and no forbidden legacy names.
  - API client points to configured backend URL.
- Dependencies/blockers: OS-001, OS-004.
- Estimated complexity: M.
- Estimated token budget: 18k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Build a compact shell and shared primitives; avoid broad design system work.

### OS-014: Subject list, detail, and model-specific views

- Objective: Implement functional subject views backed by the subject API.
- Scope: Subject list, detail, model-specific sections for human participants, rodent subjects, zebrafish batches, farm animals, and generic subjects.
- Affected files/modules: `apps/web/src/app/subjects/**`, `apps/web/src/features/subjects/**`, UI tests where practical.
- Acceptance criteria:
  - Subject list and detail fetch real API data.
  - Model-specific labels and fields render correctly.
  - Human participant UI displays pseudonymized codes only.
  - Loading, empty, and error states exist.
- Dependencies/blockers: OS-005, OS-013.
- Estimated complexity: M.
- Estimated token budget: 20k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Reuse typed API client and small components; keep forms minimal.

### OS-015: Facility layout and housing detail views

- Objective: Implement facility hierarchy and cage/tank detail pages.
- Scope: Facility layout, room/rack/housing navigation, housing detail, current occupants, environmental observation summary.
- Affected files/modules: `apps/web/src/app/facilities/**`, `apps/web/src/features/facilities/**`.
- Acceptance criteria:
  - Facility hierarchy fetches from API.
  - Cage and tank details show housing-specific labels and occupant summaries.
  - UI supports future transfer and environmental workflows.
- Dependencies/blockers: OS-006, OS-013.
- Estimated complexity: M.
- Estimated token budget: 18k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Keep navigation simple; avoid diagramming complex floor plans in MVP.

### OS-016: Investigation, study, and assay views

- Objective: Implement research metadata pages.
- Scope: Investigation list/detail, study list/detail, assay/procedure views, linked subjects/cohorts, connected resources.
- Affected files/modules: `apps/web/src/app/investigations/**`, `apps/web/src/features/research/**`.
- Acceptance criteria:
  - Views fetch real API data.
  - UI vocabulary maps investigation/study/assay clearly.
  - Connected resource links are visible where available.
- Dependencies/blockers: OS-007, OS-013.
- Estimated complexity: M.
- Estimated token budget: 18k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Use shared table/detail patterns; defer advanced planning tools.

### OS-017: Welfare, alerts, and reports views

- Objective: Implement welfare, alert, and export/report screens.
- Scope: Welfare observations, alert list, mortality/environment summaries, export actions for CSV, JSON, PDF, and ISA JSON where available.
- Affected files/modules: `apps/web/src/app/welfare/**`, `apps/web/src/app/reports/**`, `packages/reporting/src/**`.
- Acceptance criteria:
  - Alert and welfare data fetch from API.
  - Report/export actions call real endpoints or typed package functions.
  - UI explains configurable rule thresholds without legal claims.
- Dependencies/blockers: OS-008, OS-009, OS-010, OS-013.
- Estimated complexity: M.
- Estimated token budget: 22k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Implement small report adapters; avoid full PDF styling until data contracts stabilize.

### OS-018: Connector settings and export UI

- Objective: Implement connector configuration and export workflow screens.
- Scope: Connector settings, health check display, credential reference form, ISA export action, connected resource status.
- Affected files/modules: `apps/web/src/app/connectors/**`, `apps/web/src/features/connectors/**`.
- Acceptance criteria:
  - Connector settings use typed API contracts.
  - No real credentials are required or stored in seed examples.
  - Health check and sync placeholders are explicit and actionable.
- Dependencies/blockers: OS-010, OS-011, OS-013.
- Estimated complexity: M.
- Estimated token budget: 16k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Keep configuration forms narrow; avoid provider-specific assumptions beyond the skeleton.

### OS-019: Test suite hardening

- Objective: Ensure MVP test coverage covers required domain, event, rule, ISA, and naming behavior.
- Scope: Add or consolidate tests across packages, forbidden-name scan, package-level fixtures, CI-compatible commands.
- Affected files/modules: `packages/*/src/**/*.test.ts`, `apps/*/**/*.test.ts`, root test scripts.
- Acceptance criteria:
  - Tests cover subject union validation, pseudonymization expectations, animal NCBITaxon fields, event-derived counts, mortality effects, welfare alerts, ISA output shape, and forbidden-name scan.
  - `pnpm test` passes at root.
  - Tests remain deterministic and do not require external services.
- Dependencies/blockers: OS-002, OS-008, OS-009, OS-010.
- Estimated complexity: M.
- Estimated token budget: 20k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Add focused tests near implementation packages; avoid large snapshots.

### OS-020: Documentation completion

- Objective: Complete MVP documentation set.
- Scope: README and architecture, domain, ISA, connector, audit/security, welfare, QR workflow, development loop docs.
- Affected files/modules: `README.md`, `docs/architecture.md`, `docs/domain-model.md`, `docs/isa-mapping.md`, `docs/connector-design.md`, `docs/audit-security.md`, `docs/welfare-model.md`, `docs/qr-workflows.md`, `docs/development-loop.md`, `docs/backlog.md`.
- Acceptance criteria:
  - Required documentation files exist and match implemented behavior.
  - README includes purpose, scope, non-goals, stack, quick start, package layout, validation, data protection, audit, ISA/export, connector, and MVP status.
  - Docs avoid forbidden legacy names and directly identifying sample data.
- Dependencies/blockers: OS-001 through OS-019.
- Estimated complexity: M.
- Estimated token budget: 24k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Update docs incrementally after each ticket; reserve OS-020 for consistency review and gaps.

### OS-021: CI and release-readiness cleanup

- Objective: Add GitHub Actions CI and final MVP readiness checks.
- Scope: CI workflow, lockfile validation, lint/typecheck/test/build commands, license confirmation, package metadata cleanup.
- Affected files/modules: `.github/workflows/ci.yml`, root package files, license file if absent, docs status.
- Acceptance criteria:
  - CI installs dependencies and runs lint, typecheck, test, and build.
  - CI uses pnpm and current Node LTS or documented supported runtime.
  - Apache-2.0 license is added if no license exists and no human decision changed the default.
  - Release-readiness risks are listed in backlog.
- Dependencies/blockers: OS-001, OS-019, OS-020.
- Estimated complexity: M.
- Estimated token budget: 14k.
- Recommended model: GPT-5 Codex.
- Recommended effort level: Medium.
- Token-optimization strategy: Use one simple CI workflow; avoid release automation until package publishing is required.

## Review Log

### OS-000 Self-Review

- Correctness: Passed local validation for repository inspection and backlog initialization.
- Scope control: OS-000 is limited to repository inspection and backlog initialization.
- Type safety: No TypeScript code added.
- Data protection: Backlog records pseudonymization and synthetic seed constraints.
- Auditability: Future audit ticket is explicitly sequenced after domain, database, and API foundations.
- Naming: Product vocabulary uses COHOS and required domain terms.
- Test coverage: No executable code yet; forbidden-name scan passed.
- Migration risk: None, because no database schema exists yet.
- PR review result: Self-review passed. GitHub PR review could not run for OS-000 because no base branch existed when the first PR was attempted.

## Follow-Up Notes

- OS-001 should create the first executable validation surface.
- OS-002 should be reviewed carefully before API, database, and UI work begin.
- OS-001 should branch from `main`.
