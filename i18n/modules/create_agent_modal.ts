export const create_agent_modal = {
  zh: {
    notify_create_failed: '创建失败',
    notify_invalid_workflow: '无效的工作流选择。',
    notify_missing_user_title: '缺少用户信息',
    notify_missing_user_desc: '请先登录以创建 Agent。',
    notify_create_success: '创建成功',
    notify_create_success_desc: '助手已创建并就绪。',
    notify_create_agent_failed_fallback: '创建 Agent 时出现错误',

    step_label: '步骤',
    step_of: ' / 04',

    existing_agent: '已有 Agent',
    existing_agent_flow: '流程',

    step_naming: '设置名称',
    step_preset: '工作流选择',
    step_configure: '人格选择',
    step_knowledge: '知识库接入',
    step_simulation: '回测模拟',

    naming_title: '设置名称',
    naming_desc: '此名称将作为该智能体在平台内的唯一标识。',
    naming_placeholder: '输入名称',
    naming_next: '下一步: 选择工作流',

    preset_title: '选择工作流',
    back: '返回',
    next: '下一步',

    configure_missing_preset: '请先在上一步选择工作流',

    knowledge_title: '知识库接入 (可选)',
    knowledge_desc: '上传私有文档以增强 Agent 的分析能力。',
    upload_title: '点击或拖拽上传文件',
    upload_desc: '支持 PDF, TXT, MD, CSV 格式 (最大 20MB)',
    creating: '创建中...',
    skip: '跳过',
    finish_upload: '完成上传',

    sim_title: '回测周期',
    duration_1w: '1周',
    duration_1m: '1月',
    duration_3m: '3月',
    duration_1y: '1年',

    sim_log_ready: '> 系统就绪...',
    sim_log_pick: '> 请选择回测周期并启动。',
    sim_log_init: '> 初始化回测环境...',
    sim_log_load: '> 加载历史数据...',
    sim_log_set_duration: '> 设置回测周期',
    sim_log_run: '> 开始执行策略模拟...',
    sim_log_day: '> 模拟交易日 Day',
    sim_log_scanning: '信号检测中...',
    sim_log_done: '> 回测完成。',
    sim_log_report: '> 生成分析报告...',

    sim_processing: '处理中...',
    sim_rerun: '重新回测',
    sim_start: '开始模拟回测',
    sim_est_time: '预计耗时: 3s',

    stat_total_return: '总收益',
    stat_max_drawdown: '最大回撤',
    stat_win_rate: '胜率',
    stat_sharpe: '夏普比率',

    adjust_params: '调整参数',
    finish_deploy: '完成创建',

    workflow_track_title: '赛道激进型',
    workflow_track_desc:
      '追求高成长赛道，愿意承担高风险。30-40岁，有一定投资经验。',
    workflow_track_prompt:
      '你是一名赛道激进型投资者，追求高成长赛道机会，愿意承担更高波动风险。',

    workflow_quant_title: '稳健价值型',
    workflow_quant_desc:
      '偏好成熟赛道龙头，低估值高分红。45-60岁，投资经验丰富。',
    workflow_quant_prompt:
      '你是一名稳健价值型投资者，偏好成熟龙头与高分红资产，重视安全边际与现金流。',

    workflow_news_title: '红利收益型',
    workflow_news_desc: '关注高股息赛道，追求稳定现金流。50岁以上，接近退休。',
    workflow_news_prompt:
      '你是一名红利收益型投资者，关注高股息资产与稳定现金流，强调长期持有与回撤控制。',

    persona_aggressive_growth_title: '赛道激进型',
    persona_aggressive_growth_desc: '追求高成长赛道，愿意承担高风险',

    persona_conservative_value_title: '稳健价值型',
    persona_conservative_value_desc: '偏好成熟赛道龙头，低估值高分红',

    persona_dividend_focus_title: '红利收益型',
    persona_dividend_focus_desc: '关注高股息赛道，追求稳定现金流',

    persona_quantitative_title: '数据策略型',
    persona_quantitative_desc: '基于数据和模型，严格执行纪律',

    persona_momentum_trader_title: '趋势动量型',
    persona_momentum_trader_desc: '追涨强势股，跟随市场热点',

    persona_contrarian_title: '逆向投资型',
    persona_contrarian_desc: '别人恐惧时贪婪，寻找被错杀机会',

    persona_balanced_title: '均衡配置型',
    persona_balanced_desc: '综合考虑多个维度，分散配置'
  },
  en: {
    notify_create_failed: 'Create failed',
    notify_invalid_workflow: 'Invalid workflow selection.',
    notify_missing_user_title: 'User required',
    notify_missing_user_desc: 'Please login before creating an agent.',
    notify_create_success: 'Created',
    notify_create_success_desc: 'Agent created and ready.',
    notify_create_agent_failed_fallback: 'Failed to create agent',

    step_label: 'Step',
    step_of: ' / 04',

    existing_agent: 'Existing agent',
    existing_agent_flow: 'Workflow',

    step_naming: 'Identity',
    step_preset: 'Workflow',
    step_configure: 'Persona',
    step_knowledge: 'Knowledge',
    step_simulation: 'Backtest',

    naming_title: 'Initialize Unique ID',
    naming_desc: 'This name will be the unique identifier on the platform.',
    naming_placeholder: 'Enter codename',
    naming_next: 'Next: Choose workflow',

    preset_title: 'Choose workflow',
    back: 'Back',
    next: 'Next',

    configure_missing_preset: 'Please choose a workflow in the previous step',

    knowledge_title: 'Knowledge Upload (optional)',
    knowledge_desc: 'Upload private documents to enhance analysis.',
    upload_title: 'Click or drag files to upload',
    upload_desc: 'Supports PDF, TXT, MD, CSV (max 20MB)',
    creating: 'Creating...',
    skip: 'Skip',
    finish_upload: 'Continue',

    sim_title: 'Backtest Horizon',
    duration_1w: '1W',
    duration_1m: '1M',
    duration_3m: '3M',
    duration_1y: '1Y',

    sim_log_ready: '> System ready...',
    sim_log_pick: '> Choose horizon and start.',
    sim_log_init: '> Initializing environment...',
    sim_log_load: '> Loading historical data...',
    sim_log_set_duration: '> Horizon',
    sim_log_run: '> Running simulation...',
    sim_log_day: '> Trading day',
    sim_log_scanning: 'Scanning signals...',
    sim_log_done: '> Backtest finished.',
    sim_log_report: '> Generating report...',

    sim_processing: 'Processing...',
    sim_rerun: 'Run again',
    sim_start: 'Start Backtest',
    sim_est_time: 'EST. TIME: 3s',

    stat_total_return: 'Total Return',
    stat_max_drawdown: 'Max Drawdown',
    stat_win_rate: 'Win Rate',
    stat_sharpe: 'Sharpe',

    adjust_params: 'Adjust',
    finish_deploy: 'Finish Deploy',

    workflow_track_title: 'Aggressive Growth',
    workflow_track_desc: 'Chase high-growth themes with higher risk tolerance.',
    workflow_track_prompt:
      'You are an aggressive growth investor focused on high-growth opportunities and willing to accept higher volatility.',

    workflow_quant_title: 'Defensive Value',
    workflow_quant_desc:
      'Prefer established leaders with valuation discipline and dividends.',
    workflow_quant_prompt:
      'You are a defensive value investor who favors mature leaders and dividend-paying assets, emphasizing margin of safety and cashflow.',

    workflow_news_title: 'Dividend Income',
    workflow_news_desc:
      'Focus on dividend yield and stable cashflow for the long term.',
    workflow_news_prompt:
      'You are a dividend income investor focused on high-yield assets and stable cashflow, emphasizing long-term holding and drawdown control.',

    persona_aggressive_growth_title: 'Aggressive Growth',
    persona_aggressive_growth_desc: 'High growth focus, higher risk tolerance',

    persona_conservative_value_title: 'Defensive Value',
    persona_conservative_value_desc:
      'Established leaders, valuation and dividends',

    persona_dividend_focus_title: 'Dividend Income',
    persona_dividend_focus_desc: 'Dividend yield and stable cashflow',

    persona_quantitative_title: 'Data-Driven',
    persona_quantitative_desc: 'Model-driven, disciplined execution',

    persona_momentum_trader_title: 'Momentum',
    persona_momentum_trader_desc: 'Follow trends and strong names',

    persona_contrarian_title: 'Contrarian',
    persona_contrarian_desc: 'Buy fear, look for mispricing',

    persona_balanced_title: 'Balanced',
    persona_balanced_desc: 'Diversify with multiple signals'
  }
} as const;
