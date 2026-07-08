import type { AddressInfo } from 'node:net';

import type { INestApplication } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';

import { createApiApp } from '../app.factory.js';

describe('SubjectsController', () => {
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

  it('lists pseudonymized subjects for all supported models', async () => {
    const response = await fetch(`${await baseUrl()}/subjects`);
    const subjects = (await response.json()) as Array<{
      readonly profileType?: string;
      readonly profile?: Record<string, unknown>;
    }>;

    expect(response.status).toBe(200);
    expect(subjects.map((subject) => subject.profileType).sort()).toEqual([
      'farm_animal',
      'generic',
      'human',
      'rodent',
      'zebrafish_batch',
    ]);

    const humanSubject = subjects.find((subject) => subject.profileType === 'human');

    expect(humanSubject?.profile?.pseudonymizedSubjectCode).toBe('HUM-PSEUDO-001');
    expect(humanSubject?.profile?.email).toBeUndefined();
    expect(humanSubject?.profile?.fullName).toBeUndefined();
  });

  it('reads a single subject and returns 404 for a missing subject', async () => {
    const root = await baseUrl();
    const foundResponse = await fetch(`${root}/subjects/subject-rodent-001`);
    const found = (await foundResponse.json()) as {
      readonly id?: string;
      readonly profile?: { readonly species?: { readonly ncbiTaxonId?: string } };
    };

    expect(foundResponse.status).toBe(200);
    expect(found.id).toBe('subject-rodent-001');
    expect(found.profile?.species?.ncbiTaxonId).toBe('NCBITaxon:10090');

    const missingResponse = await fetch(`${root}/subjects/not-found`);

    expect(missingResponse.status).toBe(404);
  });

  it('creates a subject through domain-aligned validation', async () => {
    const response = await fetch(`${await baseUrl()}/subjects`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectCode: 'GEN-SYN-NEW',
        profileType: 'generic',
        profile: {
          profileType: 'generic',
          biologicalType: 'synthetic biological subject',
          metadata: {
            fixture: true,
          },
        },
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const created = (await response.json()) as {
      readonly id?: string;
      readonly profileType?: string;
    };

    expect(response.status).toBe(201);
    expect(created.id).toMatch(/^subject-/);
    expect(created.profileType).toBe('generic');
  });

  it('rejects mismatched subject/profile types', async () => {
    const response = await fetch(`${await baseUrl()}/subjects`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectCode: 'BAD-SYN-001',
        profileType: 'rodent',
        profile: {
          profileType: 'generic',
          biologicalType: 'synthetic biological subject',
          metadata: {},
        },
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    expect(response.status).toBe(400);
  });
});
