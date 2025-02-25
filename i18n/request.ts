import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

const LOCALES = ['en', 'th'] as const;
const DEFAULT_LOCALE = 'en';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE;

  // Ensure the locale is valid
  const validLocale = LOCALES.includes(locale as any) ? locale : DEFAULT_LOCALE;

  return {
    messages: (await import(`../messages/${validLocale}.json`)).default,
    locale: validLocale
  };
});