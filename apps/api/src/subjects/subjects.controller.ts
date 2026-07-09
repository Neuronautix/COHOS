import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { createSubjectSchema, type CreateSubjectDto } from './dto.js';
import { SubjectsService } from './subjects.service.js';

@Controller('subjects')
export class SubjectsController {
  constructor(@Inject(SubjectsService) private readonly subjectsService: SubjectsService) {}

  @Get()
  listSubjects() {
    return this.subjectsService.listSubjects();
  }

  @Get(':subjectId/aggregates')
  listSubjectMemberships(@Param('subjectId') subjectId: string) {
    return this.subjectsService.listSubjectMemberships(subjectId);
  }

  @Get(':subjectId')
  getSubject(@Param('subjectId') subjectId: string) {
    return this.subjectsService.getSubject(subjectId);
  }

  @Post()
  createSubject(
    @Body(new ZodValidationPipe(createSubjectSchema))
    createSubjectDto: CreateSubjectDto,
  ) {
    return this.subjectsService.createSubject(createSubjectDto);
  }
}

@Controller('subject-aggregates')
export class SubjectAggregatesController {
  constructor(@Inject(SubjectsService) private readonly subjectsService: SubjectsService) {}

  @Get()
  listSubjectAggregates() {
    return this.subjectsService.listSubjectAggregates();
  }

  @Get(':aggregateId')
  getSubjectAggregate(@Param('aggregateId') aggregateId: string) {
    return this.subjectsService.getSubjectAggregate(aggregateId);
  }

  @Get(':aggregateId/memberships')
  listSubjectAggregateMemberships(@Param('aggregateId') aggregateId: string) {
    return this.subjectsService.listSubjectAggregateMemberships(aggregateId);
  }
}
