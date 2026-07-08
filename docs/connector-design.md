# Connector Design

COHOS connector packages define typed boundaries for synchronization without embedding live provider credentials or provider-specific network behavior in the MVP.

## Contracts

- Connector configs identify the connector type, organization, display name, optional endpoint metadata, and a credential reference.
- Credential values must be references such as `secret://...`, `vault://...`, `keyring://...`, or `env:NAME`; raw tokens are not valid connector config.
- Connector adapters expose `healthCheck`, `push`, and `pull` methods with typed result envelopes.
- Errors carry a stable code, message, retryability flag, and structured details.
- Connector records preserve the COHOS entity type, entity id, optional external id, and payload.

## Metadatapp Skeleton

The Metadatapp adapter validates configuration and maps COHOS investigation and connected-resource records into connector records. Health, push, and pull methods return deterministic placeholder results and do not resolve credentials or make network calls.

The skeleton is intentionally provider-light. Real authentication, request signing, pagination, retry handling, conflict resolution, and remote schema negotiation are deferred until a live integration ticket defines those requirements.
