import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import {
  recordEnvironmentalObservationSchema,
  recordMortalitySchema,
  recordTransferSchema,
  recordWelfareObservationSchema,
  type RecordEnvironmentalObservationDto,
  type RecordMortalityDto,
  type RecordTransferDto,
  type RecordWelfareObservationDto,
} from './dto.js';
import { EventsService } from './events.service.js';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  listEvents(
    @Query('eventType') eventType?: string,
    @Query('housingUnitId') housingUnitId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.eventsService.listEvents({ eventType, housingUnitId, subjectId });
  }

  @Get('subjects/:subjectId/state')
  getSubjectEventState(@Param('subjectId') subjectId: string) {
    return this.eventsService.getSubjectEventState(subjectId);
  }

  @Get('housing-units/:housingUnitId/state')
  getHousingEventState(@Param('housingUnitId') housingUnitId: string) {
    return this.eventsService.getHousingEventState(housingUnitId);
  }

  @Get(':eventId')
  getEvent(@Param('eventId') eventId: string) {
    return this.eventsService.getEvent(eventId);
  }

  @Post('transfers')
  recordTransfer(
    @Body(new ZodValidationPipe(recordTransferSchema))
    recordTransferDto: RecordTransferDto,
  ) {
    return this.eventsService.recordTransfer(recordTransferDto);
  }

  @Post('mortalities')
  recordMortality(
    @Body(new ZodValidationPipe(recordMortalitySchema))
    recordMortalityDto: RecordMortalityDto,
  ) {
    return this.eventsService.recordMortality(recordMortalityDto);
  }

  @Post('welfare-observations')
  recordWelfareObservation(
    @Body(new ZodValidationPipe(recordWelfareObservationSchema))
    recordWelfareObservationDto: RecordWelfareObservationDto,
  ) {
    return this.eventsService.recordWelfareObservation(recordWelfareObservationDto);
  }

  @Post('environmental-observations')
  recordEnvironmentalObservation(
    @Body(new ZodValidationPipe(recordEnvironmentalObservationSchema))
    recordEnvironmentalObservationDto: RecordEnvironmentalObservationDto,
  ) {
    return this.eventsService.recordEnvironmentalObservation(recordEnvironmentalObservationDto);
  }
}

@Controller('audit-events')
export class AuditEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  listAuditEvents(
    @Query('entityId') entityId?: string,
    @Query('entityType') entityType?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.eventsService.listAuditEvents({ entityId, entityType, eventId });
  }

  @Get(':auditEventId')
  getAuditEvent(@Param('auditEventId') auditEventId: string) {
    return this.eventsService.getAuditEvent(auditEventId);
  }
}

@Controller('alerts')
export class AlertsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  listAlerts() {
    return this.eventsService.listAlerts();
  }
}
