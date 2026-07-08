import { describe, expect, it } from 'vitest';

import type {
  AlertRuleConfigInput,
  EnvironmentalObservation,
  HousingUnit,
  MortalityEvent,
  SubjectWithProfile,
  WelfareObservation,
} from '@cohos/domain';

import {
  evaluateCumulativeHarmPlaceholders,
  evaluateEnvironmentalRules,
  evaluateEventRules,
  evaluateMortalityRules,
  evaluateWelfareObservationRules,
} from './index.js';

const rodentSubject: SubjectWithProfile = {
  id: 'subject-rodent-001',
  organizationId: 'org-cohos',
  subjectCode: 'RDT-001',
  profileType: 'rodent',
  status: 'active',
  speciesId: 'species-mouse',
  profile: {
    profileType: 'rodent',
    species: {
      id: 'species-mouse',
      commonName: 'house mouse',
      scientificName: 'Mus musculus',
      ncbiTaxonId: 'NCBITaxon:10090',
    },
    sex: 'female',
    welfareStatus: 'watch',
  },
};

const zebrafishBatch: SubjectWithProfile = {
  id: 'subject-zebrafish-batch-001',
  organizationId: 'org-cohos',
  subjectCode: 'ZFB-001',
  profileType: 'zebrafish_batch',
  status: 'active',
  speciesId: 'species-zebrafish',
  profile: {
    profileType: 'zebrafish_batch',
    species: {
      id: 'species-zebrafish',
      commonName: 'zebrafish',
      scientificName: 'Danio rerio',
      ncbiTaxonId: 'NCBITaxon:7955',
    },
    batchIdentifier: 'ZFB-001',
    developmentalStage: 'adult',
    count: 20,
    tankId: 'tank-001',
    mortalityEventIds: [],
    environmentalObservationIds: [],
  },
};

const tank: HousingUnit = {
  id: 'tank-001',
  roomId: 'room-aquatics',
  type: 'tank',
  name: 'Tank 001',
  code: 'T-001',
};

const welfareObservation: WelfareObservation = {
  id: 'event-welfare-001',
  organizationId: 'org-cohos',
  subjectId: rodentSubject.id,
  eventType: 'welfare_observation',
  occurredAt: '2026-07-08T09:00:00Z',
  recordedByUserId: 'user-care-001',
  score: 3,
  status: 'concern',
};

const batchMortality: MortalityEvent = {
  id: 'event-mortality-001',
  organizationId: 'org-cohos',
  subjectId: zebrafishBatch.id,
  housingUnitId: tank.id,
  eventType: 'mortality',
  occurredAt: '2026-07-08T10:00:00Z',
  recordedByUserId: 'user-care-001',
  count: 4,
};

const individualMortality: MortalityEvent = {
  id: 'event-mortality-rodent-001',
  organizationId: 'org-cohos',
  subjectId: rodentSubject.id,
  eventType: 'mortality',
  occurredAt: '2026-07-08T11:00:00Z',
  recordedByUserId: 'user-care-001',
  count: 1,
};

const highTemperatureObservation: EnvironmentalObservation = {
  id: 'event-environment-001',
  organizationId: 'org-cohos',
  housingUnitId: tank.id,
  eventType: 'environmental_observation',
  occurredAt: '2026-07-08T12:00:00Z',
  recordedByUserId: 'user-care-001',
  metric: 'temperature',
  value: 29,
  unit: 'celsius',
};

