import type { Event } from '@cohos/domain';
import { describe, expect, it } from 'vitest';

import {
  AppendOnlyAuditLog,
  createAuditEvent,
  createAuditSnapshot,
  deriveHousingEventState,
  deriveSubjectEventState,
} from './index.js';

const transferEvent = {
  id: 'event-transfer-1',
  organizationId: 'org-1',
  subjectId: 'subject-1',
  housingUnitId: 'housing-2',
  occurredAt: '2026-03-01T10:00:00Z',
  recordedByUserId: 'user-1',
  eventType: 'transfer',
  fromHousingUnitId: 'housing-1',
  toHousingUnitId: 'housing-2',
} satisfies Event;

const welfareEvent = {
  id: 'event-welfare-1',
  organizationId: 'org-1',
  subjectId: 'subject-1',
  occurredAt: '2026-03-01T11:00:00Z',
  recordedByUserId: 'user-1',
  eventType: 'welfare_observation',
  score: 5,
  status: 'critical',
} satisfies Event;

const environmentalEvent = {
  id: 'event-environmental-1',
  organizationId: 'org-1',
  housingUnitId: 'housing-2',
  occurredAt: '2026-03-01T12:00:00Z',
  recordedByUserId: 'user-1',
  eventType: 'environmental_observation',
  metric: 'temperature',
  value: 28,
  unit: 'C',
} satisfies Event;

describe('audit helpers', () => {
  it('derives current housing, welfare flags, and environmental flags from ordered events', () => {
    const state = deriveSubjectEventState({
      subjectId: 'subject-1',
      initialHousingUnitId: 'housing-1',
      events: [environmentalEvent, welfareEvent, transferEvent],
    });

    expect(state.currentHousingUnitId).toBe('housing-2');
    expect(state.aliveStatus).toBe('alive');
    expect(state.latestWelfareStatus).toBe('critical');
    expect(state.alertFlags.map((flag) => flag.code)).toEqual([
      'welfare_critical',
      'environmental_recorded',
    ]);
  });

  it('derives individual mortality and batch-count depletion', () => {
    const individualMortality = {
      id: 'event-mortality-individual-1',
      organizationId: 'org-1',
      subjectId: 'subject-1',
      occurredAt: '2026-03-01T13:00:00Z',
      recordedByUserId: 'user-1',
      eventType: 'mortality',
      count: 1,
    } satisfies Event;
    const batchMortality = {
      id: 'event-mortality-batch-1',
      organizationId: 'org-1',
      subjectId: 'subject-batch-1',
      occurredAt: '2026-03-01T13:00:00Z',
      recordedByUserId: 'user-1',
      eventType: 'mortality',
      count: 12,
    } satisfies Event;

    expect(
      deriveSubjectEventState({
        subjectId: 'subject-1',
        events: [individualMortality],
      }).aliveStatus,
    ).toBe('deceased');

    const batchState = deriveSubjectEventState({
      subjectId: 'subject-batch-1',
      initialBatchCount: 12,
      events: [batchMortality],
    });

    expect(batchState.batchCount).toBe(0);
    expect(batchState.aliveStatus).toBe('deceased');
    expect(batchState.alertFlags.map((flag) => flag.code)).toContain('batch_depleted');
  });

  it('derives housing environmental state', () => {
    const state = deriveHousingEventState({
      housingUnitId: 'housing-2',
      events: [environmentalEvent],
    });

    expect(state.latestEnvironmentalObservationId).toBe('event-environmental-1');
    expect(state.alertFlags).toEqual([
      {
        code: 'environmental_recorded',
        message: 'Environmental observation recorded for temperature.',
        severity: 'info',
        sourceEventId: 'event-environmental-1',
      },
    ]);
  });

  it('creates stable redacted audit snapshots and append-only audit logs', () => {
    const left = createAuditSnapshot({ b: 2, a: 1 });
    const right = createAuditSnapshot({ a: 1, b: 2 });
    const auditEvent = createAuditEvent({
      organizationId: 'org-1',
      actorUserId: 'user-1',
      entityType: 'event',
      entityId: 'event-1',
      action: 'event.transfer.record',
      source: 'test',
      newValue: { subjectId: 'subject-1', directIdentifier: 'redacted before storage' },
    });
    const log = new AppendOnlyAuditLog([auditEvent]);
    const listed = log.list();

    listed[0] = {
      ...listed[0]!,
      action: 'mutated.after.read',
    };

    expect(left).toEqual(right);
    expect(auditEvent.newValue?.redacted).toBe(true);
    expect(auditEvent.newValue?.hash).toMatch(/^sha256:/);
    expect(log.list()[0]?.action).toBe('event.transfer.record');
    expect(() => log.append(auditEvent)).toThrow(/already exists/);
    expect('update' in log).toBe(false);
    expect('delete' in log).toBe(false);
  });
});
