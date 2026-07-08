'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import type { ConnectorPullResult, ConnectorPushResult } from '@cohos/connectors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Download, ExternalLink, RefreshCw, Save, UploadCloud } from 'lucide-react';

import {
  fetchConnectorDashboard,
  fetchConnectorExportSource,
  runConnectorHealthCheck,
  runConnectorPull,
  runConnectorPush,
  updateConnectorSettings,
} from './connector-api';
import {
  createConnectorIsaJsonPayload,
  formatConnectorResultSummary,
  formatConnectorToken,
  getConnectorHealthTone,
  getConnectorResourceTone,
  getConnectorResultWarnings,
  getConnectorSyncTone,
  getHealthForConnector,
  getPreferredConnector,
  summarizeConnectorDashboard,
} from './connector-formatters';
import { ConnectorLoadingState, ConnectorState } from './connector-states';

type ConnectorSettingsFormState = {
  readonly baseUrl: string;
  readonly credentialReference: string;
  readonly displayName: string;
  readonly enabled: boolean;
  readonly workspaceId: string;
};

const emptySettings: ConnectorSettingsFormState = {
  baseUrl: '',
  credentialReference: '',
  displayName: '',
  enabled: true,
  workspaceId: '',
};

export function ConnectorsOverview() {
  const queryClient = useQueryClient();
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>();
  const [settings, setSettings] = useState<ConnectorSettingsFormState>(emptySettings);

  const dashboardQuery = useQuery({
    queryFn: fetchConnectorDashboard,
    queryKey: ['connector-dashboard'],
  });
  const exportSourceQuery = useQuery({
    queryFn: fetchConnectorExportSource,
    queryKey: ['connector-export-source'],
  });

  const dashboard = dashboardQuery.data;
  const connector = useMemo(
    () => getPreferredConnector(dashboard?.connectors ?? [], selectedConnectorId),
    [dashboard?.connectors, selectedConnectorId],
  );
  const dashboardHealth = getHealthForConnector(dashboard?.healthChecks ?? [], connector);

  useEffect(() => {
    if (connector === undefined) {
      return;
    }

    setSelectedConnectorId((current) => current ?? connector.id);
    setSettings(toSettingsState(connector));
  }, [connector]);

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      if (connector === undefined) {
        throw new Error('No connector selected.');
      }

      return updateConnectorSettings(connector.id, {
        baseUrl: settings.baseUrl.trim() || undefined,
        credentialReference: settings.credentialReference,
        displayName: settings.displayName,
        enabled: settings.enabled,
        workspaceId: settings.workspaceId.trim() || undefined,
      });
    },
    onSuccess: async (updatedConnector) => {
      setSelectedConnectorId(updatedConnector.id);
      await queryClient.invalidateQueries({ queryKey: ['connector-dashboard'] });
    },
  });
  const healthCheckMutation = useMutation({
    mutationFn: async () => {
      if (connector === undefined) {
        throw new Error('No connector selected.');
      }

      return runConnectorHealthCheck(connector.id);
    },
  });
  const pushMutation = useMutation({
    mutationFn: async () => {
      if (connector === undefined) {
        throw new Error('No connector selected.');
      }

      return runConnectorPush(connector.id);
    },
  });
  const pullMutation = useMutation({
    mutationFn: async () => {
      if (connector === undefined) {
        throw new Error('No connector selected.');
      }

      return runConnectorPull(connector.id);
    },
  });

  if (dashboardQuery.isLoading) {
    return <ConnectorLoadingState />;
  }

  if (dashboardQuery.isError) {
    return (
      <ConnectorState
        detail={
          dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Request failed.'
        }
        title="Connector API unavailable"
      />
    );
  }

  if (dashboard === undefined || connector === undefined) {
    return (
      <ConnectorState
        detail="No connector settings were returned by the configured API."
        title="No connectors found"
      />
    );
  }

  const summary = summarizeConnectorDashboard(dashboard);
  const latestHealth = healthCheckMutation.data ?? dashboardHealth;
  const latestPush = pushMutation.data;
  const latestPull = pullMutation.data;
  const canExportIsaJson =
    exportSourceQuery.data !== undefined && exportSourceQuery.data.investigations.length > 0;

  return (
    <div className="connectors-page">
      <PageHeader
        eyebrow="Connectors"
        summary="Reference-only connector settings, health checks, sync placeholders, and ISA export workflow."
        title="Connector settings"
      />

      <section aria-label="Connector metrics" className="metric-grid">
        <MetricTile
          detail="Configured provider skeletons"
          label="Connectors"
          tone="info"
          value={summary.connectorCount.toString()}
        />
        <MetricTile
          detail="Passing health checks"
          label="Ready"
          tone={summary.readyCount > 0 ? 'success' : 'warning'}
          value={summary.readyCount.toString()}
        />
        <MetricTile
          detail="Mapped external records"
          label="Resources"
          tone={summary.linkedResourceCount > 0 ? 'success' : 'neutral'}
          value={summary.linkedResourceCount.toString()}
        />
        <MetricTile
          detail="Available export actions"
          label="Exports"
          tone={summary.exportActionCount > 0 ? 'success' : 'neutral'}
          value={summary.exportActionCount.toString()}
        />
      </section>

      <div className="workspace-grid">
        <WorkspacePanel title="Settings">
          <form
            className="connector-settings-form"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              saveSettingsMutation.mutate();
            }}
          >
            <label>
              <span>Connector</span>
              <select
                onChange={(event) => {
                  setSelectedConnectorId(event.target.value);
                }}
                value={connector.id}
              >
                {dashboard.connectors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Display name</span>
              <input
                onChange={(event) => {
                  setSettings((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }));
                }}
                type="text"
                value={settings.displayName}
              />
            </label>
            <label>
              <span>Credential reference</span>
              <input
                onChange={(event) => {
                  setSettings((current) => ({
                    ...current,
                    credentialReference: event.target.value,
                  }));
                }}
                type="text"
                value={settings.credentialReference}
              />
            </label>
            <label>
              <span>Base URL</span>
              <input
                onChange={(event) => {
                  setSettings((current) => ({
                    ...current,
                    baseUrl: event.target.value,
                  }));
                }}
                type="url"
                value={settings.baseUrl}
              />
            </label>
            <label>
              <span>Workspace ID</span>
              <input
                onChange={(event) => {
                  setSettings((current) => ({
                    ...current,
                    workspaceId: event.target.value,
                  }));
                }}
                type="text"
                value={settings.workspaceId}
              />
            </label>
            <label className="checkbox-field">
              <input
                checked={settings.enabled}
                onChange={(event) => {
                  setSettings((current) => ({
                    ...current,
                    enabled: event.target.checked,
                  }));
                }}
                type="checkbox"
              />
              <span>Enabled</span>
            </label>
            <div className="connector-action-row">
              <button
                className="report-action-button"
                disabled={saveSettingsMutation.isPending}
                type="submit"
              >
                <Save aria-hidden="true" size={15} />
                <span>{saveSettingsMutation.isPending ? 'Saving' : 'Save'}</span>
              </button>
              <button
                className="report-action-button"
                disabled={healthCheckMutation.isPending}
                onClick={() => {
                  healthCheckMutation.mutate();
                }}
                type="button"
              >
                <Activity aria-hidden="true" size={15} />
                <span>{healthCheckMutation.isPending ? 'Checking' : 'Health'}</span>
              </button>
            </div>
            <MutationError error={saveSettingsMutation.error ?? healthCheckMutation.error} />
          </form>
        </WorkspacePanel>

        <WorkspacePanel title="Health check">
          {latestHealth === undefined ? (
            <div className="inline-empty-state">
              <h3>No health result</h3>
              <p>Health check has not returned a result.</p>
            </div>
          ) : (
            <article className="connector-status-card">
              <div>
                <h3>{formatConnectorToken(latestHealth.connectorType)}</h3>
                <p>{latestHealth.message}</p>
              </div>
              <StatusBadge tone={getConnectorHealthTone(latestHealth.status)}>
                {formatConnectorToken(latestHealth.status)}
              </StatusBadge>
              <dl className="field-list">
                <div>
                  <dt>Checked</dt>
                  <dd>{latestHealth.checkedAt}</dd>
                </div>
                <div>
                  <dt>Credential</dt>
                  <dd>{latestHealth.credentialReference ?? 'Reference unavailable'}</dd>
                </div>
              </dl>
            </article>
          )}
        </WorkspacePanel>
      </div>

      <div className="workspace-grid">
        <WorkspacePanel title="Sync placeholders">
          <div className="connector-action-row">
            <button
              className="report-action-button"
              disabled={pushMutation.isPending}
              onClick={() => {
                pushMutation.mutate();
              }}
              type="button"
            >
              <UploadCloud aria-hidden="true" size={15} />
              <span>{pushMutation.isPending ? 'Pushing' : 'Push'}</span>
            </button>
            <button
              className="report-action-button"
              disabled={pullMutation.isPending}
              onClick={() => {
                pullMutation.mutate();
              }}
              type="button"
            >
              <RefreshCw aria-hidden="true" size={15} />
              <span>{pullMutation.isPending ? 'Pulling' : 'Pull'}</span>
            </button>
          </div>
          <div className="connector-result-grid">
            <ConnectorResultCard label="Push" result={latestPush} />
            <ConnectorResultCard label="Pull" result={latestPull} />
          </div>
          <MutationError error={pushMutation.error ?? pullMutation.error} />
        </WorkspacePanel>

        <WorkspacePanel title="ISA export">
          <div className="connector-status-card">
            <div>
              <h3>Research metadata</h3>
              <p>
                {exportSourceQuery.data?.investigations.length ?? 0} investigation
                {(exportSourceQuery.data?.investigations.length ?? 0) === 1 ? '' : 's'} and{' '}
                {exportSourceQuery.data?.subjects.length ?? 0} subject
                {(exportSourceQuery.data?.subjects.length ?? 0) === 1 ? '' : 's'}
              </p>
            </div>
            <button
              className="report-action-button"
              disabled={!canExportIsaJson}
              onClick={() => {
                const payload =
                  exportSourceQuery.data === undefined
                    ? undefined
                    : createConnectorIsaJsonPayload(exportSourceQuery.data);

                if (payload !== undefined) {
                  downloadTextFile(
                    'connector-isa-json-export.json',
                    JSON.stringify(payload, null, 2),
                    'application/json',
                  );
                }
              }}
              type="button"
            >
              <Download aria-hidden="true" size={15} />
              <span>ISA JSON</span>
            </button>
          </div>
          {exportSourceQuery.isError ? (
            <div className="inline-empty-state">
              <h3>Export source unavailable</h3>
              <p>
                {exportSourceQuery.error instanceof Error
                  ? exportSourceQuery.error.message
                  : 'Request failed.'}
              </p>
            </div>
          ) : null}
        </WorkspacePanel>
      </div>

      <WorkspacePanel title="Connected resource status">
        <div className="research-card-list">
          {dashboard.resourceStatuses.map((status) => (
            <article className="research-card-list__item" key={status.linkId}>
              <div>
                <h3>{status.label}</h3>
                <p>
                  {status.entityType} {status.entityId} - {status.message}
                </p>
              </div>
              <StatusBadge tone={getConnectorResourceTone(status.status)}>
                {formatConnectorToken(status.status)}
              </StatusBadge>
              {status.externalUrl === undefined ? (
                <StatusBadge tone="neutral">{formatConnectorToken(status.source)}</StatusBadge>
              ) : (
                <a className="icon-link" href={status.externalUrl} rel="noreferrer" target="_blank">
                  <span>{formatConnectorToken(status.source)}</span>
                  <ExternalLink aria-hidden="true" size={16} />
                </a>
              )}
            </article>
          ))}
        </div>
      </WorkspacePanel>
    </div>
  );
}

