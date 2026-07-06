import { describe, expect, it } from 'vitest';
import { aggregateWithSuppression } from '../src/features/analytics/privacyAnalytics';
import type { Member } from '../src/types';

describe('privacy-safe analytics', () => {
  it('suppresses groups below the configured minimum', () => {
    const members = [
      { diocese: 'Large' },
      { diocese: 'Large' },
      { diocese: 'Large' },
      { diocese: 'Small' },
    ] as Member[];
    expect(
      aggregateWithSuppression(members, member => member.diocese, 3),
    ).toEqual([{ label: 'Large', count: 3 }]);
  });
});

