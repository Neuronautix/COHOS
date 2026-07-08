import { describe, expect, it } from 'vitest';

import { defaultApiBaseUrl, normalizeApiBaseUrl, toApiUrl } from './api-client';

describe('web API client configuration', () => {
  it('defaults to the local API base URL', () => {
    expect(normalizeApiBaseUrl()).toBe(defaultApiBaseUrl);
    expect(normalizeApiBaseUrl('   ')).toBe(defaultApiBaseUrl);
  });

  it('normalizes trailing slashes and joins API paths', () => {
    expect(normalizeApiBaseUrl('https://api.example.test/')).toBe('https://api.example.test');
    expect(toApiUrl('health', 'https://api.example.test/')).toBe('https://api.example.test/health');
    expect(toApiUrl('/subjects', 'https://api.example.test')).toBe(
      'https://api.example.test/subjects',
    );
  });
});
