import { describe, expect, it } from 'vitest';

import {
  animalSpeciesSchema,
  auditEventSchema,
  cageSchema,
  connectedResourceLinkSchema,
  environmentalObservationSchema,
  facilitySchema,
  farmAnimalProfileSchema,
  humanSubjectProfileSchema,
  investigationSchema,
  rodentSubjectProfileSchema,
  roomSchema,
  studySchema,
  subjectProfileSchema,
  subjectWithProfileSchema,
  tankSchema,
  welfareObservationSchema,
  zebrafishBatchProfileSchema,
} from './index.js';

const mouseSpecies = {
  id: 'species-mouse',
  commonName: 'house mouse',
  scientificName: 'Mus musculus',
  ncbiTaxonId: 'NCBITaxon:10090',
};

const zebrafishSpecies = {
  id: 'species-zebrafish',
  commonName: 'zebrafish',
  scientificName: 'Danio rerio',
  ncbiTaxonId: 'NCBITaxon:7955',
};

const cattleSpecies = {
  id: 'species-cattle',
  commonName: 'cattle',
  scientificName: 'Bos taurus',
  ncbiTaxonId: 'NCBITaxon:9913',
};

describe('subject profile schemas', () => {
  it('accepts each supported subject profile variant', () => {
    const profiles = [
      {
        profileType: 'human',
        pseudonymizedSubjectCode: 'HUM-PSEUDO-001',
        consentStatus: 'consented',
        studyParticipationStatus: 'enrolled',
        ageBand: '40-49',
      },
      {
        profileType: 'rodent',
        species: mouseSpecies,
        sex: 'female',
        ageDays: 80,
        welfareStatus: 'normal',
      },
      {
        profileType: 'zebrafish_batch',
        species: zebrafishSpecies,
        batchIdentifier: 'ZFB-2026-001',
        developmentalStage: 'larva',
        tankId: 'tank-1',
        count: 120,
      },
      {
        profileType: 'farm_animal',
        species: cattleSpecies,
        groupIdentifier: 'herd-synthetic-a',
        sex: 'mixed',
        welfareStatus: 'watch',
      },
      {
        profileType: 'generic',
        biologicalType: 'cell culture',
        metadata: {
          passage: 3,
        },
      },
    ];

    for (const profile of profiles) {
      expect(subjectProfileSchema.safeParse(profile).success).toBe(true);
    }
  });

  it('rejects unknown profile variants and subject/profile mismatches', () => {
    expect(subjectProfileSchema.safeParse({ profileType: 'unsupported' }).success).toBe(false);

    const result = subjectWithProfileSchema.safeParse({
      id: 'subject-1',
      organizationId: 'org-1',
      subjectCode: 'SUB-001',
      profileType: 'rodent',
      profile: {
        profileType: 'human',
        pseudonymizedSubjectCode: 'HUM-PSEUDO-002',
        consentStatus: 'pending',
        studyParticipationStatus: 'screening',
      },
    });

    expect(result.success).toBe(false);
  });

  it('keeps human participant profiles pseudonymized and strict', () => {
    const accepted = humanSubjectProfileSchema.safeParse({
      profileType: 'human',
      pseudonymizedSubjectCode: 'HUM-PSEUDO-003',
      consentStatus: 'unknown',
      studyParticipationStatus: 'screening',
      sex: 'not_recorded',
      genderIdentity: 'prefer_not_to_say',
    });

    expect(accepted.success).toBe(true);

    const rejected = humanSubjectProfileSchema.safeParse({
      profileType: 'human',
      pseudonymizedSubjectCode: 'HUM-PSEUDO-004',
      consentStatus: 'consented',
      studyParticipationStatus: 'enrolled',
      email: 'participant@example.test',
      fullName: 'Synthetic Person',
    });

    expect(rejected.success).toBe(false);
  });

  it('requires structured NCBITaxon identifiers for animal profiles', () => {
    expect(animalSpeciesSchema.safeParse(mouseSpecies).success).toBe(true);
    expect(
      rodentSubjectProfileSchema.safeParse({
        profileType: 'rodent',
        species: { ...mouseSpecies, ncbiTaxonId: '10090' },
        sex: 'male',
      }).success,
    ).toBe(false);
    expect(
      zebrafishBatchProfileSchema.safeParse({
        profileType: 'zebrafish_batch',
        species: zebrafishSpecies,
        batchIdentifier: 'ZFB-2026-002',
        developmentalStage: 'embryo',
        count: 20,
      }).success,
    ).toBe(true);
    expect(
      farmAnimalProfileSchema.safeParse({
        profileType: 'farm_animal',
        species: cattleSpecies,
        groupIdentifier: 'flock-synthetic-a',
        sex: 'female',
      }).success,
    ).toBe(true);
  });

  it('models zebrafish batches as count-bearing groups', () => {
    expect(
      zebrafishBatchProfileSchema.safeParse({
        profileType: 'zebrafish_batch',
        species: zebrafishSpecies,
        batchIdentifier: 'ZFB-2026-003',
        developmentalStage: 'juvenile',
        count: 0,
      }).success,
    ).toBe(true);

    expect(
      zebrafishBatchProfileSchema.safeParse({
        profileType: 'zebrafish_batch',
        species: zebrafishSpecies,
        batchIdentifier: 'ZFB-2026-004',
        developmentalStage: 'adult',
        count: -1,
      }).success,
    ).toBe(false);
  });
});

