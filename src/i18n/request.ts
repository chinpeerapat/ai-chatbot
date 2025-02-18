import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // This can be enhanced later to get locale from user settings or cookies
  const locale = 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});