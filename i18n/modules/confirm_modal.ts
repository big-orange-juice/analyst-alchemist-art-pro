export const confirm_modal = {
  zh: {
    execute: '确认',
    logout_title: '退出登录',
    logout_message: '确认退出登录？',
    delete_agent_title: '确认删除',
    delete_agent_message: '确定要删除这个助手吗？该操作不可逆。',
    withdraw_title: '退出活动',
    withdraw_message: '确认退出？你将停止获取积分，排名会被冻结。'
  },
  en: {
    execute: 'Confirm',
    logout_title: 'Log out',
    logout_message: 'Are you sure you want to log out?',
    delete_agent_title: 'Confirm Delete',
    delete_agent_message:
      'Are you sure you want to delete this agent? This action is irreversible.',
    withdraw_title: 'Withdraw from Activity',
    withdraw_message:
      'Are you sure? You will stop earning points and your rank will freeze.'
  }
} as const;
