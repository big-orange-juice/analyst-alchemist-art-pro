import { create } from 'zustand';
import type { AppNotification } from '@/types';

interface NotificationState {
  notifications: AppNotification[];
  notificationHistory: AppNotification[];
  addNotification: (
    title: string,
    message: string,
    type?: AppNotification['type']
  ) => void;
  dismissNotification: (id: string) => void;
  clearHistory: () => void;
}

function generateUniqueId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  notificationHistory: [],
  addNotification: (title, message, type = 'info') => {
    const newNote: AppNotification = {
      id: generateUniqueId(),
      title,
      message,
      type,
      timestamp: Date.now()
    };
    set((state) => ({
      notifications: [newNote, ...state.notifications].slice(0, 5),
      notificationHistory: [newNote, ...state.notificationHistory].slice(0, 50)
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== newNote.id)
      }));
    }, 5000);
  },
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  clearHistory: () => set({ notificationHistory: [] })
}));
