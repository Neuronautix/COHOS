import type {
  ConnectorConfig,
  ConnectorHealthCheckResult,
  ConnectorPullResult,
  ConnectorPushResult,
  ConnectorResourceStatus,
  ConnectorSyncStatus,
} from '@cohos/connectors';
import { createIsaJsonExport, type IsaJsonExport } from '@cohos/isa';
import type { StatusTone } from '@cohos/ui';

import type { ConnectorDashboardData, ConnectorExportSourceData } from './connector-api';

export type ConnectorSummary = {
  readonly connectorCount: number;
  readonly exportActionCount: number;
  readonly linkedResourceCount: number;
  readonly readyCount: number;
};

export function formatConnectorToken(value: string): string {
  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getConnectorHealthTone(status: ConnectorHealthCheckResult['status']): StatusTone {
  switch (status) {
    case 'ready':
      return 'success';
    case 'not_configured':
      return 'warning';
    case 'unavailable':
      return 'danger';
  }
}

export function getConnectorSyncTone(status: ConnectorSyncStatus): StatusTone {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'skipped':
      return 'warning';
    case 'failed':
      return 'danger';
  }
}

export function getConnectorResourceTone(status: ConnectorResourceStatus['status']): StatusTone {
  return status === 'linked' ? 'success' : 'warning';
}

export function summarizeConnectorDashboard(input: ConnectorDashboardData): ConnectorSummary {
  return {
    connectorCount: input.connectors.length,
    exportActionCount: input.connectors.length > 0 ? 1 : 0,
    linkedResourceCount: input.resourceStatuses.filter((status) => status.status === 'linked')
      .length,
    readyCount: input.healthChecks.filter((health) => health.status === 'ready').length,
  };
}

export function getPreferredConnector(
  connectors: readonly ConnectorConfig[],
  selectedConnectorId: string | undefined,
): ConnectorConfig | undefined {
  return connectors.find((connector) => connector.id === selectedConnectorId) ?? connectors[0];
}

export function getHealthForConnector(
  healthChecks: readonly ConnectorHealthCheckResult[],
  connector: ConnectorConfig | undefined,
): ConnectorHealthCheckResult | undefined {
  if (connector === undefined) {
    return undefined;
  }

  return healthChecks.find((health) => health.connectorType === connector.connectorType);
}

export function formatConnectorResultSummary(
  result: ConnectorPushResult | ConnectorPullResult | undefined,
): string {
  if (result === undefined) {
    return 'No run recorded';
  }

  if (result.operation === 'push') {
    return `${result.acceptedRecords.length} accepted, ${result.skippedRecords.length} skipped`;
  }

  return `${result.records.length} records returned`;
}

export function getConnectorResultWarnings(
  result: ConnectorPushResult | ConnectorPullResult | undefined,
): readonly string[] {
  return result?.warnings ?? [];
}

export function createConnectorIsaJsonPayload(
  input: ConnectorExportSourceData,
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
