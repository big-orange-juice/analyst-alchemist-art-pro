import { create } from 'zustand';
import type { AgentStats, AgentModule } from '@/types';

interface SavedAgentData {
  id: string | null;
  name: string;
  class: string;
  stats: AgentStats;
  modules: AgentModule[];
  prompts: Record<string, string>;
  isJoined: boolean;
}

interface AgentState {
  agentId: string | null;
  agentName: string | null;
  agentClass: string;
  agentStats: AgentStats;
  agentModules: AgentModule[];
  customPrompts: Record<string, string>;
  isJoinedCompetition: boolean;
  lastFetchedUserId: string | null;
  setAgentName: (name: string | null) => void;
  setAgentClass: (cls: string) => void;
  setAgentStats: (stats: AgentStats) => void;
  setAgentModules: (modules: AgentModule[]) => void;
  setCustomPrompts: (prompts: Record<string, string>) => void;
  updateCustomPrompt: (capability: string, prompt: string) => void;
  setAgentId: (id: string | null) => void;
  setIsJoinedCompetition: (joined: boolean) => void;
  setLastFetchedUserId: (userId: string | null) => void;
  clearAgent: () => void;
  loadAgent: (data: SavedAgentData) => void;
}

export const useAgentStore = create<AgentState>()((set) => ({
  agentId: null,
  agentName: null,
  agentClass: '智能型',
  agentStats: { intelligence: 50, speed: 50, risk: 50 },
  agentModules: [],
  customPrompts: {},
  isJoinedCompetition: false,
  lastFetchedUserId: null,
  setAgentName: (name) => set({ agentName: name }),
  setAgentClass: (cls) => set({ agentClass: cls }),
  setAgentStats: (stats) => set({ agentStats: stats }),
  setAgentModules: (modules) => set({ agentModules: modules }),
  setCustomPrompts: (prompts) => set({ customPrompts: prompts }),
  updateCustomPrompt: (capability, prompt) =>
    set((state) => ({
      customPrompts: { ...state.customPrompts, [capability]: prompt }
    })),
  setAgentId: (id) => set({ agentId: id }),
  setIsJoinedCompetition: (joined) => set({ isJoinedCompetition: joined }),
  setLastFetchedUserId: (userId) => set({ lastFetchedUserId: userId }),
  clearAgent: () =>
    set({
      agentId: null,
      agentName: null,
      agentClass: '智能型',
      agentStats: { intelligence: 50, speed: 50, risk: 50 },
      agentModules: [],
      customPrompts: {},
      isJoinedCompetition: false,
      lastFetchedUserId: null
    }),
  loadAgent: (data) =>
    set({
      agentId: data.id,
      agentName: data.name,
      agentClass: data.class,
      agentStats: data.stats,
      agentModules: data.modules,
      customPrompts: data.prompts,
      isJoinedCompetition: data.isJoined
    })
}));
