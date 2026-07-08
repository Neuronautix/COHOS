'use client';

import Link from 'next/link';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';

import { fetchWelfareDashboard } from './operations-api';
import {
  getEnvironmentalObservations,
  getEventDetail,
  getEventEntityLabel,
  getEventTitle,
  getEventTone,
  getMortalityEvents,
  getOpenAlerts,
  getSeverityTone,
  getWelfareObservations,
  summarizeWelfareDashboard,
} from './operations-formatters';
import { OperationsLoadingState, OperationsState } from './operations-states';

const ruleContexts = [
  {
    detail: 'Configured statuses and score thresholds can create alert review records.',
    label: 'Welfare',
    title: 'Welfare threshold',
  },
  {
    detail: 'Configured count or percentage thresholds can flag mortality review records.',
    label: 'Mortality',
    title: 'Mortality threshold',
  },
  {
    detail: 'Configured metric ranges can flag housing environment review records.',
    label: 'Environment',
    title: 'Environmental threshold',
  },
  {
    detail: 'Weighted event placeholders can surface cumulative review records.',
    label: 'Review',
    title: 'Cumulative review',
  },
];

export function WelfareOverview() {
  const dashboardQuery = useQuery({
    queryFn: fetchWelfareDashboard,
    queryKey: ['welfare-dashboard'],
  });

  if (dashboardQuery.isLoading) {
    return <OperationsLoadingState />;
  }

  if (dashboardQuery.isError) {
    return (
      <OperationsState
        detail={
          dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Request failed.'
        }
        title="Welfare API unavailable"
      />
    );
  }

  const dashboard = dashboardQuery.data;

  if (dashboard === undefined) {
    return (
      <OperationsState
        detail="No welfare or alert data was returned by the configured API."
        title="Welfare data unavailable"
      />
    );
  }

  const summary = summarizeWelfareDashboard(dashboard);
  const careEvents = [
    ...getWelfareObservations(dashboard.events),
    ...getMortalityEvents(dashboard.events),
  ].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  const environmentalEvents = getEnvironmentalObservations(dashboard.events);
  const openAlerts = getOpenAlerts(dashboard.alerts);

  return (
    <div className="operations-page">
      <PageHeader
        eyebrow="Welfare"
        summary="API-backed welfare observations, mortality signals, environmental observations, and alert review."
        title="Welfare"
      />

      <section aria-label="Welfare metrics" className="metric-grid">
        <MetricTile
          detail="Unresolved alert records"
          label="Open alerts"
          tone={summary.openAlertCount > 0 ? 'warning' : 'success'}
          value={summary.openAlertCount.toString()}
        />
        <MetricTile
          detail="Recorded subject checks"
          label="Welfare"
          tone="info"
          value={summary.welfareObservationCount.toString()}
        />
        <MetricTile
          detail="Mortality event records"
          label="Mortality"
          tone={summary.mortalityEventCount > 0 ? 'danger' : 'success'}
          value={summary.mortalityEventCount.toString()}
        />
        <MetricTile
          detail="Housing environment records"
          label="Environment"
          tone="neutral"
          value={summary.environmentalObservationCount.toString()}
        />
      </section>

      <WorkspacePanel title="Rule context">
        <div className="research-card-list">
          {ruleContexts.map((ruleContext) => (
            <article className="research-card-list__item" key={ruleContext.title}>
              <div>
                <h3>{ruleContext.title}</h3>
                <p>{ruleContext.detail}</p>
              </div>
              <StatusBadge tone="neutral">{ruleContext.label}</StatusBadge>
            </article>
          ))}
        </div>
      </WorkspacePanel>

      <div className="workspace-grid">
        <WorkspacePanel title="Alerts">
          {openAlerts.length === 0 ? (
            <div className="inline-empty-state">
              <h3>No open alerts</h3>
              <p>No unresolved alert records were returned by the API.</p>
            </div>
          ) : (
            <div className="research-card-list">
              {openAlerts.map((alert) => (
                <article className="research-card-list__item" key={alert.id}>
                  <div>
                    <h3>{alert.title}</h3>
                    <p>
                      {alert.entityType} - {alert.entityId}
                    </p>
                  </div>
                  <StatusBadge tone={getSeverityTone(alert.severity)}>{alert.severity}</StatusBadge>
                  {alert.entityType === 'subject' ? (
                    <Link className="icon-link" href={`/subjects/${alert.entityId}`}>
                      Subject
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel title="Derived states">
          <div className="research-card-list">
            {dashboard.subjectStates.map((state) => (
              <article className="research-card-list__item" key={state.subjectId}>
                <div>
                  <h3>{state.subjectId}</h3>
                  <p>
                    {state.currentHousingUnitId ?? 'No housing'} - {state.aliveStatus}
                    {state.batchCount === undefined ? '' : ` - batch ${state.batchCount}`}
                  </p>
                </div>
                <StatusBadge tone={state.alertFlags.length > 0 ? 'warning' : 'success'}>
                  {state.alertFlags.length} flag{state.alertFlags.length === 1 ? '' : 's'}
                </StatusBadge>
                <Link className="icon-link" href={`/subjects/${state.subjectId}`}>
                  Subject
                </Link>
              </article>
            ))}
            {dashboard.housingStates.map((state) => (
              <article className="research-card-list__item" key={state.housingUnitId}>
                <div>
                  <h3>{state.housingUnitId}</h3>
                  <p>{state.latestEnvironmentalObservationId ?? 'No recent environment record'}</p>
                </div>
                <StatusBadge tone={state.alertFlags.length > 0 ? 'info' : 'neutral'}>
                  {state.alertFlags.length} flag{state.alertFlags.length === 1 ? '' : 's'}
                </StatusBadge>
                <Link
                  className="icon-link"
                  href={`/facilities/housing-units/${state.housingUnitId}`}
                >
                  Housing
                </Link>
              </article>
            ))}
          </div>
        </WorkspacePanel>
      </div>

      <div className="workspace-grid">
        <WorkspacePanel title="Welfare and mortality events">
          <EventList events={careEvents} />
        </WorkspacePanel>

        <WorkspacePanel title="Environmental observations">
          <EventList events={environmentalEvents} />
        </WorkspacePanel>
      </div>
    </div>
  );
}

function EventList({
  events,
}: {
  readonly events: readonly Parameters<typeof getEventTitle>[0][];
}) {
  if (events.length === 0) {
    return (
      <div className="inline-empty-state">
        <h3>No events</h3>
        <p>No matching operational events were returned by the API.</p>
      </div>
    );
  }

  return (
    <div className="research-card-list">
      {events.map((event) => (
        <article className="research-card-list__item" key={event.id}>
          <div>
            <h3>{getEventTitle(event)}</h3>
            <p>
              {getEventEntityLabel(event)} - {getEventDetail(event)}
            </p>
          </div>
          <StatusBadge tone={getEventTone(event)}>{event.eventType}</StatusBadge>
          {event.subjectId === undefined ? null : (
            <Link className="icon-link" href={`/subjects/${event.subjectId}`}>
              Subject
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
