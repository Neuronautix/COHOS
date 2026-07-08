import { type SubjectWithProfile, subjectWithProfileSchema } from '@cohos/domain';

const mouseSpecies = {
  id: 'species-mus-musculus',
  commonName: 'house mouse',
  scientificName: 'Mus musculus',
  ncbiTaxonId: 'NCBITaxon:10090',
};

const zebrafishSpecies = {
  id: 'species-danio-rerio',
  commonName: 'zebrafish',
  scientificName: 'Danio rerio',
  ncbiTaxonId: 'NCBITaxon:7955',
};

const cattleSpecies = {
  id: 'species-bos-taurus',
  commonName: 'cattle',
  scientificName: 'Bos taurus',
  ncbiTaxonId: 'NCBITaxon:9913',
};

export const subjectFixtures = [
  {
    id: 'subject-human-pseudo-001',
    organizationId: 'org-synthetic-cohos',
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
    organizationId: 'org-synthetic-cohos',
    subjectCode: 'ROD-SYN-001',
    profileType: 'rodent',
    status: 'active',
    speciesId: mouseSpecies.id,
    profile: {
      profileType: 'rodent',
      species: mouseSpecies,
      strainId: 'strain-mouse-synthetic-a',
      genotypeId: 'genotype-wildtype-synthetic',
      sex: 'female',
      ageDays: 84,
      housingUnitId: 'housing-cage-a1',
      welfareStatus: 'normal',
    },
  },
  {
    id: 'subject-zebrafish-batch-001',
    organizationId: 'org-synthetic-cohos',
    subjectCode: 'ZFB-SYN-001',
    profileType: 'zebrafish_batch',
    status: 'active',
    speciesId: zebrafishSpecies.id,
    profile: {
      profileType: 'zebrafish_batch',
      species: zebrafishSpecies,
      batchIdentifier: 'ZFB-SYN-001',
      developmentalStage: 'larva',
      tankId: 'housing-tank-z1',
      count: 120,
      mortalityEventIds: [],
      environmentalObservationIds: [],
    },
  },
  {
    id: 'subject-farm-001',
    organizationId: 'org-synthetic-cohos',
    subjectCode: 'FARM-SYN-001',
    profileType: 'farm_animal',
    status: 'active',
    speciesId: cattleSpecies.id,
    profile: {
      profileType: 'farm_animal',
      species: cattleSpecies,
      groupIdentifier: 'herd-synthetic-a',
      individualIdentifier: 'farm-synthetic-001',
      ageDescription: 'juvenile',
      sex: 'female',
      housingUnitId: 'housing-pasture-f1',
      welfareStatus: 'normal',
    },
  },
  {
    id: 'subject-generic-001',
    organizationId: 'org-synthetic-cohos',
    subjectCode: 'GEN-SYN-001',
    profileType: 'generic',
    status: 'active',
    profile: {
      profileType: 'generic',
      biologicalType: 'cell culture',
      metadata: {
        fixture: true,
        passage: 3,
      },
      extensibilityNotes: 'Synthetic generic subject metadata for API fixtures.',
    },
  },
].map((subject) => subjectWithProfileSchema.parse(subject)) satisfies SubjectWithProfile[];
