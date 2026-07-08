import { createHash, randomUUID } from 'node:crypto';

import {
  type AliveStatus,
  type AuditEvent,
  type DerivedAlertFlag,
  type Event,
  type HousingEventState,
  type SubjectEventState,
  auditEventSchema,
  auditSnapshotSchema,
  housingEventStateSchema,
  subjectEventStateSchema,
} from '@cohos/domain';

export type AuditEventInput = Omit<
  AuditEvent,
  'createdAt' | 'id' | 'newValue' | 'previousValue'
> & {
  readonly createdAt?: string;
  readonly id?: string;
  readonly newValue?: unknown;
  readonly previousValue?: unknown;
};

export type DeriveSubjectEventStateInput = {
  readonly subjectId: string;
  readonly initialAliveStatus?: AliveStatus;
  readonly initialBatchCount?: number;
  readonly initialHousingUnitId?: string;
  readonly events: readonly Event[];
};

export type DeriveHousingEventStateInput = {
  readonly housingUnitId: string;
  readonly events: readonly Event[];
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }

  return value;
}

function cloneAuditEvent(event: AuditEvent): AuditEvent {
  return auditEventSchema.parse(JSON.parse(JSON.stringify(event)));
}

function sortedEvents(events: readonly Event[]): Event[] {
  return [...events].sort((left, right) => {
    const occurredDelta = Date.parse(left.occurredAt) - Date.parse(right.occurredAt);

    if (occurredDelta !== 0) {
      return occurredDelta;
    }

    return left.id.localeCompare(right.id);
  });
}

function welfareAlertFlag(event: Extract<Event, { eventType: 'welfare_observation' }>) {
  if (event.status === 'normal') {
    return undefined;
  }

  return {
    code: `welfare_${event.status}` as const,
    message: `Welfare observation recorded with ${event.status} status.`,
    severity: event.status === 'critical' ? ('critical' as const) : ('warning' as const),
    sourceEventId: event.id,
  };
}

export function createAuditSnapshot(value: unknown) {
  const serialized = JSON.stringify(canonicalize(value));
  const digest = createHash('sha256').update(serialized).digest('hex');

  return auditSnapshotSchema.parse({
    hash: `sha256:${digest}`,
    redacted: true,
  });
}

export function createAuditEvent(input: AuditEventInput): AuditEvent {
  return auditEventSchema.parse({
    ...input,
    id: input.id ?? `audit-${randomUUID()}`,
    createdAt: input.createdAt ?? new Date().toISOString(),
    previousValue:
      input.previousValue === undefined ? undefined : createAuditSnapshot(input.previousValue),
    newValue: input.newValue === undefined ? undefined : createAuditSnapshot(input.newValue),
  });
}

export function deriveSubjectEventState(input: DeriveSubjectEventStateInput): SubjectEventState {
  let aliveStatus = input.initialAliveStatus ?? 'alive';
  let batchCount = input.initialBatchCount;
  let currentHousingUnitId = input.initialHousingUnitId;
  let latestEventId: string | undefined;
  let latestWelfareStatus: SubjectEventState['latestWelfareStatus'];
  const alertFlags: DerivedAlertFlag[] = [];

  for (const event of sortedEvents(input.events)) {
    if (event.eventType === 'transfer' && event.subjectId === input.subjectId) {
      currentHousingUnitId = event.toHousingUnitId;
      latestEventId = event.id;
      continue;
    }

    if (event.eventType === 'mortality' && event.subjectId === input.subjectId) {
      latestEventId = event.id;
      alertFlags.push({
        code: 'mortality_recorded',
        message: `Mortality event recorded with count ${event.count}.`,
        severity: 'critical',
        sourceEventId: event.id,
      });

      if (batchCount === undefined) {
        aliveStatus = 'deceased';
        continue;
      }

      batchCount = Math.max(0, batchCount - event.count);

      if (batchCount === 0) {
        aliveStatus = 'deceased';
        alertFlags.push({
          code: 'batch_depleted',
          message: 'Batch count reached zero after mortality events.',
          severity: 'critical',
          sourceEventId: event.id,
        });
      }

      continue;
    }

    if (event.eventType === 'welfare_observation' && event.subjectId === input.subjectId) {
      latestEventId = event.id;
      latestWelfareStatus = event.status;

      const alertFlag = welfareAlertFlag(event);

      if (alertFlag !== undefined) {
        alertFlags.push(alertFlag);
      }

      continue;
    }

    if (
      event.eventType === 'environmental_observation' &&
      event.housingUnitId !== undefined &&
      event.housingUnitId === currentHousingUnitId
    ) {
      latestEventId = event.id;
      alertFlags.push({
        code: 'environmental_recorded',
        message: `Environmental observation recorded for ${event.metric}.`,
        severity: 'info',
        sourceEventId: event.id,
      });
    }
  }

  return subjectEventStateSchema.parse({
    subjectId: input.subjectId,
    aliveStatus,
    currentHousingUnitId,
    batchCount,
    latestWelfareStatus,
    latestEventId,
    alertFlags,
  });
}

export function deriveHousingEventState(input: DeriveHousingEventStateInput): HousingEventState {
  let latestEnvironmentalObservationId: string | undefined;
  const alertFlags: DerivedAlertFlag[] = [];

  for (const event of sortedEvents(input.events)) {
    if (
      event.eventType !== 'environmental_observation' ||
      event.housingUnitId !== input.housingUnitId
    ) {
      continue;
    }

    latestEnvironmentalObservationId = event.id;
    alertFlags.push({
      code: 'environmental_recorded',
      message: `Environmental observation recorded for ${event.metric}.`,
      severity: 'info',
      sourceEventId: event.id,
    });
  }

  return housingEventStateSchema.parse({
    housingUnitId: input.housingUnitId,
    latestEnvironmentalObservationId,
    alertFlags,
  });
}

export class AppendOnlyAuditLog {
  private readonly events = new Map<string, AuditEvent>();

  constructor(initialEvents: readonly AuditEvent[] = []) {
    for (const event of initialEvents) {
      this.append(event);
    }
  }

  append(event: AuditEvent): AuditEvent {
    const parsed = auditEventSchema.parse(event);

    if (this.events.has(parsed.id)) {
      throw new Error(`Audit event ${parsed.id} already exists.`);
    }

    this.events.set(parsed.id, cloneAuditEvent(parsed));

    return cloneAuditEvent(parsed);
  }

  get(auditEventId: string): AuditEvent | undefined {
    const event = this.events.get(auditEventId);

    return event === undefined ? undefined : cloneAuditEvent(event);
  }

  list(): AuditEvent[] {
    return Array.from(this.events.values()).map((event) => cloneAuditEvent(event));
  }
}
