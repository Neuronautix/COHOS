import {
  type Alert,
  type AuditEvent,
  type Event,
  alertSchema,
  auditEventSchema,
  eventSchema,
} from '@cohos/domain';

const organizationId = 'org-synthetic-cohos';
const recordedByUserId = 'user-seed-coordinator';

export const eventFixtures = [
  eventSchema.parse({
    id: 'event-transfer-rodent-1',
    organizationId,
    subjectId: 'subject-rodent-001',
    housingUnitId: 'housing-cage-a1',
    occurredAt: '2026-03-01T10:00:00Z',
    recordedByUserId,
    eventType: 'transfer',
    toHousingUnitId: 'housing-cage-a1',
  }),
  eventSchema.parse({
    id: 'event-welfare-rodent-1',
    organizationId,
    subjectId: 'subject-rodent-001',
    occurredAt: '2026-03-02T10:00:00Z',
    recordedByUserId,
    eventType: 'welfare_observation',
    score: 1,
    status: 'normal',
  }),
  eventSchema.parse({
    id: 'event-env-zebrafish-1',
    organizationId,
    housingUnitId: 'housing-tank-z1',
    occurredAt: '2026-03-02T11:00:00Z',
    recordedByUserId,
    eventType: 'environmental_observation',
    metric: 'temperature',
    value: 27.5,
    unit: 'C',
  }),
  eventSchema.parse({
    id: 'event-mortality-zebrafish-1',
    organizationId,
    subjectId: 'subject-zebrafish-batch-001',
    housingUnitId: 'housing-tank-z1',
    occurredAt: '2026-03-02T11:30:00Z',
    recordedByUserId,
    eventType: 'mortality',
    count: 4,
    cause: 'Synthetic fixture mortality record',
  }),
] satisfies Event[];

export const auditEventFixtures = [
  auditEventSchema.parse({
    id: 'audit-seed-subject-create-1',
    organizationId,
    actorUserId: recordedByUserId,
    entityType: 'subject',
    entityId: 'subject-human-pseudo-001',
    action: 'subject.create',
    reason: 'Synthetic seed initialization',
    newValue: {
      hash: 'sha256:synthetic-seed-subject-human-pseudo-001',
      redacted: true,
    },
    createdAt: '2026-03-02T12:00:00Z',
    correlationId: 'seed-run-synthetic',
    source: 'seed',
  }),
] satisfies AuditEvent[];

export const alertFixtures = [
  alertSchema.parse({
    id: 'alert-synthetic-info-1',
    organizationId,
    severity: 'info',
    title: 'Synthetic seed alert',
    entityType: 'subject',
    entityId: 'subject-rodent-001',
    createdAt: '2026-03-02T12:15:00Z',
  }),
] satisfies Alert[];
