export enum AgentCapability {
  AUTO_TRADING = 'AUTO_TRADING',
  STRATEGY_PICKING = 'STRATEGY_PICKING',
  STOCK_ANALYSIS = 'STOCK_ANALYSIS',
  BACKTESTING = 'BACKTESTING',
  ARTICLE_WRITING = 'ARTICLE_WRITING'
}

export interface User {
  id: string;
  username: string;
  email?: string;
  faction?: 'CORPO' | 'NOMAD' | 'NETRUNNER';
  level: number;
  achievements: Achievement[];
  avatarFrame: string;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}

export interface AgentStats {
  intelligence: number; // Renamed to Strategy Capability in UI
  speed: number; // Renamed to Execution Efficiency in UI
  risk: number; // Renamed to Stability/Robustness in UI
}

// New: Module Definition for Team Assembly
export interface AgentModule {
  id: string;
  type: 'CORE' | 'EXECUTION' | 'RISK';
  name: string;
  description: string;
  statsMod: Partial<AgentStats>;
  icon: string;
}

export interface Agent {
  id: string;
  name: string;
  class: string; // e.g., "NetRunner", "Corporate", "Street Kid"
  modules: AgentModule[]; // Composition
  level: number;
  exp: number;
  nextLevelExp: number;
  stats: AgentStats;
  rank: number;
  returns: number;
  status: 'active' | 'idle' | 'error';
}

export interface RankingItem {
  id: number | string;
  rank: number;
  name: string;
  class: string;
  profit: string;
  rawProfit: number; // Numeric value for sorting
  status: '在线' | '离线' | '训练中';
  badges?: string[];
  isUser?: boolean; // Identify if this is the user's agent
}

export interface ChartDataPoint {
  time: string;
  [agentId: string]: number | string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'market';
  timestamp: number;
}

export interface CapabilityHistoryEntry {
  time: string;
  tag: string;
  summary: string;
  detail: string;
}

export interface StockActivityHoldingsLatestMaster {
  id: string;
  activity_id: string;
  user_id: string;
  agent_id: string;
  snapshot_date: string;
  status: string;
  cash: number;
  total_market_value: number;
  total_cost: number;
  profit_loss: number;
  profit_loss_pct: number;
  total_value: number;
  holdings_count: number;
}

export interface StockActivityHoldingsLatestItem {
  id: string;
  position_id: string;
  activity_id: string;
  user_id: string;
  agent_id: string;
  snapshot_date: string;
  stock_code: string;
  stock_name: string;
  quantity: number;
  avg_cost: number;
  latest_price: number;
  market_value: number;
  cost: number;
  profit_loss: number;
  profit_loss_pct: number;
}

export interface StockActivityHoldingsLatestResponse {
  activity_id: string;
  user_id: string;
  price_date: string;
  masters: StockActivityHoldingsLatestMaster[];
  items: StockActivityHoldingsLatestItem[];
}

export const AGENT_CAPABILITY_DETAILS: Record<
  AgentCapability,
  { icon: string; labelKey: string; descKey: string; roleKey: string }
> = {
  [AgentCapability.AUTO_TRADING]: {
    icon: 'activity',
    labelKey: 'capabilities.AUTO_TRADING.label',
    descKey: 'capabilities.AUTO_TRADING.desc',
    roleKey: 'capabilities.AUTO_TRADING.role'
  },
  [AgentCapability.STRATEGY_PICKING]: {
    icon: 'crosshair',
    labelKey: 'capabilities.STRATEGY_PICKING.label',
    descKey: 'capabilities.STRATEGY_PICKING.desc',
    roleKey: 'capabilities.STRATEGY_PICKING.role'
  },
  [AgentCapability.STOCK_ANALYSIS]: {
    icon: 'search',
    labelKey: 'capabilities.STOCK_ANALYSIS.label',
    descKey: 'capabilities.STOCK_ANALYSIS.desc',
    roleKey: 'capabilities.STOCK_ANALYSIS.role'
  },
  [AgentCapability.BACKTESTING]: {
    icon: 'rewind',
    labelKey: 'capabilities.BACKTESTING.label',
    descKey: 'capabilities.BACKTESTING.desc',
    roleKey: 'capabilities.BACKTESTING.role'
  },
  [AgentCapability.ARTICLE_WRITING]: {
    icon: 'pen-tool',
    labelKey: 'capabilities.ARTICLE_WRITING.label',
    descKey: 'capabilities.ARTICLE_WRITING.desc',
    roleKey: 'capabilities.ARTICLE_WRITING.role'
  }
};
