import {
  type Alert,
  type AuditEvent,
  type EnvironmentalObservation,
  type Event,
  type HousingEventState,
  type InvestigationDetail,
  type MortalityEvent,
  type SubjectEventState,
  type SubjectWithProfile,
  type WelfareObservation,
} from '@cohos/domain';
import { createIsaJsonExport, type IsaJsonExport } from '@cohos/isa';
import type { ReportRow } from '@cohos/reporting';
import type { StatusTone } from '@cohos/ui';

export type OperationalSummary = {
  readonly alertCount: number;
  readonly criticalAlertCount: number;
  readonly environmentalObservationCount: number;
  readonly mortalityEventCount: number;
  readonly openAlertCount: number;
  readonly subjectStateCount: number;
  readonly welfareObservationCount: number;
};

export type ReportSummary = {
  readonly alertCount: number;
  readonly auditEventCount: number;
  readonly eventCount: number;
  readonly investigationCount: number;
  readonly subjectCount: number;
};

export type WelfareDashboardLike = {
  readonly alerts: readonly Alert[];
  readonly events: readonly Event[];
  readonly housingStates: readonly HousingEventState[];
  readonly subjectStates: readonly SubjectEventState[];
};

export type ReportDashboardLike = WelfareDashboardLike & {
  readonly auditEvents: readonly AuditEvent[];
  readonly investigations: readonly InvestigationDetail[];
  readonly subjects: readonly SubjectWithProfile[];
};

export function formatOperationToken(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function getSeverityTone(severity: Alert['severity']): StatusTone {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
  }
}

export function getEventTone(event: Event): StatusTone {
  switch (event.eventType) {
    case 'mortality':
      return 'danger';
    case 'welfare_observation':
      return event.status === 'critical'
        ? 'danger'
        : event.status === 'concern' || event.status === 'watch'
          ? 'warning'
          : 'success';
    case 'environmental_observation':
      return 'info';
    case 'transfer':
      return 'neutral';
  }
}

export function getEventTitle(event: Event): string {
  switch (event.eventType) {
    case 'environmental_observation':
      return 'Environmental observation';
    case 'mortality':
      return 'Mortality event';
    case 'transfer':
      return 'Transfer event';
    case 'welfare_observation':
      return 'Welfare observation';
  }
}

export function getEventEntityLabel(event: Event): string {
  if (event.subjectId !== undefined) {
    return event.subjectId;
  }

  if (event.housingUnitId !== undefined) {
    return event.housingUnitId;
  }

  return event.organizationId;
}

export function getEventDetail(event: Event): string {
  switch (event.eventType) {
    case 'environmental_observation':
      return `${formatOperationToken(event.metric)} ${event.value} ${event.unit}`;
    case 'mortality':
      return `${event.count} recorded${event.cause === undefined ? '' : ` - ${event.cause}`}`;
    case 'transfer':
      return `To ${event.toHousingUnitId}`;
    case 'welfare_observation':
      return `Score ${event.score} - ${formatOperationToken(event.status)}`;
  }
}

export function getOpenAlerts(alerts: readonly Alert[]): Alert[] {
  return alerts.filter((alert) => alert.resolvedAt === undefined);
}

export function getWelfareObservations(events: readonly Event[]): WelfareObservation[] {
  return events.filter(
    (event): event is WelfareObservation => event.eventType === 'welfare_observation',
  );
}

export function getMortalityEvents(events: readonly Event[]): MortalityEvent[] {
  return events.filter((event): event is MortalityEvent => event.eventType === 'mortality');
}

export function getEnvironmentalObservations(events: readonly Event[]): EnvironmentalObservation[] {
  return events.filter(
    (event): event is EnvironmentalObservation => event.eventType === 'environmental_observation',
  );
}

export function summarizeWelfareDashboard(input: WelfareDashboardLike): OperationalSummary {
  const openAlerts = getOpenAlerts(input.alerts);

  return {
    alertCount: input.alerts.length,
    criticalAlertCount: input.alerts.filter((alert) => alert.severity === 'critical').length,
    environmentalObservationCount: getEnvironmentalObservations(input.events).length,
    mortalityEventCount: getMortalityEvents(input.events).length,
    openAlertCount: openAlerts.length,
    subjectStateCount: input.subjectStates.length,
    welfareObservationCount: getWelfareObservations(input.events).length,
  };
}

export function summarizeReportDashboard(input: ReportDashboardLike): ReportSummary {
  return {
    alertCount: input.alerts.length,
    auditEventCount: input.auditEvents.length,
    eventCount: input.events.length,
    investigationCount: input.investigations.length,
    subjectCount: input.subjects.length,
  };
}

export function getReportRows(reportId: string, input: ReportDashboardLike): ReportRow[] {
  switch (reportId) {
    case 'audit-log-export':
      return input.auditEvents.map((auditEvent) => ({
        action: auditEvent.action,
        createdAt: auditEvent.createdAt,
        entityId: auditEvent.entityId,
        entityType: auditEvent.entityType,
        eventId: auditEvent.eventId,
        id: auditEvent.id,
        source: auditEvent.source,
      }));
    case 'mortality-environment-summary':
      return [...getMortalityEvents(input.events), ...getEnvironmentalObservations(input.events)]
        .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
        .map((event) => ({
          detail: getEventDetail(event),
          entityId: getEventEntityLabel(event),
          eventType: event.eventType,
          id: event.id,
          occurredAt: event.occurredAt,
        }));
    case 'welfare-alert-review':
      return [
        ...input.alerts.map((alert) => ({
          createdAt: alert.createdAt,
          entityId: alert.entityId,
          entityType: alert.entityType,
          id: alert.id,
          severity: alert.severity,
          title: alert.title,
          type: 'alert',
        })),
        ...getWelfareObservations(input.events).map((event) => ({
          entityId: getEventEntityLabel(event),
          id: event.id,
          occurredAt: event.occurredAt,
          score: event.score,
          status: event.status,
          type: event.eventType,
        })),
      ];
    default:
      return [];
  }
}

export function getReportJsonPayload(reportId: string, input: ReportDashboardLike): unknown {
  switch (reportId) {
    case 'audit-log-export':
      return {
        auditEvents: input.auditEvents,
      };
    case 'mortality-environment-summary':
      return {
        environmentalObservations: getEnvironmentalObservations(input.events),
        mortalityEvents: getMortalityEvents(input.events),
      };
    case 'welfare-alert-review':
      return {
        alerts: input.alerts,
        welfareObservations: getWelfareObservations(input.events),
      };
    default:
      return {};
  }
}

export function createIsaJsonReportPayload(
  input: ReportDashboardLike,
  generatedAt?: string,
): IsaJsonExport | undefined {
  const investigation = input.investigations[0];

  if (investigation === undefined) {
    return undefined;
  }

  return createIsaJsonExport({
    generatedAt,
    investigation,
    subjects: input.subjects,
  });
}
