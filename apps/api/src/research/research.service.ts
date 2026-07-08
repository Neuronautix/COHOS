import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type Assay,
  type AssayDetail,
  type ConnectedResourceLink,
  type Dataset,
  type Investigation,
  type InvestigationDetail,
  type Procedure,
  type ResearchVocabulary,
  type Sample,
  type Study,
  type StudyDetail,
  assayDetailSchema,
  assaySchema,
  investigationDetailSchema,
  investigationSchema,
  procedureSchema,
  studyDetailSchema,
  studySchema,
} from '@cohos/domain';

import type {
  CreateAssayDto,
  CreateInvestigationDto,
  CreateProcedureDto,
  CreateStudyDto,
} from './dto.js';
import {
  assayFixtures,
  connectedResourceLinkFixtures,
  datasetFixtures,
  investigationFixtures,
  procedureFixtures,
  researchVocabularyFixture,
  sampleFixtures,
  studyFixtures,
} from './research.fixtures.js';

type ConnectedResourceFilters = {
  readonly entityType?: string;
  readonly entityId?: string;
};

@Injectable()
export class ResearchService {
  private readonly investigations = new Map<string, Investigation>(
    investigationFixtures.map((investigation) => [investigation.id, investigation]),
  );

  private readonly studies = new Map<string, Study>(
    studyFixtures.map((study) => [study.id, study]),
  );

  private readonly assays = new Map<string, Assay>(assayFixtures.map((assay) => [assay.id, assay]));

  private readonly procedures = new Map<string, Procedure>(
    procedureFixtures.map((procedure) => [procedure.id, procedure]),
  );

  private readonly samples = new Map<string, Sample>(
    sampleFixtures.map((sample) => [sample.id, sample]),
  );

  private readonly datasets = new Map<string, Dataset>(
    datasetFixtures.map((dataset) => [dataset.id, dataset]),
  );

  private readonly connectedResources = new Map<string, ConnectedResourceLink>(
    connectedResourceLinkFixtures.map((link) => [link.id, link]),
  );

  getVocabulary(): ResearchVocabulary {
    return researchVocabularyFixture;
  }

  listInvestigations(): InvestigationDetail[] {
    return Array.from(this.investigations.values()).map((investigation) =>
      this.detailForInvestigation(investigation),
    );
  }

  getInvestigation(investigationId: string): InvestigationDetail {
    return this.detailForInvestigation(this.getInvestigationBase(investigationId));
  }

  createInvestigation(input: CreateInvestigationDto): InvestigationDetail {
    const investigation = investigationSchema.parse({
      ...input,
      id: `investigation-${randomUUID()}`,
    });

    this.investigations.set(investigation.id, investigation);

    return this.detailForInvestigation(investigation);
  }

  listStudies(investigationId: string): StudyDetail[] {
    this.getInvestigationBase(investigationId);

    return Array.from(this.studies.values())
      .filter((study) => study.investigationId === investigationId)
      .map((study) => this.detailForStudy(study));
  }

  getStudy(studyId: string): StudyDetail {
    return this.detailForStudy(this.getStudyBase(studyId));
  }

  createStudy(input: CreateStudyDto): StudyDetail {
    this.getInvestigationBase(input.investigationId);

    const study = studySchema.parse({
      ...input,
      id: `study-${randomUUID()}`,
    });

    this.studies.set(study.id, study);

    return this.detailForStudy(study);
  }

  listAssays(studyId: string): AssayDetail[] {
    this.getStudyBase(studyId);

    return Array.from(this.assays.values())
      .filter((assay) => assay.studyId === studyId)
      .map((assay) => this.detailForAssay(assay));
  }

  getAssay(assayId: string): AssayDetail {
    return this.detailForAssay(this.getAssayBase(assayId));
  }

  createAssay(input: CreateAssayDto): AssayDetail {
    this.getStudyBase(input.studyId);

    const assay = assaySchema.parse({
      ...input,
      id: `assay-${randomUUID()}`,
    });

    this.assays.set(assay.id, assay);

    return this.detailForAssay(assay);
  }

  listProcedures(assayId: string): Procedure[] {
    this.getAssayBase(assayId);

    return Array.from(this.procedures.values()).filter(
      (procedure) => procedure.assayId === assayId,
    );
  }

  getProcedure(procedureId: string): Procedure {
    return this.getProcedureBase(procedureId);
  }

  createProcedure(input: CreateProcedureDto): Procedure {
    this.getAssayBase(input.assayId);

    const procedure = procedureSchema.parse({
      ...input,
      id: `procedure-${randomUUID()}`,
    });

    this.procedures.set(procedure.id, procedure);

    return procedure;
  }

  listConnectedResources(filters: ConnectedResourceFilters = {}): ConnectedResourceLink[] {
    return Array.from(this.connectedResources.values()).filter(
      (link) =>
        (filters.entityType === undefined || link.entityType === filters.entityType) &&
        (filters.entityId === undefined || link.entityId === filters.entityId),
    );
  }

  getConnectedResource(linkId: string): ConnectedResourceLink {
    const link = this.connectedResources.get(linkId);

    if (link === undefined) {
      throw new NotFoundException(`Connected resource link ${linkId} was not found.`);
    }

    return link;
  }

  private detailForInvestigation(investigation: Investigation): InvestigationDetail {
    return investigationDetailSchema.parse({
      ...investigation,
      studies: Array.from(this.studies.values())
        .filter((study) => study.investigationId === investigation.id)
        .map((study) => this.detailForStudy(study)),
      connectedResources: this.connectedResourcesFor('investigation', investigation.id),
    });
  }

  private detailForStudy(study: Study): StudyDetail {
    return studyDetailSchema.parse({
      ...study,
      assays: Array.from(this.assays.values())
        .filter((assay) => assay.studyId === study.id)
        .map((assay) => this.detailForAssay(assay)),
      connectedResources: this.connectedResourcesFor('study', study.id),
    });
  }

  private detailForAssay(assay: Assay): AssayDetail {
    return assayDetailSchema.parse({
      ...assay,
      procedures: Array.from(this.procedures.values()).filter(
        (procedure) => procedure.assayId === assay.id,
      ),
      samples: Array.from(this.samples.values()).filter((sample) => sample.assayId === assay.id),
      datasets: Array.from(this.datasets.values()).filter(
        (dataset) => dataset.assayId === assay.id,
      ),
      connectedResources: this.connectedResourcesFor('assay', assay.id),
    });
  }

  private connectedResourcesFor(entityType: string, entityId: string): ConnectedResourceLink[] {
    return Array.from(this.connectedResources.values()).filter(
      (link) => link.entityType === entityType && link.entityId === entityId,
    );
  }

  private getInvestigationBase(investigationId: string): Investigation {
    const investigation = this.investigations.get(investigationId);

    if (investigation === undefined) {
      throw new NotFoundException(`Investigation ${investigationId} was not found.`);
    }

    return investigation;
  }

  private getStudyBase(studyId: string): Study {
    const study = this.studies.get(studyId);

    if (study === undefined) {
      throw new NotFoundException(`Study ${studyId} was not found.`);
    }

    return study;
  }

  private getAssayBase(assayId: string): Assay {
    const assay = this.assays.get(assayId);

    if (assay === undefined) {
      throw new NotFoundException(`Assay ${assayId} was not found.`);
    }

    return assay;
  }

  private getProcedureBase(procedureId: string): Procedure {
    const procedure = this.procedures.get(procedureId);

    if (procedure === undefined) {
      throw new NotFoundException(`Procedure ${procedureId} was not found.`);
    }

    return procedure;
  }
}
