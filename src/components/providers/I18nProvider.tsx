'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/i18n/client';
import type { Locale } from '@/i18n/config';

interface I18nProviderProps {
  children: ReactNode;
  locale?: Locale;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  useEffect(() => {
    if (locale && i18next.language !== locale) {
      i18next.changeLanguage(locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
