import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';

import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import {
  createAssaySchema,
  createInvestigationSchema,
  createProcedureSchema,
  createStudySchema,
  type CreateAssayDto,
  type CreateInvestigationDto,
  type CreateProcedureDto,
  type CreateStudyDto,
} from './dto.js';
import { ResearchService } from './research.service.js';

@Controller('research')
export class ResearchController {
  constructor(@Inject(ResearchService) private readonly researchService: ResearchService) {}

  @Get('vocabulary')
  getVocabulary() {
    return this.researchService.getVocabulary();
  }
}

@Controller('investigations')
export class InvestigationsController {
  constructor(@Inject(ResearchService) private readonly researchService: ResearchService) {}

  @Get()
  listInvestigations() {
    return this.researchService.listInvestigations();
  }

  @Get(':investigationId')
  getInvestigation(@Param('investigationId') investigationId: string) {
    return this.researchService.getInvestigation(investigationId);
  }

  @Get(':investigationId/studies')
  listStudies(@Param('investigationId') investigationId: string) {
    return this.researchService.listStudies(investigationId);
  }

  @Post()
  createInvestigation(
    @Body(new ZodValidationPipe(createInvestigationSchema))
    createInvestigationDto: CreateInvestigationDto,
  ) {
    return this.researchService.createInvestigation(createInvestigationDto);
  }
}

@Controller('studies')
export class StudiesController {
  constructor(@Inject(ResearchService) private readonly researchService: ResearchService) {}

  @Get(':studyId')
  getStudy(@Param('studyId') studyId: string) {
    return this.researchService.getStudy(studyId);
  }

  @Get(':studyId/assays')
  listAssays(@Param('studyId') studyId: string) {
    return this.researchService.listAssays(studyId);
  }

  @Post()
  createStudy(
    @Body(new ZodValidationPipe(createStudySchema))
    createStudyDto: CreateStudyDto,
  ) {
    return this.researchService.createStudy(createStudyDto);
  }
}

@Controller('assays')
export class AssaysController {
  constructor(@Inject(ResearchService) private readonly researchService: ResearchService) {}

  @Get(':assayId')
  getAssay(@Param('assayId') assayId: string) {
    return this.researchService.getAssay(assayId);
  }

  @Get(':assayId/procedures')
  listProcedures(@Param('assayId') assayId: string) {
    return this.researchService.listProcedures(assayId);
  }

  @Post()
  createAssay(
    @Body(new ZodValidationPipe(createAssaySchema))
    createAssayDto: CreateAssayDto,
  ) {
    return this.researchService.createAssay(createAssayDto);
  }
}

@Controller('procedures')
export class ProceduresController {
  constructor(@Inject(ResearchService) private readonly researchService: ResearchService) {}

  @Get(':procedureId')
  getProcedure(@Param('procedureId') procedureId: string) {
    return this.researchService.getProcedure(procedureId);
  }

  @Post()
  createProcedure(
    @Body(new ZodValidationPipe(createProcedureSchema))
    createProcedureDto: CreateProcedureDto,
  ) {
    return this.researchService.createProcedure(createProcedureDto);
  }
}

@Controller('connected-resource-links')
export class ConnectedResourceLinksController {
  constructor(@Inject(ResearchService) private readonly researchService: ResearchService) {}

  @Get()
  listConnectedResourceLinks(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.researchService.listConnectedResources({ entityType, entityId });
  }

  @Get(':linkId')
  getConnectedResourceLink(@Param('linkId') linkId: string) {
    return this.researchService.getConnectedResource(linkId);
  }
}
