import {
  alertSchema,
  auditEventSchema,
  eventSchema,
  housingEventStateSchema,
  investigationDetailSchema,
  subjectEventStateSchema,
  subjectWithProfileSchema,
  type Alert,
  type AuditEvent,
  type Event,
  type HousingEventState,
  type InvestigationDetail,
  type SubjectEventState,
  type SubjectWithProfile,
} from '@cohos/domain';

import { fetchFromApi } from '../../lib/api-client';

const alertListSchema = alertSchema.array();
const auditEventListSchema = auditEventSchema.array();
const eventListSchema = eventSchema.array();
const investigationListSchema = investigationDetailSchema.array();
const subjectListSchema = subjectWithProfileSchema.array();

export type WelfareDashboardData = {
  readonly alerts: readonly Alert[];
  readonly events: readonly Event[];
  readonly housingStates: readonly HousingEventState[];
  readonly subjectStates: readonly SubjectEventState[];
};

export type ReportDashboardData = WelfareDashboardData & {
  readonly auditEvents: readonly AuditEvent[];
  readonly investigations: readonly InvestigationDetail[];
  readonly subjects: readonly SubjectWithProfile[];
};

export async function fetchEvents(): Promise<Event[]> {
  const payload = await fetchFromApi<unknown>('/events');

  return eventListSchema.parse(payload);
}

export async function fetchAlerts(): Promise<Alert[]> {
  const payload = await fetchFromApi<unknown>('/alerts');

  return alertListSchema.parse(payload);
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const payload = await fetchFromApi<unknown>('/audit-events');

  return auditEventListSchema.parse(payload);
}

export async function fetchInvestigations(): Promise<InvestigationDetail[]> {
  const payload = await fetchFromApi<unknown>('/investigations');

  return investigationListSchema.parse(payload);
}

export async function fetchSubjects(): Promise<SubjectWithProfile[]> {
  const payload = await fetchFromApi<unknown>('/subjects');

  return subjectListSchema.parse(payload);
}

export async function fetchSubjectEventState(subjectId: string): Promise<SubjectEventState> {
  const payload = await fetchFromApi<unknown>(
    `/events/subjects/${encodeURIComponent(subjectId)}/state`,
  );

  return subjectEventStateSchema.parse(payload);
}

export async function fetchHousingEventState(housingUnitId: string): Promise<HousingEventState> {
  const payload = await fetchFromApi<unknown>(
    `/events/housing-units/${encodeURIComponent(housingUnitId)}/state`,
  );

  return housingEventStateSchema.parse(payload);
}

export async function fetchWelfareDashboard(): Promise<WelfareDashboardData> {
  const [events, alerts] = await Promise.all([fetchEvents(), fetchAlerts()]);
  const states = await fetchStatesForEvents(events);

  return {
    alerts,
    events,
    ...states,
  };
}

export async function fetchReportDashboard(): Promise<ReportDashboardData> {
  const [events, alerts, auditEvents, investigations, subjects] = await Promise.all([
    fetchEvents(),
    fetchAlerts(),
    fetchAuditEvents(),
    fetchInvestigations(),
    fetchSubjects(),
  ]);
  const states = await fetchStatesForEvents(events);

  return {
    alerts,
    auditEvents,
    events,
    investigations,
    subjects,
    ...states,
  };
}

async function fetchStatesForEvents(events: readonly Event[]) {
  const subjectIds = uniqueValues(events.map((event) => event.subjectId));
  const housingUnitIds = uniqueValues(events.map((event) => event.housingUnitId));
  const [subjectStates, housingStates] = await Promise.all([
    Promise.all(subjectIds.map((subjectId) => fetchSubjectEventState(subjectId))),
    Promise.all(housingUnitIds.map((housingUnitId) => fetchHousingEventState(housingUnitId))),
  ]);

  return {
    housingStates,
    subjectStates,
  };
}

function uniqueValues(values: readonly (string | undefined)[]): string[] {
  return Array.from(
    values.reduce((unique, value) => {
      if (value !== undefined) {
        unique.add(value);
      }

      return unique;
    }, new Set<string>()),
  ).sort((left, right) => left.localeCompare(right));
}
