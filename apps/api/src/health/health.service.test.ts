import { describe, expect, it } from 'vitest';

import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('returns a stable health payload', () => {
    const response = new HealthService().getHealth();

    expect(response.service).toBe('cohos-api');
    expect(response.status).toBe('ok');
    expect(response.version).toBeTruthy();
    expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
  });
});
