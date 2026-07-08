import { describe, expect, it } from 'vitest';

import type {
  ConnectedResourceLink,
  InvestigationDetail,
  Organization,
  SubjectWithProfile,
} from '@cohos/domain';

import { createIsaJsonExport, isaSkeletonVersion } from './index.js';

const organization: Organization = {
  id: 'org-cohos-synthetic',
  name: 'COHOS Synthetic Research Organization',
  slug: 'cohos-synthetic',
};

const connectedResource: ConnectedResourceLink = {
  id: 'link-synthetic-protocol',
  organizationId: organization.id,
  entityType: 'study',
  entityId: 'study-synthetic-001',
  label: 'Synthetic external protocol',
  url: 'https://example.test/cohos/protocol',
  metadata: {
    fixture: true,
  },
};

const subjects: SubjectWithProfile[] = [
  {
    id: 'subject-human-pseudo-001',
    organizationId: organization.id,
    subjectCode: 'HUM-PSEUDO-001',
    profileType: 'human',
    status: 'active',
    profile: {
      profileType: 'human',
      pseudonymizedSubjectCode: 'HUM-PSEUDO-001',
      consentStatus: 'consented',
      studyParticipationStatus: 'enrolled',
      ageBand: '40-49',
      sex: 'not_recorded',
      genderIdentity: 'prefer_not_to_say',
    },
  },
  {
    id: 'subject-rodent-001',
    organizationId: organization.id,
    subjectCode: 'ROD-SYN-001',
    profileType: 'rodent',
    status: 'active',
    speciesId: 'species-mus-musculus',
    profile: {
      profileType: 'rodent',
      species: {
        id: 'species-mus-musculus',
        commonName: 'house mouse',
        scientificName: 'Mus musculus',
        ncbiTaxonId: 'NCBITaxon:10090',
      },
      sex: 'female',
      ageDays: 84,
      welfareStatus: 'normal',
    },
  },
];

const investigationDetail: InvestigationDetail = {
  id: 'investigation-synthetic-001',
  organizationId: organization.id,
  title: 'Synthetic COHOS investigation',
  description: 'Development fixture for investigation, study, assay, sample, and dataset flow.',
  startsOn: '2026-01-01',
  studies: [
    {
      id: 'study-synthetic-001',
      investigationId: 'investigation-synthetic-001',
      title: 'Synthetic subject management study',
      description: 'Development fixture study.',
      subjectIds: ['subject-human-pseudo-001', 'subject-rodent-001'],
      cohortIds: ['cohort-synthetic-mixed'],
      connectedResources: [connectedResource],
      assays: [
        {
          id: 'assay-synthetic-001',
          studyId: 'study-synthetic-001',
          title: 'Synthetic observation assay',
          measurementType: 'observation',
          technologyType: 'manual record',
          procedures: [
            {
              id: 'procedure-synthetic-001',
              assayId: 'assay-synthetic-001',
              name: 'Synthetic welfare check',
              description: 'Synthetic procedure record for development fixtures.',
            },
          ],
          samples: [
            {
              id: 'sample-synthetic-001',
              subjectId: 'subject-rodent-001',
              assayId: 'assay-synthetic-001',
              sampleCode: 'SAMPLE-SYN-001',
              sampleType: 'derived specimen',
              collectedOn: '2026-02-01',
            },
          ],
          datasets: [
            {
              id: 'dataset-synthetic-001',
              assayId: 'assay-synthetic-001',
              sampleId: 'sample-synthetic-001',
              title: 'Synthetic observation dataset',
              format: 'json',
              uri: 'https://example.test/cohos/synthetic-dataset.json',
            },
          ],
          connectedResources: [],
        },
      ],
    },
  ],
  connectedResources: [],
};

