export const capabilities = {
  zh: {
    AUTO_TRADING: {
      label: '自动交易',
      desc: '低买高卖，自动赚钱',
      role: '交易员'
    },
    STRATEGY_PICKING: {
      label: '智能选股',
      desc: '挖掘潜力牛股',
      role: '策略师'
    },
    STOCK_ANALYSIS: {
      label: '个股诊断',
      desc: '分析股票好坏',
      role: '分析师'
    },
    BACKTESTING: {
      label: '历史验证',
      desc: '用历史数据测试',
      role: '精算师'
    },
    ARTICLE_WRITING: {
      label: '文章分析',
      desc: '自动写复盘总结',
      role: '研究员'
    }
  },
  en: {
    AUTO_TRADING: {
      label: 'Auto Trading',
      desc: 'Buy low, sell high',
      role: 'Trader'
    },
    STRATEGY_PICKING: {
      label: 'Strategy Picking',
      desc: 'Find potential stocks',
      role: 'Strategist'
    },
    STOCK_ANALYSIS: {
      label: 'Stock Analysis',
      desc: 'Diagnose stock health',
      role: 'Analyst'
    },
    BACKTESTING: {
      label: 'Backtesting',
      desc: 'Verify with history',
      role: 'Actuary'
    },
    ARTICLE_WRITING: {
      label: 'Article Analysis',
      desc: 'Auto-write summaries',
      role: 'Researcher'
    }
  }
} as const;
