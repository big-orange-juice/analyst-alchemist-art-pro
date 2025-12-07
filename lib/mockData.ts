import type { RankingItem } from '@/types';

// Initial Bots Configuration
export const INITIAL_BOTS: RankingItem[] = [
  {
    id: 101,
    rank: 1,
    name: 'Alpha_Seeker',
    class: 'Quant',
    profit: '+0.0%',
    rawProfit: 100,
    status: '在线',
    badges: ['legend', 'whale']
  },
  {
    id: 102,
    rank: 2,
    name: 'Golden_Ratio',
    class: 'Scalper',
    profit: '+0.0%',
    rawProfit: 100,
    status: '在线',
    badges: ['quant']
  },
  {
    id: 103,
    rank: 3,
    name: 'Value_Discovery',
    class: 'Quant',
    profit: '+0.0%',
    rawProfit: 100,
    status: '在线'
  },
  {
    id: 104,
    rank: 4,
    name: 'Momentum_Flow',
    class: 'Scalper',
    profit: '+0.0%',
    rawProfit: 100,
    status: '训练中',
    badges: ['risk']
  },
  {
    id: 105,
    rank: 5,
    name: 'Reform_Strategy',
    class: 'Corpo',
    profit: '+0.0%',
    rawProfit: 100,
    status: '离线'
  },
  {
    id: 106,
    rank: 6,
    name: 'Growth_Hunter',
    class: 'NetRunner',
    profit: '+0.0%',
    rawProfit: 100,
    status: '在线'
  },
  {
    id: 107,
    rank: 7,
    name: 'Arbitrage_Bot',
    class: 'Quant',
    profit: '+0.0%',
    rawProfit: 100,
    status: '在线'
  },
  {
    id: 108,
    rank: 8,
    name: 'Dividend_Yield',
    class: 'Whale',
    profit: '+0.0%',
    rawProfit: 100,
    status: '在线'
  },
  {
    id: 109,
    rank: 9,
    name: 'Limit_Up',
    class: 'Scalper',
    profit: '+0.0%',
    rawProfit: 100,
    status: '训练中'
  },
  {
    id: 110,
    rank: 10,
    name: 'Micro_Cap',
    class: 'NetRunner',
    profit: '+0.0%',
    rawProfit: 100,
    status: '在线'
  }
];

// Top performers for landing page
export const TOP_PERFORMERS = [
  { rank: 1, name: 'Alpha_Seeker', profit: '+142.5%', badge: 'LEGEND' },
  { rank: 2, name: 'Deep_Value', profit: '+89.2%', badge: 'WHALE' },
  { rank: 3, name: 'Quant_X', profit: '+76.4%', badge: 'BOT' }
];

// Holdings mock data
export const MOCK_HOLDINGS = [
  { code: '600519', name: '贵州茅台', volume: 200, price: 1750.0, pnl: 2.5 },
  { code: '300750', name: '宁德时代', volume: 500, price: 180.5, pnl: -1.2 },
  { code: '002594', name: '比亚迪', volume: 1000, price: 280.0, pnl: 0.8 },
  { code: '601318', name: '中国平安', volume: 2000, price: 42.5, pnl: 1.5 },
  { code: '688981', name: '中芯国际', volume: 1500, price: 48.2, pnl: -0.5 }
];

// Season info
export const SEASON_INFO = {
  prizePool: '¥1.0M',
  participants: '14,204',
  endDate: '14 Days',
  currentSeason: 4,
  seasonName: "PHILOSOPHER'S STONE"
};

// Market events for notifications
export const MARKET_EVENTS = [
  { title: 'Market Update', msg: 'Semiconductor sector seeing net inflows.', type: 'market' },
  { title: 'System Alert', msg: "'Alpha_Seeker' strategy triggered a stop-loss.", type: 'warning' },
  { title: 'Macro News', msg: 'Central bank releases liquidity report.', type: 'info' },
  { title: 'Whale Alert', msg: 'Large block trade detected: 520M.', type: 'market' },
  { title: 'Season Update', msg: 'Rankings refreshed. Top 10 volatility increased.', type: 'info' }
];

// Strategy presets for agent creation
export const STRATEGY_PRESETS = [
  {
    id: 'conservative',
    name: '稳健理财型',
    desc: '低风险偏好，追求绝对收益，严格控制回撤。',
    stats: { intelligence: 60, speed: 20, risk: 80 },
    defaultPrompt: '你是一个极度厌恶风险的A股交易员，优先考虑资金安全，只在确定性极高时出手。',
    defaultConfig: { risk: 'low', freq: 'low', asset: 'bluechip', execution: 'limit' }
  },
  {
    id: 'balanced',
    name: '趋势均衡型',
    desc: '平衡风险与收益，顺势而为，捕捉波段机会。',
    stats: { intelligence: 50, speed: 50, risk: 50 },
    defaultPrompt: '你是一个成熟的趋势交易员，擅长通过技术形态和均线系统捕捉主升浪。',
    defaultConfig: { risk: 'mid', freq: 'mid', asset: 'growth', execution: 'smart' }
  },
  {
    id: 'aggressive',
    name: '激进超短型',
    desc: '高风险高收益，专注于热点题材与龙头战法。',
    stats: { intelligence: 40, speed: 90, risk: 20 },
    defaultPrompt: '你是一个激进的短线游资操盘手，专注于市场情绪核心，敢于在分歧中寻找一致性。',
    defaultConfig: { risk: 'high', freq: 'high', asset: 'concept', execution: 'market' }
  }
];
