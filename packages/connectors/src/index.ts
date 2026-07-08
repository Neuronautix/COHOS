import { z } from 'zod';

import {
  type ConnectedResourceLink,
  type InvestigationDetail,
  connectorCredentialSchema,
  entityIdSchema,
  isoDateTimeSchema,
  metadataObjectSchema,
} from '@cohos/domain';

export const connectorsPackageName = '@cohos/connectors';

export type ConnectorsPackageName = typeof connectorsPackageName;

export const connectorTypeSchema = z.enum(['metadatapp']);
export const connectorEntityTypeSchema = z.enum([
  'investigation',
  'study',
  'assay',
  'subject',
  'sample',
  'dataset',
  'connected_resource',
]);
export const connectorOperationSchema = z.enum(['health_check', 'push', 'pull']);
export const connectorHealthStatusSchema = z.enum(['ready', 'not_configured', 'unavailable']);
export const connectorSyncStatusSchema = z.enum(['accepted', 'skipped', 'failed']);
export const connectorResourceSyncStatusSchema = z.enum(['linked', 'pending_review']);
export const connectorErrorCodeSchema = z.enum([
  'configuration_invalid',
  'credentials_missing',
  'credentials_unavailable',
  'network_unavailable',
  'remote_validation_failed',
  'unsupported_operation',
]);

export const credentialReferenceSchema = z
  .string()
  .trim()
  .regex(
    /^(?:secret:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+|vault:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+|keyring:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+|env:[A-Z][A-Z0-9_]*)$/,
    'Credential value must be a secret, vault, keyring, or env reference',
  );

const connectorConfigBaseSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  connectorType: connectorTypeSchema,
  displayName: z.string().trim().min(1),
  enabled: z.boolean().default(true),
  credentialReference: credentialReferenceSchema,
  createdAt: isoDateTimeSchema.optional(),
  metadata: metadataObjectSchema.default({}),
});

export const metadatappConnectorConfigSchema = connectorConfigBaseSchema.extend({
  connectorType: z.literal('metadatapp'),
  baseUrl: z.string().url().optional(),
  workspaceId: z.string().trim().min(1).optional(),
});

export const connectorConfigSchema = z.discriminatedUnion('connectorType', [
  metadatappConnectorConfigSchema,
]);

export const metadatappConnectorSettingsUpdateSchema = z.strictObject({
  displayName: z.string().trim().min(1).optional(),
  enabled: z.boolean().optional(),
  credentialReference: credentialReferenceSchema.optional(),
  baseUrl: z.string().url().optional(),
  workspaceId: z.string().trim().min(1).optional(),
  metadata: metadataObjectSchema.optional(),
});

export const connectorCredentialReferenceSchema = connectorCredentialSchema.extend({
  credentialReference: credentialReferenceSchema,
});

export const connectorErrorSchema = z.strictObject({
  code: connectorErrorCodeSchema,
  message: z.string().trim().min(1),
  retryable: z.boolean().default(false),
  details: metadataObjectSchema.default({}),
});

export const connectorRecordSchema = z.strictObject({
  entityType: connectorEntityTypeSchema,
  entityId: entityIdSchema,
  payload: metadataObjectSchema,
  externalId: z.string().trim().min(1).optional(),
});

export const connectorHealthCheckResultSchema = z.strictObject({
  connectorType: connectorTypeSchema,
  checkedAt: isoDateTimeSchema,
  status: connectorHealthStatusSchema,
  message: z.string().trim().min(1),
  credentialReference: credentialReferenceSchema.optional(),
  errors: z.array(connectorErrorSchema).default([]),
});

export const connectorPushResultSchema = z.strictObject({
  connectorType: connectorTypeSchema,
  operation: z.literal('push'),
  status: connectorSyncStatusSchema,
  acceptedRecords: z.array(connectorRecordSchema).default([]),
  skippedRecords: z.array(connectorRecordSchema).default([]),
  errors: z.array(connectorErrorSchema).default([]),
  warnings: z.array(z.string().trim().min(1)).default([]),
});

