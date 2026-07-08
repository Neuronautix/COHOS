import type { AddressInfo } from 'node:net';

import type { INestApplication } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';

import { createApiApp } from '../app.factory.js';

describe('HealthController', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('serves GET /health over HTTP', async () => {
    app = await createApiApp();
    await app.listen(0);

    const server = app.getHttpServer() as { address: () => AddressInfo | string | null };
    const address = server.address();

    if (address === null || typeof address === 'string') {
      throw new Error('Expected an ephemeral TCP address for the test server.');
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    const body = (await response.json()) as {
      readonly service?: string;
      readonly status?: string;
      readonly timestamp?: string;
      readonly version?: string;
    };

    expect(response.status).toBe(200);
    expect(body.service).toBe('cohos-api');
    expect(body.status).toBe('ok');
    expect(body.version).toBeTruthy();
    expect(Number.isNaN(Date.parse(body.timestamp ?? ''))).toBe(false);
  });
});
