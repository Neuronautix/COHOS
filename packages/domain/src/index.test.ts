import { describe, expect, it } from 'vitest';

import {
  alertRuleConfigSchema,
  animalSpeciesSchema,
  assayDetailSchema,
  auditEventSchema,
  cageSchema,
  connectedResourceLinkSchema,
  housingEventStateSchema,
  environmentalObservationSchema,
  facilitySchema,
  housingUnitDetailSchema,
  housingUnitSummarySchema,
  farmAnimalProfileSchema,
  humanSubjectProfileSchema,
  investigationDetailSchema,
  investigationSchema,
  researchVocabularySchema,
  rodentSubjectProfileSchema,
  roomSchema,
  ruleAlertSchema,
  subjectAggregateBehaviorByProfileType,
  subjectAggregateMembershipSchema,
  subjectBatchAggregateSchema,
  subjectCohortAggregateSchema,
  subjectGroupAggregateSchema,
  subjectEventStateSchema,
  studyDetailSchema,
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

  it('requires human subject codes to match pseudonymized profile codes', () => {
    const accepted = subjectWithProfileSchema.safeParse({
      id: 'subject-human-pseudo-003',
      organizationId: 'org-1',
      subjectCode: 'HUM-PSEUDO-003',
      profileType: 'human',
      profile: {
        profileType: 'human',
        pseudonymizedSubjectCode: 'HUM-PSEUDO-003',
        consentStatus: 'unknown',
        studyParticipationStatus: 'screening',
      },
    });

    expect(accepted.success).toBe(true);

    const rejected = subjectWithProfileSchema.safeParse({
      id: 'subject-human-pseudo-004',
      organizationId: 'org-1',
      subjectCode: 'DIRECT-HUMAN-CODE',
      profileType: 'human',
      profile: {
        profileType: 'human',
        pseudonymizedSubjectCode: 'HUM-PSEUDO-004',
        consentStatus: 'consented',
        studyParticipationStatus: 'enrolled',
      },
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

  it('validates batch, group, and cohort aggregate metadata separately', () => {
    const batch = subjectBatchAggregateSchema.parse({
      id: 'batch-zebrafish-spawn-test',
      organizationId: 'org-1',
      kind: 'batch',
      code: 'BATCH-ZF-TEST',
      name: 'Zebrafish spawn test batch',
      profileTypes: ['zebrafish_batch'],
      speciesId: zebrafishSpecies.id,
      subjectIds: ['subject-zebrafish-batch-1'],
      batch: {
        originType: 'spawn',
        spawnDate: '2026-03-01',
        hatchDate: '2026-03-04',
        developmentalStage: 'larva',
        initialCount: 120,
        currentCount: 116,
        countUnit: 'larvae',
      },
    });
    const group = subjectGroupAggregateSchema.parse({
      id: 'group-rodent-cage-test',
      organizationId: 'org-1',
      kind: 'group',
      code: 'GROUP-ROD-TEST',
      name: 'Rodent cage test group',
      profileTypes: ['rodent'],
      speciesId: mouseSpecies.id,
      subjectIds: ['subject-rodent-1'],
      group: {
        groupPurpose: 'housing',
        housingUnitId: 'housing-cage-1',
        membershipPolicy: 'dynamic',
      },
    });
    const cohort = subjectCohortAggregateSchema.parse({
      id: 'cohort-test',
      organizationId: 'org-1',
      kind: 'cohort',
      code: 'COHORT-TEST',
      name: 'Synthetic cohort test',
      profileTypes: ['human'],
      subjectIds: ['subject-human-1'],
      cohort: {
        cohortKind: 'observational',
        studyId: 'study-1',
        inclusionCriteria: ['Consented participant'],
        exclusionCriteria: ['Withdrawn consent'],
        plannedSize: 20,
      },
    });
    const membership = subjectAggregateMembershipSchema.parse({
      subjectId: 'subject-rodent-1',
      aggregateId: 'group-rodent-cage-test',
      aggregateKind: 'group',
      aggregateCode: 'GROUP-ROD-TEST',
      role: 'housing_member',
      validFrom: '2026-03-01',
    });

    expect(batch.batch.originType).toBe('spawn');
    expect(group.group.groupPurpose).toBe('housing');
    expect(cohort.cohort.cohortKind).toBe('observational');
    expect(cohort.cohort.blinding).toBe('not_recorded');
    expect(membership.metadata).toEqual({});
  });

  it('documents aggregate behavior by subject category', () => {
    expect(subjectAggregateBehaviorByProfileType.human.primaryAggregateKinds).toEqual(['cohort']);
    expect(subjectAggregateBehaviorByProfileType.rodent.primaryAggregateKinds).toEqual([
      'batch',
      'group',
      'cohort',
    ]);
    expect(subjectAggregateBehaviorByProfileType.zebrafish_batch.subjectUnit).toBe('counted_batch');
    expect(subjectAggregateBehaviorByProfileType.generic.primaryAggregateKinds).toEqual([
      'batch',
      'cohort',
    ]);
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

  it('validates housing summaries, occupant summaries, and environmental hooks', () => {
    expect(
      housingUnitSummarySchema.safeParse({
        id: 'tank-1',
        roomId: 'room-1',
        type: 'tank',
        name: 'Tank 1',
        code: 'T-1',
        currentOccupantSubjectIds: ['subject-zebrafish-batch-1'],
        currentOccupantCount: 120,
        recentEnvironmentalObservationIds: ['event-env-1'],
      }).success,
    ).toBe(true);

    expect(
      housingUnitDetailSchema.safeParse({
        id: 'tank-1',
        roomId: 'room-1',
        type: 'tank',
        name: 'Tank 1',
        code: 'T-1',
        volumeLiters: 12,
        occupants: [
          {
            subjectId: 'subject-zebrafish-batch-1',
            subjectCode: 'ZFB-SYN-001',
            profileType: 'zebrafish_batch',
            status: 'active',
            count: 120,
          },
        ],
        recentEnvironmentalObservations: [
          {
            id: 'event-env-1',
            housingUnitId: 'tank-1',
            occurredAt: '2026-07-08T12:00:00Z',
            metric: 'temperature',
            value: 27.5,
            unit: 'C',
          },
        ],
        environmentalObservationTarget: {
          housingUnitId: 'tank-1',
          supportedEventType: 'environmental_observation',
        },
        transferTarget: {
          housingUnitId: 'tank-1',
          supportedEventType: 'transfer',
        },
      }).success,
    ).toBe(true);
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

  it('validates research detail responses and vocabulary ordering', () => {
    const connectedResource = {
      id: 'link-1',
      organizationId: 'org-1',
      entityType: 'study',
      entityId: 'study-1',
      label: 'External protocol',
      url: 'https://example.test/protocol',
    };
    const assayDetail = {
      id: 'assay-1',
      studyId: 'study-1',
      title: 'Synthetic assay',
      procedures: [
        {
          id: 'procedure-1',
          assayId: 'assay-1',
          name: 'Synthetic procedure',
        },
      ],
      samples: [
        {
          id: 'sample-1',
          subjectId: 'subject-1',
          assayId: 'assay-1',
          sampleCode: 'SAMPLE-1',
          sampleType: 'derived specimen',
        },
      ],
      datasets: [
        {
          id: 'dataset-1',
          assayId: 'assay-1',
          sampleId: 'sample-1',
          title: 'Synthetic dataset',
          format: 'json',
        },
      ],
      connectedResources: [],
    };
    const studyDetail = {
      id: 'study-1',
      investigationId: 'investigation-1',
      title: 'Synthetic study',
      subjectIds: ['subject-1'],
      cohortIds: ['cohort-1'],
      assays: [assayDetail],
      connectedResources: [connectedResource],
    };
    const vocabulary = researchVocabularySchema.parse({
      terms: [
        {
          canonical: 'investigation',
          equivalentTerms: ['project'],
          description: 'Top-level research context.',
        },
        {
          canonical: 'study',
          equivalentTerms: ['experiment'],
          description: 'Subject and cohort participation context.',
        },
        {
          canonical: 'assay',
          equivalentTerms: ['procedure'],
          description: 'Measurement or observation plan.',
        },
      ],
    });

    expect(assayDetailSchema.safeParse(assayDetail).success).toBe(true);
    expect(studyDetailSchema.safeParse(studyDetail).success).toBe(true);
    expect(
      investigationDetailSchema.safeParse({
        id: 'investigation-1',
        organizationId: 'org-1',
        title: 'Synthetic investigation',
        studies: [studyDetail],
        connectedResources: [],
      }).success,
    ).toBe(true);
    expect(vocabulary.terms.map((term) => term.canonical)).toEqual([
      'investigation',
      'study',
      'assay',
    ]);
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

  it('validates derived event state and event-linked audit records', () => {
    expect(
      subjectEventStateSchema.safeParse({
        subjectId: 'subject-1',
        aliveStatus: 'deceased',
        currentHousingUnitId: 'housing-1',
        batchCount: 0,
        latestWelfareStatus: 'critical',
        latestEventId: 'event-1',
        alertFlags: [
          {
            code: 'batch_depleted',
            severity: 'critical',
            message: 'Batch count reached zero after mortality events.',
            sourceEventId: 'event-1',
          },
        ],
      }).success,
    ).toBe(true);

    expect(
      housingEventStateSchema.safeParse({
        housingUnitId: 'housing-1',
        latestEnvironmentalObservationId: 'event-env-1',
        alertFlags: [
          {
            code: 'environmental_recorded',
            severity: 'info',
            message: 'Environmental observation recorded for temperature.',
            sourceEventId: 'event-env-1',
          },
        ],
      }).success,
    ).toBe(true);

    expect(
      auditEventSchema.safeParse({
        id: 'audit-2',
        organizationId: 'org-1',
        actorUserId: 'user-1',
        entityType: 'event',
        entityId: 'event-1',
        action: 'event.transfer.record',
        newValue: {
          hash: 'sha256:synthetic',
          redacted: true,
        },
        createdAt: '2026-07-08T12:15:00Z',
        source: 'api',
        eventId: 'event-1',
      }).success,
    ).toBe(true);
  });
});

describe('rule and alert schemas', () => {
  it('validates configurable welfare and environmental rule contracts', () => {
    const welfareRule = alertRuleConfigSchema.parse({
      id: 'rule-welfare-rodent-concern',
      organizationId: 'org-cohos',
      name: 'Rodent concern threshold',
      ruleType: 'welfare_threshold',
      severity: 'warning',
      appliesToProfileTypes: ['rodent'],
      appliesToSpeciesIds: ['species-mouse'],
      statuses: ['concern', 'critical'],
      minimumScore: 3,
    });

    expect(welfareRule.enabled).toBe(true);

    expect(() =>
      alertRuleConfigSchema.parse({
        id: 'rule-env-invalid',
        organizationId: 'org-cohos',
        name: 'Invalid environmental rule',
        ruleType: 'environmental_threshold',
        severity: 'warning',
        metric: 'temperature',
        unit: 'celsius',
      }),
    ).toThrow(/minimumValue or maximumValue/);
  });

  it('validates generated rule alerts', () => {
    const alert = ruleAlertSchema.parse({
      id: 'alert-rule-welfare-event-001',
      organizationId: 'org-cohos',
      ruleId: 'rule-welfare-rodent-concern',
      ruleType: 'welfare_threshold',
      code: 'welfare_threshold_exceeded',
      severity: 'warning',
      title: 'Rodent concern threshold',
      message: 'Welfare observation met the configured concern threshold.',
      entityType: 'subject',
      entityId: 'subject-rodent-001',
      sourceEventIds: ['event-welfare-001'],
      createdAt: '2026-07-08T09:00:00Z',
    });

    expect(alert.metadata).toEqual({});
  });
});
