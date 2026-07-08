import type { AddressInfo } from 'node:net';

import type { INestApplication } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';

import { createApiApp } from '../app.factory.js';

describe('ConnectorsController', () => {
  let app: INestApplication | undefined;

  async function baseUrl() {
    app = await createApiApp();
    await app.listen(0);

    const server = app.getHttpServer() as { address: () => AddressInfo | string | null };
    const address = server.address();

    if (address === null || typeof address === 'string') {
      throw new Error('Expected an ephemeral TCP address for the test server.');
    }

    return `http://127.0.0.1:${address.port}`;
  }

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('returns typed connector settings without raw credentials', async () => {
    const root = await baseUrl();
    const response = await fetch(`${root}/connectors`);
    const connectors = (await response.json()) as Array<{
      readonly connectorType?: string;
      readonly credentialReference?: string;
      readonly id?: string;
    }>;

    expect(response.status).toBe(200);
    expect(connectors).toHaveLength(1);
    expect(connectors[0]).toMatchObject({
      connectorType: 'metadatapp',
      credentialReference: 'secret://cohos/synthetic/metadatapp',
      id: 'connector-metadatapp-synthetic',
    });
    expect(JSON.stringify(connectors)).not.toContain('raw-token');
  });

  it('validates connector setting updates through reference-only credentials', async () => {
    const root = await baseUrl();
    const invalidResponse = await fetch(`${root}/connectors/connector-metadatapp-synthetic`, {
      body: JSON.stringify({
        credentialReference: 'raw-token-value',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'PATCH',
    });
    const validResponse = await fetch(`${root}/connectors/connector-metadatapp-synthetic`, {
      body: JSON.stringify({
        baseUrl: 'https://metadatapp-review.example.test',
        credentialReference: 'env:METADATAPP_TOKEN',
        enabled: false,
        workspaceId: 'workspace-review',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'PATCH',
    });
    const connector = (await validResponse.json()) as {
      readonly baseUrl?: string;
      readonly credentialReference?: string;
      readonly enabled?: boolean;
      readonly workspaceId?: string;
    };

    expect(invalidResponse.status).toBe(400);
    expect(validResponse.status).toBe(200);
    expect(connector).toMatchObject({
      baseUrl: 'https://metadatapp-review.example.test',
      credentialReference: 'env:METADATAPP_TOKEN',
      enabled: false,
      workspaceId: 'workspace-review',
    });
  });

  it('returns health, push, pull, and resource status placeholders', async () => {
    const root = await baseUrl();
    const dashboardResponse = await fetch(`${root}/connectors/dashboard`);
    const dashboard = (await dashboardResponse.json()) as {
      readonly healthChecks?: Array<{ readonly status?: string }>;
      readonly resourceStatuses?: Array<{ readonly status?: string; readonly source?: string }>;
    };
    const healthResponse = await fetch(
      `${root}/connectors/connector-metadatapp-synthetic/health-check`,
      { method: 'POST' },
    );
    const health = (await healthResponse.json()) as { readonly status?: string };
    const pushResponse = await fetch(`${root}/connectors/connector-metadatapp-synthetic/push`, {
      method: 'POST',
    });
    const push = (await pushResponse.json()) as {
      readonly acceptedRecords?: Array<{ readonly entityType?: string }>;
      readonly status?: string;
      readonly warnings?: string[];
    };
    const pullResponse = await fetch(`${root}/connectors/connector-metadatapp-synthetic/pull`, {
      method: 'POST',
    });
    const pull = (await pullResponse.json()) as {
      readonly status?: string;
      readonly warnings?: string[];
    };

    expect(dashboardResponse.status).toBe(200);
    expect(dashboard.healthChecks?.[0]?.status).toBe('ready');
    expect(dashboard.resourceStatuses?.map((status) => status.source)).toEqual([
      'metadatapp',
      'metadatapp',
    ]);
    expect(dashboard.resourceStatuses?.map((status) => status.status)).toEqual([
      'linked',
      'linked',
    ]);
    expect(healthResponse.status).toBe(201);
    expect(health.status).toBe('ready');
    expect(pushResponse.status).toBe(201);
    expect(push.status).toBe('accepted');
    expect(push.acceptedRecords?.map((record) => record.entityType)).toEqual([
      'investigation',
      'connected_resource',
      'connected_resource',
    ]);
    expect(push.warnings?.join(' ')).toContain('no network call was made');
    expect(pullResponse.status).toBe(201);
    expect(pull.status).toBe('skipped');
    expect(pull.warnings?.join(' ')).toContain('Pull filters were recorded');
  });

  it('returns 404 for missing connectors', async () => {
    const root = await baseUrl();

    expect((await fetch(`${root}/connectors/connector-not-found`)).status).toBe(404);
    expect(
      (
        await fetch(`${root}/connectors/connector-not-found/health-check`, {
          method: 'POST',
        })
      ).status,
    ).toBe(404);
  });
});
