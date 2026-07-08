import { describe, expect, it } from 'vitest';

import { qrTokenContractSchema } from '@cohos/domain';

import { validateQrToken } from './index.js';

const baseToken = {
  id: 'qr-token-subject-001',
  organizationId: 'org-cohos',
  purpose: 'quick_action',
  targetEntityType: 'subject',
  targetEntityId: 'subject-rodent-001',
  expiresAt: '2026-12-31T23:59:59Z',
  createdAt: '2026-07-08T09:00:00Z',
  createdByUserId: 'user-care-001',
  metadata: {
    fixture: true,
  },
} as const;

describe('QR token validation', () => {
  it('rejects permanent unrestricted tokens by requiring expiry and known purpose', () => {
    expect(
      qrTokenContractSchema.safeParse({
        ...baseToken,
        expiresAt: undefined,
      }).success,
    ).toBe(false);

    expect(
      qrTokenContractSchema.safeParse({
        ...baseToken,
        purpose: 'unrestricted',
      }).success,
    ).toBe(false);
  });

  it('returns quick action intents for valid subject tokens', () => {
    const result = validateQrToken({
      token: baseToken,
      scannedAt: '2026-07-08T10:00:00Z',
    });

    expect(result).toMatchObject({
      status: 'valid',
      scannedAt: '2026-07-08T10:00:00Z',
      quickActionIntents: [
        {
          actionType: 'open_subject',
          targetEntityId: 'subject-rodent-001',
        },
        {
          actionType: 'record_welfare_observation',
          targetEntityId: 'subject-rodent-001',
        },
      ],
    });
  });

  it('marks expired tokens invalid and suppresses quick actions', () => {
    const result = validateQrToken({
      token: {
        ...baseToken,
        id: 'qr-token-expired-001',
        expiresAt: '2026-07-08T10:00:00Z',
      },
      scannedAt: '2026-07-08T10:00:00Z',
    });

    expect(result.status).toBe('expired');
    expect(result.quickActionIntents).toEqual([]);
  });

  it('marks revoked tokens invalid and suppresses quick actions', () => {
    const result = validateQrToken({
      token: {
        ...baseToken,
        id: 'qr-token-revoked-001',
        revokedAt: '2026-07-08T09:30:00Z',
      },
      scannedAt: '2026-07-08T10:00:00Z',
    });

    expect(result.status).toBe('revoked');
    expect(result.quickActionIntents).toEqual([]);
  });
});
