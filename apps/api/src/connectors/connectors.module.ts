import { Module } from '@nestjs/common';

import { ResearchModule } from '../research/research.module.js';
import { ConnectorsController } from './connectors.controller.js';
import { ConnectorsService } from './connectors.service.js';

@Module({
  controllers: [ConnectorsController],
  imports: [ResearchModule],
  providers: [ConnectorsService],
})
export class ConnectorsModule {}
