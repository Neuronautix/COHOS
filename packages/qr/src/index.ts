import {
  type QRScanResult,
  type QRTokenContract,
  type QuickActionIntent,
  qrScanResultSchema,
  qrTokenContractSchema,
} from '@cohos/domain';

export const qrPackageName = '@cohos/qr';

export type QrPackageName = typeof qrPackageName;

export type ValidateQrTokenInput = {
  readonly scannedAt?: string;
  readonly token: QRTokenContract;
};

function parsedToken(token: QRTokenContract): QRTokenContract {
  return qrTokenContractSchema.parse(token);
}

function scanTimestamp(scannedAt?: string): string {
  return scannedAt ?? new Date().toISOString();
}

function isExpired(token: QRTokenContract, scannedAt: string): boolean {
  return Date.parse(token.expiresAt) <= Date.parse(scannedAt);
}

function quickActionIntents(token: QRTokenContract): QuickActionIntent[] {
  if (token.targetEntityType === 'subject') {
    return [
      {
        actionType: 'open_subject',
        label: 'Open subject',
        targetEntityType: 'subject',
        targetEntityId: token.targetEntityId,
        payload: {},
      },
      ...(token.purpose === 'quick_action'
        ? [
            {
              actionType: 'record_welfare_observation' as const,
              label: 'Record welfare observation',
              targetEntityType: 'subject' as const,
              targetEntityId: token.targetEntityId,
              payload: {},
            },
          ]
        : []),
    ];
  }

  if (token.targetEntityType === 'housing_unit') {
    return [
      {
        actionType: 'open_housing_unit',
        label: 'Open housing unit',
        targetEntityType: 'housing_unit',
        targetEntityId: token.targetEntityId,
        payload: {},
      },
      ...(token.purpose === 'quick_action'
        ? [
            {
              actionType: 'record_environmental_observation' as const,
              label: 'Record environmental observation',
              targetEntityType: 'housing_unit' as const,
              targetEntityId: token.targetEntityId,
              payload: {},
            },
            {
              actionType: 'record_transfer' as const,
              label: 'Record transfer',
              targetEntityType: 'housing_unit' as const,
              targetEntityId: token.targetEntityId,
              payload: {},
            },
          ]
        : []),
    ];
  }

  return [];
}

export function validateQrToken(input: ValidateQrTokenInput): QRScanResult {
  const token = parsedToken(input.token);
  const scannedAt = scanTimestamp(input.scannedAt);

  if (token.revokedAt !== undefined) {
    return qrScanResultSchema.parse({
      token,
      status: 'revoked',
      scannedAt,
      message: `QR token ${token.id} was revoked at ${token.revokedAt}.`,
      quickActionIntents: [],
    });
  }

  if (isExpired(token, scannedAt)) {
    return qrScanResultSchema.parse({
      token,
      status: 'expired',
      scannedAt,
      message: `QR token ${token.id} expired at ${token.expiresAt}.`,
      quickActionIntents: [],
    });
  }

  return qrScanResultSchema.parse({
    token,
    status: 'valid',
    scannedAt,
    message: `QR token ${token.id} is valid for ${token.targetEntityType}.`,
    quickActionIntents: quickActionIntents(token),
  });
}
