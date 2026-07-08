# QR Workflows

COHOS QR contracts identify a target entity and a bounded purpose. Tokens always include an expiry timestamp; permanent unrestricted tokens are not part of the workflow.

## Package

The implementation lives in `packages/qr` and exports:

- `validateQrToken`
- QR package name metadata
- validation input types

Domain QR schemas live in `packages/domain/src/qr.ts`.

## Token Fields

- `purpose`: subject lookup, housing lookup, or quick action.
- `targetEntityType`: subject, housing unit, facility, study, or assay.
- `targetEntityId`: backend source-of-truth identifier.
- `expiresAt`: UTC timestamp after which scans are invalid.
- `revokedAt`: optional timestamp showing the token has been revoked.
- `createdAt`, `createdByUserId`, and metadata for audit context.

## API Surface

The QR API module exposes:

- `GET /qr/tokens`
- `GET /qr/tokens/:tokenId`
- `POST /qr/scan`

`POST /qr/scan` accepts a token ID and optional scan timestamp. The service returns a status of `valid`, `expired`, or `revoked`.

## Quick Actions

Valid subject tokens can return:

- open subject
- record welfare observation when the token purpose is quick action

Valid housing-unit tokens can return:

- open housing unit
- record environmental observation when the token purpose is quick action
- record transfer when the token purpose is quick action

Expired and revoked tokens return no quick-action intents.

## Security And Audit Notes

The current implementation validates deterministic token semantics only. Authentication, authorization, scan audit persistence, QR image generation, and durable token rotation are deferred. Future scan handlers should record actor, timestamp, target, token status, and action intent without exposing sensitive target metadata in the QR payload.
