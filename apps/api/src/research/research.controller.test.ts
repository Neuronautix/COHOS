import type { AddressInfo } from 'node:net';

import type { INestApplication } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';

import { createApiApp } from '../app.factory.js';

describe('ResearchController', () => {
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

  it('documents canonical research vocabulary before equivalent terms', async () => {
    const response = await fetch(`${await baseUrl()}/research/vocabulary`);
    const vocabulary = (await response.json()) as {
      readonly terms?: Array<{
        readonly canonical?: string;
        readonly equivalentTerms?: string[];
      }>;
    };

    expect(response.status).toBe(200);
    expect(vocabulary.terms?.map((term) => term.canonical)).toEqual([
      'investigation',
      'study',
      'assay',
    ]);
    expect(vocabulary.terms?.[0]?.equivalentTerms).toEqual(['project']);
    expect(vocabulary.terms?.[1]?.equivalentTerms).toEqual(['experiment']);
    expect(vocabulary.terms?.[2]?.equivalentTerms).toEqual(['procedure']);
  });

  it('reads investigation detail with studies, assays, procedures, outputs, and provenance links', async () => {
    const response = await fetch(`${await baseUrl()}/investigations/investigation-synthetic-001`);
    const investigation = (await response.json()) as {
      readonly id?: string;
      readonly studies?: Array<{
        readonly id?: string;
        readonly subjectIds?: string[];
        readonly cohortIds?: string[];
        readonly connectedResources?: Array<{ readonly label?: string; readonly url?: string }>;
        readonly assays?: Array<{
          readonly id?: string;
          readonly procedures?: Array<{ readonly id?: string; readonly name?: string }>;
          readonly samples?: Array<{ readonly sampleCode?: string }>;
          readonly datasets?: Array<{ readonly title?: string; readonly uri?: string }>;
          readonly connectedResources?: Array<{ readonly label?: string }>;
        }>;
      }>;
    };
    const study = investigation.studies?.[0];
    const assay = study?.assays?.[0];

    expect(response.status).toBe(200);
    expect(investigation.id).toBe('investigation-synthetic-001');
    expect(study?.subjectIds).toEqual(['subject-human-pseudo-001', 'subject-rodent-001']);
    expect(study?.cohortIds).toEqual(['cohort-synthetic-mixed']);
    expect(study?.connectedResources?.[0]).toMatchObject({
      label: 'Synthetic external protocol',
      url: 'https://example.test/cohos/protocol',
    });
    expect(assay?.procedures?.[0]).toMatchObject({
      id: 'procedure-synthetic-001',
      name: 'Synthetic welfare check',
    });
    expect(assay?.samples?.[0]?.sampleCode).toBe('SAMPLE-SYN-001');
    expect(assay?.datasets?.[0]?.uri).toBe('https://example.test/cohos/synthetic-dataset.json');
    expect(assay?.connectedResources?.[0]?.label).toBe('Synthetic assay plan');
    expect(JSON.stringify(investigation)).not.toContain('email');
    expect(JSON.stringify(investigation)).not.toContain('fullName');
  });

  it('lists nested research collections from canonical parent routes', async () => {
    const root = await baseUrl();
    const investigationsResponse = await fetch(`${root}/investigations`);
    const investigations = (await investigationsResponse.json()) as Array<{ readonly id?: string }>;
    const studiesResponse = await fetch(
      `${root}/investigations/investigation-synthetic-001/studies`,
    );
    const studies = (await studiesResponse.json()) as Array<{ readonly id?: string }>;
    const studyResponse = await fetch(`${root}/studies/study-synthetic-001`);
    const study = (await studyResponse.json()) as {
      readonly assays?: Array<{ readonly id?: string }>;
    };
    const assaysResponse = await fetch(`${root}/studies/study-synthetic-001/assays`);
    const assays = (await assaysResponse.json()) as Array<{ readonly id?: string }>;
    const assayResponse = await fetch(`${root}/assays/assay-synthetic-001`);
    const assay = (await assayResponse.json()) as {
      readonly procedures?: Array<{ readonly id?: string }>;
    };
    const proceduresResponse = await fetch(`${root}/assays/assay-synthetic-001/procedures`);
    const procedures = (await proceduresResponse.json()) as Array<{ readonly id?: string }>;

    expect(investigationsResponse.status).toBe(200);
    expect(investigations.map((investigation) => investigation.id)).toEqual([
      'investigation-synthetic-001',
    ]);
    expect(studiesResponse.status).toBe(200);
    expect(studies.map((nestedStudy) => nestedStudy.id)).toEqual(['study-synthetic-001']);
    expect(studyResponse.status).toBe(200);
    expect(study.assays?.[0]?.id).toBe('assay-synthetic-001');
    expect(assaysResponse.status).toBe(200);
    expect(assays.map((nestedAssay) => nestedAssay.id)).toEqual(['assay-synthetic-001']);
    expect(assayResponse.status).toBe(200);
    expect(assay.procedures?.[0]?.id).toBe('procedure-synthetic-001');
    expect(proceduresResponse.status).toBe(200);
    expect(procedures.map((procedure) => procedure.id)).toEqual(['procedure-synthetic-001']);
  });

  it('reads connected resource links directly and by linked entity', async () => {
    const root = await baseUrl();
    const filteredResponse = await fetch(
      `${root}/connected-resource-links?entityType=study&entityId=study-synthetic-001`,
    );
    const filtered = (await filteredResponse.json()) as Array<{
      readonly id?: string;
      readonly metadata?: { readonly source?: string };
    }>;
    const singleResponse = await fetch(
      `${root}/connected-resource-links/link-synthetic-protocol-1`,
    );
    const single = (await singleResponse.json()) as { readonly entityType?: string };

    expect(filteredResponse.status).toBe(200);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('link-synthetic-protocol-1');
    expect(filtered[0]?.metadata?.source).toBe('metadatapp');
    expect(singleResponse.status).toBe(200);
    expect(single.entityType).toBe('study');
  });

  it('creates investigation, study, assay, and procedure records through domain-aligned validation', async () => {
    const root = await baseUrl();
    const investigationResponse = await fetch(`${root}/investigations`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        title: 'New synthetic investigation',
        description: 'Created during API tests.',
        startsOn: '2026-04-01',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const investigation = (await investigationResponse.json()) as { readonly id?: string };
    const studyResponse = await fetch(`${root}/studies`, {
      body: JSON.stringify({
        investigationId: investigation.id,
        title: 'New synthetic study',
        subjectIds: ['subject-human-pseudo-001'],
        cohortIds: ['cohort-synthetic-mixed'],
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const study = (await studyResponse.json()) as { readonly id?: string };
    const assayResponse = await fetch(`${root}/assays`, {
      body: JSON.stringify({
        studyId: study.id,
        title: 'New synthetic assay',
        measurementType: 'observation',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const assay = (await assayResponse.json()) as { readonly id?: string };
    const procedureResponse = await fetch(`${root}/procedures`, {
      body: JSON.stringify({
        assayId: assay.id,
        name: 'New synthetic procedure',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const procedure = (await procedureResponse.json()) as { readonly id?: string };
    const createdAssayResponse = await fetch(`${root}/assays/${assay.id}`);
    const createdAssay = (await createdAssayResponse.json()) as {
      readonly procedures?: Array<{ readonly id?: string }>;
    };

    expect(investigationResponse.status).toBe(201);
    expect(investigation.id).toMatch(/^investigation-/);
    expect(studyResponse.status).toBe(201);
    expect(study.id).toMatch(/^study-/);
    expect(assayResponse.status).toBe(201);
    expect(assay.id).toMatch(/^assay-/);
    expect(procedureResponse.status).toBe(201);
    expect(procedure.id).toMatch(/^procedure-/);
    expect(createdAssay.procedures?.map((item) => item.id)).toContain(procedure.id);
  });

  it('rejects invalid payloads and missing parent references', async () => {
    const root = await baseUrl();
    const invalidInvestigationResponse = await fetch(`${root}/investigations`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        title: '',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const missingParentResponse = await fetch(`${root}/studies`, {
      body: JSON.stringify({
        investigationId: 'investigation-not-found',
        title: 'Orphan synthetic study',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    expect(invalidInvestigationResponse.status).toBe(400);
    expect(missingParentResponse.status).toBe(404);
  });

  it('returns 404 for missing research metadata records', async () => {
    const root = await baseUrl();

    expect((await fetch(`${root}/investigations/not-found`)).status).toBe(404);
    expect((await fetch(`${root}/studies/not-found`)).status).toBe(404);
    expect((await fetch(`${root}/assays/not-found`)).status).toBe(404);
    expect((await fetch(`${root}/procedures/not-found`)).status).toBe(404);
    expect((await fetch(`${root}/connected-resource-links/not-found`)).status).toBe(404);
  });
});
