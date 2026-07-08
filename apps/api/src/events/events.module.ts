import { Module } from '@nestjs/common';

import { AlertsController, AuditEventsController, EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';

@Module({
  controllers: [EventsController, AuditEventsController, AlertsController],
  providers: [EventsService],
})
export class EventsModule {}
