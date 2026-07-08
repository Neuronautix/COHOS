import { describe, expect, it } from 'vitest';

import { workspaceNavigation } from './navigation';

describe('workspace navigation', () => {
  it('covers every MVP navigation area with unique routes', () => {
    expect(workspaceNavigation.map((item) => item.label)).toEqual([
      'Dashboard',
      'Subjects',
      'Facility',
      'Investigations',
      'Welfare',
      'Reports',
      'Connectors',
      'QR scan',
      'Admin settings',
    ]);

    expect(new Set(workspaceNavigation.map((item) => item.href)).size).toBe(
      workspaceNavigation.length,
    );
  });
});
