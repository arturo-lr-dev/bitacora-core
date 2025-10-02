import { cookies, headers } from 'next/headers';
import { defaultLocale, type Locale } from '@/i18n/config';

export async function getServerLocale(): Promise<Locale> {
  const headersList = await headers();
  const cookieStore = await cookies();

  return (
    (headersList.get('x-locale') as Locale) ||
    (cookieStore.get('NEXT_LOCALE')?.value as Locale) ||
    defaultLocale
  );
}
