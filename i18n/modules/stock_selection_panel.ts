export const stock_selection_panel = {
  zh: {
    industry_label: '行业',
    theme_label: '主题',
    user_input_label: '补充说明',
    user_input_ph: '例如：偏好价值/成长、打算持有多久、能承受多大回撤等',
    enable_llm: '启用智能分析（可选）',

    parse_failed_title: '解析失败',
    parse_failed_desc: '返回内容不是有效 JSON，无法解析。',

    unable_format: '（无法格式化返回内容）',
    empty_response: '（空响应）',

    execute_failed_title: '执行失败',
    execute_failed_desc: '执行出错',

    industry_options: [
      { value: '不限', label: '不限' },
      { value: '消费', label: '消费' },
      { value: '科技', label: '科技' },
      { value: '医药', label: '医药' },
      { value: '金融', label: '金融' },
      { value: '能源', label: '能源' },
      { value: '制造', label: '制造' },
      { value: '地产', label: '地产' }
    ],
    theme_options: [
      { value: '不限', label: '不限' },
      { value: '价值', label: '价值' },
      { value: '成长', label: '成长' },
      { value: '红利', label: '红利' },
      { value: '低波动', label: '低波动' },
      { value: '高股息', label: '高股息' },
      { value: '景气度', label: '景气度' }
    ]
  },
  en: {
    industry_label: 'Industry',
    theme_label: 'Theme',
    user_input_label: 'Notes',
    user_input_ph:
      'e.g. value/growth preference, holding horizon, drawdown tolerance',
    enable_llm: 'Enable AI analysis (optional)',

    parse_failed_title: 'Parse failed',
    parse_failed_desc: 'Response looks like JSON but is not valid JSON.',

    unable_format: '(unable to format response)',
    empty_response: '(empty response)',

    execute_failed_title: 'Execution failed',
    execute_failed_desc: 'Execution error',

    industry_options: [
      { value: '不限', label: 'Any' },
      { value: '消费', label: 'Consumer' },
      { value: '科技', label: 'Tech' },
      { value: '医药', label: 'Healthcare' },
      { value: '金融', label: 'Financials' },
      { value: '能源', label: 'Energy' },
      { value: '制造', label: 'Industrials' },
      { value: '地产', label: 'Real Estate' }
    ],
    theme_options: [
      { value: '不限', label: 'Any' },
      { value: '价值', label: 'Value' },
      { value: '成长', label: 'Growth' },
      { value: '红利', label: 'Dividend' },
      { value: '低波动', label: 'Low Vol' },
      { value: '高股息', label: 'High Yield' },
      { value: '景气度', label: 'Cyclical' }
    ]
  }
} as const;
