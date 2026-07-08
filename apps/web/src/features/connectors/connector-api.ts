import { z } from 'zod';

import {
  connectorConfigSchema,
  connectorHealthCheckResultSchema,
  connectorPullResultSchema,
  connectorPushResultSchema,
  connectorResourceStatusSchema,
  metadatappConnectorSettingsUpdateSchema,
  type ConnectorConfig,
  type ConnectorHealthCheckResult,
  type ConnectorPullResult,
  type ConnectorPushResult,
  type MetadatappConnectorSettingsUpdate,
} from '@cohos/connectors';
import {
  connectedResourceLinkSchema,
  investigationDetailSchema,
  subjectWithProfileSchema,
  type ConnectedResourceLink,
  type InvestigationDetail,
  type SubjectWithProfile,
} from '@cohos/domain';

import { fetchFromApi } from '../../lib/api-client';

const connectorDashboardSchema = z.strictObject({
  connectedResources: connectedResourceLinkSchema.array(),
  connectors: connectorConfigSchema.array(),
  healthChecks: connectorHealthCheckResultSchema.array(),
  resourceStatuses: connectorResourceStatusSchema.array(),
});
const investigationListSchema = investigationDetailSchema.array();
const subjectListSchema = subjectWithProfileSchema.array();

export type ConnectorDashboardData = z.infer<typeof connectorDashboardSchema>;

export type ConnectorExportSourceData = {
  readonly investigations: readonly InvestigationDetail[];
  readonly subjects: readonly SubjectWithProfile[];
};

export async function fetchConnectorDashboard(): Promise<ConnectorDashboardData> {
  const payload = await fetchFromApi<unknown>('/connectors/dashboard');

  return connectorDashboardSchema.parse(payload);
}

export async function fetchConnectorExportSource(): Promise<ConnectorExportSourceData> {
  const [investigationsPayload, subjectsPayload] = await Promise.all([
    fetchFromApi<unknown>('/investigations'),
    fetchFromApi<unknown>('/subjects'),
  ]);

  return {
    investigations: investigationListSchema.parse(investigationsPayload),
    subjects: subjectListSchema.parse(subjectsPayload),
  };
}

export async function updateConnectorSettings(
  connectorId: string,
  input: MetadatappConnectorSettingsUpdate,
): Promise<ConnectorConfig> {
  const payload = await fetchFromApi<unknown>(`/connectors/${encodeURIComponent(connectorId)}`, {
    body: JSON.stringify(metadatappConnectorSettingsUpdateSchema.parse(input)),
    headers: {
      'content-type': 'application/json',
    },
    method: 'PATCH',
  });

  return connectorConfigSchema.parse(payload);
}

export async function runConnectorHealthCheck(
  connectorId: string,
): Promise<ConnectorHealthCheckResult> {
  const payload = await fetchFromApi<unknown>(
    `/connectors/${encodeURIComponent(connectorId)}/health-check`,
    {
      method: 'POST',
    },
  );

  return connectorHealthCheckResultSchema.parse(payload);
}

export async function runConnectorPush(connectorId: string): Promise<ConnectorPushResult> {
  const payload = await fetchFromApi<unknown>(
    `/connectors/${encodeURIComponent(connectorId)}/push`,
    {
      method: 'POST',
    },
  );

  return connectorPushResultSchema.parse(payload);
}

export async function runConnectorPull(connectorId: string): Promise<ConnectorPullResult> {
  const payload = await fetchFromApi<unknown>(
    `/connectors/${encodeURIComponent(connectorId)}/pull`,
    {
      method: 'POST',
    },
  );

  return connectorPullResultSchema.parse(payload);
}

export type { ConnectedResourceLink };
