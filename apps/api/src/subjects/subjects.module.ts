import { Module } from '@nestjs/common';

import { SubjectAggregatesController, SubjectsController } from './subjects.controller.js';
import { SubjectsService } from './subjects.service.js';

@Module({
  controllers: [SubjectsController, SubjectAggregatesController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
