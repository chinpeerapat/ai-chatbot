import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const t = useTranslations('common.language');
  const locale = useLocale();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    // This will be enhanced with proper locale storage
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="size-4" />
          <span className="sr-only">{t('switch')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={locale === 'en' ? 'bg-muted' : ''}
        >
          {t('en')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('th')}
          className={locale === 'th' ? 'bg-muted' : ''}
        >
          {t('th')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}