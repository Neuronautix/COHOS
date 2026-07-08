'use client';

import { useMemo } from 'react';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import {
  createOperationalReportCatalog,
  countAvailableExportActions,
  serializeReportRowsToCsv,
  toReportFileName,
  type OperationalReportDescriptor,
  type ReportExportAction,
} from '@cohos/reporting';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';

import { fetchReportDashboard, type ReportDashboardData } from './operations-api';
import {
  createIsaJsonReportPayload,
  getReportJsonPayload,
  getReportRows,
  summarizeReportDashboard,
} from './operations-formatters';
import { OperationsLoadingState, OperationsState } from './operations-states';

export function ReportsOverview() {
  const dashboardQuery = useQuery({
    queryFn: fetchReportDashboard,
    queryKey: ['report-dashboard'],
  });

  const reports = useMemo(() => {
    if (dashboardQuery.data === undefined) {
      return [];
    }

    return createOperationalReportCatalog({
      alerts: dashboardQuery.data.alerts,
      auditEvents: dashboardQuery.data.auditEvents,
      events: dashboardQuery.data.events,
      investigationCount: dashboardQuery.data.investigations.length,
    });
  }, [dashboardQuery.data]);

  if (dashboardQuery.isLoading) {
    return <OperationsLoadingState />;
  }

  if (dashboardQuery.isError) {
    return (
      <OperationsState
        detail={
          dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Request failed.'
        }
        title="Report API unavailable"
      />
    );
  }

  const dashboard = dashboardQuery.data;

  if (dashboard === undefined) {
    return (
      <OperationsState
        detail="No report source data was returned by the configured API."
        title="Report data unavailable"
      />
    );
  }

  const summary = summarizeReportDashboard(dashboard);

  return (
    <div className="operations-page">
      <PageHeader
        eyebrow="Reports"
        summary="Operational report exports for alerts, events, audit records, and research metadata."
        title="Reports"
      />

      <section aria-label="Report metrics" className="metric-grid">
        <MetricTile
          detail="Configured report surfaces"
          label="Reports"
          tone="info"
          value={reports.length.toString()}
        />
        <MetricTile
          detail="Currently downloadable actions"
          label="Exports"
          tone="success"
          value={countAvailableExportActions(reports).toString()}
        />
        <MetricTile
          detail="Operational event rows"
          label="Events"
          tone="neutral"
          value={summary.eventCount.toString()}
        />
        <MetricTile
          detail="Append-only audit rows"
          label="Audit"
          tone="neutral"
          value={summary.auditEventCount.toString()}
        />
      </section>

      <WorkspacePanel title="Export catalog">
        <div className="research-card-list">
          {reports.map((report) => (
            <article className="research-card-list__item" key={report.id}>
              <div>
                <h3>{report.title}</h3>
                <p>
                  {report.description} - {report.sourceCount} source row
                  {report.sourceCount === 1 ? '' : 's'}
                </p>
              </div>
              <StatusBadge tone={report.sourceCount > 0 ? 'success' : 'neutral'}>
                {report.scope}
              </StatusBadge>
              <div className="report-action-list">
                {report.exportActions.map((action) => (
                  <button
                    className="report-action-button"
                    disabled={action.availability !== 'available'}
                    key={action.format}
                    onClick={() => {
                      downloadReport(report, action, dashboard);
                    }}
                    title={action.reason}
                    type="button"
                  >
                    <Download aria-hidden="true" size={15} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </WorkspacePanel>

      <div className="workspace-grid">
        <WorkspacePanel title="Source coverage">
          <dl className="field-list">
            <div>
              <dt>Alerts</dt>
              <dd>{summary.alertCount}</dd>
            </div>
            <div>
              <dt>Subjects</dt>
              <dd>{summary.subjectCount}</dd>
            </div>
            <div>
              <dt>Investigations</dt>
              <dd>{summary.investigationCount}</dd>
            </div>
            <div>
              <dt>Audit events</dt>
              <dd>{summary.auditEventCount}</dd>
            </div>
          </dl>
        </WorkspacePanel>

        <WorkspacePanel title="Export states">
          <div className="research-card-list">
            {reports.flatMap((report) =>
              report.exportActions.map((action) => (
                <article className="research-card-list__item" key={`${report.id}-${action.format}`}>
                  <div>
                    <h3>{action.label}</h3>
                    <p>{report.title}</p>
                  </div>
                  <StatusBadge tone={action.availability === 'available' ? 'success' : 'neutral'}>
                    {action.availability}
                  </StatusBadge>
                </article>
              )),
            )}
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}

function downloadReport(
  report: OperationalReportDescriptor,
  action: ReportExportAction,
  dashboard: ReportDashboardData,
) {
  if (action.availability !== 'available') {
    return;
  }

  if (action.format === 'csv') {
    downloadTextFile(
      toReportFileName(report, action.format),
      serializeReportRowsToCsv(getReportRows(report.id, dashboard)),
      'text/csv',
    );
    return;
  }

  if (action.format === 'json') {
    downloadTextFile(
      toReportFileName(report, action.format),
      JSON.stringify(getReportJsonPayload(report.id, dashboard), null, 2),
      'application/json',
    );
    return;
  }

  if (action.format === 'isa_json') {
    const payload = createIsaJsonReportPayload(dashboard);

    if (payload === undefined) {
      return;
    }

    downloadTextFile(
      toReportFileName(report, action.format),
      JSON.stringify(payload, null, 2),
      'application/json',
    );
  }
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
