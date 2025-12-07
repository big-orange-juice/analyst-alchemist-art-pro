'use client';

import { useLanguageStore } from '@/store';
import { translations } from '@/i18n/locales';

export function useLanguage() {
  const { language, setLanguage } = useLanguageStore();

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: Record<string, unknown> = translations[language];

    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${path}`);
        return path;
      }
      current = current[key] as Record<string, unknown>;
    }

    return current as unknown as string;
  };

  return {
    language,
    setLanguage,
    t,
    dictionary: translations[language],
  };
}
