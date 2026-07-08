import {
  type Assay,
  type ConnectedResourceLink,
  type Dataset,
  type Investigation,
  type Procedure,
  type ResearchVocabulary,
  type Sample,
  type Study,
  assaySchema,
  connectedResourceLinkSchema,
  datasetSchema,
  investigationSchema,
  procedureSchema,
  researchVocabularySchema,
  sampleSchema,
  studySchema,
} from '@cohos/domain';

const organizationId = 'org-synthetic-cohos';

export const investigationFixtures = [
  investigationSchema.parse({
    id: 'investigation-synthetic-001',
    organizationId,
    title: 'Synthetic COHOS investigation',
    description: 'Development fixture for investigation, study, assay, sample, and dataset flow.',
    startsOn: '2026-01-01',
  }),
] satisfies Investigation[];

export const studyFixtures = [
  studySchema.parse({
    id: 'study-synthetic-001',
    investigationId: 'investigation-synthetic-001',
    title: 'Synthetic subject management study',
    description: 'Development fixture study.',
    subjectIds: ['subject-human-pseudo-001', 'subject-rodent-001'],
    cohortIds: ['cohort-synthetic-mixed'],
  }),
] satisfies Study[];

export const assayFixtures = [
  assaySchema.parse({
    id: 'assay-synthetic-001',
    studyId: 'study-synthetic-001',
    title: 'Synthetic observation assay',
    measurementType: 'observation',
    technologyType: 'manual record',
  }),
] satisfies Assay[];

export const procedureFixtures = [
  procedureSchema.parse({
    id: 'procedure-synthetic-001',
    assayId: 'assay-synthetic-001',
    name: 'Synthetic welfare check',
    description: 'Synthetic procedure record for development fixtures.',
  }),
] satisfies Procedure[];

export const sampleFixtures = [
  sampleSchema.parse({
    id: 'sample-synthetic-001',
    subjectId: 'subject-rodent-001',
    assayId: 'assay-synthetic-001',
    sampleCode: 'SAMPLE-SYN-001',
    sampleType: 'derived specimen',
    collectedOn: '2026-02-01',
  }),
] satisfies Sample[];

export const datasetFixtures = [
  datasetSchema.parse({
    id: 'dataset-synthetic-001',
    assayId: 'assay-synthetic-001',
    sampleId: 'sample-synthetic-001',
    title: 'Synthetic observation dataset',
    format: 'json',
    uri: 'https://example.test/cohos/synthetic-dataset.json',
  }),
] satisfies Dataset[];

export const connectedResourceLinkFixtures = [
  connectedResourceLinkSchema.parse({
    id: 'link-synthetic-protocol-1',
    organizationId,
    entityType: 'study',
    entityId: 'study-synthetic-001',
    label: 'Synthetic external protocol',
    url: 'https://example.test/cohos/protocol',
    metadata: {
      fixture: true,
      source: 'metadatapp',
    },
  }),
  connectedResourceLinkSchema.parse({
    id: 'link-synthetic-assay-plan-1',
    organizationId,
    entityType: 'assay',
    entityId: 'assay-synthetic-001',
    label: 'Synthetic assay plan',
    url: 'https://example.test/cohos/assay-plan',
    metadata: {
      fixture: true,
      source: 'metadatapp',
    },
  }),
] satisfies ConnectedResourceLink[];

export const researchVocabularyFixture = researchVocabularySchema.parse({
  terms: [
    {
      canonical: 'investigation',
      equivalentTerms: ['project'],
      description: 'Top-level research context that groups studies and provenance links.',
    },
    {
      canonical: 'study',
      equivalentTerms: ['experiment'],
      description: 'Subject and cohort participation context within an investigation.',
    },
    {
      canonical: 'assay',
      equivalentTerms: ['procedure'],
      description: 'Measurement or observation plan with procedures, samples, and datasets.',
    },
  ],
}) satisfies ResearchVocabulary;
