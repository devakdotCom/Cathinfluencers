import type { ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n, { type AppLanguage } from '../../i18n';

const legacyKeys = {
  home: 'nav.home',
  directory: 'nav.directory',
  events: 'nav.events',
  resources: 'nav.resources',
  account: 'nav.profile',
  admin: 'nav.admin',
  signIn: 'nav.signIn',
  search: 'nav.searchEverything',
  language: 'common.language',
  notifications: 'nav.notifications',
  verified: 'credential.verified',
  invalidCredential: 'credential.invalid'
} as const;

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useLanguage() {
  const { t, i18n: instance } = useTranslation();
  const language: AppLanguage = instance.resolvedLanguage === 'ta' ? 'ta' : 'en';
  return {
    language,
    setLanguage: (nextLanguage: AppLanguage) => void instance.changeLanguage(nextLanguage),
    t: (key: keyof typeof legacyKeys) => t(legacyKeys[key])
  };
}
