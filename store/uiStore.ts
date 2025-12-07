import { create } from 'zustand';
import type { AgentCapability } from '@/types';

type Theme = 'dark' | 'light';
type ActiveSideTab = 'MY_AGENT' | 'RANKING';
type MobileView = 'MARKET' | 'SIDEBAR' | 'TEAM' | 'RANK';

type UIState = {
  theme: Theme;
  showLanding: boolean;
  activeSideTab: ActiveSideTab;
  mobileView: MobileView;
  isUserMenuOpen: boolean;
  isChatOpen: boolean;
  highlightedAgent: string | null;
  inspectingAgent: string | null;
  selectedCapability: AgentCapability | null;
  editingCapability: AgentCapability | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setShowLanding: (show: boolean) => void;
  setActiveSideTab: (tab: ActiveSideTab) => void;
  setMobileView: (view: MobileView) => void;
  setIsUserMenuOpen: (open: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
  setHighlightedAgent: (agent: string | null) => void;
  setInspectingAgent: (agent: string | null) => void;
  setSelectedCapability: (cap: AgentCapability | null) => void;
  setEditingCapability: (cap: AgentCapability | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  showLanding: true,
  activeSideTab: 'MY_AGENT',
  mobileView: 'MARKET',
  isUserMenuOpen: false,
  isChatOpen: false,
  highlightedAgent: null,
  inspectingAgent: null,
  selectedCapability: null,
  editingCapability: null,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark'
    })),
  setShowLanding: (show) => set({ showLanding: show }),
  setActiveSideTab: (tab) => set({ activeSideTab: tab }),
  setMobileView: (view) => set({ mobileView: view }),
  setIsUserMenuOpen: (open) => set({ isUserMenuOpen: open }),
  setIsChatOpen: (open) => set({ isChatOpen: open }),
  setHighlightedAgent: (agent) => set({ highlightedAgent: agent }),
  setInspectingAgent: (agent) => set({ inspectingAgent: agent }),
  setSelectedCapability: (cap) => set({ selectedCapability: cap }),
  setEditingCapability: (cap) => set({ editingCapability: cap })
}));
