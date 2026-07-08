import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FacilitiesModule } from './facilities/facilities.module.js';
import { HealthModule } from './health/health.module.js';
import { ResearchModule } from './research/research.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FacilitiesModule,
    HealthModule,
    ResearchModule,
    SubjectsModule,
  ],
})
export class AppModule {}