describe('rule evaluation', () => {
  it('generates welfare alerts from configurable species and profile thresholds', () => {
    const rules: AlertRuleConfigInput[] = [
      {
        id: 'rule-welfare-mouse-concern',
        organizationId: 'org-cohos',
        name: 'Mouse concern threshold',
        ruleType: 'welfare_threshold',
        severity: 'warning',
        appliesToProfileTypes: ['rodent'],
        appliesToSpeciesIds: ['species-mouse'],
        statuses: ['concern', 'critical'],
        minimumScore: 3,
      },
      {
        id: 'rule-welfare-fish-critical',
        organizationId: 'org-cohos',
        name: 'Fish-only welfare threshold',
        ruleType: 'welfare_threshold',
        severity: 'critical',
        appliesToProfileTypes: ['zebrafish_batch'],
        appliesToSpeciesIds: ['species-zebrafish'],
        statuses: ['critical'],
      },
    ];

    const alerts = evaluateWelfareObservationRules({
      observation: welfareObservation,
      rules,
      subject: rodentSubject,
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      code: 'welfare_threshold_exceeded',
      entityId: rodentSubject.id,
      ruleId: 'rule-welfare-mouse-concern',
      severity: 'warning',
    });
    expect(alerts[0]?.metadata).toMatchObject({
      score: 3,
      status: 'concern',
    });
  });

  it('evaluates mortality thresholds for individual and batch contexts', () => {
    const rules: AlertRuleConfigInput[] = [
      {
        id: 'rule-individual-mortality',
        organizationId: 'org-cohos',
        name: 'Individual mortality review',
        ruleType: 'mortality_threshold',
        severity: 'critical',
        appliesToProfileTypes: ['rodent'],
        appliesToSpeciesIds: [],
        context: 'individual',
        minimumCount: 1,
      },
      {
        id: 'rule-batch-mortality-percent',
        organizationId: 'org-cohos',
        name: 'Batch mortality percentage review',
        ruleType: 'mortality_threshold',
        severity: 'warning',
        appliesToProfileTypes: ['zebrafish_batch'],
        appliesToSpeciesIds: ['species-zebrafish'],
        context: 'batch',
        minimumPercent: 0.15,
      },
    ];

    const individualAlerts = evaluateMortalityRules({
      mortalityEvent: individualMortality,
      rules,
      subject: rodentSubject,
    });
    const batchAlerts = evaluateMortalityRules({
      mortalityEvent: batchMortality,
      rules,
      startingBatchCount: 20,
      subject: zebrafishBatch,
    });

    expect(individualAlerts).toHaveLength(1);
    expect(individualAlerts[0]?.ruleId).toBe('rule-individual-mortality');
    expect(batchAlerts).toHaveLength(1);
    expect(batchAlerts[0]).toMatchObject({
      code: 'mortality_threshold_exceeded',
      metadata: {
        context: 'batch',
        count: 4,
        mortalityPercent: 0.2,
      },
      ruleId: 'rule-batch-mortality-percent',
    });
  });

  it('generates environmental alerts from configurable ranges', () => {
    const rules: AlertRuleConfigInput[] = [
      {
        id: 'rule-tank-temperature',
        organizationId: 'org-cohos',
        name: 'Tank temperature range',
        ruleType: 'environmental_threshold',
        severity: 'warning',
        metric: 'Temperature',
        unit: 'celsius',
        minimumValue: 24,
        maximumValue: 28,
        appliesToHousingUnitTypes: ['tank'],
      },
    ];

    const alerts = evaluateEnvironmentalRules({
      housingUnit: tank,
      observation: highTemperatureObservation,
      rules,
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      code: 'environmental_threshold_exceeded',
      entityId: tank.id,
      entityType: 'housing_unit',
      ruleId: 'rule-tank-temperature',
    });
  });

  it('routes single-event evaluation by event type', () => {
    const alerts = evaluateEventRules({
      event: highTemperatureObservation,
      housingUnit: tank,
      rules: [
        {
          id: 'rule-tank-temperature',
          organizationId: 'org-cohos',
          name: 'Tank temperature range',
          ruleType: 'environmental_threshold',
          severity: 'warning',
          metric: 'temperature',
          maximumValue: 28,
        },
      ],
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.sourceEventIds).toEqual([highTemperatureObservation.id]);
  });

  it('supports cumulative harm review placeholders without legal assumptions', () => {
    const alerts = evaluateCumulativeHarmPlaceholders({
      evaluatedAt: '2026-07-08T13:00:00Z',
      events: [welfareObservation, individualMortality],
      rules: [
        {
          id: 'rule-cumulative-review',
          organizationId: 'org-cohos',
          name: 'Cumulative review placeholder',
          ruleType: 'cumulative_harm_placeholder',
          severity: 'warning',
          appliesToProfileTypes: ['rodent'],
          appliesToSpeciesIds: ['species-mouse'],
          eventWeights: {
            welfare_observation: 1,
            mortality: 2,
          },
          reviewScoreThreshold: 3,
          reviewWindowDays: 30,
        },
      ],
      subject: rodentSubject,
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      code: 'cumulative_harm_review',
      metadata: {
        reviewScore: 3,
      },
      sourceEventIds: [welfareObservation.id, individualMortality.id],
    });
  });
});
