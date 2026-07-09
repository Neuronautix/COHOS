import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type ConnectorConfig,
  type ConnectorHealthCheckResult,
  type ConnectorPullResult,
  type ConnectorPushResult,
  type ConnectorRecord,
  type ConnectorResourceStatus,
  createMetadatappConnector,
  mapConnectedResourceToConnectorRecord,
  mapConnectedResourceToConnectorStatus,
  mapInvestigationToMetadatappRecord,
  type MetadatappConnectorSettingsUpdate,
  updateMetadatappConnectorConfig,
} from '@cohos/connectors';
import type { ConnectedResourceLink } from '@cohos/domain';

import { ResearchService } from '../research/research.service.js';
import { connectorConfigFixtures } from './connectors.fixtures.js';

export type ConnectorDashboard = {
  readonly connectedResources: readonly ConnectedResourceLink[];
  readonly connectors: readonly ConnectorConfig[];
  readonly healthChecks: readonly ConnectorHealthCheckResult[];
  readonly resourceStatuses: readonly ConnectorResourceStatus[];
};

@Injectable()
export class ConnectorsService {
  private readonly connectors = new Map<string, ConnectorConfig>(
    connectorConfigFixtures.map((config) => [config.id, config]),
  );

  constructor(@Inject(ResearchService) private readonly researchService: ResearchService) {}

  listConnectors(): ConnectorConfig[] {
    return Array.from(this.connectors.values());
  }

  getConnector(connectorId: string): ConnectorConfig {
    const connector = this.connectors.get(connectorId);

    if (connector === undefined) {
      throw new NotFoundException(`Connector ${connectorId} was not found.`);
    }

    return connector;
  }

  updateConnector(connectorId: string, input: MetadatappConnectorSettingsUpdate): ConnectorConfig {
    const connector = this.getConnector(connectorId);
    const updatedConnector = updateMetadatappConnectorConfig(connector, input);

    this.connectors.set(updatedConnector.id, updatedConnector);

    return updatedConnector;
  }

  async getDashboard(): Promise<ConnectorDashboard> {
    const connectors = this.listConnectors();
    const healthChecks = await Promise.all(
      connectors.map((connector) => this.checkConnectorHealth(connector.id)),
    );
    const connectedResources = this.researchService.listConnectedResources();

    return {
      connectedResources,
      connectors,
      healthChecks,
      resourceStatuses: this.listResourceStatuses(),
    };
  }

  checkConnectorHealth(connectorId: string): Promise<ConnectorHealthCheckResult> {
    return createMetadatappConnector(this.getConnector(connectorId)).healthCheck();
  }

  pushConnector(connectorId: string): Promise<ConnectorPushResult> {
    const connector = createMetadatappConnector(this.getConnector(connectorId));

    return connector.push({
      records: this.buildConnectorRecords(),
    });
  }

  pullConnector(connectorId: string): Promise<ConnectorPullResult> {
    const connector = createMetadatappConnector(this.getConnector(connectorId));

    return connector.pull({
      entityTypes: ['investigation', 'connected_resource'],
    });
  }

  listResourceStatuses(): ConnectorResourceStatus[] {
    return this.researchService
      .listConnectedResources()
      .map((link) => mapConnectedResourceToConnectorStatus(link));
  }

  private buildConnectorRecords(): ConnectorRecord[] {
    return [
      ...this.researchService
        .listInvestigations()
        .map((investigation) => mapInvestigationToMetadatappRecord(investigation)),
      ...this.researchService
        .listConnectedResources()
        .map((link) => mapConnectedResourceToConnectorRecord(link)),
    ];
  }
}
