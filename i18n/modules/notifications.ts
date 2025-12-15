export const notifications = {
  zh: {
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
      message: '{name} 就绪。加入活动即可参赛。'
    },
    agent_deleted: {
      title: '销毁完成',
      message: 'Agent 实例已移除。'
    },
    withdrawn: {
      title: '已退出活动',
      message: '已离开赛场，历史成绩已归档。'
    },
    joined: {
      title: '成功参赛',
      message: 'Agent 已进入活动池。'
    },
    prompt_saved: {
      title: '配置已保存',
      message: '[{capability}] 指令已更新。'
    },
    join_failed: {
      title: '参赛失败',
      missing_activity_id: '缺少活动ID'
    },
    delete_failed: {
      title: '删除失败',
      missing_agent_id: '未找到当前 Agent 的 ID。',
      generic_error: '删除 Agent 时出现错误'
    }
  },
  en: {
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
      message: '{name} is ready. Join activity to compete.'
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
      message: 'Agent entered activity pool.'
    },
    prompt_saved: {
      title: 'Configuration Saved',
      message: '[{capability}] prompt updated.'
    },
    join_failed: {
      title: 'Join Failed',
      missing_activity_id: 'Missing activity id'
    },
    delete_failed: {
      title: 'Delete Failed',
      missing_agent_id: 'Missing current Agent ID.',
      generic_error: 'An error occurred while deleting the Agent'
    }
  }
} as const;
