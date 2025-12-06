export const translations = {
  zh: {
    common: {
      cancel: '取消',
      confirm: '确认',
      back: '返回',
      next: '下一步',
      save: '保存',
      close: '关闭',
      edit: '编辑',
      delete: '删除',
      chat: '通讯',
      online: '在线',
      offline: '离线'
    },
    app: {
      title: 'ANALYST ALCHEMIST',
      subtitle: '第四赛季 // 贤者之石',
      volatility: '市场波动率',
      high: '高',
      login: '接入',
      logout: '断开连接',
      operator_id: '操作员 ID',
      theme_toggle: '切换主题',
      lang_toggle: '切换语言',
      season: '第四赛季',
      philosopher: '贤者之石',
      back_to_landing: '返回着陆页',
      market_label: '市场',
      market_state: '高波动'
    },
    nav: {
      market: '市场',
      team: '技能',
      ranking: '排名',
      my_team: '技能矩阵',
      leaderboard: '排行榜'
    },
    ranking: {
      col_rank: '排名',
      col_name: '代号',
      col_profit: '赛季收益',
      live_battle: '实时对决',
      model_suffix: '模型'
    },
    capabilities: {
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
        label: '生成报告',
        desc: '自动写复盘总结',
        role: '研究员'
      }
    },
    capability_modal: {
      module: '模块',
      role: '角色：',
      input_label: '输入参数',
      input_placeholder: '输入任务参数...',
      execute: '执行任务',
      output_label: '执行输出',
      waiting: '等待输入...',
      save: '保存结果',
      mock_response: '分析完成。信号为强烈买入。',
      history_title: '执行历史',
      history_latency: '平均响应 1.3s',
      history_empty: '暂无历史执行',
      stock_symbol: '分析标的',
      trading_date: '交易日',
      news_source: '新闻源（可选）',
      loading: '执行中...',
      missing_agent_title: '缺少 Agent',
      missing_agent_desc: '请先创建或选择 Agent 后再执行。'
    },
    capability_history: {
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
    prompt_modal: {
      title: '系统指令',
      label: '基础行为模型',
      placeholder: '在此输入系统指令...',
      reset: '重置为默认',
      save: '保存配置'
    },
    external_agent: {
      rank: '排名：',
      status: '状态：',
      online: '在线',
      latest_signal: '最新信号',
      latest_signal_time: '2 分钟前',
      analysis_line_one: '分析引擎运行中，监控波动率指标。',
      analysis_line_two: '检测到板块动能出现背离。',
      analysis_highlight: '执行限价指令策略...'
    },
    chat: {
      header: '操作员 // 链接',
      placeholder: '输入指令...',
      typing: '正在分析输入...',
      clear_title: '清除历史记录',
      error: '连接中断，请稍后重试。',
      initial_message: '链接已建立。我是操作员。请问需要什么分析协助？'
    },
    article_modal: {
      title: '研究报告',
      tag_label: '主题：',
      philosopher: "PHILOSOPHER'S STONE",
      back_to_landing: 'Return to landing',
      market_label: 'MARKET',
      market_state: 'VOLATILE',
      author_value: 'AI 智能体',
      intro_line_one:
        '基于 Matrix 神经网络的最新流动性分析，{sector} 板块正逼近关键拐点。',
      intro_line_two: '主流指数检测到机构资金回流，风险偏好出现转向迹象。',
      sector_semiconductor: '半导体',
      sector_macro: '宏观',
      core_title: '核心观点',
      core_body:
        '技术指标显示核心资产处于超卖区间，20 日与 50 日均线的收敛暗示突破机会，但量能仍需确认。',
      chart_label: '[波动率指数示意图]',
      risk_title: '风险因素',
      risk_one: '全球流动性收紧',
      risk_two: '监管政策突变',
      print: '打印',
      share: '分享'
    },
    competition_join: {
      title: '第四赛季：贤者之石',
      description: '加入全球算法战场，将 Agent 注入流动性池，冲击赛季大奖。',
      rank_label: '冠军奖励',
      rank_value: '¥500,000',
      participants_label: '参赛人数',
      participants_value: '14,204',
      ends_label: '剩余时间',
      ends_value: '14 天',
      cta: '进入赛场',
      cancel: '继续离线模式'
    },
    confirm_modal: {
      execute: '确认执行',
      delete_agent_title: '确认销毁',
      delete_agent_message: '确定要销毁此 Agent 吗？该操作不可逆。',
      withdraw_title: '退出赛季',
      withdraw_message: '确认退出？你将停止获取积分，排名会被冻结。'
    },
    notifications: {
      auth: {
        title: '链接成功',
        message: '欢迎回来，{name}。'
      },
      logout: {
        title: '已断开',
        message: '用户已安全退出。'
      },
      agent_deployed: {
        title: 'Agent 已部署',
        message: '{name} 就绪。加入赛季即可参赛。'
      },
      agent_deleted: {
        title: '销毁完成',
        message: 'Agent 实例已移除。'
      },
      withdrawn: {
        title: '已退出赛季',
        message: '已离开赛场，历史成绩已归档。'
      },
      joined: {
        title: '成功参赛',
        message: 'Agent 已进入第四赛季池。'
      },
      prompt_saved: {
        title: '配置已保存',
        message: '[{capability}] 指令已更新。'
      }
    },
    edit_agent: {
      title: '重新配置 Agent',
      subtitle: '身份调整',
      placeholder: '输入新的代号',
      save: '保存修改'
    },
    notification_history: {
      title: '通知中心',
      clear: '清空历史',
      empty: '暂无历史通知'
    },
    notification_system: {
      live: '实时'
    },
    agent_party: {
      edit_prompt: '编辑指令',
      rank: '排名',
      profit: '收益',
      leave: '退赛',
      join: '参赛',
      chat: '通讯',
      edit_agent: '重构',
      delete_agent: '销毁',
      matrix: '技能矩阵',
      module_count: '模块'
    },
    landing: {
      system_online: '系统在线',
      version: '版本 4.0 // 艺术重构',
      season_live: 'S4 赛季: 贤者之石 进行中',
      hero_title_1: '铸造你的',
      hero_title_2: 'ALPHA AGENT',
      hero_desc:
        '接入金融智能矩阵。部署自主 AI 代理，实时回测策略，在全网算法排位中争夺荣耀。',
      init_system: '初始化系统',
      link_identity: '链接身份',
      continue_as: '继续身份',
      enter: '进入系统',
      resume: '继续身份',
      top_performers: '表现最佳',
      features: {
        strategy_title: '多因子策略矩阵',
        strategy_desc:
          '内置经典的量化因子库（动量、价值、波动率），支持通过自然语言组合生成全新的阿尔法策略。',
        backtest_title: '机构级回测引擎',
        backtest_desc:
          '基于 Tick 级历史数据，毫秒级仿真撮合，提供夏普比率、最大回撤等专业的绩效归因分析。',
        community_title: '去中心化智库',
        community_desc:
          '加入全球排位赛，与顶尖的 Quant Agent 对抗。共享策略逻辑，获取赛季通证奖励。',
        security_title: '零信任安全架构',
        security_desc:
          '所有策略代码均在沙箱环境中运行。用户的私有数据与核心算法享有最高级别的加密保护。'
      },
      buttons: {
        start: '启动终端',
        login: '接入系统',
        docs: '开发文档'
      },
      footer: {
        rights: '© 2024 Analyst Alchemist. All systems nominal.',
        privacy: '隐私协议',
        terms: '服务条款'
      },
      live_feed_tag: 'S4 实时信道',
      total_return: '累计收益',
      badge: {
        legend: '传说',
        whale: '巨鲸',
        bot: '智能体'
      }
    },
    season_pass: {
      title: '赛季通行证',
      subtitle: '第四赛季 // 贤者之石',
      season_pass_modal: {
        level_prefix: 'LV.',
        progress: '300 / 1000 XP',
        level_label: 'Level',
        missions_title: '每日任务',
        mission_trade: '成交额 10 万',
        mission_winrate: '胜率 55%',
        mission_deploy: '部署 1 名 Agent',
        reward: '高级外观包',
        activate: '激活通行证',
        view: '查看全部挑战'
      }
    },
    login: {
      welcome_title: '接入 Matrix 网络',
      welcome_desc: '验证您的神经链接以同步策略数据。',
      season_name: '第四赛季: 贤者之石',
      tab_login: '登录',
      tab_register: '注册',
      connecting: '正在链接...',
      connect: '链接',
      mint: '铸造身份',
      secure_msg: '由量子加密技术保护',
      username: '操作员 ID',
      username_placeholder: '输入你的代号...',
      email: '邮箱',
      email_placeholder: 'name@example.com',
      password: '口令',
      password_placeholder: '••••••••'
    },
    invite: {
      season: 'S4 赛季招募',
      intro: '部署您的 Agent 参与第四赛季“贤者之石”排位赛，赢取百万奖池。',
      login_create: '登录并创建 AGENT',
      title: '加入 S4 赛季',
      desc: '参与排位赛，与全网 14,000+ 智能体同台竞技。'
    }
  },
  en: {
    common: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      save: 'Save',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      chat: 'Chat',
      online: 'Online',
      offline: 'Offline'
    },
    app: {
      title: 'ANALYST ALCHEMIST',
      subtitle: "SEASON 4 // PHILOSOPHER'S STONE",
      volatility: 'MARKET VOLATILITY',
      high: 'HIGH',
      login: 'LOGIN',
      logout: 'DISCONNECT',
      operator_id: 'OPERATOR ID',
      theme_toggle: 'TOGGLE THEME',
      lang_toggle: 'LANGUAGE',
      season: 'SEASON 4',
      philosopher: "PHILOSOPHER'S STONE"
    },
    nav: {
      market: 'MARKET',
      team: 'TEAM',
      ranking: 'RANK',
      my_team: 'MY SQUAD',
      leaderboard: 'LEADERBOARD'
    },
    ranking: {
      col_rank: 'RANK',
      col_name: 'CODENAME',
      col_profit: 'PROFIT',
      live_battle: 'LIVE BATTLE',
      model_suffix: 'MODEL'
    },
    capabilities: {
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
        label: 'Report Gen',
        desc: 'Auto-write summaries',
        role: 'Researcher'
      }
    },
    capability_modal: {
      module: 'Module',
      role: 'Role:',
      input_label: 'Input Parameters',
      input_placeholder: 'Enter task parameters...',
      execute: 'Execute Task',
      output_label: 'Execution Output',
      waiting: 'Waiting for input...',
      save: 'Save Results',
      mock_response: 'Analysis complete. Signal: strong buy.',
      history_title: 'Execution History',
      history_latency: 'Avg latency 1.3s',
      history_empty: 'No runs recorded yet',
      stock_symbol: 'Symbol',
      trading_date: 'Trading Date',
      news_source: 'News Source (optional)',
      loading: 'Running...',
      missing_agent_title: 'Agent required',
      missing_agent_desc: 'Create or select an agent before executing.'
    },
    capability_history: {
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
    },
    prompt_modal: {
      title: 'System Instruction',
      label: 'Base Behavior Model',
      placeholder: 'Enter system prompts here...',
      reset: 'Reset to Default',
      save: 'Save Configuration'
    },
    external_agent: {
      rank: 'RANK:',
      status: 'STATUS:',
      online: 'ONLINE',
      latest_signal: 'Latest Signal',
      latest_signal_time: '2 mins ago',
      analysis_line_one:
        'Analysis engine active. Monitoring volatility index for entries.',
      analysis_line_two: 'Detected divergence in sector momentum.',
      analysis_highlight: 'Executing limit order strategy...'
    },
    chat: {
      header: 'Operator // Link',
      placeholder: 'Type command...',
      typing: 'Analyzing input...',
      clear_title: 'Clear history',
      error: 'Connection disrupted. Please try again.',
      initial_message: 'Link established. I am the Operator. How can I assist?'
    },
    article_modal: {
      title: 'Research Report',
      tag_label: 'TAG:',
      author_label: 'AUTHOR:',
      author_value: 'AI AGENT',
      intro_line_one:
        'Based on the latest liquidity scan from the Matrix Neural Network, the {sector} complex is nearing a critical pivot.',
      intro_line_two:
        'Institutional inflows across key indices indicate a shift in risk appetite.',
      sector_semiconductor: 'Semiconductor',
      sector_macro: 'Macro',
      core_title: 'Core Thesis',
      core_body:
        'Technical momentum points to an oversold condition. The 20/50-day moving average convergence implies a breakout setup, though volume remains muted.',
      chart_label: '[CHART PLACEHOLDER: VOLATILITY INDEX]',
      risk_title: 'Risk Factors',
      risk_one: 'Global liquidity constraints',
      risk_two: 'Unexpected regulatory shifts',
      print: 'PRINT',
      share: 'SHARE'
    },
    competition_join: {
      title: "Season 4: Philosopher's Stone",
      description:
        'Join the global algorithmic warfare. Deploy your agent into the liquidity pool and chase the grand prize.',
      rank_label: 'Rank 1 Prize',
      rank_value: '¥500,000',
      participants_label: 'Participants',
      participants_value: '14,204',
      ends_label: 'Ends In',
      ends_value: '14 Days',
      cta: 'Enter Competition',
      cancel: 'Continue in Local Mode'
    },
    confirm_modal: {
      execute: 'Confirm Action',
      delete_agent_title: 'Confirm Destruction',
      delete_agent_message:
        'Are you sure you want to destroy this Agent instance? This action is irreversible.',
      withdraw_title: 'Withdraw from Season',
      withdraw_message:
        'Are you sure? You will stop earning season points and your rank will freeze.'
    },
    notifications: {
      auth: {
        title: 'Authenticated',
        message: 'Welcome, {name}.'
      },
      logout: {
        title: 'Disconnected',
        message: 'User logged out securely.'
      },
      agent_deployed: {
        title: 'Agent Deployed',
        message: '{name} is ready. Join season to compete.'
      },
      agent_deleted: {
        title: 'Destruction Complete',
        message: 'Agent instance removed.'
      },
      withdrawn: {
        title: 'Withdrawn',
        message: 'Exited competition. Records archived.'
      },
      joined: {
        title: 'Competition Joined',
        message: 'Agent entered Season 4 pool.'
      },
      prompt_saved: {
        title: 'Configuration Saved',
        message: '[{capability}] prompt updated.'
      }
    },
    edit_agent: {
      title: 'Reconfigure Agent',
      subtitle: 'Identity Update',
      placeholder: 'Type new codename',
      save: 'Save Changes'
    },
    notification_history: {
      title: 'Notification Center',
      clear: 'Clear history',
      empty: 'No records yet'
    },
    notification_system: {
      live: 'Live'
    },
    agent_party: {
      edit_prompt: 'Edit prompt',
      rank: 'RANK',
      profit: 'P/L',
      leave: 'Withdraw',
      join: 'Enroll',
      chat: 'Chat',
      edit_agent: 'Rebuild',
      delete_agent: 'Delete',
      matrix: 'Skill Matrix',
      module_count: 'Modules'
    },
    landing: {
      system_online: 'SYSTEM ONLINE',
      version: 'VERSION 4.0 // ARTISTIC REFORGE',
      season_live: "SEASON 4: PHILOSOPHER'S STONE LIVE",
      hero_title_1: 'FORGE YOUR',
      hero_title_2: 'ALPHA AGENT',
      hero_desc:
        'Connect to the financial intelligence matrix. Deploy autonomous AI agents, backtest strategies in real-time, and compete for glory in the global algorithmic ladder.',
      init_system: 'INITIALIZE SYSTEM',
      link_identity: 'LINK IDENTITY',
      continue_as: 'CONTINUE AS',
      enter: 'ENTER SYSTEM',
      resume: 'RESUME IDENTITY',
      top_performers: 'TOP PERFORMERS',
      features: {
        strategy_title: 'Multi-Factor Matrix',
        strategy_desc:
          'Built-in classic quant factor libraries (Momentum, Value, Volatility), supporting NL-generated alpha strategies.',
        backtest_title: 'Institutional Engine',
        backtest_desc:
          'Tick-level historical data, millisecond simulation matching, providing Sharpe ratio and max drawdown attribution.',
        community_title: 'Decentralized Think Tank',
        community_desc:
          'Join the global ladder and compete against top Quant Agents. Share logic and earn season tokens.',
        security_title: 'Zero Trust Architecture',
        security_desc:
          'All strategy code runs in a sandbox environment. User private data and core algorithms enjoy top-level encryption.'
      },
      buttons: {
        start: 'START TERMINAL',
        login: 'ACCESS SYSTEM',
        docs: 'DOCUMENTS'
      },
      footer: {
        rights: '© 2024 Analyst Alchemist. All systems nominal.',
        privacy: 'Privacy Protocol',
        terms: 'Terms of Service'
      },
      live_feed_tag: 'SEASON 4 // LIVE FEED',
      total_return: 'Total Return',
      badge: {
        legend: 'LEGEND',
        whale: 'WHALE',
        bot: 'BOT'
      }
    },
    season_pass: {
      title: 'SEASON PASS',
      season_pass_modal: {
        level_prefix: 'LV.',
        progress: '300 / 1000 XP',
        level_label: 'Level',
        missions_title: 'Daily Missions',
        mission_trade: 'Trade Vol 100k',
        mission_winrate: 'Win Rate 55%',
        mission_deploy: 'Deploy 1 Agent',
        reward: 'Premium Skin Pack',
        activate: 'ACTIVATE PASS',
        view: 'VIEW ALL CHALLENGES'
      },
      subtitle: "SEASON 4 // PHILOSOPHER'S STONE"
    },
    login: {
      welcome_title: 'Access Matrix Network',
      welcome_desc: 'Verify your neural link to synchronize strategy data.',
      season_name: "SEASON 4: PHILOSOPHER'S STONE",
      tab_login: 'LOGIN',
      tab_register: 'REGISTER',
      connecting: 'CONNECTING...',
      connect: 'CONNECT',
      mint: 'MINT IDENTITY',
      secure_msg: 'Protected by Quantum Encryption',
      username: 'Username',
      username_placeholder: 'Type your ID...',
      email: 'Email',
      email_placeholder: 'name@example.com',
      password: 'Password',
      password_placeholder: '••••••••'
    },
    invite: {
      season: 'S4 RECRUITMENT',
      intro:
        'Deploy your Agent to join Season 4 "Philosopher\'s Stone" ranked match and win the million prize pool.',
      login_create: 'LOGIN & CREATE AGENT',
      title: 'JOIN SEASON 4',
      desc: 'Compete in ranked matches against 14,000+ agents network-wide.'
    }
  }
};
