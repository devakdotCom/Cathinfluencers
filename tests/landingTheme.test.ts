import { describe, expect, it, beforeEach } from 'vitest';
import { applyLandingTheme, readStoredTheme } from '../src/landing/theme';

describe('landing theme', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'dark';
    window.localStorage.clear();
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#050712';
      document.head.appendChild(meta);
    }
  });

  it('defaults to heritage dark theme', () => {
    expect(readStoredTheme()).toBe('dark');
  });

  it('persists corporate theme selection', () => {
    applyLandingTheme('corporate');
    expect(document.documentElement.dataset.theme).toBe('corporate');
    expect(readStoredTheme()).toBe('corporate');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#ffffff');
  });
});
