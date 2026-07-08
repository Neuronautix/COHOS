import { describe, expect, it } from 'vitest';

import {
  alertSchema,
  auditEventSchema,
  eventSchema,
  housingEventStateSchema,
  investigationDetailSchema,
  subjectEventStateSchema,
  subjectWithProfileSchema,
} from '@cohos/domain';

import {
  createIsaJsonReportPayload,
  getEventDetail,
  getReportRows,
  summarizeReportDashboard,
  summarizeWelfareDashboard,
} from './operations-formatters';

const events = [
  eventSchema.parse({
    id: 'event-welfare-test',
    organizationId: 'org-synthetic-cohos',
    subjectId: 'subject-rodent-test',
    occurredAt: '2026-03-02T10:00:00Z',
    recordedByUserId: 'user-seed-coordinator',
    eventType: 'welfare_observation',
    score: 3,
    status: 'concern',
  }),
  eventSchema.parse({
    id: 'event-env-test',
    organizationId: 'org-synthetic-cohos',
    housingUnitId: 'housing-tank-test',
    occurredAt: '2026-03-02T11:00:00Z',
    recordedByUserId: 'user-seed-coordinator',
    eventType: 'environmental_observation',
    metric: 'temperature',
    value: 27.5,
    unit: 'C',
  }),
  eventSchema.parse({
    id: 'event-mortality-test',
    organizationId: 'org-synthetic-cohos',
    subjectId: 'subject-zebrafish-test',
    housingUnitId: 'housing-tank-test',
    occurredAt: '2026-03-02T11:30:00Z',
    recordedByUserId: 'user-seed-coordinator',
    eventType: 'mortality',
    count: 4,
    cause: 'Synthetic mortality record',
  }),
];

const alert = alertSchema.parse({
  id: 'alert-test',
  organizationId: 'org-synthetic-cohos',
  severity: 'warning',
  title: 'Synthetic alert',
  entityType: 'subject',
  entityId: 'subject-rodent-test',
  createdAt: '2026-03-02T12:15:00Z',
});

const auditEvent = auditEventSchema.parse({
  id: 'audit-test',
  organizationId: 'org-synthetic-cohos',
  actorUserId: 'user-seed-coordinator',
  entityType: 'subject',
  entityId: 'subject-human-pseudo-test',
  action: 'subject.create',
  createdAt: '2026-03-02T12:00:00Z',
  source: 'seed',
});

const subjectState = subjectEventStateSchema.parse({
  subjectId: 'subject-zebrafish-test',
  aliveStatus: 'alive',
  currentHousingUnitId: 'housing-tank-test',
  batchCount: 116,
  alertFlags: [
    {
      code: 'mortality_recorded',
      severity: 'warning',
      message: 'Mortality recorded.',
      sourceEventId: 'event-mortality-test',
    },
  ],
});

const housingState = housingEventStateSchema.parse({
  housingUnitId: 'housing-tank-test',
  latestEnvironmentalObservationId: 'event-env-test',
  alertFlags: [
    {
      code: 'environmental_recorded',
      severity: 'info',
      message: 'Environment recorded.',
      sourceEventId: 'event-env-test',
    },
  ],
});

const humanSubject = subjectWithProfileSchema.parse({
  id: 'subject-human-pseudo-test',
  organizationId: 'org-synthetic-cohos',
  subjectCode: 'HUM-PSEUDO-T',
  profileType: 'human',
  status: 'active',
  profile: {
    profileType: 'human',
    pseudonymizedSubjectCode: 'HUM-PSEUDO-T',
    consentStatus: 'consented',
    studyParticipationStatus: 'enrolled',
  },
});

const rodentSubject = subjectWithProfileSchema.parse({
  id: 'subject-rodent-test',
  organizationId: 'org-synthetic-cohos',
  subjectCode: 'ROD-SYN-T',
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
    welfareStatus: 'normal',
  },
});

const investigation = investigationDetailSchema.parse({
  id: 'investigation-synthetic-test',
  organizationId: 'org-synthetic-cohos',
  title: 'Synthetic investigation',
  studies: [
    {
      id: 'study-synthetic-test',
      investigationId: 'investigation-synthetic-test',
      title: 'Synthetic study',
      subjectIds: ['subject-human-pseudo-test', 'subject-rodent-test'],
      cohortIds: [],
      assays: [],
      connectedResources: [],
    },
  ],
  connectedResources: [],
});

const dashboard = {
  alerts: [alert],
  auditEvents: [auditEvent],
  events,
  housingStates: [housingState],
  investigations: [investigation],
  subjectStates: [subjectState],
  subjects: [humanSubject, rodentSubject],
};

describe('operations formatters', () => {
  it('summarizes welfare dashboard event and alert signals', () => {
    expect(summarizeWelfareDashboard(dashboard)).toEqual({
      alertCount: 1,
      criticalAlertCount: 0,
      environmentalObservationCount: 1,
      mortalityEventCount: 1,
      openAlertCount: 1,
      subjectStateCount: 1,
      welfareObservationCount: 1,
    });
  });

  it('formats event details for operational review', () => {
    const welfareEvent = events.find((event) => event.eventType === 'welfare_observation');
    const environmentalEvent = events.find(
      (event) => event.eventType === 'environmental_observation',
    );
    const mortalityEvent = events.find((event) => event.eventType === 'mortality');

    if (
      welfareEvent === undefined ||
      environmentalEvent === undefined ||
      mortalityEvent === undefined
    ) {
      throw new Error('Expected event fixtures.');
    }

    expect(getEventDetail(welfareEvent)).toBe('Score 3 - Concern');
    expect(getEventDetail(environmentalEvent)).toBe('Temperature 27.5 C');
    expect(getEventDetail(mortalityEvent)).toBe('4 recorded - Synthetic mortality record');
  });

  it('builds report summaries and rows from fetched API data', () => {
    expect(summarizeReportDashboard(dashboard)).toEqual({
      alertCount: 1,
      auditEventCount: 1,
      eventCount: 3,
      investigationCount: 1,
      subjectCount: 2,
    });
    expect(getReportRows('welfare-alert-review', dashboard)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'alert-test',
          type: 'alert',
        }),
        expect.objectContaining({
          id: 'event-welfare-test',
          status: 'concern',
        }),
      ]),
    );
  });

  it('creates ISA JSON report payloads without direct human identifiers', () => {
    const payload = createIsaJsonReportPayload(dashboard, '2026-07-08T15:00:00Z');

    expect(payload?.generatedAt).toBe('2026-07-08T15:00:00Z');
    expect(payload?.investigations[0]?.studies[0]?.sources.map((source) => source.name)).toEqual([
      'HUM-PSEUDO-T',
      'ROD-SYN-T',
    ]);
    expect(JSON.stringify(payload)).not.toContain('email');
    expect(JSON.stringify(payload)).not.toContain('fullName');
  });
});
