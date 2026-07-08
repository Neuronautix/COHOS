import { afterEach, describe, expect, it } from 'vitest';

import type { INestApplication } from '@nestjs/common';

import { createApiApp } from '../app.factory.js';

describe('QR API', () => {
  let app: INestApplication | undefined;

  async function baseUrl() {
    app = await createApiApp();
    await app.listen(0);
    const server = app.getHttpServer() as {
      address(): { port: number };
    };

    return `http://127.0.0.1:${server.address().port}`;
  }

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('lists QR tokens with expiry and target metadata', async () => {
    const url = await baseUrl();

    const response = await fetch(`${url}/qr/tokens`);
    const tokens = (await response.json()) as Array<Record<string, unknown>>;

    expect(response.status).toBe(200);
    expect(tokens[0]).toMatchObject({
      id: 'qr-token-subject-quick-001',
      purpose: 'quick_action',
      targetEntityType: 'subject',
      targetEntityId: 'subject-rodent-001',
      expiresAt: '2026-12-31T23:59:59Z',
    });
  });

  it('scans valid tokens into quick action intents', async () => {
    const url = await baseUrl();

    const response = await fetch(`${url}/qr/scan`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: 'qr-token-housing-quick-001',
        scannedAt: '2026-07-08T10:00:00Z',
      }),
    });
    const result = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(result).toMatchObject({
      status: 'valid',
      token: {
        targetEntityType: 'housing_unit',
        targetEntityId: 'housing-tank-z1',
      },
      quickActionIntents: [
        {
          actionType: 'open_housing_unit',
          targetEntityId: 'housing-tank-z1',
        },
        {
          actionType: 'record_environmental_observation',
          targetEntityId: 'housing-tank-z1',
        },
        {
          actionType: 'record_transfer',
          targetEntityId: 'housing-tank-z1',
        },
      ],
    });
  });

  it('reports expired and revoked scans without quick actions', async () => {
    const url = await baseUrl();

    const expiredResponse = await fetch(`${url}/qr/scan`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: 'qr-token-expired-001',
        scannedAt: '2026-07-08T10:00:00Z',
      }),
    });
    const revokedResponse = await fetch(`${url}/qr/scan`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: 'qr-token-revoked-001',
        scannedAt: '2026-07-08T10:00:00Z',
      }),
    });

    expect(await expiredResponse.json()).toMatchObject({
      status: 'expired',
      quickActionIntents: [],
    });
    expect(await revokedResponse.json()).toMatchObject({
      status: 'revoked',
      quickActionIntents: [],
    });
  });

  it('rejects invalid scan payloads and missing tokens', async () => {
    const url = await baseUrl();

    const invalidResponse = await fetch(`${url}/qr/scan`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: 'qr-token-subject-quick-001',
        scannedAt: 'not-a-date',
      }),
    });
    const missingResponse = await fetch(`${url}/qr/scan`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: 'qr-token-missing',
        scannedAt: '2026-07-08T10:00:00Z',
      }),
    });

    expect(invalidResponse.status).toBe(400);
    expect(missingResponse.status).toBe(404);
  });
});
