import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { defaultLocale, type Locale } from './config';

export async function initServerI18n(locale: Locale = defaultLocale, ns: string = 'common') {
  const i18n = createInstance();
  await i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend((lng: string, ns: string) =>
        import(`./locales/${lng}/${ns}.json`)
      )
    )
    .init({
      lng: locale,
      fallbackLng: defaultLocale,
      defaultNS: 'common',
      ns,
      interpolation: {
        escapeValue: false,
      },
    });
  return i18n;
}
