import { metadatappConnectorConfigSchema, type MetadatappConnectorConfig } from '@cohos/connectors';

export const connectorConfigFixtures = [
  metadatappConnectorConfigSchema.parse({
    id: 'connector-metadatapp-synthetic',
    organizationId: 'org-synthetic-cohos',
    connectorType: 'metadatapp',
    displayName: 'Synthetic Metadatapp connector',
    credentialReference: 'secret://cohos/synthetic/metadatapp',
    baseUrl: 'https://metadatapp.example.test',
    workspaceId: 'workspace-synthetic',
    metadata: {
      environment: 'development',
    },
  }),
] satisfies MetadatappConnectorConfig[];
