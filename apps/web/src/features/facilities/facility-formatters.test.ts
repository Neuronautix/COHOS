import { describe, expect, it } from 'vitest';

import { facilityHierarchySchema, housingUnitDetailSchema } from '@cohos/domain';

import {
  getHousingSpecificFields,
  getHousingUnitOccupantCount,
  getHousingUnitTypeLabel,
  summarizeFacilities,
} from './facility-formatters';

const cage = housingUnitDetailSchema.parse({
  id: 'housing-cage-test',
  roomId: 'room-test',
  rackId: 'rack-test',
  type: 'cage',
  name: 'Test Cage',
  code: 'CAGE-T',
  cageType: 'individually ventilated',
  occupants: [
    {
      subjectId: 'subject-rodent-test',
      subjectCode: 'ROD-SYN-T',
      profileType: 'rodent',
      status: 'active',
    },
  ],
  recentEnvironmentalObservations: [],
  environmentalObservationTarget: {
    housingUnitId: 'housing-cage-test',
    supportedEventType: 'environmental_observation',
  },
  transferTarget: {
    housingUnitId: 'housing-cage-test',
    supportedEventType: 'transfer',
  },
});

const tank = housingUnitDetailSchema.parse({
  id: 'housing-tank-test',
  roomId: 'room-test',
  rackId: 'rack-test',
  type: 'tank',
  name: 'Test Tank',
  code: 'TANK-T',
  volumeLiters: 12,
  occupants: [
    {
      subjectId: 'subject-batch-test',
      subjectCode: 'ZFB-SYN-T',
      profileType: 'zebrafish_batch',
      status: 'active',
      count: 120,
    },
  ],
  recentEnvironmentalObservations: [
    {
      id: 'event-env-test',
      housingUnitId: 'housing-tank-test',
      occurredAt: '2026-07-08T10:00:00Z',
      metric: 'temperature',
      value: 27.5,
      unit: 'C',
    },
  ],
  environmentalObservationTarget: {
    housingUnitId: 'housing-tank-test',
    supportedEventType: 'environmental_observation',
  },
  transferTarget: {
    housingUnitId: 'housing-tank-test',
    supportedEventType: 'transfer',
  },
});

const facility = facilityHierarchySchema.parse({
  id: 'facility-test',
  organizationId: 'org-synthetic-cohos',
  name: 'Test Facility',
  code: 'TF',
  rooms: [
    {
      id: 'room-test',
      facilityId: 'facility-test',
      name: 'Test Room',
      code: 'T',
      racks: [
        {
          id: 'rack-test',
          roomId: 'room-test',
          name: 'Test Rack',
          code: 'R',
        },
      ],
      housingUnits: [
        {
          id: cage.id,
          roomId: cage.roomId,
          rackId: cage.rackId,
          type: cage.type,
          name: cage.name,
          code: cage.code,
          currentOccupantSubjectIds: cage.occupants.map((occupant) => occupant.subjectId),
          currentOccupantCount: getHousingUnitOccupantCount(cage),
          recentEnvironmentalObservationIds: [],
        },
        {
          id: tank.id,
          roomId: tank.roomId,
          rackId: tank.rackId,
          type: tank.type,
          name: tank.name,
          code: tank.code,
          currentOccupantSubjectIds: tank.occupants.map((occupant) => occupant.subjectId),
          currentOccupantCount: getHousingUnitOccupantCount(tank),
          recentEnvironmentalObservationIds: tank.recentEnvironmentalObservations.map(
            (observation) => observation.id,
          ),
        },
      ],
    },
  ],
});

describe('facility formatters', () => {
  it('labels cage and tank housing details', () => {
    expect(getHousingUnitTypeLabel(cage)).toBe('Cage');
    expect(getHousingSpecificFields(cage)).toEqual(
      expect.arrayContaining([
        {
          label: 'Cage type',
          value: 'individually ventilated',
        },
      ]),
    );

    expect(getHousingUnitTypeLabel(tank)).toBe('Tank');
    expect(getHousingSpecificFields(tank)).toEqual(
      expect.arrayContaining([
        {
          label: 'Volume',
          value: '12 L',
        },
      ]),
    );
  });

  it('uses batch counts when summarizing tank occupants', () => {
    expect(getHousingUnitOccupantCount(cage)).toBe(1);
    expect(getHousingUnitOccupantCount(tank)).toBe(120);
  });

  it('summarizes facility hierarchy totals', () => {
    expect(summarizeFacilities([facility])).toEqual({
      environmentalObservationCount: 1,
      facilityCount: 1,
      housingUnitCount: 2,
      occupantCount: 121,
      roomCount: 1,
    });
  });
});
