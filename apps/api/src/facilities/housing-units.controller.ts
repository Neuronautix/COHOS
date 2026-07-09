import { Controller, Get, Inject, Param } from '@nestjs/common';

import { FacilitiesService } from './facilities.service.js';

@Controller('housing-units')
export class HousingUnitsController {
  constructor(@Inject(FacilitiesService) private readonly facilitiesService: FacilitiesService) {}

  @Get(':housingUnitId')
  getHousingUnit(@Param('housingUnitId') housingUnitId: string) {
    return this.facilitiesService.getHousingUnit(housingUnitId);
  }
}
