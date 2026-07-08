import type { AddressInfo } from 'node:net';

import type { INestApplication } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';

import { createApiApp } from '../app.factory.js';

describe('EventsController', () => {
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

  it('lists event fixtures and derives existing batch and housing state', async () => {
    const root = await baseUrl();
    const eventsResponse = await fetch(`${root}/events`);
    const events = (await eventsResponse.json()) as Array<{
      readonly eventType?: string;
    }>;
    const mortalityEventsResponse = await fetch(`${root}/events?eventType=mortality`);
    const mortalityEvents = (await mortalityEventsResponse.json()) as Array<{
      readonly id?: string;
    }>;
    const subjectStateResponse = await fetch(
      `${root}/events/subjects/subject-zebrafish-batch-001/state`,
    );
    const subjectState = (await subjectStateResponse.json()) as {
      readonly aliveStatus?: string;
      readonly batchCount?: number;
      readonly currentHousingUnitId?: string;
      readonly alertFlags?: Array<{ readonly code?: string }>;
    };
    const housingStateResponse = await fetch(`${root}/events/housing-units/housing-tank-z1/state`);
    const housingState = (await housingStateResponse.json()) as {
      readonly latestEnvironmentalObservationId?: string;
      readonly alertFlags?: Array<{ readonly code?: string }>;
    };

    expect(eventsResponse.status).toBe(200);
    expect(events.map((event) => event.eventType).sort()).toEqual([
      'environmental_observation',
      'mortality',
      'transfer',
      'welfare_observation',
    ]);
    expect(mortalityEventsResponse.status).toBe(200);
    expect(mortalityEvents.map((event) => event.id)).toEqual(['event-mortality-zebrafish-1']);
    expect(subjectStateResponse.status).toBe(200);
    expect(subjectState.currentHousingUnitId).toBe('housing-tank-z1');
    expect(subjectState.batchCount).toBe(116);
    expect(subjectState.aliveStatus).toBe('alive');
    expect(subjectState.alertFlags?.map((flag) => flag.code)).toEqual([
      'environmental_recorded',
      'mortality_recorded',
    ]);
    expect(housingStateResponse.status).toBe(200);
    expect(housingState.latestEnvironmentalObservationId).toBe('event-env-zebrafish-1');
    expect(housingState.alertFlags?.[0]?.code).toBe('environmental_recorded');
  });

  it('records transfers and appends redacted audit events', async () => {
    const root = await baseUrl();
    const transferResponse = await fetch(`${root}/events/transfers`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectId: 'subject-rodent-001',
        fromHousingUnitId: 'housing-cage-a1',
        toHousingUnitId: 'housing-pasture-f1',
        occurredAt: '2026-03-03T09:00:00Z',
        recordedByUserId: 'user-seed-coordinator',
        reason: 'Synthetic transfer test',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const transfer = (await transferResponse.json()) as {
      readonly id?: string;
      readonly eventType?: string;
      readonly toHousingUnitId?: string;
    };
    const stateResponse = await fetch(`${root}/events/subjects/subject-rodent-001/state`);
    const state = (await stateResponse.json()) as {
      readonly currentHousingUnitId?: string;
      readonly latestEventId?: string;
    };
    const auditResponse = await fetch(`${root}/audit-events`);
    const auditEvents = (await auditResponse.json()) as Array<{
      readonly entityId?: string;
      readonly eventId?: string;
      readonly newValue?: { readonly hash?: string; readonly redacted?: boolean };
    }>;
    const auditEvent = auditEvents.find((item) => item.entityId === transfer.id);
    const filteredAuditResponse = await fetch(`${root}/audit-events?eventId=${transfer.id}`);
    const filteredAuditEvents = (await filteredAuditResponse.json()) as Array<{
      readonly entityId?: string;
    }>;

    expect(transferResponse.status).toBe(201);
    expect(transfer.id).toMatch(/^event-transfer-/);
    expect(transfer.eventType).toBe('transfer');
    expect(transfer.toHousingUnitId).toBe('housing-pasture-f1');
    expect(state.currentHousingUnitId).toBe('housing-pasture-f1');
    expect(state.latestEventId).toBe(transfer.id);
    expect(auditEvent?.eventId).toBe(transfer.id);
    expect(auditEvent?.newValue?.redacted).toBe(true);
    expect(auditEvent?.newValue?.hash).toMatch(/^sha256:/);
    expect(filteredAuditResponse.status).toBe(200);
    expect(filteredAuditEvents.map((item) => item.entityId)).toEqual([transfer.id]);
  });

  it('records mortality and derives deceased status and depleted batch counts', async () => {
    const root = await baseUrl();
    const individualResponse = await fetch(`${root}/events/mortalities`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectId: 'subject-rodent-001',
        housingUnitId: 'housing-cage-a1',
        occurredAt: '2026-03-03T10:00:00Z',
        recordedByUserId: 'user-seed-coordinator',
        count: 1,
        cause: 'Synthetic mortality test',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const batchResponse = await fetch(`${root}/events/mortalities`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectId: 'subject-zebrafish-batch-001',
        housingUnitId: 'housing-tank-z1',
        occurredAt: '2026-03-03T10:05:00Z',
        recordedByUserId: 'user-seed-coordinator',
        count: 116,
        cause: 'Synthetic batch depletion test',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const individualStateResponse = await fetch(`${root}/events/subjects/subject-rodent-001/state`);
    const individualState = (await individualStateResponse.json()) as {
      readonly aliveStatus?: string;
      readonly alertFlags?: Array<{ readonly code?: string }>;
    };
    const batchStateResponse = await fetch(
      `${root}/events/subjects/subject-zebrafish-batch-001/state`,
    );
    const batchState = (await batchStateResponse.json()) as {
      readonly aliveStatus?: string;
      readonly batchCount?: number;
      readonly alertFlags?: Array<{ readonly code?: string }>;
    };

    expect(individualResponse.status).toBe(201);
    expect(batchResponse.status).toBe(201);
    expect(individualState.aliveStatus).toBe('deceased');
    expect(individualState.alertFlags?.map((flag) => flag.code)).toContain('mortality_recorded');
    expect(batchState.batchCount).toBe(0);
    expect(batchState.aliveStatus).toBe('deceased');
    expect(batchState.alertFlags?.map((flag) => flag.code)).toContain('batch_depleted');
  });

  it('records welfare and environmental observations and derives alert flags', async () => {
    const root = await baseUrl();
    const welfareResponse = await fetch(`${root}/events/welfare-observations`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectId: 'subject-rodent-001',
        occurredAt: '2026-03-03T11:00:00Z',
        recordedByUserId: 'user-seed-coordinator',
        score: 5,
        status: 'critical',
        notes: 'Synthetic welfare test',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const environmentalResponse = await fetch(`${root}/events/environmental-observations`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        housingUnitId: 'housing-cage-a1',
        occurredAt: '2026-03-03T11:05:00Z',
        recordedByUserId: 'user-seed-coordinator',
        metric: 'humidity',
        value: 51,
        unit: '%',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const welfare = (await welfareResponse.json()) as { readonly id?: string };
    const environmental = (await environmentalResponse.json()) as { readonly id?: string };
    const subjectStateResponse = await fetch(`${root}/events/subjects/subject-rodent-001/state`);
    const subjectState = (await subjectStateResponse.json()) as {
      readonly latestWelfareStatus?: string;
      readonly alertFlags?: Array<{ readonly code?: string; readonly sourceEventId?: string }>;
    };
    const housingStateResponse = await fetch(`${root}/events/housing-units/housing-cage-a1/state`);
    const housingState = (await housingStateResponse.json()) as {
      readonly latestEnvironmentalObservationId?: string;
    };

    expect(welfareResponse.status).toBe(201);
    expect(environmentalResponse.status).toBe(201);
    expect(subjectState.latestWelfareStatus).toBe('critical');
    expect(subjectState.alertFlags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'welfare_critical',
          sourceEventId: welfare.id,
        }),
        expect.objectContaining({
          code: 'environmental_recorded',
          sourceEventId: environmental.id,
        }),
      ]),
    );
    expect(housingState.latestEnvironmentalObservationId).toBe(environmental.id);
  });

  it('rejects invalid payloads, missing references, and audit mutations', async () => {
    const root = await baseUrl();
    const invalidResponse = await fetch(`${root}/events/welfare-observations`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectId: 'subject-rodent-001',
        occurredAt: '2026-03-03 11:00:00',
        recordedByUserId: 'user-seed-coordinator',
        score: 6,
        status: 'critical',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const missingSubjectResponse = await fetch(`${root}/events/transfers`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        subjectId: 'subject-not-found',
        toHousingUnitId: 'housing-cage-a1',
        occurredAt: '2026-03-03T11:10:00Z',
        recordedByUserId: 'user-seed-coordinator',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const missingHousingResponse = await fetch(`${root}/events/environmental-observations`, {
      body: JSON.stringify({
        organizationId: 'org-synthetic-cohos',
        housingUnitId: 'housing-not-found',
        occurredAt: '2026-03-03T11:15:00Z',
        recordedByUserId: 'user-seed-coordinator',
        metric: 'temperature',
        value: 20,
        unit: 'C',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const auditMutationResponse = await fetch(`${root}/audit-events/audit-seed-subject-create-1`, {
      body: JSON.stringify({ action: 'mutate' }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'PUT',
    });

    expect(invalidResponse.status).toBe(400);
    expect(missingSubjectResponse.status).toBe(404);
    expect(missingHousingResponse.status).toBe(404);
    expect(auditMutationResponse.status).toBe(404);
  });

  it('reads alerts and audit events without direct human identifiers', async () => {
    const root = await baseUrl();
    const alertsResponse = await fetch(`${root}/alerts`);
    const auditResponse = await fetch(`${root}/audit-events/audit-seed-subject-create-1`);
    const alertRecords = (await alertsResponse.json()) as Array<{ readonly id?: string }>;
    const auditEvent = (await auditResponse.json()) as unknown;

    expect(alertsResponse.status).toBe(200);
    expect(alertRecords.map((alert) => alert.id)).toEqual(['alert-synthetic-info-1']);
    expect(auditResponse.status).toBe(200);
    expect(JSON.stringify(auditEvent)).not.toContain('email');
    expect(JSON.stringify(auditEvent)).not.toContain('fullName');
  });
});
