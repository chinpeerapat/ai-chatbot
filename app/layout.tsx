import type { Metadata } from "next";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { IBM_Plex_Sans_Thai } from 'next/font/google';

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const LOCALES = ['en', 'th'] as const;
const DEFAULT_LOCALE = 'en';

// Initialize the IBM Plex Sans Thai font
const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ['400', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-ibm-plex-sans-thai',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chat.vercel.ai"),
  title: "AI Chatbot",
  description: "Next.js chatbot with AI capabilities and i18n support.",
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE;
  const validLocale = LOCALES.includes(locale as any) ? locale : DEFAULT_LOCALE;
  const messages = await getMessages();

  return (
    <html
      lang={validLocale}
      suppressHydrationWarning
      className={`${ibmPlexSansThai.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <NextIntlClientProvider
          locale={validLocale}
          messages={messages}
          timeZone="Asia/Bangkok"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex min-h-screen flex-col">
              <Toaster position="top-center" />
              {children}
            </main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}