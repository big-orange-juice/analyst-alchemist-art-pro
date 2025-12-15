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
    confidence_short: '信心',
    key_factors: '关键因素',

    sentiment: '情绪',
    source: '来源',
    link: '链接'
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
    confidence_short: 'Conf.',
    key_factors: 'Key factors',

    sentiment: 'Sentiment',
    source: 'Source',
    link: 'Link'
  }
} as const;
