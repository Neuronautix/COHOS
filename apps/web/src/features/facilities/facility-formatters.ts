import type { FacilityHierarchy, HousingUnitDetail, HousingUnitSummary } from '@cohos/domain';
import type { StatusTone } from '@cohos/ui';

export type FacilityField = {
  readonly label: string;
  readonly value: string;
};

export type FacilitySummary = {
  readonly environmentalObservationCount: number;
  readonly facilityCount: number;
  readonly housingUnitCount: number;
  readonly occupantCount: number;
  readonly roomCount: number;
};

type HousingUnitLike = HousingUnitDetail | HousingUnitSummary;

export function formatFacilityToken(value: string): string {
  return value
    .split('_')
    .map((part) => (part.length === 0 ? part : `${part[0]?.toUpperCase()}${part.slice(1)}`))
    .join(' ');
}

export function getHousingUnitTypeLabel(unit: HousingUnitLike): string {
  return formatFacilityToken(unit.type);
}

export function getOccupancyTone(count: number): StatusTone {
  if (count === 0) {
    return 'neutral';
  }

  return 'success';
}

export function getEnvironmentTone(unit: HousingUnitLike): StatusTone {
  const observations =
    'recentEnvironmentalObservations' in unit
      ? unit.recentEnvironmentalObservations.length
      : unit.recentEnvironmentalObservationIds.length;

  return observations > 0 ? 'info' : 'neutral';
}

export function getHousingUnitOccupantCount(unit: HousingUnitLike): number {
  if ('occupants' in unit) {
    return unit.occupants.reduce((total, occupant) => total + (occupant.count ?? 1), 0);
  }

  return unit.currentOccupantCount;
}

export function getHousingSpecificFields(unit: HousingUnitDetail): FacilityField[] {
  const sharedFields = [
    facilityField('Code', unit.code),
    facilityField('Room', unit.roomId),
    facilityField('Rack', unit.rackId ?? 'Unassigned'),
    facilityField('Occupants', getHousingUnitOccupantCount(unit).toString()),
  ];

  switch (unit.type) {
    case 'cage':
      return [...sharedFields, facilityField('Cage type', unit.cageType ?? 'Not recorded')];
    case 'tank':
      return [
        ...sharedFields,
        facilityField(
          'Volume',
          unit.volumeLiters === undefined ? 'Not recorded' : `${unit.volumeLiters} L`,
        ),
      ];
    case 'other':
    case 'pasture':
    case 'pen':
    case 'room':
      return sharedFields;
  }
}

export function summarizeFacilities(facilities: readonly FacilityHierarchy[]): FacilitySummary {
  const rooms = facilities.flatMap((facility) => facility.rooms);
  const housingUnits = rooms.flatMap((room) => room.housingUnits);

  return {
    environmentalObservationCount: housingUnits.reduce(
      (total, unit) => total + unit.recentEnvironmentalObservationIds.length,
      0,
    ),
    facilityCount: facilities.length,
    housingUnitCount: housingUnits.length,
    occupantCount: housingUnits.reduce((total, unit) => total + unit.currentOccupantCount, 0),
    roomCount: rooms.length,
  };
}

function facilityField(label: string, value: string): FacilityField {
  return {
    label,
    value,
  };
}
