import type { AddressInfo } from 'node:net';

import type { INestApplication } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';

import { createApiApp } from '../app.factory.js';

describe('FacilitiesController', () => {
  let app: INestApplication | undefined;

  async function baseUrl() {
    app = await createApiApp();
    await app.listen(0);

    const server = app.getHttpServer() as { address: () => AddressInfo | string | null };
    const address = server.address();

    if (address === null || typeof address === 'string') {
      throw new Error('Expected an ephemeral TCP address for the test server.');
    }

    return `http://127.0.0.1:${address.port}`;
  }

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('lists the facility hierarchy with room, rack, and housing summaries', async () => {
    const response = await fetch(`${await baseUrl()}/facilities`);
    const facilities = (await response.json()) as Array<{
      readonly id?: string;
      readonly rooms?: Array<{
        readonly racks?: Array<{ readonly id?: string }>;
        readonly housingUnits?: Array<{
          readonly id?: string;
          readonly type?: string;
          readonly currentOccupantCount?: number;
        }>;
      }>;
    }>;

    expect(response.status).toBe(200);
    expect(facilities).toHaveLength(1);
    expect(facilities[0]?.id).toBe('facility-synthetic-main');
    expect(facilities[0]?.rooms?.[0]?.racks?.[0]?.id).toBe('rack-synthetic-a1');
    expect(facilities[0]?.rooms?.[0]?.housingUnits?.map((unit) => unit.type).sort()).toEqual([
      'cage',
      'pasture',
      'tank',
    ]);
    expect(
      facilities[0]?.rooms?.[0]?.housingUnits?.find((unit) => unit.id === 'housing-tank-z1')
        ?.currentOccupantCount,
    ).toBe(120);
  });

  it('reads a single facility and returns 404 for a missing facility', async () => {
    const root = await baseUrl();
    const foundResponse = await fetch(`${root}/facilities/facility-synthetic-main`);
    const found = (await foundResponse.json()) as {
      readonly code?: string;
      readonly rooms?: unknown[];
    };

    expect(foundResponse.status).toBe(200);
    expect(found.code).toBe('SMF');
    expect(found.rooms).toHaveLength(1);

    const missingResponse = await fetch(`${root}/facilities/not-found`);

    expect(missingResponse.status).toBe(404);
  });

  it('reads cage details with current occupant summaries', async () => {
    const response = await fetch(`${await baseUrl()}/housing-units/housing-cage-a1`);
    const housingUnit = (await response.json()) as {
      readonly type?: string;
      readonly cageType?: string;
      readonly occupants?: Array<{
        readonly subjectCode?: string;
        readonly profileType?: string;
      }>;
      readonly environmentalObservationTarget?: { readonly supportedEventType?: string };
      readonly transferTarget?: { readonly supportedEventType?: string };
    };

    expect(response.status).toBe(200);
    expect(housingUnit.type).toBe('cage');
    expect(housingUnit.cageType).toBe('individually ventilated');
    expect(housingUnit.occupants).toEqual([
      {
        subjectId: 'subject-rodent-001',
        subjectCode: 'ROD-SYN-001',
        profileType: 'rodent',
        status: 'active',
      },
    ]);
    expect(housingUnit.environmentalObservationTarget?.supportedEventType).toBe(
      'environmental_observation',
    );
    expect(housingUnit.transferTarget?.supportedEventType).toBe('transfer');
  });

  it('reads tank details with batch counts and environmental observations', async () => {
    const response = await fetch(`${await baseUrl()}/housing-units/housing-tank-z1`);
    const housingUnit = (await response.json()) as {
      readonly type?: string;
      readonly volumeLiters?: number;
      readonly occupants?: Array<{ readonly count?: number; readonly profileType?: string }>;
      readonly recentEnvironmentalObservations?: Array<{
        readonly metric?: string;
        readonly value?: number;
      }>;
    };

    expect(response.status).toBe(200);
    expect(housingUnit.type).toBe('tank');
    expect(housingUnit.volumeLiters).toBe(12);
    expect(housingUnit.occupants?.[0]).toMatchObject({
      profileType: 'zebrafish_batch',
      count: 120,
    });
    expect(housingUnit.recentEnvironmentalObservations?.[0]).toMatchObject({
      metric: 'temperature',
      value: 27.5,
    });
  });

  it('reads pasture details with farm animal occupant summaries', async () => {
    const response = await fetch(`${await baseUrl()}/housing-units/housing-pasture-f1`);
    const housingUnit = (await response.json()) as {
      readonly type?: string;
      readonly occupants?: Array<{
        readonly subjectId?: string;
        readonly subjectCode?: string;
        readonly profileType?: string;
        readonly status?: string;
      }>;
    };

    expect(response.status).toBe(200);
    expect(housingUnit.type).toBe('pasture');
    expect(housingUnit.occupants).toEqual([
      {
        subjectId: 'subject-farm-001',
        subjectCode: 'FARM-SYN-001',
        profileType: 'farm_animal',
        status: 'active',
      },
    ]);
    expect(JSON.stringify(housingUnit)).not.toContain('email');
    expect(JSON.stringify(housingUnit)).not.toContain('fullName');
  });

  it('returns 404 for a missing housing unit', async () => {
    const response = await fetch(`${await baseUrl()}/housing-units/not-found`);

    expect(response.status).toBe(404);
  });
});
