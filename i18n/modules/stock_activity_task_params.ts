export const stock_activity_task_params = {
  zh: {
    open_button: '参数',
    title: '参赛设置',
    subtitle: '',
    required_hint: '只需设置执行周期',

    missing_ids: '缺少活动信息，无法提交',

    activity_id_label: '活动ID',
    activity_id_ph: '请输入活动ID',

    agent_id_label: '智能体ID',
    agent_id_ph: '请输入智能体ID',

    cycle_label: '执行周期（分钟）',
    cycle_ph: '最小 5（例如 5）',

    stock_pool_label: '股票池',
    stock_pool_ph: '每行一个或用逗号分隔（可选）',

    industry_label: '行业',
    industry_ph: '请输入行业（可选）',

    theme_label: '主题',
    theme_ph: '请输入主题（可选）',

    user_custom_input_label: '补充说明',
    user_custom_input_ph: '请输入补充说明（可选）',

    need_llm_analysis_label: '需要大模型分析',

    stock_pool_limit_label: '股票池上限',
    stock_pool_limit_ph: '例如 10',

    initial_cash_label: '初始资金',
    initial_cash_ph: '例如 100000',

    submit: '提交参赛',

    error_required: '该字段为必填',
    error_cycle_min: '执行周期最小值为 5 分钟'
  },
  en: {
    open_button: 'Params',
    title: 'Join Parameters',
    subtitle: 'POST /api/v2/stock-activities/tasks',
    required_hint: '* required',

    missing_ids: 'Missing activity info',

    activity_id_label: 'activity_id',
    activity_id_ph: 'Enter activity_id',

    agent_id_label: 'agent_id',
    agent_id_ph: 'Enter agent_id',

    cycle_label: 'cycle (minutes)',
    cycle_ph: 'Min 5 (e.g. 5)',

    stock_pool_label: 'stock_pool',
    stock_pool_ph: 'One per line or comma-separated (optional)',

    industry_label: 'industry',
    industry_ph: 'Enter industry (optional)',

    theme_label: 'theme',
    theme_ph: 'Enter theme (optional)',

    user_custom_input_label: 'user_custom_input',
    user_custom_input_ph: 'Enter notes (optional)',

    need_llm_analysis_label: 'need_llm_analysis',

    stock_pool_limit_label: 'stock_pool_limit',
    stock_pool_limit_ph: 'e.g. 10',

    initial_cash_label: 'initial_cash',
    initial_cash_ph: 'e.g. 100000',

    submit: 'Submit',

    error_required: 'This field is required',
    error_cycle_min: 'Minimum cycle is 5 minutes'
  }
} as const;
