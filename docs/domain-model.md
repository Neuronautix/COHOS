# Domain Model

The domain package is the canonical contract layer for COHOS. It exports Zod schemas and inferred TypeScript types for shared use by the API, web app, database seed data, and feature packages.

## Primitives

Common primitives include entity IDs, ISO dates, ISO timestamps, metadata objects, NCBITaxon identifiers, and redacted audit snapshots. Metadata objects are intentionally flexible, but callers should treat them as sensitive because future integrations can carry operational context.

## Subjects

Every subject has:

- `id`
- `organizationId`
- `subjectCode`
- `profileType`
- `status`
- optional `cohortId`
- optional `speciesId`
- an embedded profile in `SubjectWithProfile`

Supported profile types:

- `human`: pseudonymized participant code, consent status, study participation status, optional age band, optional sex, and optional gender identity.
- `rodent`: animal species, optional strain/line/genotype, sex, age or birth date, optional housing unit, and welfare status.
- `zebrafish_batch`: animal species, batch identifier, optional line/genotype, developmental stage, optional tank, count, and event references.
- `farm_animal`: animal species, group or individual identifiers, optional age fields, sex, optional housing unit, and welfare status.
- `generic`: optional species, biological type, metadata, and extensibility notes.

Human subject validation requires `subjectCode` to match `profile.pseudonymizedSubjectCode`. Animal species profiles require NCBITaxon identifiers.

## Facility And Housing

Facility schemas model:

- Facility
- Room
- Rack
- Housing unit
- Cage
- Tank
- Pasture, pen, room, and other housing-unit detail

Housing detail includes occupants, recent environmental observations, and typed targets for future transfer and environmental observation workflows.

## Research Metadata

Research schemas use COHOS vocabulary first:

- Investigation
- Study
- Assay
- Procedure
- Sample
- Dataset
- Connected resource link

The research vocabulary endpoint documents equivalent project, experiment, and procedure terms without changing the canonical route names. Investigation details contain studies, study details contain assays, and assay details contain procedures, samples, datasets, and connected resources.

## Operations

Operational event types are:

- `transfer`
- `mortality`
- `welfare_observation`
- `environmental_observation`

Event state helpers derive subject alive status, current housing unit, batch count, latest welfare status, housing environmental state, and alert flags from sorted event streams. Derived state should be recalculated from source events when persistence is introduced.

## Audit, Requests, Tasks, And Alerts

Audit events include actor, entity, action, reason, previous snapshot, new snapshot, creation time, optional request and correlation IDs, source, and optional source event ID.

Request, approval, task, and alert schemas provide typed operational workflow hooks. They are intentionally light in the MVP and do not yet encode full authorization or workflow policy.

## QR Contracts

QR token contracts support subject lookup, housing lookup, and quick action purposes. Valid target entity types are subject, housing unit, facility, study, and assay. Scan results return `valid`, `expired`, or `revoked` plus quick-action intents when applicable.

## Connector Contracts

Connector-related domain contracts identify credential references and connected resources. The connector package extends those contracts with provider-specific config, health, push, pull, record, and status envelopes.

## Database Alignment

The Prisma schema mirrors the domain areas with normalized tables for profile-specific subject data, facility hierarchy, research metadata, operations, audit, alerts, connector credentials, and QR tokens. The database package also exports synthetic seed data that is parsed by package tests and used by the optional seed script.

## Extension Rules

- Add new shared fields in `packages/domain` before using them in API or UI code.
- Prefer discriminated unions for model families with behavior differences.
- Keep human examples pseudonymized and synthetic.
- Keep backend and package logic authoritative for derived state and export shape.
- Add focused tests near the package that owns the behavior.