describe('ISA JSON export skeleton', () => {
  it('maps organization and investigation metadata into a stable export shape', () => {
    const exported = createIsaJsonExport({
      generatedAt: '2026-07-08T15:45:00Z',
      investigation: investigationDetail,
      organization,
      subjects,
    });

    expect(exported.isaVersion).toBe(isaSkeletonVersion);
    expect(exported.generatedAt).toBe('2026-07-08T15:45:00Z');
    expect(exported.comments).toEqual([
      {
        name: 'COHOS organization',
        value: organization.name,
      },
      {
        name: 'COHOS organization id',
        value: organization.id,
      },
    ]);
    expect(exported.investigations[0]).toMatchObject({
      identifier: investigationDetail.id,
      title: investigationDetail.title,
      description: investigationDetail.description,
      startDate: investigationDetail.startsOn,
    });
  });

  it('maps studies, assays, procedures, samples, datasets, and connected links', () => {
    const exported = createIsaJsonExport({
      generatedAt: '2026-07-08T15:45:00Z',
      investigation: investigationDetail,
      subjects,
    });
    const study = exported.investigations[0]?.studies[0];
    const assay = study?.assays[0];
    const sourceStudy = investigationDetail.studies[0];
    const sourceAssay = sourceStudy?.assays[0];
    const sourceSample = sourceAssay?.samples[0];
    const sourceDataset = sourceAssay?.datasets[0];
    const sourceProcedure = sourceAssay?.procedures[0];

    expect(study).toMatchObject({
      identifier: sourceStudy?.id,
      title: sourceStudy?.title,
      description: sourceStudy?.description,
      comments: [
        {
          name: `COHOS connected resource: ${connectedResource.label}`,
          value: connectedResource.url,
        },
        {
          name: 'COHOS cohort id',
          value: sourceStudy?.cohortIds[0],
        },
      ],
    });
    expect(study?.sources.map((source) => source.name)).toEqual(['HUM-PSEUDO-001', 'ROD-SYN-001']);
    expect(study?.samples).toEqual([
      expect.objectContaining({
        derivesFrom: 'ROD-SYN-001',
        name: sourceSample?.sampleCode,
        sampleType: sourceSample?.sampleType,
      }),
    ]);
    expect(assay).toMatchObject({
      identifier: sourceAssay?.id,
      title: sourceAssay?.title,
      measurementType: sourceAssay?.measurementType,
      technologyType: sourceAssay?.technologyType,
      samples: [sourceSample?.sampleCode],
      dataFiles: [
        {
          name: sourceDataset?.title,
          format: sourceDataset?.format,
          uri: sourceDataset?.uri,
          comments: [
            {
              name: 'COHOS dataset id',
              value: sourceDataset?.id,
            },
            {
              name: 'COHOS sample id',
              value: sourceSample?.id,
            },
          ],
        },
      ],
      processSequence: [
        {
          name: sourceProcedure?.name,
          protocolName: sourceProcedure?.name,
          protocolDescription: sourceProcedure?.description,
        },
      ],
    });
  });

  it('keeps human sources pseudonymized and preserves animal taxonomy', () => {
    const exported = createIsaJsonExport({
      generatedAt: '2026-07-08T15:45:00Z',
      investigation: investigationDetail,
      subjects,
    });
    const sources = exported.investigations[0]?.studies[0]?.sources ?? [];
    const humanSource = sources.find((source) => source.name === 'HUM-PSEUDO-001');
    const rodentSource = sources.find((source) => source.name === 'ROD-SYN-001');

    expect(JSON.stringify(exported)).not.toContain('email');
    expect(JSON.stringify(exported)).not.toContain('fullName');
    expect(humanSource?.characteristics).toContainEqual({
      category: 'pseudonymized subject code',
      value: 'HUM-PSEUDO-001',
    });
    expect(rodentSource?.characteristics).toContainEqual({
      category: 'NCBI Taxon ID',
      value: 'NCBITaxon:10090',
    });
  });

  it('documents known skeleton limitations for later ISA work', () => {
    const exported = createIsaJsonExport({
      investigation: investigationDetail,
      subjects,
      generatedAt: '2026-07-08T15:45:00Z',
    });

    expect(exported.limitations).toEqual(
      expect.arrayContaining([
        expect.stringContaining('ISA-Tab'),
        expect.stringContaining('RO-Crate'),
        expect.stringContaining('JSON-LD'),
      ]),
    );
  });
});
