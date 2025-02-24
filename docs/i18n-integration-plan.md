# I18n Integration Plan for AI Chatbot (with i18n Routing)

## 1. Technology Selection

We'll use `next-intl` for internationalization, implementing a routing-based approach that:
- Uses i18n routing with locale prefixes (e.g., /en/chat, /th/chat)
- Maintains component hierarchy within locale-specific routes
- Enables static rendering for better performance
- Provides type-safe translations and routing

## 2. Directory Structure Changes

Updated structure to support i18n routing:

```
├── messages/           # Translation files
│   ├── en.json        # English (default)
│   └── th.json        # Thai
├── app/               # Updated structure with locale routing
│   ├── [locale]/      # Dynamic locale segment
│   │   ├── (auth)/    # Auth route group
│   │   ├── (chat)/    # Chat route group
│   │   └── layout.tsx # Locale-specific layout
│   └── layout.tsx     # Root layout
├── i18n/              # i18n configuration
│   ├── routing.ts     # i18n routing configuration
│   └── request.ts     # i18n request configuration
├── middleware.ts      # Updated with next-intl middleware
└── next.config.mjs    # Updated with next-intl plugin
```

## 3. Implementation Steps

### Phase 1: Basic Setup (1 day)

1. Install dependencies:
   ```bash
   pnpm add next-intl
   ```

2. Configure next-intl plugin:
   ```typescript
   // next.config.mjs
   import createNextIntlPlugin from 'next-intl/plugin';
   
   const withNextIntl = createNextIntlPlugin();
   
   /** @type {import('next').NextConfig} */
   const nextConfig = {};
   
   export default withNextIntl(nextConfig);
   ```

3. Create i18n routing configuration:
   ```typescript
   // i18n/routing.ts
   import {defineRouting} from 'next-intl/routing';
   import {createNavigation} from 'next-intl/navigation';
   
   export const routing = defineRouting({
     locales: ['en', 'th'],
     defaultLocale: 'en'
   });
   
   export const {
     Link, 
     redirect,
     usePathname,
     useRouter,
     getPathname
   } = createNavigation(routing);
   ```

4. Set up middleware for locale handling while preserving NextAuth config:
   ```typescript
   // middleware.ts
   import NextAuth from 'next-auth';
   import { authConfig } from '@/app/(auth)/auth.config';
   import createMiddleware from 'next-intl/middleware';
   import {routing} from './src/i18n/routing';
   
   // Create both middleware handlers
   const authMiddleware = NextAuth(authConfig).auth;
   const intlMiddleware = createMiddleware(routing);
   
   // Combine the middleware handlers
   export default async function middleware(request) {
     // First handle i18n
     const intlResult = await intlMiddleware(request);
     
     // Then handle auth, passing through the i18n result
     return (await authMiddleware(request)) || intlResult;
   }
   
   export const config = {
     // Combine matchers from both middleware
     matcher: [
       // i18n routes
       '/',
       '/(en|th)/:path*',
       // auth routes
       '/:id',
       '/api/:path*',
       '/login',
       '/register'
     ]
   };
   ```

5. Create i18n request configuration:
   ```typescript
   // i18n/request.ts
   import {getRequestConfig} from 'next-intl/server';
   import {routing} from './routing';
   
   export default getRequestConfig(async ({requestLocale}) => {
     let locale = await requestLocale;
   
     if (!locale || !routing.locales.includes(locale as any)) {
       locale = routing.defaultLocale;
     }
   
     return {
       locale,
       messages: (await import(`../messages/${locale}.json`)).default
     };
   });
   ```

### Phase 2: Message Structure (1-2 days)

Create comprehensive message structure (messages/en.json and messages/th.json) covering all UI components:

```json
{
  "app": {
    "title": "Next.js Chatbot Template",
    "description": "Next.js chatbot template using the AI SDK."
  },
  "overview": {
    "title": "Open Source AI Chatbot",
    "description": "This is an {openSourceLink} chatbot template built with Next.js and the AI SDK by Vercel. It uses the {streamText} function in the server and the {useChatHook} hook on the client to create a seamless chat experience.",
    "openSourceLink": "open source",
    "learnMore": "You can learn more about the AI SDK by visiting the {docsLink}.",
    "docsLink": "docs",
    "links": {
      "github": "https://github.com/vercel/ai-chatbot",
      "docs": "https://sdk.vercel.ai/docs"
    }
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "emailLabel": "Email Address",
      "passwordLabel": "Password",
      "submitButton": "Sign In",
      "errors": {
        "invalidCredentials": "Invalid email or password",
        "failed": "Authentication failed"
      }
    },
    "register": {
      "title": "Create Account",
      "submitButton": "Create Account"
    }
  },
  "chat": {
    "header": {
      "newChat": "New Chat",
      "deployButton": "Deploy with Vercel"
    },
    "input": {
      "placeholder": "Type a message...",
      "send": "Send",
      "stop": "Stop generating"
    },
    "messages": {
      "thinking": "Thinking...",
      "error": "An error occurred, please try again!"
    }
  },
  "sidebar": {
    "title": "Chatbot",
    "newChat": "New Chat",
    "timeGroups": {
      "today": "Today",
      "yesterday": "Yesterday",
      "lastWeek": "Last 7 days",
      "lastMonth": "Last 30 days",
      "older": "Older"
    },
    "emptyState": {
      "loggedOut": "Login to save and revisit previous chats!",
      "noChats": "Your conversations will appear here once you start chatting!"
    }
  },
  "userNav": {
    "theme": {
      "toggle": "Toggle {mode} mode",
      "light": "light",
      "dark": "dark"
    },
    "signOut": "Sign out"
  },
  "visibility": {
    "private": {
      "label": "Private",
      "description": "Only you can access this chat"
    },
    "public": {
      "label": "Public", 
      "description": "Anyone with the link can access this chat"
    }
  },
  "messageActions": {
    "copy": "Copy",
    "copied": "Copied to clipboard!",
    "upvote": "Upvote Response",
    "downvote": "Downvote Response",
    "upvoting": "Upvoting Response...",
    "upvoted": "Upvoted Response!",
    "downvoting": "Downvoting Response...",
    "downvoted": "Downvoted Response!",
    "error": "Failed to {action} response"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "language": {
      "en": "English",
      "th": "ไทย"
    }
  }
}
```

