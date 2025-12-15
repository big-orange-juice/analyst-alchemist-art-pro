export const confirm_modal = {
  zh: {
    execute: '确认执行',
    delete_agent_title: '确认销毁',
    delete_agent_message: '确定要销毁此 Agent 吗？该操作不可逆。',
    withdraw_title: '退出活动',
    withdraw_message: '确认退出？你将停止获取积分，排名会被冻结。'
  },
  en: {
    execute: 'Confirm Action',
    delete_agent_title: 'Confirm Destruction',
    delete_agent_message:
      'Are you sure you want to destroy this Agent instance? This action is irreversible.',
    withdraw_title: 'Withdraw from Activity',
    withdraw_message:
      'Are you sure? You will stop earning points and your rank will freeze.'
  }
} as const;