export const connectorPullResultSchema = z.strictObject({
  connectorType: connectorTypeSchema,
  operation: z.literal('pull'),
  status: connectorSyncStatusSchema,
  records: z.array(connectorRecordSchema).default([]),
  errors: z.array(connectorErrorSchema).default([]),
  warnings: z.array(z.string().trim().min(1)).default([]),
});

export const connectorResourceStatusSchema = z.strictObject({
  connectorType: connectorTypeSchema,
  entityType: connectorEntityTypeSchema,
  entityId: entityIdSchema,
  externalUrl: z.string().url().optional(),
  label: z.string().trim().min(1),
  linkId: entityIdSchema,
  message: z.string().trim().min(1),
  source: z.string().trim().min(1),
  status: connectorResourceSyncStatusSchema,
});

export type ConnectorType = z.infer<typeof connectorTypeSchema>;
export type ConnectorEntityType = z.infer<typeof connectorEntityTypeSchema>;
export type ConnectorOperation = z.infer<typeof connectorOperationSchema>;
export type ConnectorHealthStatus = z.infer<typeof connectorHealthStatusSchema>;
export type ConnectorSyncStatus = z.infer<typeof connectorSyncStatusSchema>;
export type ConnectorResourceSyncStatus = z.infer<typeof connectorResourceSyncStatusSchema>;
export type ConnectorErrorCode = z.infer<typeof connectorErrorCodeSchema>;
export type CredentialReference = z.infer<typeof credentialReferenceSchema>;
export type MetadatappConnectorConfig = z.infer<typeof metadatappConnectorConfigSchema>;
export type MetadatappConnectorSettingsUpdate = z.infer<
  typeof metadatappConnectorSettingsUpdateSchema
>;
export type ConnectorConfig = z.infer<typeof connectorConfigSchema>;
export type ConnectorError = z.infer<typeof connectorErrorSchema>;
export type ConnectorRecord = z.infer<typeof connectorRecordSchema>;
export type ConnectorHealthCheckResult = z.infer<typeof connectorHealthCheckResultSchema>;
export type ConnectorPushResult = z.infer<typeof connectorPushResultSchema>;
export type ConnectorPullResult = z.infer<typeof connectorPullResultSchema>;
export type ConnectorResourceStatus = z.infer<typeof connectorResourceStatusSchema>;

export type ConnectorPushInput = {
  readonly records: readonly ConnectorRecord[];
};

export type ConnectorPullInput = {
  readonly entityTypes?: readonly ConnectorEntityType[];
  readonly since?: string;
};

export type ConnectorAdapter = {
  readonly connectorType: ConnectorType;
  readonly config: ConnectorConfig;
  healthCheck(checkedAt?: string): Promise<ConnectorHealthCheckResult>;
  push(input: ConnectorPushInput): Promise<ConnectorPushResult>;
  pull(input?: ConnectorPullInput): Promise<ConnectorPullResult>;
};

function placeholderWarning(config: MetadatappConnectorConfig): string {
  const target = config.baseUrl ?? 'unconfigured Metadatapp base URL';

  return `Metadatapp connector skeleton accepted the request locally; no network call was made to ${target}.`;
}

export function createConnectorRecord(input: ConnectorRecord): ConnectorRecord {
  return connectorRecordSchema.parse(input);
}

export function updateMetadatappConnectorConfig(
  config: MetadatappConnectorConfig,
  input: MetadatappConnectorSettingsUpdate,
): MetadatappConnectorConfig {
  const update = metadatappConnectorSettingsUpdateSchema.parse(input);

  return metadatappConnectorConfigSchema.parse({
    ...config,
    ...update,
    metadata:
      update.metadata === undefined ? config.metadata : { ...config.metadata, ...update.metadata },
  });
}

