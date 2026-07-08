import {
  facilityHierarchySchema,
  housingUnitDetailSchema,
  type FacilityHierarchy,
  type HousingUnitDetail,
} from '@cohos/domain';

import { fetchFromApi } from '../../lib/api-client';

const facilityListSchema = facilityHierarchySchema.array();

export async function fetchFacilities(): Promise<FacilityHierarchy[]> {
  const payload = await fetchFromApi<unknown>('/facilities');

  return facilityListSchema.parse(payload);
}

export async function fetchFacility(facilityId: string): Promise<FacilityHierarchy> {
  const payload = await fetchFromApi<unknown>(`/facilities/${encodeURIComponent(facilityId)}`);

  return facilityHierarchySchema.parse(payload);
}

export async function fetchHousingUnit(housingUnitId: string): Promise<HousingUnitDetail> {
  const payload = await fetchFromApi<unknown>(
    `/housing-units/${encodeURIComponent(housingUnitId)}`,
  );

  return housingUnitDetailSchema.parse(payload);
}
