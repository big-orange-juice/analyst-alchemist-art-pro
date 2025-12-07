import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { STORAGE_KEYS } from './storageKeys';

interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      clearUser: () => set({ currentUser: null })
    }),
    {
      name: STORAGE_KEYS.USER_SESSION
    }
  )
);
