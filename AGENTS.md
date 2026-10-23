# AGENTS.md — COHOS

## Project status
COHOS is a **frozen R&D proof of concept**, not an active production roadmap. Preserve it as an architecture/domain reference for subjects, facility/housing, operations, welfare observations, pseudonymised human records, audit and ISA-like metadata. The current NestJS/Next.js project has synthetic in-memory API routes and incomplete persistence, authentication and live connectors. Do not represent it as a qualified LIMS, registry or welfare monitoring service.

## Development guardrails
By default: read-only review, targeted documentation and bug fixes preserving the prototype. Do not expand the domain scope, enable real clinical/animal records, connect external live systems, or turn on production endpoints without an explicit change of project status.
`packages/domain/` Zod schemas own domain constraints; `apps/api/` owns API behavior; `packages/db/` models prospective Prisma persistence; `apps/web/` must not introduce new scientific authority.
Audit hashes, QR token checks and synthetically tested rules are not automatically tamper-proof operational audit or safety decisions. Never infer welfare/clinical outcomes from placeholders.
Preserve synthetic and pseudonymized fixtures; avoid direct identifiers in logs and test payloads. Keep the distinction between persistence schema and currently operational persistence.

## Validation
```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```
Refer to `README.md`, `docs/architecture.md` and the existing CI for supported Node/pnpm versions. Do not state that a service is production-ready because these checks pass.
