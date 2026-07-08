import { Controller, Get, Param } from '@nestjs/common';

import { FacilitiesService } from './facilities.service.js';

@Controller('housing-units')
export class HousingUnitsController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get(':housingUnitId')
  getHousingUnit(@Param('housingUnitId') housingUnitId: string) {
    return this.facilitiesService.getHousingUnit(housingUnitId);
  }
}
