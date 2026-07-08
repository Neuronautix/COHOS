# QR Workflows

COHOS QR contracts identify a target entity and a bounded purpose. Tokens always include an expiry timestamp; permanent unrestricted tokens are not part of the workflow.

## Token Fields

- `purpose`: subject lookup, housing lookup, or quick action.
- `targetEntityType`: subject, housing unit, facility, study, or assay.
- `targetEntityId`: backend source-of-truth identifier.
- `expiresAt`: UTC timestamp after which scans are invalid.
- `revokedAt`: optional timestamp showing the token has been revoked.
- `createdAt`, `createdByUserId`, and metadata for audit context.

## Scan Flow

The API accepts a token id and optional scan timestamp at `POST /qr/scan`. The service returns a status of `valid`, `expired`, or `revoked`. Valid tokens return quick action intents that future UI flows can render as buttons or menu actions; expired and revoked tokens return no actions.

QR image generation, authentication/authorization checks, and persistence-backed token rotation are deferred. The current implementation defines deterministic contracts and scan semantics for future UI and API integration.
