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
      readonly aggregateMemberships?: Array<{ readonly aggregateKind?: string }>;
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

    const rodentSubject = subjects.find((subject) => subject.profileType === 'rodent');

    expect(
      rodentSubject?.aggregateMemberships?.map((membership) => membership.aggregateKind),
    ).toEqual(['batch', 'group', 'cohort']);
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

  it('exposes batch, group, and cohort aggregate fixtures', async () => {
    const root = await baseUrl();
    const aggregatesResponse = await fetch(`${root}/subject-aggregates`);
    const aggregates = (await aggregatesResponse.json()) as Array<{
      readonly id?: string;
      readonly kind?: string;
      readonly batch?: { readonly originType?: string };
      readonly group?: { readonly groupPurpose?: string };
      readonly cohort?: { readonly cohortKind?: string };
    }>;
    const membershipsResponse = await fetch(
      `${root}/subject-aggregates/cohort-synthetic-mixed/memberships`,
    );
    const memberships = (await membershipsResponse.json()) as Array<{
      readonly subjectId?: string;
      readonly aggregateKind?: string;
      readonly role?: string;
    }>;
    const subjectMembershipsResponse = await fetch(
      `${root}/subjects/subject-rodent-001/aggregates`,
    );
    const subjectMemberships = (await subjectMembershipsResponse.json()) as Array<{
      readonly aggregateCode?: string;
    }>;

    expect(aggregatesResponse.status).toBe(200);
    expect(aggregates.map((aggregate) => aggregate.kind)).toEqual(
      expect.arrayContaining(['batch', 'group', 'cohort']),
    );
    expect(
      aggregates.find((aggregate) => aggregate.id === 'batch-zebrafish-spawn-001')?.batch
        ?.originType,
    ).toBe('spawn');
    expect(
      aggregates.find((aggregate) => aggregate.id === 'group-rodent-cage-a1')?.group?.groupPurpose,
    ).toBe('housing');
    expect(
      aggregates.find((aggregate) => aggregate.id === 'cohort-synthetic-mixed')?.cohort?.cohortKind,
    ).toBe('interventional_arm');
    expect(membershipsResponse.status).toBe(200);
    expect(memberships.map((membership) => membership.subjectId)).toEqual([
      'subject-rodent-001',
      'subject-zebrafish-batch-001',
    ]);
    expect(memberships.map((membership) => membership.role)).toEqual([
      'randomized_unit',
      'randomized_unit',
    ]);
    expect(subjectMembershipsResponse.status).toBe(200);
    expect(subjectMemberships.map((membership) => membership.aggregateCode)).toEqual([
      'BATCH-ROD-SHIP-001',
      'GROUP-ROD-CAGE-A1',
      'COHORT-SYN-MIXED',
    ]);
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

  it('rejects human subject codes that differ from the pseudonymized code', async () => {
    const response = await fetch(`${await baseUrl()}/subjects`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectCode: 'DIRECT-HUMAN-CODE',
        profileType: 'human',
        profile: {
          profileType: 'human',
          pseudonymizedSubjectCode: 'HUM-PSEUDO-999',
          consentStatus: 'pending',
          studyParticipationStatus: 'screening',
        },
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    expect(response.status).toBe(400);
  });

  it('rejects direct human identifier fields', async () => {
    const response = await fetch(`${await baseUrl()}/subjects`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectCode: 'HUM-PSEUDO-998',
        profileType: 'human',
        profile: {
          profileType: 'human',
          pseudonymizedSubjectCode: 'HUM-PSEUDO-998',
          consentStatus: 'pending',
          studyParticipationStatus: 'screening',
          email: 'participant@example.test',
          fullName: 'Synthetic Person',
        },
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    expect(response.status).toBe(400);
  });

  it('rejects animal profiles without structured NCBITaxon identifiers', async () => {
    const root = await baseUrl();
    const missingResponse = await fetch(`${root}/subjects`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectCode: 'ROD-SYN-998',
        profileType: 'rodent',
        profile: {
          profileType: 'rodent',
          species: {
            id: 'species-mouse-invalid',
            commonName: 'house mouse',
            scientificName: 'Mus musculus',
          },
          sex: 'female',
        },
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    const invalidResponse = await fetch(`${root}/subjects`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectCode: 'ROD-SYN-999',
        profileType: 'rodent',
        profile: {
          profileType: 'rodent',
          species: {
            id: 'species-mouse-invalid',
            commonName: 'house mouse',
            scientificName: 'Mus musculus',
            ncbiTaxonId: '10090',
          },
          sex: 'female',
        },
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    expect(missingResponse.status).toBe(400);
    expect(invalidResponse.status).toBe(400);
  });
});
