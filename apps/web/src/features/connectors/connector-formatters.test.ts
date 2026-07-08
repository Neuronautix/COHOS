import { describe, expect, it } from 'vitest';

import {
  connectorConfigSchema,
  connectorHealthCheckResultSchema,
  connectorPullResultSchema,
  connectorPushResultSchema,
  connectorResourceStatusSchema,
} from '@cohos/connectors';
import {
  connectedResourceLinkSchema,
  investigationDetailSchema,
  subjectWithProfileSchema,
} from '@cohos/domain';

import {
  createConnectorIsaJsonPayload,
  formatConnectorResultSummary,
  getConnectorHealthTone,
  getConnectorResourceTone,
  getConnectorResultWarnings,
  getConnectorSyncTone,
  getHealthForConnector,
  getPreferredConnector,
  summarizeConnectorDashboard,
} from './connector-formatters';

const connector = connectorConfigSchema.parse({
  id: 'connector-metadatapp-test',
  organizationId: 'org-synthetic-cohos',
  connectorType: 'metadatapp',
  displayName: 'Synthetic Metadatapp connector',
  credentialReference: 'secret://cohos/synthetic/metadatapp',
  baseUrl: 'https://metadatapp.example.test',
  workspaceId: 'workspace-synthetic',
});

const healthCheck = connectorHealthCheckResultSchema.parse({
  checkedAt: '2026-07-08T16:30:00Z',
  connectorType: 'metadatapp',
  credentialReference: connector.credentialReference,
  errors: [],
  message: 'Metadatapp connector configuration is valid.',
  status: 'ready',
});

const connectedResource = connectedResourceLinkSchema.parse({
  id: 'link-synthetic-protocol-test',
  organizationId: 'org-synthetic-cohos',
  entityType: 'study',
  entityId: 'study-synthetic-test',
  label: 'Synthetic protocol',
  url: 'https://example.test/protocol',
  metadata: {
    source: 'metadatapp',
  },
});

const resourceStatus = connectorResourceStatusSchema.parse({
  connectorType: 'metadatapp',
  entityType: 'study',
  entityId: 'study-synthetic-test',
  externalUrl: 'https://example.test/protocol',
  label: 'Synthetic protocol',
  linkId: 'link-synthetic-protocol-test',
  message: 'Connected resource is mapped to the Metadatapp connector skeleton.',
  source: 'metadatapp',
  status: 'linked',
});

const pushResult = connectorPushResultSchema.parse({
  acceptedRecords: [
    {
      entityType: 'investigation',
      entityId: 'investigation-synthetic-test',
      payload: {
        title: 'Synthetic investigation',
      },
    },
  ],
  connectorType: 'metadatapp',
  errors: [],
  operation: 'push',
  skippedRecords: [],
  status: 'accepted',
  warnings: ['Metadatapp connector skeleton accepted the request locally.'],
});

const pullResult = connectorPullResultSchema.parse({
  connectorType: 'metadatapp',
  errors: [],
  operation: 'pull',
  records: [],
  status: 'skipped',
  warnings: ['Pull filters were recorded but not sent.'],
});

const humanSubject = subjectWithProfileSchema.parse({
  id: 'subject-human-pseudo-test',
  organizationId: 'org-synthetic-cohos',
  subjectCode: 'HUM-PSEUDO-T',
  profileType: 'human',
  status: 'active',
  profile: {
    profileType: 'human',
    pseudonymizedSubjectCode: 'HUM-PSEUDO-T',
    consentStatus: 'consented',
    studyParticipationStatus: 'enrolled',
  },
});

const investigation = investigationDetailSchema.parse({
  id: 'investigation-synthetic-test',
  organizationId: 'org-synthetic-cohos',
  title: 'Synthetic investigation',
  studies: [
    {
      id: 'study-synthetic-test',
      investigationId: 'investigation-synthetic-test',
      title: 'Synthetic study',
      subjectIds: ['subject-human-pseudo-test'],
      cohortIds: [],
      assays: [],
      connectedResources: [connectedResource],
    },
  ],
  connectedResources: [],
});

describe('connector formatters', () => {
  it('summarizes connector dashboard health and linked resources', () => {
    expect(
      summarizeConnectorDashboard({
        connectedResources: [connectedResource],
        connectors: [connector],
        healthChecks: [healthCheck],
        resourceStatuses: [resourceStatus],
      }),
    ).toEqual({
      connectorCount: 1,
      exportActionCount: 1,
      linkedResourceCount: 1,
      readyCount: 1,
    });
  });

  it('maps connector statuses to badge tones', () => {
    expect(getConnectorHealthTone('ready')).toBe('success');
    expect(getConnectorHealthTone('not_configured')).toBe('warning');
    expect(getConnectorHealthTone('unavailable')).toBe('danger');
    expect(getConnectorSyncTone('accepted')).toBe('success');
    expect(getConnectorSyncTone('skipped')).toBe('warning');
    expect(getConnectorSyncTone('failed')).toBe('danger');
    expect(getConnectorResourceTone('linked')).toBe('success');
    expect(getConnectorResourceTone('pending_review')).toBe('warning');
  });

  it('selects connector and health records by stable IDs and types', () => {
    expect(getPreferredConnector([connector], connector.id)).toBe(connector);
    expect(getPreferredConnector([connector], 'connector-missing')).toBe(connector);
    expect(getHealthForConnector([healthCheck], connector)).toBe(healthCheck);
    expect(getHealthForConnector([healthCheck], undefined)).toBeUndefined();
  });

  it('formats placeholder push and pull results', () => {
    expect(formatConnectorResultSummary(pushResult)).toBe('1 accepted, 0 skipped');
    expect(formatConnectorResultSummary(pullResult)).toBe('0 records returned');
    expect(formatConnectorResultSummary(undefined)).toBe('No run recorded');
    expect(getConnectorResultWarnings(pushResult)).toEqual(pushResult.warnings);
    expect(getConnectorResultWarnings(undefined)).toEqual([]);
  });

  it('creates ISA JSON export payloads without direct human identifiers', () => {
    const payload = createConnectorIsaJsonPayload(
      {
        investigations: [investigation],
        subjects: [humanSubject],
      },
      '2026-07-08T16:45:00Z',
    );

    expect(payload?.generatedAt).toBe('2026-07-08T16:45:00Z');
    expect(payload?.investigations[0]?.studies[0]?.sources[0]?.name).toBe('HUM-PSEUDO-T');
    expect(JSON.stringify(payload)).not.toContain('email');
    expect(JSON.stringify(payload)).not.toContain('fullName');
  });
});
