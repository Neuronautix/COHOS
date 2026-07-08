import type { QRTokenContract } from '@cohos/domain';

export const qrTokenFixtures = [
  {
    id: 'qr-token-subject-quick-001',
    organizationId: 'org-synthetic-cohos',
    purpose: 'quick_action',
    targetEntityType: 'subject',
    targetEntityId: 'subject-rodent-001',
    expiresAt: '2026-12-31T23:59:59Z',
    createdAt: '2026-07-08T09:00:00Z',
    createdByUserId: 'user-seed-coordinator',
    metadata: {
      fixture: true,
    },
  },
  {
    id: 'qr-token-housing-quick-001',
    organizationId: 'org-synthetic-cohos',
    purpose: 'quick_action',
    targetEntityType: 'housing_unit',
    targetEntityId: 'housing-tank-z1',
    expiresAt: '2026-12-31T23:59:59Z',
    createdAt: '2026-07-08T09:05:00Z',
    createdByUserId: 'user-seed-coordinator',
    metadata: {
      fixture: true,
    },
  },
  {
    id: 'qr-token-expired-001',
    organizationId: 'org-synthetic-cohos',
    purpose: 'subject_lookup',
    targetEntityType: 'subject',
    targetEntityId: 'subject-rodent-001',
    expiresAt: '2026-01-01T00:00:00Z',
    createdAt: '2025-12-01T00:00:00Z',
    createdByUserId: 'user-seed-coordinator',
    metadata: {
      fixture: true,
    },
  },
  {
    id: 'qr-token-revoked-001',
    organizationId: 'org-synthetic-cohos',
    purpose: 'housing_lookup',
    targetEntityType: 'housing_unit',
    targetEntityId: 'housing-cage-a1',
    expiresAt: '2026-12-31T23:59:59Z',
    revokedAt: '2026-07-08T09:30:00Z',
    createdAt: '2026-07-08T09:10:00Z',
    createdByUserId: 'user-seed-coordinator',
    metadata: {
      fixture: true,
    },
  },
] satisfies QRTokenContract[];