### Phase 3: Component Updates (2-3 days)

1. Update root layout with locale support:
   ```typescript
   // app/[locale]/layout.tsx
   import {NextIntlClientProvider} from 'next-intl';
   import {getMessages} from 'next-intl/server';
   import {notFound} from 'next/navigation';
   import {routing} from '@/i18n/routing';
   
   export function generateStaticParams() {
     return routing.locales.map((locale) => ({locale}));
   }
   
   export default async function LocaleLayout({
     children,
     params: {locale}
   }: {
     children: React.ReactNode;
     params: {locale: string};
   }) {
     if (!routing.locales.includes(locale as any)) {
       notFound();
     }
   
     const messages = await getMessages();
   
     return (
       <html lang={locale}>
         <body>
           <NextIntlClientProvider messages={messages}>
             {children}
           </NextIntlClientProvider>
         </body>
       </html>
     );
   }
   ```

2. Update language switcher component:
   ```typescript
   // components/language-switcher.tsx
   import {useLocale} from 'next-intl';
   import {useRouter, usePathname} from '@/i18n/routing';
   import {useTranslations} from 'next-intl';
   
   export function LanguageSwitcher() {
     const t = useTranslations('common.language');
     const locale = useLocale();
     const router = useRouter();
     const pathname = usePathname();
   
     return (
       <select
         value={locale}
         onChange={(e) => {
           router.replace(pathname, {locale: e.target.value});
         }}
       >
         <option value="en">{t('en')}</option>
         <option value="th">{t('th')}</option>
       </select>
     );
   }
   ```

3. Enable static rendering for pages:
   ```typescript
   // app/[locale]/page.tsx
   import {setRequestLocale} from 'next-intl/server';
   
   export default function IndexPage({params: {locale}}) {
     setRequestLocale(locale);
   
     const t = useTranslations('IndexPage');
   
     return (
       // ...
     );
   }
   ```

4. Update components with translations:
   - Replace all hardcoded strings with translation keys
   - Use `useTranslations` hook for accessing translations
   - Update links to use next-intl's Link component
   - Add proper typing for translation keys

### Phase 4: Testing (1-2 days)

1. Basic Testing:
   - Verify translations work in all components
   - Test auth flows in both languages
   - Validate error messages
   - Check chat interface
   - Test language switching
   - Verify fallback behavior
   - Test static rendering

2. Documentation:
   - Update README with i18n information
   - Document translation process
   - Add language switching instructions
   - Document static rendering setup

## 4. Key Considerations

### Performance
- Static rendering enabled for better performance
- Messages loaded only when needed
- No additional client-side JS for basic functionality
- Maintains current bundle sizes

### User Experience
- Language preference persisted in URL
- Smooth language switching with proper routing
- Fallback to English when translation missing
- SEO-friendly URLs with locale prefixes

### Maintainability
- Type-safe translations
- Centralized routing configuration
- Clear separation of concerns
- Easy to add new languages

## 5. Future Enhancements

1. Gradual Improvements:
   - Add more languages as needed
   - Enhance translation coverage
   - Improve language detection
   - Add user settings for language preference

2. Possible Extensions:
   - Translation management system
   - Automated translation workflow
   - Regional content variations
   - Domain-based routing (e.g., en.example.com)

## 6. Timeline

Total estimated time: 5-7 days

- Phase 1 (Setup): 1 day
- Phase 2 (Messages): 1-2 days
- Phase 3 (Components): 2-3 days
- Phase 4 (Testing): 1-2 days

## 7. Implementation Strategy

1. Implement changes incrementally:
   - Start with routing infrastructure
   - Add translations gradually
   - Update components one at a time
   - Enable static rendering
   - No big-bang changes

2. Rollout Process:
   - Deploy routing changes first
   - Add English translations
   - Test thoroughly
   - Add Thai translations
   - Enable language switching
   - Enable static rendering

## 8. Success Metrics

- All user-facing text is translatable
- No breaking changes to existing functionality
- Smooth language switching with proper routing
- Static rendering enabled for better performance
- SEO-friendly URLs with locale prefixes
- Type-safe translations throughout the app
- Maintainable translation structure