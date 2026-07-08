import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    SubjectsModule,
  ],
})
export class AppModule {}
