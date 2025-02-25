import { useTranslations } from 'next-intl';

interface TranslatedDescriptionProps {
  translationKey: string;
  className?: string;
  as?: React.ElementType;
}

export function TranslatedDescription({ 
  translationKey,
  className,
  as: Component = 'span'
}: TranslatedDescriptionProps) {
  // Split the translation key into namespace and key
  const [namespace, ...keyParts] = translationKey.split('.');
  const key = keyParts.join('.');
  
  const t = useTranslations(namespace);
  const translated = t(key);
  
  return (
    <Component className={className}>
      {translated}
    </Component>
  );
} 