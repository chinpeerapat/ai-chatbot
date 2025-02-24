import { useTranslations } from 'next-intl';

interface TranslatedDescriptionProps {
  translationKey: string;
}

export function TranslatedDescription({ translationKey }: TranslatedDescriptionProps) {
  // Split the translation key into namespace and key
  const [namespace, ...keyParts] = translationKey.split('.');
  const key = keyParts.join('.');
  
  const t = useTranslations(namespace);
  const translated = t(key);
  return <>{translated}</>;
} 