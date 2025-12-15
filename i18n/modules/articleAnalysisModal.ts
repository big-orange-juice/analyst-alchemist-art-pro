export const articleAnalysisModal = {
  zh: {
    title: '文章分析',
    subtitle: '分析师',

    input_label: '输入',

    mode_url: '在线链接',
    mode_text: '粘贴文本',
    mode_file: '文件上传',

    content_type: '内容类型',
    content_type_url: 'URL 链接',
    content_type_text: '纯文本',
    content_type_pdf: 'PDF 文档',
    content_type_excel: 'Excel 表格',
    content_type_image: '图片',

    content_data: '内容',
    focus: '分析关注点（每行/逗号分隔）',
    symbol: '股票代码（可选）',
    trading_date: '交易日（可选）',

    url_ph: 'https://...',
    text_ph: '在此粘贴文章/研报纯文本...',
    focus_ph: '例如：估值，行业景气，财务质量，风险点',

    not_set: '不指定',
    symbol_aapl: '苹果（AAPL）',
    symbol_600519: '贵州茅台（600519.SH）',
    symbol_000001: '平安银行（000001.SZ）',
    symbol_000859: '中信国安（000859.SZ）',

    file_disabled: '文件上传暂不可用',

    response: '响应结果',
    clear: '清空',

    submitting: '生成中...',
    waiting: '等待生成结果...',
    empty_response: '（空响应）',

    submit: '生成',
    cancel: '取消',

    missing_title: '生成失败',
    missing_desc: '缺少用户或Agent信息，请先登录并创建Agent。',

    ok_title: '请求已提交',
    ok_message: '分析师',

    fail_title: '生成失败',

    md_title: '文章分析结果',
    md_content_type: '内容类型',
    md_trading_date: '交易日',
    md_timestamp: '时间',
    md_extracted: '提取内容',
    md_summary: '摘要',
    md_text_length: '文本长度',
    md_has_tables: '包含表格',
    md_has_images: '包含图片',
    md_structured: '结构化信息',
    md_doc_theme: '文档主题',
    md_doc_category: '文档类别',
    md_key_metrics: '关键指标',
    md_revenue: '营收',
    md_profit: '利润',
    md_growth: '增长率',
    md_events: '重要事件',
    md_risk_factors: '风险因素',
    md_investment_views: '投资观点',
    md_analyses: '分析结论',
    md_macro_analysis: '宏观分析',
    md_technical_analysis: '技术分析',
    md_fundamental_analysis: '基本面分析',
    md_sentiment_analysis: '情绪分析',
    md_risk_analysis: '风险分析',
    md_investment_advice: '投资建议',
    md_rating: '评级',
    md_position: '仓位建议',
    md_target_price: '目标价',
    md_confidence: '置信度',
    md_key_risks: '关键风险',
    md_action_plan: '行动计划',
    md_explain: '解释'
  },
  en: {
    title: 'Article Analysis',
    subtitle: 'The Analyst',

    input_label: 'Input',

    mode_url: 'Use online URL',
    mode_text: 'Paste plain text',
    mode_file: 'Upload file',

    content_type: 'content_type',
    content_type_url: 'URL',
    content_type_text: 'Plain text',
    content_type_pdf: 'PDF',
    content_type_excel: 'Excel',
    content_type_image: 'Image',

    content_data: 'content_data',
    focus: 'analysis_focus (newline/comma separated)',
    symbol: 'symbol (optional)',
    trading_date: 'trading_date (optional)',

    url_ph: 'https://...',
    text_ph: 'Paste article/report plain text here...',
    focus_ph: 'e.g. valuation, catalysts, financials, risks',

    not_set: 'Not set',
    symbol_aapl: 'Apple (AAPL)',
    symbol_600519: 'Kweichow Moutai (600519.SH)',
    symbol_000001: 'Ping An Bank (000001.SZ)',
    symbol_000859: 'CITIC Guoan (000859.SZ)',

    file_disabled: 'File upload is disabled for now',

    response: 'Response',
    clear: 'Clear',

    submitting: 'Loading...',
    waiting: 'Waiting for result...',
    empty_response: '(empty response)',

    submit: 'Generate',
    cancel: 'Cancel',

    missing_title: 'Request failed',
    missing_desc: 'Missing user/agent. Please login and create an agent first.',

    ok_title: 'Request submitted',
    ok_message: 'The Analyst',

    fail_title: 'Request failed',

    md_title: 'Article Analysis Result',
    md_content_type: 'Content Type',
    md_trading_date: 'Trading Date',
    md_timestamp: 'Time',
    md_extracted: 'Extracted Content',
    md_summary: 'Summary',
    md_text_length: 'Text Length',
    md_has_tables: 'Has Tables',
    md_has_images: 'Has Images',
    md_structured: 'Structured Info',
    md_doc_theme: 'Document Theme',
    md_doc_category: 'Document Category',
    md_key_metrics: 'Key Metrics',
    md_revenue: 'Revenue',
    md_profit: 'Profit',
    md_growth: 'Growth',
    md_events: 'Important Events',
    md_risk_factors: 'Risk Factors',
    md_investment_views: 'Investment Views',
    md_analyses: 'Analyses',
    md_macro_analysis: 'Macro Analysis',
    md_technical_analysis: 'Technical Analysis',
    md_fundamental_analysis: 'Fundamental Analysis',
    md_sentiment_analysis: 'Sentiment Analysis',
    md_risk_analysis: 'Risk Analysis',
    md_investment_advice: 'Investment Advice',
    md_rating: 'Rating',
    md_position: 'Position',
    md_target_price: 'Target Price',
    md_confidence: 'Confidence',
    md_key_risks: 'Key Risks',
    md_action_plan: 'Action Plan',
    md_explain: 'Explanation'
  }
} as const;