function ConnectorResultCard({
  label,
  result,
}: {
  readonly label: string;
  readonly result: ConnectorPullResult | ConnectorPushResult | undefined;
}) {
  const warnings = getConnectorResultWarnings(result);

  return (
    <article className="connector-status-card">
      <div>
        <h3>{label}</h3>
        <p>{formatConnectorResultSummary(result)}</p>
      </div>
      <StatusBadge tone={result === undefined ? 'neutral' : getConnectorSyncTone(result.status)}>
        {result === undefined ? 'Not run' : formatConnectorToken(result.status)}
      </StatusBadge>
      {warnings.length === 0 ? null : (
        <ul className="connector-warning-list">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function MutationError({ error }: { readonly error: unknown }) {
  if (error === null || error === undefined) {
    return null;
  }

  return (
    <div className="inline-empty-state">
      <h3>Request failed</h3>
      <p>{error instanceof Error ? error.message : 'Request failed.'}</p>
    </div>
  );
}

function toSettingsState(connector: {
  readonly baseUrl?: string;
  readonly credentialReference: string;
  readonly displayName: string;
  readonly enabled?: boolean;
  readonly workspaceId?: string;
}): ConnectorSettingsFormState {
  return {
    baseUrl: connector.baseUrl ?? '',
    credentialReference: connector.credentialReference,
    displayName: connector.displayName,
    enabled: connector.enabled ?? true,
    workspaceId: connector.workspaceId ?? '',
  };
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
