'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const LOCALES = ['en', 'th'] as const;

// Map of locale codes to their full names (for accessibility)
const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  th: 'Thai',
};

export function LanguageSwitcher() {
  const t = useTranslations('common.language');
  const locale = useLocale();
  const router = useRouter();

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === locale) return; // Don't refresh if the same language is selected
    
    // Set the cookie for the whole app
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`; // 1 year
    
    // Refresh the page to apply new language
    router.refresh();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1.5 px-2.5 transition-all hover:bg-muted"
                aria-label={t('switch')}
              >
                <Languages className="size-4" />
                <span className="text-xs font-medium uppercase">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {t('switch')}
          </TooltipContent>
          <DropdownMenuContent 
            align="end" 
            className="min-w-32 animate-in fade-in-80 zoom-in-95"
          >
            {LOCALES.map((lang) => {
              const isActive = locale === lang;
              return (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={cn(
                    "flex items-center justify-between gap-2 cursor-pointer transition-colors",
                    isActive && "bg-muted font-medium"
                  )}
                >
                  <span>
                    {t(lang)}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({lang.toUpperCase()})
                    </span>
                  </span>
                  {isActive && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}