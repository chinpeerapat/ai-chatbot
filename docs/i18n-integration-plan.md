# I18n Integration Plan for AI Chatbot (Minimal Structure Changes)

## 1. Technology Selection

We'll use `next-intl` for internationalization, with a simplified approach that:
- Preserves existing route structure
- Maintains current component hierarchy
- Minimizes refactoring of existing code
- Uses a simple request-based configuration without complex routing changes

## 2. Directory Structure Changes

Minimal changes to existing structure:

```
├── messages/           # Translation files
│   ├── en.json        # English (default)
│   └── th.json        # Thai
├── app/               # Existing structure preserved
│   ├── (auth)/        # Existing auth route group
│   ├── (chat)/        # Existing chat route group
│   └── layout.tsx     # Updated with language provider
├── src/
│   └── i18n/
│       └── request.ts # i18n configuration
├── next.config.mjs    # Updated with next-intl plugin
└── components/
    └── language-switcher.tsx  # New language selector component
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

3. Create i18n configuration:
   ```typescript
   // src/i18n/request.ts
   import { getRequestConfig } from 'next-intl/server';
   
   export default getRequestConfig(async () => {
     // This can be enhanced later to get locale from user settings or cookies
     const locale = 'en';
   
     return {
       locale,
       messages: (await import(`../../messages/${locale}.json`)).default
     };
   });
   ```

### Phase 2: Message Structure (1-2 days)

Create a comprehensive message structure covering all UI components:

```json
// messages/en.json
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
  "weather": {
    "high": "H:{temp}°",
    "low": "L:{temp}°"
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

1. Update root layout with language provider:
   ```typescript
   // app/layout.tsx
   import { NextIntlClientProvider } from 'next-intl';
   import { getLocale, getMessages } from 'next-intl/server';
   
   export default async function RootLayout({
     children
   }: {
     children: React.ReactNode;
   }) {
     const locale = await getLocale();
     const messages = await getMessages();
   
     return (
       <html lang={locale}>
         <body>
           <NextIntlClientProvider messages={messages}>
             <ThemeProvider>
               {children}
             </ThemeProvider>
           </NextIntlClientProvider>
         </body>
       </html>
     );
   }
   ```

2. Create language switcher component:
   ```typescript
   // components/language-switcher.tsx
   import { useLocale } from 'next-intl';
   import { useRouter } from 'next/navigation';
   
   export function LanguageSwitcher() {
     const locale = useLocale();
     const router = useRouter();
   
     return (
       <select
         value={locale}
         onChange={(e) => {
           // This will be enhanced with proper locale storage
           router.refresh();
         }}
       >
         <option value="en">English</option>
         <option value="th">ไทย</option>
       </select>
     );
   }
   ```

3. Update components with translations:

   a. Overview Component:
   ```typescript
   // components/overview.tsx
   import { useTranslations } from 'next-intl';
   import Link from 'next/link';
   import { motion } from 'framer-motion';
   import { MessageIcon, VercelIcon } from './icons';
   
   export const Overview = () => {
     const t = useTranslations('overview');
   
     return (
       <motion.div
         key="overview"
         className="max-w-3xl mx-auto md:mt-20"
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.98 }}
         transition={{ delay: 0.5 }}
       >
         <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
           <p className="flex flex-row justify-center gap-4 items-center">
             <VercelIcon size={32} />
             <span>+</span>
             <MessageIcon size={32} />
           </p>
           <p>
             {t.rich('description', {
               openSourceLink: (chunks) => (
                 <Link
                   className="font-medium underline underline-offset-4"
                   href={t('links.github')}
                   target="_blank"
                 >
                   {chunks}
                 </Link>
               ),
               streamText: (chunks) => (
                 <code className="rounded-md bg-muted px-1 py-0.5">
                   streamText
                 </code>
               ),
               useChatHook: (chunks) => (
                 <code className="rounded-md bg-muted px-1 py-0.5">
                   useChat
                 </code>
               ),
             })}
           </p>
           <p>
             {t.rich('learnMore', {
               docsLink: (chunks) => (
                 <Link
                   className="font-medium underline underline-offset-4"
                   href={t('links.docs')}
                   target="_blank"
                 >
                   {chunks}
                 </Link>
               ),
             })}
           </p>
         </div>
       </motion.div>
     );
   };
   ```

   b. Auth Form:
   ```typescript
   import { useTranslations } from 'next-intl';
   
   export function AuthForm() {
     const t = useTranslations('auth');
     return (
       <form>
         <Label>{t('login.emailLabel')}</Label>
         <Input />
         <Label>{t('login.passwordLabel')}</Label>
         <Input />
       </form>
     );
   }
   ```

   c. Message Actions:
   ```typescript
   import { useTranslations } from 'next-intl';
   
   export function MessageActions() {
     const t = useTranslations('messageActions');
     return (
       // ...
       <TooltipContent>{t('copy')}</TooltipContent>
       // ...
     );
   }
   ```

### Phase 4: Testing (1-2 days)

1. Basic Testing:
   - Verify translations work in all components
   - Test auth flows in both languages
   - Validate error messages
   - Check chat interface
   - Test language switching
   - Verify fallback behavior

2. Documentation:
   - Update README with i18n information
   - Document translation process
   - Add language switching instructions

## 4. Key Considerations

### Minimal Impact
- No route restructuring required
- Existing components remain in place
- Auth flow remains unchanged
- Minimal changes to existing logic

### Performance
- Messages loaded only when needed
- No additional client-side JS for basic functionality
- Maintains current bundle sizes

### User Experience
- Language preference can be stored in user settings
- Smooth language switching
- Fallback to English when translation missing

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

## 6. Timeline

Total estimated time: 5-7 days

- Phase 1 (Setup): 1 day
- Phase 2 (Messages): 1-2 days
- Phase 3 (Components): 2-3 days
- Phase 4 (Testing): 1-2 days

## 7. Implementation Strategy

1. Implement changes incrementally:
   - Start with basic setup
   - Add translations gradually
   - Update components one at a time
   - No big-bang changes

2. Rollout Process:
   - Deploy infrastructure changes first
   - Add English translations
   - Test thoroughly
   - Add Thai translations
   - Enable language switching

## 8. Success Metrics

- All user-facing text is translatable
- No breaking changes to existing functionality
- Smooth language switching
- Minimal performance impact
- Maintainable translation structure