export function mapInvestigationToMetadatappRecord(
  investigation: InvestigationDetail,
): ConnectorRecord {
  return createConnectorRecord({
    entityType: 'investigation',
    entityId: investigation.id,
    payload: {
      sourceSystem: 'COHOS',
      investigationId: investigation.id,
      title: investigation.title,
      description: investigation.description,
      studies: investigation.studies.map((study) => ({
        studyId: study.id,
        title: study.title,
        assays: study.assays.map((assay) => ({
          assayId: assay.id,
          title: assay.title,
          measurementType: assay.measurementType,
          technologyType: assay.technologyType,
        })),
      })),
    },
  });
}

export function mapConnectedResourceToConnectorRecord(
  link: ConnectedResourceLink,
): ConnectorRecord {
  return createConnectorRecord({
    entityType: 'connected_resource',
    entityId: link.id,
    payload: {
      entityType: link.entityType,
      entityId: link.entityId,
      label: link.label,
      url: link.url,
      metadata: link.metadata,
    },
  });
}

export function mapConnectedResourceToConnectorStatus(
  link: ConnectedResourceLink,
): ConnectorResourceStatus {
  const source = getMetadataString(link.metadata, 'source') ?? 'unknown';
  const normalizedSource = source.toLowerCase();
  const isMetadatappLink = normalizedSource === 'metadatapp';

  return connectorResourceStatusSchema.parse({
    connectorType: 'metadatapp',
    entityType: link.entityType,
    entityId: link.entityId,
    externalUrl: link.url,
    label: link.label,
    linkId: link.id,
    message: isMetadatappLink
      ? 'Connected resource is mapped to the Metadatapp connector skeleton.'
      : 'Connected resource is visible but not mapped to an active connector skeleton.',
    source,
    status: isMetadatappLink ? 'linked' : 'pending_review',
  });
}

export class MetadatappConnector implements ConnectorAdapter {
  readonly connectorType = 'metadatapp' as const;
  readonly config: MetadatappConnectorConfig;

  constructor(config: unknown) {
    this.config = metadatappConnectorConfigSchema.parse(config);
  }

  healthCheck(checkedAt = new Date().toISOString()): Promise<ConnectorHealthCheckResult> {
    return Promise.resolve(
      connectorHealthCheckResultSchema.parse({
        connectorType: this.connectorType,
        checkedAt,
        status: this.config.enabled ? 'ready' : 'not_configured',
        message: this.config.enabled
          ? 'Metadatapp connector configuration is valid. Live credential resolution is intentionally deferred.'
          : 'Metadatapp connector is disabled.',
        credentialReference: this.config.credentialReference,
        errors: [],
      }),
    );
  }

  push(input: ConnectorPushInput): Promise<ConnectorPushResult> {
    const acceptedRecords = input.records.map((record) => connectorRecordSchema.parse(record));

    return Promise.resolve(
      connectorPushResultSchema.parse({
        connectorType: this.connectorType,
        operation: 'push',
        status: acceptedRecords.length === 0 ? 'skipped' : 'accepted',
        acceptedRecords,
        skippedRecords: [],
        errors: [],
        warnings: [placeholderWarning(this.config)],
      }),
    );
  }

  pull(input: ConnectorPullInput = {}): Promise<ConnectorPullResult> {
    return Promise.resolve(
      connectorPullResultSchema.parse({
        connectorType: this.connectorType,
        operation: 'pull',
        status: 'skipped',
        records: [],
        errors: [],
        warnings: [
          placeholderWarning(this.config),
          `Pull filters were recorded but not sent: ${JSON.stringify(input)}`,
        ],
      }),
    );
  }
}

export function createMetadatappConnector(config: unknown): MetadatappConnector {
  return new MetadatappConnector(config);
}

function getMetadataString(
  metadata: ConnectedResourceLink['metadata'],
  key: string,
): string | undefined {
  const value = metadata[key];

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
