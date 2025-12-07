import { create } from 'zustand';

type PendingAction = 'createAgent' | null;

type ConfirmModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  action: () => void;
};

type ReadingArticleState = { title: string; date: string; tag: string } | null;

interface ModalState {
  isLoginModalOpen: boolean;
  isCreateModalOpen: boolean;
  isSeasonPassOpen: boolean;
  isJoinCompetitionModalOpen: boolean;
  isNotifHistoryOpen: boolean;
  confirmModal: ConfirmModalState;
  readingArticle: ReadingArticleState;
  pendingAction: PendingAction;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsSeasonPassOpen: (open: boolean) => void;
  setIsJoinCompetitionModalOpen: (open: boolean) => void;
  setIsNotifHistoryOpen: (open: boolean) => void;
  setConfirmModal: (modal: ConfirmModalState) => void;
  setReadingArticle: (article: ReadingArticleState) => void;
  setPendingAction: (action: PendingAction) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginModalOpen: false,
  isCreateModalOpen: false,
  isSeasonPassOpen: false,
  isJoinCompetitionModalOpen: false,
  isNotifHistoryOpen: false,
  confirmModal: { isOpen: false, title: '', message: '', action: () => {} },
  readingArticle: null,
  pendingAction: null,
  setIsLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
  setIsCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setIsSeasonPassOpen: (open) => set({ isSeasonPassOpen: open }),
  setIsJoinCompetitionModalOpen: (open) =>
    set({ isJoinCompetitionModalOpen: open }),
  setIsNotifHistoryOpen: (open) => set({ isNotifHistoryOpen: open }),
  setConfirmModal: (modal) => set({ confirmModal: modal }),
  setReadingArticle: (article) => set({ readingArticle: article }),
  setPendingAction: (action) => set({ pendingAction: action })
}));
