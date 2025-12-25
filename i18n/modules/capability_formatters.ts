export const capability_formatters = {
  zh: {
    op_lte: '不高于',
    op_gte: '不低于',
    current: '当前',

    hit_conditions: '命中条件',
    no_candidates: '（未返回候选标的或命中条件）',
    candidate: '候选',
    no_reasons: '（未提供命中条件）',

    symbol_fallback: '标的',
    overall_rating: '综合评级',
    score: '分数',
    confidence: '置信度',

    technical: '技术分析',
    fundamental: '基本面分析',
    news: '新闻解读',
    financial_report: '财报摘要',

    recommendation: '建议',
    recommendation_value: {
      buy: '买入',
      sell: '卖出',
      hold: '持有'
    },
    confidence_short: '信心',
    key_factors: '关键因素',

    sentiment: '情绪',
    source: '来源',
    link: '链接',

    summary: '摘要',
    highlights: '要点',
    key_metrics: '关键指标',
    income: '利润表',
    balance: '资产负债表',

    field: {
      revenue: '营收',
      revenue_yoy: '营收同比',
      net_profit: '净利润',
      net_profit_yoy: '净利润同比',
      gross_profit_margin: '毛利率',
      net_profit_margin: '净利率',
      debt_ratio: '资产负债率',
      total_assets: '总资产',
      current_ratio: '流动比率',
      period: '期间',
      trading_date: '交易日',
      report_period: '报告期'
    }
  },
  en: {
    op_lte: 'no higher than',
    op_gte: 'no lower than',
    current: 'Current',

    hit_conditions: 'Hit conditions',
    no_candidates: '(no candidates or match conditions returned)',
    candidate: 'Candidate',
    no_reasons: '(no match reasons provided)',

    symbol_fallback: 'Symbol',
    overall_rating: 'Overall Rating',
    score: 'Score',
    confidence: 'Confidence',

    technical: 'Technical Analysis',
    fundamental: 'Fundamental Analysis',
    news: 'News',
    financial_report: 'Financial Report',

    recommendation: 'Recommendation',
    recommendation_value: {
      buy: 'Buy',
      sell: 'Sell',
      hold: 'Hold'
    },
    confidence_short: 'Conf.',
    key_factors: 'Key factors',

    sentiment: 'Sentiment',
    source: 'Source',
    link: 'Link',

    summary: 'Summary',
    highlights: 'Highlights',
    key_metrics: 'Key metrics',
    income: 'Income statement',
    balance: 'Balance sheet',

    field: {
      revenue: 'Revenue',
      revenue_yoy: 'Revenue YoY',
      net_profit: 'Net profit',
      net_profit_yoy: 'Net profit YoY',
      gross_profit_margin: 'Gross margin',
      net_profit_margin: 'Net margin',
      debt_ratio: 'Debt ratio',
      total_assets: 'Total assets',
      current_ratio: 'Current ratio',
      period: 'Period',
      trading_date: 'Trading date',
      report_period: 'Report period'
    }
  }
} as const;
