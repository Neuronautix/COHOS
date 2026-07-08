import { describe, expect, it } from 'vitest';

import { alertSchema, auditEventSchema, eventSchema } from '@cohos/domain';

import {
  countAvailableExportActions,
  createOperationalReportCatalog,
  serializeReportRowsToCsv,
  toReportFileName,
} from './index.js';

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
    id: 'event-mortality-test',
    organizationId: 'org-synthetic-cohos',
    subjectId: 'subject-zebrafish-test',
    housingUnitId: 'housing-tank-test',
    occurredAt: '2026-03-02T11:30:00Z',
    recordedByUserId: 'user-seed-coordinator',
    eventType: 'mortality',
    count: 4,
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

describe('reporting package', () => {
  it('builds report export descriptors from operational data', () => {
    const reports = createOperationalReportCatalog({
      alerts: [alert],
      auditEvents: [auditEvent],
      events,
      investigationCount: 1,
    });

    expect(reports.map((report) => report.id)).toEqual([
      'welfare-alert-review',
      'mortality-environment-summary',
      'audit-log-export',
      'isa-json-research-export',
    ]);
    expect(reports[0]?.sourceCount).toBe(2);
    expect(reports[1]?.sourceCount).toBe(2);
    expect(reports[3]?.exportActions).toContainEqual(
      expect.objectContaining({
        availability: 'available',
        format: 'isa_json',
      }),
    );
    expect(countAvailableExportActions(reports)).toBe(7);
  });

  it('marks ISA JSON as planned when research metadata is missing', () => {
    const reports = createOperationalReportCatalog({
      alerts: [],
      auditEvents: [],
      events: [],
    });
    const isaReport = reports.find((report) => report.id === 'isa-json-research-export');

    expect(isaReport?.exportActions[0]).toMatchObject({
      availability: 'planned',
      format: 'isa_json',
    });
  });

  it('serializes rows to CSV with stable escaping', () => {
    expect(
      serializeReportRowsToCsv([
        {
          id: 'row-1',
          notes: 'Needs review, same day',
        },
      ]),
    ).toBe('id,notes\nrow-1,"Needs review, same day"');
  });

  it('uses JSON extension for ISA JSON report filenames', () => {
    const report = createOperationalReportCatalog({
      alerts: [alert],
      auditEvents: [auditEvent],
      events,
      investigationCount: 1,
    })[3];

    if (report === undefined) {
      throw new Error('Expected an ISA report descriptor.');
    }

    expect(toReportFileName(report, 'isa_json')).toBe('isa-json-research-export.json');
  });
});
