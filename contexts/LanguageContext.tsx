import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { translations } from '../i18n/locales';

const STORAGE_KEY = 'analyst_alchemist_language';

type Language = keyof typeof translations;

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
  dictionary: (typeof translations)[Language];
};

const fallbackLanguage: Language = 'zh';

const defaultValue: LanguageContextValue = {
  language: fallbackLanguage,
  setLanguage: () => undefined,
  t: (key: string) => key,
  dictionary: translations[fallbackLanguage]
};

const LanguageContext = createContext<LanguageContextValue>(defaultValue);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(fallbackLanguage);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  const t = useCallback(
    (path: string) => {
      const keys = path.split('.');
      let current: Record<string, unknown> = translations[language];

      for (const key of keys) {
        if (current[key] === undefined) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Missing translation for key: ${path}`);
          }
          return path;
        }
        current = current[key] as Record<string, unknown>;
      }

      return (current as unknown as string) ?? path;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      dictionary: translations[language]
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