describe('facility schemas', () => {
  it('validates facility hierarchy references and housing distinctions', () => {
    expect(
      facilitySchema.safeParse({
        id: 'facility-1',
        organizationId: 'org-1',
        name: 'Synthetic Research Facility',
        code: 'FAC-1',
      }).success,
    ).toBe(true);
    expect(
      roomSchema.safeParse({
        id: 'room-1',
        facilityId: 'facility-1',
        name: 'Room A',
        code: 'A',
      }).success,
    ).toBe(true);
    expect(
      cageSchema.safeParse({
        id: 'cage-1',
        roomId: 'room-1',
        rackId: 'rack-1',
        type: 'cage',
        name: 'Cage 1',
        code: 'C-1',
      }).success,
    ).toBe(true);
    expect(
      tankSchema.safeParse({
        id: 'tank-1',
        roomId: 'room-1',
        type: 'tank',
        name: 'Tank 1',
        code: 'T-1',
        volumeLiters: 12,
      }).success,
    ).toBe(true);
    expect(tankSchema.safeParse({ id: 'tank-2', roomId: 'room-1', type: 'cage' }).success).toBe(
      false,
    );
  });
});

describe('research metadata schemas', () => {
  it('validates investigation, study, and connected resource contracts', () => {
    expect(
      investigationSchema.safeParse({
        id: 'investigation-1',
        organizationId: 'org-1',
        title: 'Synthetic investigation',
        startsOn: '2026-01-01',
      }).success,
    ).toBe(true);

    expect(
      studySchema.safeParse({
        id: 'study-1',
        investigationId: 'investigation-1',
        title: 'Synthetic study',
        subjectIds: ['subject-1'],
        cohortIds: ['cohort-1'],
      }).success,
    ).toBe(true);

    expect(
      connectedResourceLinkSchema.safeParse({
        id: 'link-1',
        organizationId: 'org-1',
        entityType: 'study',
        entityId: 'study-1',
        label: 'External protocol',
        url: 'https://example.test/protocol',
      }).success,
    ).toBe(true);
  });
});

describe('event and audit boundary schemas', () => {
  it('validates typed event placeholders without deriving state', () => {
    expect(
      welfareObservationSchema.safeParse({
        id: 'event-1',
        organizationId: 'org-1',
        subjectId: 'subject-1',
        occurredAt: '2026-07-08T12:00:00Z',
        recordedByUserId: 'user-1',
        eventType: 'welfare_observation',
        score: 2,
        status: 'watch',
      }).success,
    ).toBe(true);

    expect(
      environmentalObservationSchema.safeParse({
        id: 'event-2',
        organizationId: 'org-1',
        housingUnitId: 'tank-1',
        occurredAt: '2026-07-08T12:05:00Z',
        recordedByUserId: 'user-1',
        eventType: 'environmental_observation',
        metric: 'temperature',
        value: 27.5,
        unit: 'C',
      }).success,
    ).toBe(true);
  });

  it('defaults audit snapshots to redacted boundaries', () => {
    const auditEvent = auditEventSchema.parse({
      id: 'audit-1',
      organizationId: 'org-1',
      actorUserId: 'user-1',
      entityType: 'subject',
      entityId: 'subject-1',
      action: 'subject.create',
      newValue: {
        hash: 'sha256:synthetic',
      },
      createdAt: '2026-07-08T12:10:00Z',
      source: 'api',
    });

    expect(auditEvent.newValue?.redacted).toBe(true);
  });
});
