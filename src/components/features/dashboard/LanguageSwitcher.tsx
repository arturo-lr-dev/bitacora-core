'use client';

import { useTranslation } from 'react-i18next';
import { locales, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = async (locale: Locale) => {
    await i18n.changeLanguage(locale);
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div
      className="flex items-center gap-1 border rounded-md p-1 bg-white"
      style={{ borderColor: 'hsl(var(--color-border))' }}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => changeLanguage(locale)}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
            i18n.language === locale
              ? ''
              : 'hover:bg-muted'
          }`}
          style={
            i18n.language === locale
              ? {
                  backgroundColor: 'hsl(var(--color-foreground))',
                  color: 'hsl(var(--color-background))',
                }
              : {
                  color: 'hsl(var(--color-muted-foreground))',
                }
          }
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
