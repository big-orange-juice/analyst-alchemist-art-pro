export const external_agent = {
  zh: {
    rank: '排名：',
    status: '状态：',
    online: '在线',
    latest_signal: '最新信号',
    latest_signal_time: '2 分钟前',
    analysis_line_one: '分析引擎运行中，监控波动率指标。',
    analysis_line_two: '检测到板块动能出现背离。',
    analysis_highlight: '执行限价指令策略...'
  },
  en: {
    rank: 'RANK:',
    status: 'STATUS:',
    online: 'ONLINE',
    latest_signal: 'Latest Signal',
    latest_signal_time: '2 mins ago',
    analysis_line_one:
      'Analysis engine active. Monitoring volatility index for entries.',
    analysis_line_two: 'Detected divergence in sector momentum.',
    analysis_highlight: 'Executing limit order strategy...'
  }
} as const;
