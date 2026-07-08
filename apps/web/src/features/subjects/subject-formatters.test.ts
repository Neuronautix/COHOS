import { describe, expect, it } from 'vitest';

import { subjectWithProfileSchema } from '@cohos/domain';

import {
  getSubjectDisplayCode,
  getSubjectProfileFields,
  getSubjectProfileLabel,
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
});
