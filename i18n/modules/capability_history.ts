export const capability_history = {
  zh: {
    AUTO_TRADING: [
      {
        time: '09:42:11',
        tag: '成交',
        summary: '完成 CTA 高频套利，三笔对冲建仓执行完毕。',
        detail: '净收益 +0.8%，滑点 0.3bp'
      },
      {
        time: '09:15:07',
        tag: '风控',
        summary: '波动率突破阈值，自动将仓位降至 65%。',
        detail: '最大回撤受控在 -0.6%'
      },
      {
        time: '08:58:22',
        tag: '监听',
        summary: '订阅深市流动性，捕获资金回流节点。',
        detail: '触发执行队列 #443'
      }
    ],
    STRATEGY_PICKING: [
      {
        time: '11:20:33',
        tag: '因子',
        summary: '多因子扫描完成，新能源 / 算力 / 航天为高分因子组。',
        detail: '动量 0.82，风险加权 0.64'
      },
      {
        time: '10:48:02',
        tag: '篮子',
        summary: '组合权重重排，剔除 beta 过高票。',
        detail: '剩余 12 只候选股'
      },
      {
        time: '09:05:44',
        tag: '信号',
        summary: '监测到北向净流入翻倍，触发攻势策略。',
        detail: '优先关注沪深 300 成份'
      }
    ],
    STOCK_ANALYSIS: [
      {
        time: '14:02:18',
        tag: '诊断',
        summary: '对 300750 完成五维体检，盈利能力改善。',
        detail: 'ROE 近三季环比 +4.2%'
      },
      {
        time: '13:11:09',
        tag: '事件',
        summary: '情绪面读取到董事会换届预期。',
        detail: '公告热度 +37%'
      },
      {
        time: '11:56:40',
        tag: '估值',
        summary: 'DCF 重新估算完成，安全边际 12%。',
        detail: '目标价 142.6'
      }
    ],
    BACKTESTING: [
      {
        time: '16:05:55',
        tag: '回测',
        summary: '完成 3Y 滚动回测，策略夏普 1.48。',
        detail: '最大回撤 -5.2%'
      },
      {
        time: '15:41:12',
        tag: '优化',
        summary: '参数网格搜索收敛，risk window=7。',
        detail: '胜率抬升至 61%'
      },
      {
        time: '15:05:20',
        tag: '验证',
        summary: '蒙特卡洛 1k 次模拟完成。',
        detail: '尾部风险 < 2.3%'
      }
    ],
    ARTICLE_WRITING: [
      {
        time: '17:28:03',
        tag: '研报',
        summary: '生成新能源链午后快评，含 4 条操作要点。',
        detail: '推送至订阅频道'
      },
      {
        time: '16:44:37',
        tag: '素材',
        summary: '同步最新财报摘要与高频交易点评。',
        detail: '引用 6 份外部情报'
      },
      {
        time: '15:18:29',
        tag: '结构',
        summary: '调整模板结构，加入流动性热力段落。',
        detail: '文档得分 +12%'
      }
    ]
  },
  en: {
    AUTO_TRADING: [
      {
        time: '09:42:11',
        tag: 'EXEC',
        summary: 'Closed CTA arbitrage cycle with three hedged orders.',
        detail: 'PnL +0.8%, slippage 0.3bp'
      },
      {
        time: '09:15:07',
        tag: 'RISK',
        summary: 'Volatility breached guardrail, scaled exposure to 65%.',
        detail: 'Max drawdown capped at -0.6%'
      },
      {
        time: '08:58:22',
        tag: 'SCAN',
        summary: 'Monitoring SZ liquidity stream, inbound flow detected.',
        detail: 'Triggered queue #443'
      }
    ],
    STRATEGY_PICKING: [
      {
        time: '11:20:33',
        tag: 'FACTOR',
        summary: 'Multi-factor sweep favors EV / Compute / Aerospace basket.',
        detail: 'Momentum 0.82, risk weight 0.64'
      },
      {
        time: '10:48:02',
        tag: 'BASKET',
        summary: 'Re-ranked universe, removed beta-heavy names.',
        detail: '12 candidates remain'
      },
      {
        time: '09:05:44',
        tag: 'FLOW',
        summary: 'Northbound net inflow doubled, aggressive mode armed.',
        detail: 'Focus on CSI300 constituents'
      }
    ],
    STOCK_ANALYSIS: [
      {
        time: '14:02:18',
        tag: 'HEALTH',
        summary: 'Ran 5D diagnostics on 300750; profitability trending up.',
        detail: 'ROE +4.2% QoQ'
      },
      {
        time: '13:11:09',
        tag: 'EVENT',
        summary: 'Sentiment spike tied to board reshuffle chatter.',
        detail: 'News heat +37%'
      },
      {
        time: '11:56:40',
        tag: 'VALUATION',
        summary: 'Updated DCF baseline; margin of safety 12%.',
        detail: 'Target ¥142.6'
      }
    ],
    BACKTESTING: [
      {
        time: '16:05:55',
        tag: 'ROLL',
        summary: 'Finished 3Y rolling backtest; Sharpe 1.48.',
        detail: 'Max DD -5.2%'
      },
      {
        time: '15:41:12',
        tag: 'TUNE',
        summary: 'Grid search converged with risk window = 7.',
        detail: 'Win rate lifted to 61%'
      },
      {
        time: '15:05:20',
        tag: 'MC',
        summary: 'Monte Carlo 1k iterations complete.',
        detail: 'Tail risk < 2.3%'
      }
    ],
    ARTICLE_WRITING: [
      {
        time: '17:28:03',
        tag: 'REPORT',
        summary: 'Published EV supply-chain flash note with four actions.',
        detail: 'Pushed to broadcast feed'
      },
      {
        time: '16:44:37',
        tag: 'SOURCE',
        summary: 'Synced earnings digest plus HFT commentary.',
        detail: 'Referenced six intel packets'
      },
      {
        time: '15:18:29',
        tag: 'FORMAT',
        summary: 'Template refreshed with liquidity heatmap section.',
        detail: 'Readability score +12%'
      }
    ]
  }
} as const;
