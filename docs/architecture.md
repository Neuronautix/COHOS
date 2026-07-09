# Architecture

COHOS is a contract-first TypeScript monorepo. Shared Zod schemas define the domain surface, the NestJS API exposes those contracts, and the Next.js web app consumes the API rather than inventing local data shapes.

## Runtime Shape

- `apps/api` is the backend source of truth for application data returned to the web app.
- `apps/web` is the workspace UI and uses `NEXT_PUBLIC_COHOS_API_BASE_URL` or `COHOS_API_BASE_URL` to locate the API.
- `packages/domain` owns shared schemas and inferred TypeScript types.
- Feature packages implement deterministic behavior around those domain types.
- `packages/db` defines the intended PostgreSQL persistence model with Prisma and synthetic seed data.

The current API modules are fixture-backed. The Prisma schema is ready for persistence integration, but most API read/write paths do not yet use Prisma at runtime.

## Application Modules

The API imports these modules:

- Health: `GET /health`.
- Subjects: `GET /subjects`, `GET /subjects/:subjectId`, `GET /subjects/:subjectId/aggregates`, `POST /subjects`.
- Subject aggregates: `GET /subject-aggregates`, `GET /subject-aggregates/:aggregateId`, `GET /subject-aggregates/:aggregateId/memberships`.
- Facilities and housing: `GET /facilities`, `GET /facilities/:facilityId`, `GET /housing-units/:housingUnitId`.
- Research metadata: vocabulary, investigations, studies, assays, procedures, and connected-resource links.
- Events: event lists, transfer/mortality/welfare/environmental creation routes, derived subject state, derived housing state, audit events, and alerts.
- QR: token list/detail and `POST /qr/scan`.
- Connectors: connector list/detail/settings, dashboard, health check, push, pull, and resource status.

The web app mirrors those areas with routes for dashboard, subjects, facilities, investigations, studies, assays, welfare, reports, connectors, QR scan, and admin settings.

## Package Responsibilities

- `@cohos/domain`: canonical schemas for primitives, species, subjects, facilities, research metadata, operations, alerts, and QR.
- `@cohos/db`: Prisma schema and synthetic seed data aligned with the domain package.
- `@cohos/audit`: audit event creation, redacted snapshot hashes, append-only in-memory storage, and derived event state helpers.
- `@cohos/rules`: rule evaluation for welfare observations, mortality events, environmental observations, and cumulative-review placeholders.
- `@cohos/isa`: ISA-like JSON skeleton generation from research metadata.
- `@cohos/connectors`: connector config validation, credential reference validation, Metadatapp mapping, and deterministic connector adapter behavior.
- `@cohos/qr`: token validation and quick-action intent derivation.
- `@cohos/reporting`: operational report catalog, export action descriptors, filenames, and CSV serialization.
- `@cohos/ui`: shared React UI primitives.

## Data Flow

1. Domain schemas validate shared shapes and provide TypeScript types.
2. API fixtures and services parse or construct domain-compatible data.
3. Feature packages derive audit state, alerts, exports, reports, connector results, and QR scan results.
4. The web app fetches API responses through `fetchFromApi`.
5. UI components format domain data for review and export actions.

Backend contracts remain authoritative. Frontend pages should not add hidden state rules that disagree with API or package behavior.

## Persistence Model

The Prisma schema models:

- Organizations, users, roles, and user-role assignments.
- Species, lines, strains, genotypes, subjects, cohorts, and profile-specific tables.
- Facilities, rooms, racks, housing units, cages, and tanks.
- Investigations, studies, assays, procedures, samples, datasets, and connected-resource links.
- Events and event-specific detail tables.
- Audit events, requests, approvals, tasks, alerts, connector credentials, and QR tokens.

The seed path is synthetic and safe for development. It uses pseudonymized human examples and NCBITaxon identifiers for animal species.

## Validation And Invariants

Important invariants are enforced close to the schemas:

- Human participant `subjectCode` must match the pseudonymized code in the human profile.
- Animal profiles require NCBITaxon identifiers through `animalSpeciesSchema`.
- Mortality thresholds require a count or percent threshold.
- Environmental thresholds require a minimum or maximum value.
- QR tokens always expire and can be revoked.
- Connector credential values must be references, not raw tokens.

## Security Posture

MVP security is defensive but incomplete. The code avoids direct identifying seed data, validates DTOs, redacts audit snapshots, and stores connector credential references only. Production authentication, authorization, immutable database controls, secret resolution, retention policy, and deployment hardening remain future work.

## Deferred Work

- Prisma-backed API repositories.
- Authenticated user context and authorization checks.
- Live connector integration.
- Full ISA-JSON conformance and additional export packaging.
- PDF report rendering.
- Generated QR images and durable token revocation.
- CI and release-readiness automation in OS-021.
