import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { createSubjectSchema, type CreateSubjectDto } from './dto.js';
import { SubjectsService } from './subjects.service.js';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  listSubjects() {
    return this.subjectsService.listSubjects();
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
