# Audit And Security

COHOS treats auditability and data protection as first-class design constraints, but the MVP is not a production security boundary.

## Audit Model

Audit events include:

- stable audit event ID
- organization ID
- actor user ID
- entity type and entity ID
- action
- optional reason
- optional previous and new value snapshots
- creation timestamp
- optional request ID
- optional correlation ID
- source
- optional source event ID

The `@cohos/audit` package creates redacted snapshots by canonicalizing values and hashing the serialized payload with SHA-256. The resulting snapshot stores a hash and `redacted: true`, not the original object.

## Append-Only Behavior

`AppendOnlyAuditLog` is an in-memory append-only helper. It parses audit events through the domain schema, rejects duplicate IDs, and returns cloned records from reads. The Prisma schema models audit events as separate records linked to organizations, actors, entities, and source events.

Database-level immutability enforcement, write-once storage, and tamper-evident chains are not implemented yet.

## Event-Derived State

Operational state is derived from event streams instead of mutating source events:

- Transfers update current housing unit.
- Mortality updates alive status and batch counts.
- Welfare observations update latest welfare status and alert flags.
- Environmental observations update housing environmental state.

This keeps source events auditable and makes derived views reproducible.

## Data Protection Rules

- Human examples are synthetic and pseudonymized.
- Human subject display codes match the pseudonymized subject profile code.
- Seed data avoids direct identifying names, contact details, addresses, and real participant identifiers.
- Connector credential fields accept references such as `secret://...`, `vault://...`, `keyring://...`, and `env:NAME`; raw secret values are rejected by connector schemas.
- Audit snapshots are redacted hashes by default.

Generic metadata, connected-resource metadata, audit reasons, and event notes can become sensitive in future real deployments. Treat them as protected data in API, UI, export, and connector work.

## Current Runtime Controls

The API enables CORS for local web origins by default and supports `COHOS_WEB_ORIGINS` for explicit origins. NestJS validation is enabled globally with whitelist behavior and non-whitelisted fields rejected.

These controls are development safeguards. They do not replace authentication, authorization, rate limiting, transport security, or database access control.

## Deferred Security Work

- Authentication and session management.
- Role-based or policy-based authorization.
- Tenant isolation enforcement in every repository query.
- Database-backed immutable audit controls.
- Encryption strategy for sensitive fields and backups.
- Secret manager integration for connector credentials.
- Retention, deletion, export, and legal hold policy.
- Security headers and deployment hardening.
- Formal threat model and audit log review workflow.

## Contributor Guidance

- Do not add directly identifying sample data.
- Do not log raw connector credentials or raw sensitive metadata.
- Prefer redacted snapshots and stable IDs in audit output.
- Keep live integration secrets outside source control and seed data.
- Add tests when adding validation, derived state, audit, export, or connector behavior.
