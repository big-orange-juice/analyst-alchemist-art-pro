export const chat = {
  zh: {
    header: '操作员 // 链接',
    placeholder: '输入指令...',
    typing: '正在分析输入...',
    clear_title: '清除历史记录',
    error: '连接中断，请稍后重试。',
    initial_message: '链接已建立。我是操作员。请问需要什么分析协助？',
    simulated_reply:
      '收到您的消息: "{content}"\n\n这是一个模拟回复。实际的 AI 服务已被移除。'
  },
  en: {
    header: 'Operator // Link',
    placeholder: 'Type command...',
    typing: 'Analyzing input...',
    clear_title: 'Clear history',
    error: 'Connection disrupted. Please try again.',
    initial_message: 'Link established. I am the Operator. How can I assist?',
    simulated_reply:
      'Message received: "{content}"\n\nThis is a simulated reply. The real AI service has been removed.'
  }
} as const;
