import { describe, expect, it, vi, beforeEach } from 'vitest';
import { goToMarketingHome } from '../src/utils/marketingNavigation';

describe('marketingNavigation', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { assign: vi.fn() });
  });

  it('loads the public landing page with a full navigation', () => {
    goToMarketingHome();
    expect(window.location.assign).toHaveBeenCalledWith('/');
  });
});
