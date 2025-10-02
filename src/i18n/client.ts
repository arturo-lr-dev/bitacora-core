'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { defaultLocale, locales } from './config';

i18next
  .use(initReactI18next)
  .use(
    resourcesToBackend((lng: string, ns: string) =>
      import(`./locales/${lng}/${ns}.json`)
    )
  )
  .init({
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    supportedLngs: [...locales],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
