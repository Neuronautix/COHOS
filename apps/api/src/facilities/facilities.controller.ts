import { Controller, Get, Inject, Param } from '@nestjs/common';

import { FacilitiesService } from './facilities.service.js';

@Controller('facilities')
export class FacilitiesController {
  constructor(@Inject(FacilitiesService) private readonly facilitiesService: FacilitiesService) {}

  @Get()
  listFacilities() {
    return this.facilitiesService.listFacilities();
  }

  @Get(':facilityId')
  getFacility(@Param('facilityId') facilityId: string) {
    return this.facilitiesService.getFacility(facilityId);
  }
}
