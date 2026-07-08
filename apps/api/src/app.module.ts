import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EventsModule } from './events/events.module.js';
import { FacilitiesModule } from './facilities/facilities.module.js';
import { HealthModule } from './health/health.module.js';
import { QRModule } from './qr/qr.module.js';
import { ResearchModule } from './research/research.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventsModule,
    FacilitiesModule,
    HealthModule,
    QRModule,
    ResearchModule,
    SubjectsModule,
  ],
})
export class AppModule {}
