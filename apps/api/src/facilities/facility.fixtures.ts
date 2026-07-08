import {
  type EnvironmentalObservationSummary,
  type FacilityHierarchy,
  type HousingOccupantSummary,
  type HousingUnitDetail,
  environmentalObservationSummarySchema,
  facilityHierarchySchema,
  housingOccupantSummarySchema,
  housingUnitDetailSchema,
  housingUnitSummarySchema,
} from '@cohos/domain';

import { subjectFixtures } from '../subjects/subject.fixtures.js';

const facility = {
  id: 'facility-synthetic-main',
  organizationId: 'org-synthetic-cohos',
  name: 'Synthetic Main Facility',
  code: 'SMF',
};

const room = {
  id: 'room-synthetic-a',
  facilityId: facility.id,
  name: 'Synthetic Room A',
  code: 'A',
};

const rack = {
  id: 'rack-synthetic-a1',
  roomId: room.id,
  name: 'Synthetic Rack A1',
  code: 'A1',
};

const housingUnits = [
  {
    id: 'housing-cage-a1',
    roomId: room.id,
    rackId: rack.id,
    type: 'cage',
    name: 'Synthetic Cage A1',
    code: 'CAGE-A1',
    cageType: 'individually ventilated',
  },
  {
    id: 'housing-tank-z1',
    roomId: room.id,
    rackId: rack.id,
    type: 'tank',
    name: 'Synthetic Tank Z1',
    code: 'TANK-Z1',
    volumeLiters: 12,
  },
  {
    id: 'housing-pasture-f1',
    roomId: room.id,
    type: 'pasture',
    name: 'Synthetic Pasture F1',
    code: 'PASTURE-F1',
  },
] as const;

const environmentalObservations = [
  environmentalObservationSummarySchema.parse({
    id: 'event-env-zebrafish-1',
    housingUnitId: 'housing-tank-z1',
    occurredAt: '2026-03-02T11:00:00Z',
    metric: 'temperature',
    value: 27.5,
    unit: 'C',
  }),
] satisfies EnvironmentalObservationSummary[];

function housingUnitIdForSubject(subject: (typeof subjectFixtures)[number]): string | undefined {
  switch (subject.profile.profileType) {
    case 'rodent':
    case 'farm_animal':
      return subject.profile.housingUnitId;
    case 'zebrafish_batch':
      return subject.profile.tankId;
    case 'human':
    case 'generic':
      return undefined;
  }
}

function occupantCount(subject: (typeof subjectFixtures)[number]): number | undefined {
  if (subject.profile.profileType === 'zebrafish_batch') {
    return subject.profile.count;
  }

  return undefined;
}

function occupantSummariesFor(housingUnitId: string): HousingOccupantSummary[] {
  return subjectFixtures
    .filter((subject) => housingUnitIdForSubject(subject) === housingUnitId)
    .map((subject) =>
      housingOccupantSummarySchema.parse({
        subjectId: subject.id,
        subjectCode: subject.subjectCode,
        profileType: subject.profileType,
        status: subject.status,
        count: occupantCount(subject),
      }),
    );
}

function environmentalObservationsFor(housingUnitId: string): EnvironmentalObservationSummary[] {
  return environmentalObservations.filter(
    (observation) => observation.housingUnitId === housingUnitId,
  );
}

function currentOccupantCount(occupants: HousingOccupantSummary[]): number {
  return occupants.reduce((total, occupant) => total + (occupant.count ?? 1), 0);
}

function detailFor(housingUnit: (typeof housingUnits)[number]): HousingUnitDetail {
  const occupants = occupantSummariesFor(housingUnit.id);
  const recentEnvironmentalObservations = environmentalObservationsFor(housingUnit.id);

  return housingUnitDetailSchema.parse({
    ...housingUnit,
    occupants,
    recentEnvironmentalObservations,
    environmentalObservationTarget: {
      housingUnitId: housingUnit.id,
      supportedEventType: 'environmental_observation',
    },
    transferTarget: {
      housingUnitId: housingUnit.id,
      supportedEventType: 'transfer',
    },
  });
}

export const housingUnitFixtures = housingUnits.map(detailFor);

export const facilityFixtures = [
  facilityHierarchySchema.parse({
    ...facility,
    rooms: [
      {
        ...room,
        racks: [rack],
        housingUnits: housingUnitFixtures.map((housingUnit) =>
          housingUnitSummarySchema.parse({
            id: housingUnit.id,
            roomId: housingUnit.roomId,
            rackId: housingUnit.rackId,
            type: housingUnit.type,
            name: housingUnit.name,
            code: housingUnit.code,
            currentOccupantSubjectIds: housingUnit.occupants.map((occupant) => occupant.subjectId),
            currentOccupantCount: currentOccupantCount(housingUnit.occupants),
            recentEnvironmentalObservationIds: housingUnit.recentEnvironmentalObservations.map(
              (observation) => observation.id,
            ),
          }),
        ),
      },
    ],
  }),
] satisfies FacilityHierarchy[];
