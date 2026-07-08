import { Injectable, NotFoundException } from '@nestjs/common';
import type { FacilityHierarchy, HousingUnitDetail } from '@cohos/domain';

import { facilityFixtures, housingUnitFixtures } from './facility.fixtures.js';

@Injectable()
export class FacilitiesService {
  private readonly facilities = new Map<string, FacilityHierarchy>(
    facilityFixtures.map((facility) => [facility.id, facility]),
  );

  private readonly housingUnits = new Map<string, HousingUnitDetail>(
    housingUnitFixtures.map((housingUnit) => [housingUnit.id, housingUnit]),
  );

  listFacilities(): FacilityHierarchy[] {
    return Array.from(this.facilities.values());
  }

  getFacility(facilityId: string): FacilityHierarchy {
    const facility = this.facilities.get(facilityId);

    if (facility === undefined) {
      throw new NotFoundException(`Facility ${facilityId} was not found.`);
    }

    return facility;
  }

  getHousingUnit(housingUnitId: string): HousingUnitDetail {
    const housingUnit = this.housingUnits.get(housingUnitId);

    if (housingUnit === undefined) {
      throw new NotFoundException(`Housing unit ${housingUnitId} was not found.`);
    }

    return housingUnit;
  }
}
