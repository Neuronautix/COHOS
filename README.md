# COHOS

COHOS is an open-source TypeScript monorepo for subject operations, research metadata, welfare review, audit trails, QR scan workflows, ISA-like export, and connector preparation.

The MVP is intentionally contract-first. The backend API and shared domain schemas are the source of truth, while the web app reads those contracts and keeps create/update behavior narrow until persistence and authorization are completed.

## Scope

COHOS currently covers:

- Subject registry contracts for pseudonymized human participants, rodent subjects, zebrafish batches, farm animals, and generic biological subjects.
- Facility and housing hierarchy for facilities, rooms, racks, cages, tanks, pastures, pens, rooms, and other housing units.
- Investigation, study, assay, procedure, sample, dataset, and connected-resource metadata.
- Operational events for transfers, mortality, welfare observations, and environmental observations.
- Append-only audit event helpers with redacted hashed snapshots.
- Configurable welfare, mortality, environmental, and cumulative-review rule contracts.
- ISA-like JSON skeleton export for research metadata.
- Connector contracts and a deterministic Metadatapp connector skeleton.
- QR token validation and scan result contracts for bounded quick actions.
- Next.js workspace pages backed by the NestJS API for the implemented MVP routes.

## Non-Goals

The MVP does not yet provide:

- Production authentication, authorization, or tenant isolation enforcement.
- Durable API persistence for all application routes. The Prisma schema and seed path exist, while current API modules use synthetic in-memory fixtures.
- Live connector network calls, credential resolution, request signing, pagination, or conflict resolution.
- Complete ISA-JSON conformance, ISA-Tab serialization, RO-Crate packaging, or JSON-LD publication.
- PDF rendering beyond planned export descriptors.
- Jurisdiction-specific welfare or legal threshold defaults.
- Generated QR images or persistence-backed token rotation.

## Stack

- Node.js 24 LTS in CI, with Node.js 22 or newer allowed by local package engines.
- pnpm 11 or newer.
- TypeScript with strict project references.
- NestJS API in `apps/api`.
- Next.js web app in `apps/web`.
- Zod schemas in `packages/domain`.
- Prisma PostgreSQL schema and synthetic seed data in `packages/db`.
- Vitest, ESLint, and Prettier for local validation.

## Quick Start

Install dependencies:

```powershell
pnpm install
```

Generate the Prisma client used by typecheck and build scripts:

```powershell
pnpm --filter @cohos/db prisma:generate
```

Run the API and web app together:

```powershell
pnpm dev
```

Defaults:

- API: `http://localhost:3001`
- Web: `http://localhost:3000`
- API port override: `PORT`
- CORS allow-list override: `COHOS_WEB_ORIGINS`
- Web API URL override: `NEXT_PUBLIC_COHOS_API_BASE_URL` or `COHOS_API_BASE_URL`
- Prisma database URL: `DATABASE_URL`, defaulting to `postgresql://cohos:cohos@localhost:5432/cohos_dev`

Optional database commands:

```powershell
pnpm --filter @cohos/db prisma:validate
pnpm --filter @cohos/db seed
```

## Package Layout

- `apps/api`: NestJS API with health, subject, facility, research, event, audit, alert, QR, and connector routes.
- `apps/web`: Next.js workspace for dashboard, subjects, facilities, investigations, welfare, reports, connectors, QR scan, and admin settings.
- `packages/domain`: Shared Zod schemas and TypeScript types.
- `packages/db`: Prisma schema, generated client target, and synthetic seed data.
- `packages/audit`: Audit event creation, redacted snapshot hashing, append-only in-memory log, and derived event state helpers.
- `packages/rules`: Configurable rule evaluation for welfare, mortality, environmental, and cumulative-review alerts.
- `packages/isa`: ISA-like JSON skeleton exporter.
- `packages/connectors`: Connector contracts and Metadatapp skeleton adapter.
- `packages/qr`: QR token validation and quick-action intent derivation.
- `packages/reporting`: Operational report descriptors and CSV helpers.
- `packages/ui`: Shared React UI primitives.

## Validation

Run the full local validation set:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:forbidden-names
```

The forbidden-name scan is intentionally a standalone Node script at `scripts/check-forbidden-legacy-names.mjs` so it works across shells without relying on platform-specific grep behavior.

GitHub Actions runs the same validation set on Node.js 24 LTS with pnpm 11.10.0 and `pnpm install --frozen-lockfile`.

## Data Protection

Human participant examples are synthetic and pseudonymized. Domain validation requires a human subject's `subjectCode` to match `profile.pseudonymizedSubjectCode`, and examples avoid direct identifying fields. Seed data uses synthetic users, organization names, subject codes, URLs, and connector credential references.

Generic metadata can still carry sensitive values if future features write unreviewed data into it. Treat metadata payloads as sensitive by default in API, UI, export, and connector work.

## Audit And Security

Audit helpers create redacted SHA-256 snapshots for previous and new values instead of storing raw object payloads. `AppendOnlyAuditLog` prevents duplicate event IDs in memory, and the Prisma schema models audit rows as separate append-oriented records linked to actors, entities, requests, correlations, and source events.

Authentication, authorization, immutable database enforcement, encryption, retention policy, and production secret handling are release-readiness work, not completed MVP behavior.

## ISA, Reports, And Connectors

`@cohos/isa` exports an ISA-like JSON skeleton from investigation, study, assay, sample, dataset, subject, organization, and connected-resource data. It preserves COHOS identifiers and NCBITaxon values where available, but does not claim complete ISA-JSON conformance.

`@cohos/reporting` exposes deterministic report descriptors for welfare, mortality and environment, audit, and research export workflows. CSV, JSON, and ISA JSON actions are available where data exists; PDF is represented as planned.

`@cohos/connectors` defines typed connector configs, credential references, health checks, push/pull envelopes, and connected-resource status. The Metadatapp adapter validates and maps records locally without resolving credentials or making network calls.

## MVP Status

OS-000 through OS-021 complete the MVP backlog through CI and release-readiness cleanup.

See `docs/backlog.md` for ticket history and `docs/development-loop.md` for the validation and PR workflow used by the repository.

## License

COHOS is licensed under Apache-2.0. See `LICENSE`.
