export const season_info_panel = {
  zh: {
    history_backtest_label: '历史回测',
    history_backtest_desc: '查看历史回测记录与关键结果。',
    history_review_label: '历史复盘',
    history_review_desc: '汇总展示个股诊断、智能选股与历史回测的历史记录。',
    holdings_title: '实时持仓',
    holdings_delay: '数据延迟 3s',
    system_logs: '系统日志',
    system_stream_start: '--- SYSTEM STREAM START ---',
    pass_button: '查看活动通行证',
    logs: {
      scanning: '正在扫描市场信号...',
      signal_detected: '检测到信号: {symbol}',
      risk_ok: '风控检查通过',
      placing_order: '挂单中: 买入 {symbol}',
      deep_analysis: '分析深度数据...',
      updating_pnl: '更新持仓盈亏...'
    }
  },
  en: {
    history_backtest_label: 'Backtest History',
    history_backtest_desc: 'View historical backtest logs and key results.',
    history_review_label: 'Review',
    history_review_desc:
      'A combined view of Stock Diagnosis, Stock Picker, and Backtest history.',
    holdings_title: 'LIVE HOLDINGS',
    holdings_delay: 'Data delayed 3s',
    system_logs: 'SYSTEM LOGS',
    system_stream_start: '--- SYSTEM STREAM START ---',
    pass_button: 'View Activity Pass',
    logs: {
      scanning: 'Scanning market signals...',
      signal_detected: 'Signal detected: {symbol}',
      risk_ok: 'Risk checks passed',
      placing_order: 'Placing order: BUY {symbol}',
      deep_analysis: 'Analyzing deep data...',
      updating_pnl: 'Updating PnL...'
    }
  }
} as const;
