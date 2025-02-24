import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

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
                {chunks}
              </code>
            ),
            useChatHook: (chunks) => (
              <code className="rounded-md bg-muted px-1 py-0.5">
                {chunks}
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
