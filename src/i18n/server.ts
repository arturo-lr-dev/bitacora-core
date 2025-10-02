import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { defaultLocale, type Locale } from './config';

export async function initServerI18n(
  locale: Locale = defaultLocale, 
  ns: string = 'common'
) {
  const i18n = createInstance();
  
  await i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend((lng: string, namespace: string) =>
        import(`./locales/${lng}/${namespace}.json`)
      )
    )
    .init({
      lng: locale,
      fallbackLng: defaultLocale,
      defaultNS: 'common',
      ns: [ns], // Asegúrate de que sea un array
      interpolation: {
        escapeValue: false,
      },
    });

  return {
    t: i18n.getFixedT(locale, ns), // Retorna la función t específica
    i18n
  };
}