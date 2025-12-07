import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './storageKeys';

type Language = 'zh' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'zh',
      setLanguage: (language) => set({ language })
    }),
    {
      name: STORAGE_KEYS.LANGUAGE
    }
  )
);
