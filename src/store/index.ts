import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  AgentStats, 
  AgentModule, 
  AppNotification,
  RankingItem,
  ChartDataPoint,
  AgentCapability
} from '@/types';

// User Store
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
      clearUser: () => set({ currentUser: null }),
    }),
    {
      name: 'matrix_user_session',
    }
  )
);

// Agent Store
interface SavedAgentData {
  name: string;
  class: string;
  stats: AgentStats;
  modules: AgentModule[];
  prompts: Record<string, string>;
  isJoined: boolean;
}

interface AgentState {
  agentName: string | null;
  agentClass: string;
  agentStats: AgentStats;
  agentModules: AgentModule[];
  customPrompts: Record<string, string>;
  isJoinedCompetition: boolean;
  setAgentName: (name: string | null) => void;
  setAgentClass: (cls: string) => void;
  setAgentStats: (stats: AgentStats) => void;
  setAgentModules: (modules: AgentModule[]) => void;
  setCustomPrompts: (prompts: Record<string, string>) => void;
  updateCustomPrompt: (capability: string, prompt: string) => void;
  setIsJoinedCompetition: (joined: boolean) => void;
  clearAgent: () => void;
  loadAgent: (data: SavedAgentData) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      agentName: null,
      agentClass: '智能型',
      agentStats: { intelligence: 50, speed: 50, risk: 50 },
      agentModules: [],
      customPrompts: {},
      isJoinedCompetition: false,
      setAgentName: (name) => set({ agentName: name }),
      setAgentClass: (cls) => set({ agentClass: cls }),
      setAgentStats: (stats) => set({ agentStats: stats }),
      setAgentModules: (modules) => set({ agentModules: modules }),
      setCustomPrompts: (prompts) => set({ customPrompts: prompts }),
      updateCustomPrompt: (capability, prompt) => 
        set((state) => ({ 
          customPrompts: { ...state.customPrompts, [capability]: prompt } 
        })),
      setIsJoinedCompetition: (joined) => set({ isJoinedCompetition: joined }),
      clearAgent: () => set({ 
        agentName: null,
        agentClass: '智能型',
        agentStats: { intelligence: 50, speed: 50, risk: 50 },
        agentModules: [],
        customPrompts: {},
        isJoinedCompetition: false
      }),
      loadAgent: (data) => set({
        agentName: data.name,
        agentClass: data.class,
        agentStats: data.stats,
        agentModules: data.modules,
        customPrompts: data.prompts,
        isJoinedCompetition: data.isJoined,
      }),
    }),
    {
      name: 'matrix_agent_data',
    }
  )
);

// UI Store (non-persistent)
interface UIState {
  theme: 'dark' | 'light';
  showLanding: boolean;
  activeSideTab: 'MY_AGENT' | 'RANKING';
  mobileView: 'MARKET' | 'SIDEBAR' | 'TEAM' | 'RANK';
  isUserMenuOpen: boolean;
  isChatOpen: boolean;
  highlightedAgent: string | null;
  inspectingAgent: string | null;
  selectedCapability: AgentCapability | null;
  editingCapability: AgentCapability | null;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setShowLanding: (show: boolean) => void;
  setActiveSideTab: (tab: 'MY_AGENT' | 'RANKING') => void;
  setMobileView: (view: 'MARKET' | 'SIDEBAR' | 'TEAM' | 'RANK') => void;
  setIsUserMenuOpen: (open: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
  setHighlightedAgent: (agent: string | null) => void;
  setInspectingAgent: (agent: string | null) => void;
  setSelectedCapability: (cap: AgentCapability | null) => void;
  setEditingCapability: (cap: AgentCapability | null) => void;
}

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
  toggleTheme: () => set((state) => ({ 
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
  setEditingCapability: (cap) => set({ editingCapability: cap }),
}));

// Modal Store
interface ModalState {
  isLoginModalOpen: boolean;
  isCreateModalOpen: boolean;
  isSeasonPassOpen: boolean;
  isJoinCompetitionModalOpen: boolean;
  isNotifHistoryOpen: boolean;
  confirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  };
  readingArticle: { title: string; date: string; tag: string } | null;
  pendingAction: 'createAgent' | null;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsSeasonPassOpen: (open: boolean) => void;
  setIsJoinCompetitionModalOpen: (open: boolean) => void;
  setIsNotifHistoryOpen: (open: boolean) => void;
  setConfirmModal: (modal: { isOpen: boolean; title: string; message: string; action: () => void }) => void;
  setReadingArticle: (article: { title: string; date: string; tag: string } | null) => void;
  setPendingAction: (action: 'createAgent' | null) => void;
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
  setIsJoinCompetitionModalOpen: (open) => set({ isJoinCompetitionModalOpen: open }),
  setIsNotifHistoryOpen: (open) => set({ isNotifHistoryOpen: open }),
  setConfirmModal: (modal) => set({ confirmModal: modal }),
  setReadingArticle: (article) => set({ readingArticle: article }),
  setPendingAction: (action) => set({ pendingAction: action }),
}));

// Notification Store
interface NotificationState {
  notifications: AppNotification[];
  notificationHistory: AppNotification[];
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  dismissNotification: (id: string) => void;
  clearHistory: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  notificationHistory: [],
  addNotification: (title, message, type = 'info') => {
    const newNote: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    set((state) => ({
      notifications: [newNote, ...state.notifications].slice(0, 5),
      notificationHistory: [newNote, ...state.notificationHistory].slice(0, 50),
    }));
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== newNote.id),
      }));
    }, 5000);
  },
  dismissNotification: (id) => 
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearHistory: () => set({ notificationHistory: [] }),
}));

// Language Store
type Language = 'zh' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'zh',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'matrix_language',
    }
  )
);

// Market Data Store (for ranking and chart data)
interface MarketDataState {
  chartData: ChartDataPoint[];
  rankingList: RankingItem[];
  setChartData: (data: ChartDataPoint[]) => void;
  setRankingList: (list: RankingItem[]) => void;
}

export const useMarketDataStore = create<MarketDataState>((set) => ({
  chartData: [],
  rankingList: [],
  setChartData: (data) => set({ chartData: data }),
  setRankingList: (list) => set({ rankingList: list }),
}));
