import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AppendOnlyAuditLog,
  createAuditEvent,
  deriveHousingEventState,
  deriveSubjectEventState,
} from '@cohos/audit';
import {
  type Alert,
  type AuditEvent,
  type Event,
  type HousingEventState,
  type HousingUnitDetail,
  type SubjectEventState,
  type SubjectWithProfile,
  environmentalObservationSchema,
  eventSchema,
  mortalityEventSchema,
  transferEventSchema,
  welfareObservationSchema,
} from '@cohos/domain';

import { housingUnitFixtures } from '../facilities/facility.fixtures.js';
import { subjectFixtures } from '../subjects/subject.fixtures.js';
import type {
  RecordEnvironmentalObservationDto,
  RecordMortalityDto,
  RecordTransferDto,
  RecordWelfareObservationDto,
} from './dto.js';
import { alertFixtures, auditEventFixtures, eventFixtures } from './event.fixtures.js';

type EventFilters = {
  readonly eventType?: string;
  readonly housingUnitId?: string;
  readonly subjectId?: string;
};

type AuditEventFilters = {
  readonly entityId?: string;
  readonly entityType?: string;
  readonly eventId?: string;
};

@Injectable()
export class EventsService {
  private readonly events = new Map<string, Event>(eventFixtures.map((event) => [event.id, event]));

  private readonly auditLog = new AppendOnlyAuditLog(auditEventFixtures);

  private readonly alerts = new Map<string, Alert>(alertFixtures.map((alert) => [alert.id, alert]));

  private readonly subjects = new Map<string, SubjectWithProfile>(
    subjectFixtures.map((subject) => [subject.id, subject]),
  );

  private readonly housingUnits = new Map<string, HousingUnitDetail>(
    housingUnitFixtures.map((housingUnit) => [housingUnit.id, housingUnit]),
  );

  listEvents(filters: EventFilters = {}): Event[] {
    return Array.from(this.events.values()).filter(
      (event) =>
        (filters.eventType === undefined || event.eventType === filters.eventType) &&
        (filters.housingUnitId === undefined || event.housingUnitId === filters.housingUnitId) &&
        (filters.subjectId === undefined || event.subjectId === filters.subjectId),
    );
  }

  getEvent(eventId: string): Event {
    const event = this.events.get(eventId);

    if (event === undefined) {
      throw new NotFoundException(`Event ${eventId} was not found.`);
    }

    return event;
  }

  listAuditEvents(filters: AuditEventFilters = {}): AuditEvent[] {
    return this.auditLog
      .list()
      .filter(
        (auditEvent) =>
          (filters.entityId === undefined || auditEvent.entityId === filters.entityId) &&
          (filters.entityType === undefined || auditEvent.entityType === filters.entityType) &&
          (filters.eventId === undefined || auditEvent.eventId === filters.eventId),
      );
  }

  getAuditEvent(auditEventId: string): AuditEvent {
    const auditEvent = this.auditLog.get(auditEventId);

    if (auditEvent === undefined) {
      throw new NotFoundException(`Audit event ${auditEventId} was not found.`);
    }

    return auditEvent;
  }

  listAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  getSubjectEventState(subjectId: string): SubjectEventState {
    const subject = this.getSubject(subjectId);

    return deriveSubjectEventState({
      subjectId,
      initialBatchCount: batchCountForSubject(subject),
      initialHousingUnitId: housingUnitIdForSubject(subject),
      events: this.listEvents(),
    });
  }

  getHousingEventState(housingUnitId: string): HousingEventState {
    this.getHousingUnit(housingUnitId);

    return deriveHousingEventState({
      housingUnitId,
      events: this.listEvents(),
    });
  }

  recordTransfer(input: RecordTransferDto): Event {
    this.getSubject(input.subjectId);
    this.getHousingUnit(input.toHousingUnitId);

    if (input.fromHousingUnitId !== undefined) {
      this.getHousingUnit(input.fromHousingUnitId);
    }

    const event = transferEventSchema.parse({
      ...input,
      id: `event-transfer-${randomUUID()}`,
      eventType: 'transfer',
      housingUnitId: input.toHousingUnitId,
    });

    return this.storeEventWithAudit(event);
  }

  recordMortality(input: RecordMortalityDto): Event {
    this.getSubject(input.subjectId);

    if (input.housingUnitId !== undefined) {
      this.getHousingUnit(input.housingUnitId);
    }

    const event = mortalityEventSchema.parse({
      ...input,
      id: `event-mortality-${randomUUID()}`,
      eventType: 'mortality',
    });

    return this.storeEventWithAudit(event);
  }

  recordWelfareObservation(input: RecordWelfareObservationDto): Event {
    this.getSubject(input.subjectId);

    const event = welfareObservationSchema.parse({
      ...input,
      id: `event-welfare-${randomUUID()}`,
      eventType: 'welfare_observation',
    });

    return this.storeEventWithAudit(event);
  }

  recordEnvironmentalObservation(input: RecordEnvironmentalObservationDto): Event {
    this.getHousingUnit(input.housingUnitId);

    const event = environmentalObservationSchema.parse({
      ...input,
      id: `event-environmental-${randomUUID()}`,
      eventType: 'environmental_observation',
    });

    return this.storeEventWithAudit(event);
  }

  private storeEventWithAudit(event: Event): Event {
    const parsed = eventSchema.parse(event);

    this.events.set(parsed.id, parsed);
    this.auditLog.append(
      createAuditEvent({
        organizationId: parsed.organizationId,
        actorUserId: parsed.recordedByUserId,
        entityType: 'event',
        entityId: parsed.id,
        action: `event.${parsed.eventType}.record`,
        reason: parsed.reason,
        newValue: parsed,
        correlationId: parsed.id,
        source: 'api',
        eventId: parsed.id,
      }),
    );

    return parsed;
  }

  private getSubject(subjectId: string): SubjectWithProfile {
    const subject = this.subjects.get(subjectId);

    if (subject === undefined) {
      throw new NotFoundException(`Subject ${subjectId} was not found.`);
    }

    return subject;
  }

  private getHousingUnit(housingUnitId: string): HousingUnitDetail {
    const housingUnit = this.housingUnits.get(housingUnitId);

    if (housingUnit === undefined) {
      throw new NotFoundException(`Housing unit ${housingUnitId} was not found.`);
    }

    return housingUnit;
  }
}

function housingUnitIdForSubject(subject: SubjectWithProfile): string | undefined {
  switch (subject.profile.profileType) {
    case 'rodent':
    case 'farm_animal':
      return subject.profile.housingUnitId;
    case 'zebrafish_batch':
      return subject.profile.tankId;
    case 'generic':
    case 'human':
      return undefined;
  }
}

function batchCountForSubject(subject: SubjectWithProfile): number | undefined {
  if (subject.profile.profileType === 'zebrafish_batch') {
    return subject.profile.count;
  }

  return undefined;
}
