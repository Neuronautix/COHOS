import { Module } from '@nestjs/common';

import { FacilitiesController } from './facilities.controller.js';
import { FacilitiesService } from './facilities.service.js';
import { HousingUnitsController } from './housing-units.controller.js';

@Module({
  controllers: [FacilitiesController, HousingUnitsController],
  providers: [FacilitiesService],
})
export class FacilitiesModule {}
