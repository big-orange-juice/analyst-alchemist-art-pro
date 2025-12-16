export const notifications = {
  zh: {
    auth: {
      title: '登录成功',
      message: '欢迎回来，{name}。'
    },
    logout: {
      title: '已退出',
      message: '已安全退出登录。'
    },
    agent_deployed: {
      title: '助手已就绪',
      message: '{name} 已准备好。加入活动即可参赛。'
    },
    agent_deleted: {
      title: '删除完成',
      message: '助手已删除。'
    },
    withdrawn: {
      title: '已退出活动',
      message: '已退出活动，历史成绩已保存。'
    },
    joined: {
      title: '成功参赛',
      message: '已加入活动。'
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
      title: 'Signed in',
      message: 'Welcome, {name}.'
    },
    logout: {
      title: 'Disconnected',
      message: 'User logged out securely.'
    },
    agent_deployed: {
      title: 'Agent Ready',
      message: '{name} is ready. Join an activity to compete.'
    },
    agent_deleted: {
      title: 'Deleted',
      message: 'Agent removed.'
    },
    withdrawn: {
      title: 'Withdrawn',
      message: 'Exited activity. Results saved.'
    },
    joined: {
      title: 'Joined',
      message: 'Joined the activity.'
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
