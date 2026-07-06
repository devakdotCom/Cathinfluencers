import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';

export const LANGUAGE_STORAGE_KEY = 'vox-ecclesiae-language';
export type AppLanguage = 'en' | 'ta';

function savedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'ta' ? 'ta' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ta: { translation: ta } },
  lng: savedLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'ta'],
  interpolation: { escapeValue: false },
  returnNull: false,
  saveMissing: import.meta.env.DEV,
  missingKeyHandler: (_languages, _namespace, key) => {
    if (import.meta.env.DEV) console.warn(`[i18n] Missing translation: ${key}`);
  }
});

i18n.on('languageChanged', language => {
  const normalized: AppLanguage = language === 'ta' ? 'ta' : 'en';
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalized;
    document.documentElement.dir = 'ltr';
  }
});

if (typeof document !== 'undefined') document.documentElement.lang = savedLanguage();

export default i18n;
