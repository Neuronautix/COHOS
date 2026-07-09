import { describe, expect, it } from 'vitest';

import { subjectAggregateSchema, subjectWithProfileSchema } from '@cohos/domain';

import {
  getSubjectAggregateDetailFields,
  matchesSubjectAggregateSearch,
  getSubjectDisplayCode,
  getSubjectProfileFields,
  getSubjectProfileLabel,
  summarizeSubjectAggregates,
  summarizeSubjects,
} from './subject-formatters';

const humanSubject = subjectWithProfileSchema.parse({
  id: 'subject-human-pseudo-101',
  organizationId: 'org-synthetic-cohos',
  subjectCode: 'HUM-PSEUDO-101',
  profileType: 'human',
  status: 'active',
  profile: {
    profileType: 'human',
    pseudonymizedSubjectCode: 'HUM-PSEUDO-101',
    consentStatus: 'consented',
    studyParticipationStatus: 'enrolled',
    ageBand: '30-39',
    sex: 'not_recorded',
    genderIdentity: 'prefer_not_to_say',
  },
});

const rodentSubject = subjectWithProfileSchema.parse({
  id: 'subject-rodent-101',
  organizationId: 'org-synthetic-cohos',
  subjectCode: 'ROD-SYN-101',
  profileType: 'rodent',
  status: 'active',
  speciesId: 'species-mus-musculus',
  aggregateMemberships: [
    {
      subjectId: 'subject-rodent-101',
      aggregateId: 'batch-rodent-test-101',
      aggregateKind: 'batch',
      aggregateCode: 'BATCH-ROD-TEST-101',
      role: 'source',
      validFrom: '2026-02-15',
    },
  ],
  profile: {
    profileType: 'rodent',
    species: {
      id: 'species-mus-musculus',
      commonName: 'house mouse',
      scientificName: 'Mus musculus',
      ncbiTaxonId: 'NCBITaxon:10090',
    },
    sex: 'female',
    ageDays: 42,
    housingUnitId: 'housing-cage-a1',
    welfareStatus: 'normal',
  },
});

const rodentBatchAggregate = subjectAggregateSchema.parse({
  id: 'batch-rodent-test-101',
  organizationId: 'org-synthetic-cohos',
  kind: 'batch',
  code: 'BATCH-ROD-TEST-101',
  name: 'Rodent test shipment batch',
  profileTypes: ['rodent'],
  speciesId: 'species-mus-musculus',
  subjectIds: ['subject-rodent-101'],
  batch: {
    originType: 'shipment',
    arrivalDate: '2026-02-15',
    sexComposition: 'female',
    initialCount: 12,
    currentCount: 12,
    countUnit: 'animals',
  },
});

const rodentGroupAggregate = subjectAggregateSchema.parse({
  id: 'group-rodent-test-101',
  organizationId: 'org-synthetic-cohos',
  kind: 'group',
  code: 'GROUP-ROD-TEST-101',
  name: 'Rodent test cage group',
  profileTypes: ['rodent'],
  status: 'active',
  subjectIds: ['subject-rodent-101'],
  group: {
    groupPurpose: 'housing',
    membershipPolicy: 'dynamic',
  },
});

const humanCohortAggregate = subjectAggregateSchema.parse({
  id: 'cohort-human-test-101',
  organizationId: 'org-synthetic-cohos',
  kind: 'cohort',
  code: 'COHORT-HUM-TEST-101',
  name: 'Human test cohort',
  profileTypes: ['human'],
  status: 'planned',
  subjectIds: ['subject-human-pseudo-101'],
  cohort: {
    cohortKind: 'observational',
    inclusionCriteria: ['Consented participant'],
    exclusionCriteria: ['Withdrawn consent'],
    plannedSize: 20,
  },
});

describe('subject formatters', () => {
  it('uses pseudonymized codes for human participant display', () => {
    expect(getSubjectDisplayCode(humanSubject)).toBe('HUM-PSEUDO-101');
    expect(getSubjectProfileLabel(humanSubject)).toBe('Human participant');
    expect(getSubjectProfileFields(humanSubject)).toEqual(
      expect.arrayContaining([
        {
          label: 'Pseudonymized code',
          value: 'HUM-PSEUDO-101',
        },
      ]),
    );
  });

  it('returns model-specific animal fields', () => {
    expect(getSubjectProfileLabel(rodentSubject)).toBe('Rodent subject');
    expect(getSubjectProfileFields(rodentSubject)).toEqual(
      expect.arrayContaining([
        {
          label: 'Species',
          value: 'house mouse (NCBITaxon:10090)',
        },
        {
          label: 'Housing unit',
          value: 'housing-cage-a1',
        },
        {
          label: 'Aggregate memberships',
          value: 'Batch: BATCH-ROD-TEST-101',
        },
      ]),
    );
  });

  it('summarizes profile coverage', () => {
    expect(summarizeSubjects([humanSubject, rodentSubject])).toEqual({
      activeSubjects: 2,
      animalSubjects: 1,
      profileTypes: 2,
      protectedHumanSubjects: 1,
      totalSubjects: 2,
    });
  });

  it('summarizes and searches subject aggregate coverage', () => {
    const aggregates = [rodentBatchAggregate, rodentGroupAggregate, humanCohortAggregate];

    expect(summarizeSubjectAggregates(aggregates)).toEqual({
      activeAggregates: 2,
      batches: 1,
      cohorts: 1,
      groups: 1,
      totalAggregates: 3,
    });
    expect(matchesSubjectAggregateSearch(rodentBatchAggregate, 'shipment')).toBe(true);
    expect(matchesSubjectAggregateSearch(humanCohortAggregate, 'rodent')).toBe(false);
  });

  it('returns kind-specific aggregate detail fields', () => {
    expect(getSubjectAggregateDetailFields(rodentBatchAggregate)).toEqual(
      expect.arrayContaining([
        {
          label: 'Origin type',
          value: 'Shipment',
        },
        {
          label: 'Current count',
          value: '12',
        },
      ]),
    );
    expect(getSubjectAggregateDetailFields(humanCohortAggregate)).toEqual(
      expect.arrayContaining([
        {
          label: 'Cohort kind',
          value: 'Observational',
        },
        {
          label: 'Planned size',
          value: '20',
        },
      ]),
    );
  });
});
