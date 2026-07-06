import { afterEach, describe, expect, it } from 'vitest';
import i18n, { LANGUAGE_STORAGE_KEY } from '../src/i18n';

afterEach(async () => {
  await i18n.changeLanguage('en');
  window.localStorage.clear();
});

describe('internationalization', () => {
  it('switches instantly to valid Tamil and persists the choice', async () => {
    await i18n.changeLanguage('ta');
    expect(i18n.t('dashboard.publicTitle')).toBe('உங்கள் கத்தோலிக்க ஊடகப் பணி இங்கே தொடங்குகிறது');
    expect(document.documentElement.lang).toBe('ta');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ta');
  });

  it('falls back to English for an unsupported locale', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('nav.home')).toBe('Home');
  });
});
