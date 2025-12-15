'use client';

import { useCallback, useMemo } from 'react';
import { useLanguageStore } from '@/store';
import { translations } from '@/i18n/locales';

export function useLanguage() {
  const { language, setLanguage } = useLanguageStore();

  const resolve = useCallback(
    (path: string): unknown => {
      const keys = path.split('.');
      let current: unknown = translations[language] as unknown;

      for (const key of keys) {
        if (current === null || current === undefined) return undefined;
        if (typeof current !== 'object') return undefined;
        const obj = current as Record<string, unknown>;
        if (obj[key] === undefined) return undefined;
        current = obj[key];
      }

      return current;
    },
    [language]
  );

  const get = useCallback(
    (path: string): unknown => {
      const value = resolve(path);
      if (value === undefined) {
        console.warn(`Translation missing for key: ${path}`);
      }
      return value;
    },
    [resolve]
  );

  const t = useCallback(
    (path: string): string => {
      const value = resolve(path);
      if (value === undefined) {
        console.warn(`Translation missing for key: ${path}`);
        return path;
      }
      if (typeof value === 'string') return value;
      if (value === null) return path;
      return String(value);
    },
    [resolve]
  );

  const dictionary = useMemo(() => translations[language], [language]);

  return {
    language,
    setLanguage,
    t,
    get,
    dictionary
  };
}
