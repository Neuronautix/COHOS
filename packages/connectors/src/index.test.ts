import { describe, expect, it } from 'vitest';

import type { ConnectedResourceLink, InvestigationDetail } from '@cohos/domain';

import {
  createMetadatappConnector,
  credentialReferenceSchema,
  mapConnectedResourceToConnectorRecord,
  mapInvestigationToMetadatappRecord,
  metadatappConnectorConfigSchema,
} from './index.js';

const metadatappConfig = {
  id: 'connector-metadatapp-synthetic',
  organizationId: 'org-cohos',
  connectorType: 'metadatapp',
  displayName: 'Synthetic Metadatapp connector',
  credentialReference: 'secret://cohos/synthetic/metadatapp',
  baseUrl: 'https://metadatapp.example.test',
  workspaceId: 'workspace-synthetic',
};

const investigation: InvestigationDetail = {
  id: 'investigation-synthetic-001',
  organizationId: 'org-cohos',
  title: 'Synthetic investigation',
  studies: [
    {
      id: 'study-synthetic-001',
      investigationId: 'investigation-synthetic-001',
      title: 'Synthetic study',
      subjectIds: ['subject-rodent-001'],
      cohortIds: [],
      assays: [
        {
          id: 'assay-synthetic-001',
          studyId: 'study-synthetic-001',
          title: 'Synthetic assay',
          measurementType: 'observation',
          technologyType: 'manual record',
          procedures: [],
          samples: [],
          datasets: [],
          connectedResources: [],
        },
      ],
      connectedResources: [],
    },
  ],
  connectedResources: [],
};

const connectedResource: ConnectedResourceLink = {
  id: 'link-synthetic-protocol',
  organizationId: 'org-cohos',
  entityType: 'study',
  entityId: 'study-synthetic-001',
  label: 'Synthetic protocol',
  url: 'https://example.test/protocol',
  metadata: {
    fixture: true,
  },
};

describe('connector contracts', () => {
  it('validates config and credential references without raw secrets', () => {
    const parsed = metadatappConnectorConfigSchema.parse(metadatappConfig);

    expect(parsed.enabled).toBe(true);
    expect(credentialReferenceSchema.safeParse('env:METADATAPP_TOKEN').success).toBe(true);
    expect(credentialReferenceSchema.safeParse('raw-token-value').success).toBe(false);
  });

  it('maps COHOS research records into connector records', () => {
    const investigationRecord = mapInvestigationToMetadatappRecord(investigation);
    const resourceRecord = mapConnectedResourceToConnectorRecord(connectedResource);

    expect(investigationRecord).toMatchObject({
      entityType: 'investigation',
      entityId: investigation.id,
      payload: {
        sourceSystem: 'COHOS',
        investigationId: investigation.id,
        studies: [
          {
            studyId: 'study-synthetic-001',
            assays: [
              {
                assayId: 'assay-synthetic-001',
                measurementType: 'observation',
              },
            ],
          },
        ],
      },
    });
    expect(resourceRecord).toMatchObject({
      entityType: 'connected_resource',
      entityId: connectedResource.id,
      payload: {
        entityType: connectedResource.entityType,
        entityId: connectedResource.entityId,
        url: connectedResource.url,
      },
    });
  });

  it('performs placeholder health checks without resolving live credentials', async () => {
    const connector = createMetadatappConnector(metadatappConfig);

    const health = await connector.healthCheck('2026-07-08T16:30:00Z');

    expect(health).toMatchObject({
      checkedAt: '2026-07-08T16:30:00Z',
      connectorType: 'metadatapp',
      credentialReference: metadatappConfig.credentialReference,
      status: 'ready',
    });
    expect(JSON.stringify(health)).not.toContain('raw-token');
  });

  it('provides push and pull signatures without network access', async () => {
    const connector = createMetadatappConnector(metadatappConfig);
    const record = mapInvestigationToMetadatappRecord(investigation);

    const pushResult = await connector.push({ records: [record] });
    const pullResult = await connector.pull({
      entityTypes: ['investigation'],
      since: '2026-07-08T00:00:00Z',
    });

    expect(pushResult).toMatchObject({
      connectorType: 'metadatapp',
      operation: 'push',
      status: 'accepted',
      acceptedRecords: [record],
      errors: [],
    });
    expect(pushResult.warnings[0]).toContain('no network call was made');
    expect(pullResult).toMatchObject({
      connectorType: 'metadatapp',
      operation: 'pull',
      status: 'skipped',
      records: [],
      errors: [],
    });
    expect(pullResult.warnings.join(' ')).toContain('Pull filters were recorded');
  });
});
