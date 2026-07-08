import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import {
  metadatappConnectorSettingsUpdateSchema,
  type MetadatappConnectorSettingsUpdate,
} from '@cohos/connectors';

import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { ConnectorsService } from './connectors.service.js';

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Get()
  listConnectors() {
    return this.connectorsService.listConnectors();
  }

  @Get('dashboard')
  getDashboard() {
    return this.connectorsService.getDashboard();
  }

  @Get(':connectorId')
  getConnector(@Param('connectorId') connectorId: string) {
    return this.connectorsService.getConnector(connectorId);
  }

  @Patch(':connectorId')
  updateConnector(
    @Param('connectorId') connectorId: string,
    @Body(new ZodValidationPipe(metadatappConnectorSettingsUpdateSchema))
    update: MetadatappConnectorSettingsUpdate,
  ) {
    return this.connectorsService.updateConnector(connectorId, update);
  }

  @Post(':connectorId/health-check')
  checkConnectorHealth(@Param('connectorId') connectorId: string) {
    return this.connectorsService.checkConnectorHealth(connectorId);
  }

  @Post(':connectorId/push')
  pushConnector(@Param('connectorId') connectorId: string) {
    return this.connectorsService.pushConnector(connectorId);
  }

  @Post(':connectorId/pull')
  pullConnector(@Param('connectorId') connectorId: string) {
    return this.connectorsService.pullConnector(connectorId);
  }

  @Get(':connectorId/resource-status')
  listResourceStatuses(@Param('connectorId') connectorId: string) {
    this.connectorsService.getConnector(connectorId);

    return this.connectorsService.listResourceStatuses();
  }
}
