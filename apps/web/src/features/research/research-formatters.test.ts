import { describe, expect, it } from 'vitest';

import { investigationDetailSchema, researchVocabularySchema } from '@cohos/domain';

import {
  formatResearchDateRange,
  getConnectedResourceSource,
  getInvestigationFields,
  getVocabularyEquivalentLabel,
  getVocabularyTitle,
  matchesInvestigationSearch,
  summarizeInvestigations,
} from './research-formatters';

const investigation = investigationDetailSchema.parse({
  id: 'investigation-synthetic-test',
  organizationId: 'org-synthetic-cohos',
  title: 'Synthetic research investigation',
  description: 'Development fixture for research views.',
  startsOn: '2026-01-01',
  endsOn: '2026-06-30',
  connectedResources: [
    {
      id: 'link-investigation-test',
      organizationId: 'org-synthetic-cohos',
      entityType: 'investigation',
      entityId: 'investigation-synthetic-test',
      label: 'Investigation plan',
      url: 'https://example.test/cohos/investigation-plan',
      metadata: {
        source: 'metadatapp',
      },
    },
  ],
  studies: [
    {
      id: 'study-synthetic-test',
      investigationId: 'investigation-synthetic-test',
      title: 'Synthetic enrollment study',
      description: 'Study fixture.',
      subjectIds: ['subject-human-pseudo-test', 'subject-rodent-test'],
      cohortIds: ['cohort-synthetic-test'],
      connectedResources: [
        {
          id: 'link-study-test',
          organizationId: 'org-synthetic-cohos',
          entityType: 'study',
          entityId: 'study-synthetic-test',
          label: 'Study protocol',
          url: 'https://example.test/cohos/study-protocol',
          metadata: {
            source: 'metadatapp',
          },
        },
      ],
      assays: [
        {
          id: 'assay-synthetic-test',
          studyId: 'study-synthetic-test',
          title: 'Synthetic observation assay',
          measurementType: 'observation',
          technologyType: 'manual record',
          procedures: [
            {
              id: 'procedure-synthetic-test',
              assayId: 'assay-synthetic-test',
              name: 'Synthetic procedure',
            },
          ],
          samples: [
            {
              id: 'sample-synthetic-test',
              subjectId: 'subject-rodent-test',
              assayId: 'assay-synthetic-test',
              sampleCode: 'SAMPLE-SYN-T',
              sampleType: 'derived specimen',
            },
          ],
          datasets: [
            {
              id: 'dataset-synthetic-test',
              assayId: 'assay-synthetic-test',
              sampleId: 'sample-synthetic-test',
              title: 'Synthetic dataset',
              format: 'json',
              uri: 'https://example.test/cohos/dataset.json',
            },
          ],
          connectedResources: [
            {
              id: 'link-assay-test',
              organizationId: 'org-synthetic-cohos',
              entityType: 'assay',
              entityId: 'assay-synthetic-test',
              label: 'Assay plan',
              url: 'https://example.test/cohos/assay-plan',
              metadata: {
                source: 'metadatapp',
              },
            },
          ],
        },
      ],
    },
  ],
});

const vocabulary = researchVocabularySchema.parse({
  terms: [
    {
      canonical: 'investigation',
      equivalentTerms: ['project'],
      description: 'Top-level research context.',
    },
  ],
});

describe('research formatters', () => {
  it('summarizes nested investigation, study, assay, and output counts', () => {
    expect(summarizeInvestigations([investigation])).toEqual({
      assayCount: 1,
      cohortLinkCount: 1,
      connectedResourceCount: 3,
      datasetCount: 1,
      investigationCount: 1,
      procedureCount: 1,
      sampleCount: 1,
      studyCount: 1,
      subjectLinkCount: 2,
    });
  });

  it('maps canonical vocabulary before equivalent terms', () => {
    const term = vocabulary.terms[0];

    if (term === undefined) {
      throw new Error('Expected a vocabulary term fixture.');
    }

    expect(getVocabularyTitle(term)).toBe('Investigation');
    expect(getVocabularyEquivalentLabel(term)).toBe('Also Project');
  });

  it('formats investigation fields and connected resource sources', () => {
    const link = investigation.connectedResources[0];

    if (link === undefined) {
      throw new Error('Expected a connected resource fixture.');
    }

    expect(formatResearchDateRange(investigation)).toBe('2026-01-01 to 2026-06-30');
    expect(getInvestigationFields(investigation)).toEqual(
      expect.arrayContaining([
        {
          label: 'Date range',
          value: '2026-01-01 to 2026-06-30',
        },
      ]),
    );
    expect(getConnectedResourceSource(link)).toBe('Metadatapp');
  });

  it('searches nested study, assay, subject, and cohort context', () => {
    expect(matchesInvestigationSearch(investigation, 'observation')).toBe(true);
    expect(matchesInvestigationSearch(investigation, 'subject-human-pseudo-test')).toBe(true);
    expect(matchesInvestigationSearch(investigation, 'cohort-synthetic-test')).toBe(true);
    expect(matchesInvestigationSearch(investigation, 'not-present')).toBe(false);
  });
});
