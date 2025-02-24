import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { ThemeProvider } from '@/components/theme-provider';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  let messages;
  const locale = params.locale;
  
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    notFound();
  }

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  return (
    <NextIntlClientProvider timeZone="Asia/Bangkok" locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster position="top-center" />
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}