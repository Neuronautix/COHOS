import { describe, expect, it } from 'vitest';

import { domainPackageName } from './index.js';

describe('domain package shell', () => {
  it('exports the package name', () => {
    expect(domainPackageName).toBe('@cohos/domain');
  });
});
