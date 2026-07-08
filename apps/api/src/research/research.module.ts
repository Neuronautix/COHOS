import { Module } from '@nestjs/common';

import {
  AssaysController,
  ConnectedResourceLinksController,
  InvestigationsController,
  ProceduresController,
  ResearchController,
  StudiesController,
} from './research.controller.js';
import { ResearchService } from './research.service.js';

@Module({
  controllers: [
    ResearchController,
    InvestigationsController,
    StudiesController,
    AssaysController,
    ProceduresController,
    ConnectedResourceLinksController,
  ],
  providers: [ResearchService],
})
export class ResearchModule {}
