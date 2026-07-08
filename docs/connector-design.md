# Connector Design

COHOS connector packages define typed boundaries for synchronization without embedding live provider credentials or provider-specific network behavior in the MVP.

## Package

The implementation lives in `packages/connectors` and exports:

- connector config schemas
- credential reference validation
- connector record, health, push, pull, error, and resource status schemas
- Metadatapp mapping helpers
- `MetadatappConnector`
- `createMetadatappConnector`

## Contracts

- Connector configs identify connector type, organization, display name, enabled state, optional endpoint metadata, and credential reference.
- Credential values must be references such as `secret://...`, `vault://...`, `keyring://...`, or `env:NAME`; raw tokens are not valid connector config.
- Connector adapters expose `healthCheck`, `push`, and `pull` methods with typed result envelopes.
- Errors carry a stable code, message, retryability flag, and structured details.
- Connector records preserve COHOS entity type, entity ID, optional external ID, and payload.
- Connected-resource status reports whether a linked external resource is mapped to the connector skeleton or needs review.

## API Surface

The API connector module exposes:

- `GET /connectors`
- `GET /connectors/dashboard`
- `GET /connectors/:connectorId`
- `PATCH /connectors/:connectorId`
- `POST /connectors/:connectorId/health-check`
- `POST /connectors/:connectorId/push`
- `POST /connectors/:connectorId/pull`
- `GET /connectors/:connectorId/resource-status`

These routes are fixture-backed and deterministic. Settings updates validate typed inputs and return updated in-memory state for the current process.

## Web Surface

The connectors page shows settings, credential references, health status, push/pull placeholders, connected-resource status, and ISA export source data. The UI must continue to display credential references only, never raw secret values.

## Metadatapp Skeleton

The Metadatapp adapter validates configuration and maps COHOS investigation and connected-resource records into connector records. Health, push, and pull methods return deterministic placeholder results and do not resolve credentials or make network calls.

The skeleton records the intent of a push or pull and returns warnings that no network call occurred. This keeps the MVP safe to run locally while preserving the provider boundary needed for a future live integration.

## Deferred Live Integration Work

- Credential resolution through a secret manager.
- Authentication and request signing.
- Provider network calls.
- Pagination, retries, and rate-limit handling.
- Conflict detection and merge policy.
- Remote schema negotiation.
- Durable sync job state.
- Audit events for live connector operations.
