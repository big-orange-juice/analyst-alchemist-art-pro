'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Hexagon,
  BarChart3,
  Bell,
  Sun,
  Moon,
  Globe,
  LogOut,
  TrendingUp,
  User
} from 'lucide-react';

import {
  useUserStore,
  useAgentStore,
  useUIStore,
  useModalStore,
  useNotificationStore,
  useLanguageStore,
  useMarketDataStore
} from '@/store';

import type {
  AgentStats,
  AgentModule,
  RankingItem,
  ChartDataPoint
} from '@/types';

// Components
import MatrixRain from '@/components/MatrixRain';
import EquityChart from '@/components/EquityChart';
import RankingList from '@/components/RankingList';
import AgentPartyFrame from '@/components/AgentPartyFrame';
import SeasonInfoPanel from '@/components/SeasonInfoPanel';
import CompetitionInviteCard from '@/components/CompetitionInviteCard';
import NotificationSystem from '@/components/NotificationSystem';
import ChatWidget from '@/components/ChatWidget';
import LoginScreen from '@/components/LoginScreen';
import CreateAgentModal from '@/components/CreateAgentModal';
import EditAgentModal from '@/components/EditAgentModal';
import SeasonPassModal from '@/components/SeasonPassModal';
import ConfirmModal from '@/components/ConfirmModal';
import CompetitionJoinModal from '@/components/CompetitionJoinModal';
import CapabilityModal from '@/components/CapabilityModal';
import PromptEditModal from '@/components/PromptEditModal';
import ExternalAgentModal from '@/components/ExternalAgentModal';
import ArticleModal from '@/components/ArticleModal';
import NotificationHistoryModal from '@/components/NotificationHistoryModal';

// Translations
const translations = {
  zh: {
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
      back_to_landing: '返回首页'
    },
    nav: {
      market: '市场',
      team: '技能',
      ranking: '排名',
      my_team: '技能矩阵',
      leaderboard: '排行榜'
    },
    ranking: { live_battle: '实时对决' },
    confirm_modal: {
      delete_agent_title: '确认销毁',
      delete_agent_message: '确定要销毁此 Agent 吗？该操作不可逆。',
      withdraw_title: '退出赛季',
      withdraw_message: '确认退出？你将停止获取积分，排名会被冻结。'
    },
    notifications: {
      auth: { title: '链接成功', message: '欢迎回来，{name}。' },
      logout: { title: '已断开', message: '用户已安全退出。' },
      agent_deployed: {
        title: 'Agent 已部署',
        message: '{name} 就绪。加入赛季即可参赛。'
      },
      agent_deleted: { title: '销毁完成', message: 'Agent 实例已移除。' },
      withdrawn: {
        title: '已退出赛季',
        message: '已离开赛场，历史成绩已归档。'
      },
      joined: { title: '成功参赛', message: 'Agent 已进入第四赛季池。' },
      prompt_saved: {
        title: '配置已保存',
        message: '[{capability}] 指令已更新。'
      }
    }
  },
  en: {
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
      back_to_landing: 'Back to Home'
    },
    nav: {
      market: 'MARKET',
      team: 'TEAM',
      ranking: 'RANK',
      my_team: 'MY SQUAD',
      leaderboard: 'LEADERBOARD'
    },
    ranking: { live_battle: 'LIVE BATTLE' },
    confirm_modal: {
      delete_agent_title: 'Confirm Destruction',
      delete_agent_message:
        'Are you sure you want to destroy this Agent instance? This action is irreversible.',
      withdraw_title: 'Withdraw from Season',
      withdraw_message:
        'Are you sure? You will stop earning season points and your rank will freeze.'
    },
    notifications: {
      auth: { title: 'Authenticated', message: 'Welcome, {name}.' },
      logout: { title: 'Disconnected', message: 'User logged out securely.' },
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
    }
  }
};

export default function DashboardContent() {
  const searchParams = useSearchParams();

  // Stores
  const { currentUser, setCurrentUser, clearUser } = useUserStore();
  const {
    agentId,
    agentName,
    agentClass,
    agentStats,
    customPrompts,
    isJoinedCompetition,
    setAgentName,
    setAgentClass,
    setAgentStats,
    setAgentModules,
    setLastFetchedUserId,
    setAgentId,
    updateCustomPrompt,
    setIsJoinedCompetition,
    clearAgent
  } = useAgentStore();
  const {
    theme,
    activeSideTab,
    isChatOpen,
    highlightedAgent,
    inspectingAgent,
    selectedCapability,
    editingCapability,
    setTheme,
    setActiveSideTab,
    setIsChatOpen,
    setHighlightedAgent,
    setInspectingAgent,
    setSelectedCapability,
    setEditingCapability
  } = useUIStore();
  const {
    isLoginModalOpen,
    isCreateModalOpen,
    isSeasonPassOpen,
    isJoinCompetitionModalOpen,
    isNotifHistoryOpen,
    confirmModal,
    readingArticle,
    pendingAction,
    setIsLoginModalOpen,
    setIsCreateModalOpen,
    setIsSeasonPassOpen,
    setIsJoinCompetitionModalOpen,
    setIsNotifHistoryOpen,
    setConfirmModal,
    setReadingArticle,
    setPendingAction
  } = useModalStore();
  const {
    notifications,
    notificationHistory,
    addNotification,
    dismissNotification,
    clearHistory
  } = useNotificationStore();
  const { language, setLanguage } = useLanguageStore();
  const { chartData, rankingList, setChartData, setRankingList } =
    useMarketDataStore();

  // Local state
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userProfit, setUserProfit] = useState<string | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const t = translations[language];
  const notify = useCallback(
    (
      title: string,
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' | 'market' = 'info'
    ) => {
      addNotification(title, message, type);
    },
    [addNotification]
  );

  // Check for login param on load
  useEffect(() => {
    if (searchParams.get('login') === 'true' && !currentUser) {
      setIsLoginModalOpen(true);
    }
  }, [searchParams, currentUser, setIsLoginModalOpen]);

  // Apply theme
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/rankings')
      .then((res) => res.json())
      .then(
        (data: { rankings: RankingItem[]; chartData: ChartDataPoint[] }) => {
          setRankingList(data.rankings);
          setChartData(data.chartData);
        }
      )
      .catch(console.error);
  }, [setChartData, setRankingList]);

  // Simulation interval
  useEffect(() => {
    if (rankingList.length === 0 || chartData.length === 0) return;

    const interval = setInterval(() => {
      setRankingList(
        rankingList
          .map((agent) => {
            const change = (Math.random() - 0.48) * 0.2;
            const newProfit = agent.rawProfit + change;
            return {
              ...agent,
              rawProfit: parseFloat(newProfit.toFixed(2)),
              profit: `${newProfit >= 100 ? '+' : ''}${(
                newProfit - 100
              ).toFixed(2)}%`
            };
          })
          .sort((a, b) => b.rawProfit - a.rawProfit)
          .map((a, i) => ({ ...a, rank: i + 1 }))
      );

      const lastTime = chartData[chartData.length - 1]?.time || '09:30';
      const [h, m] = lastTime.split(':').map(Number);
      const newMinutes = m + 5 >= 60 ? 0 : m + 5;
      const newHours = m + 5 >= 60 ? (h + 1) % 24 : h;
      const newTimeStr = `${String(newHours).padStart(2, '0')}:${String(
        newMinutes
      ).padStart(2, '0')}`;

      const newPoint: ChartDataPoint = { time: newTimeStr };
      const lastPoint = chartData[chartData.length - 1];
      if (lastPoint) {
        Object.keys(lastPoint)
          .filter((k) => k !== 'time')
          .forEach((key) => {
            const prevVal = lastPoint[key] as number;
            const change = (Math.random() - 0.48) * 2;
            newPoint[key] = parseFloat((prevVal + change).toFixed(2));
          });
      }

      setChartData([...chartData.slice(-49), newPoint]);
    }, 2000);

    return () => clearInterval(interval);
  }, [chartData, rankingList, setChartData, setRankingList]);

  // Handle user agent rank/profit
  useEffect(() => {
    const resolvedUserId = (() => {
      if (currentUser?.id) return currentUser.id;
      if (typeof window === 'undefined') return null;
      try {
        const raw = localStorage.getItem('matrix_user_session');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.currentUser?.id ?? null;
      } catch (_) {
        return null;
      }
    })();

    if (!resolvedUserId) return;

    const controller = new AbortController();
    let cancelled = false;

    const fetchAgent = async () => {
      try {
        const query = `/api/agents?user_id=${encodeURIComponent(
          resolvedUserId
        )}&skip=0&limit=1`;
        const res = await fetch(query, { signal: controller.signal });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.agents?.length) {
          const agent = data.agents[0];
          const resolvedAgentId = agent.agent_id || agent.id || null;
          const workflowId = agent.workflow_id || null;
          setAgentId(resolvedAgentId);
          setAgentName(agent.agent_name);
          if (workflowId) setAgentClass(workflowId);
          setLastFetchedUserId(resolvedUserId);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // silent fail
      }
    };

    const timer = setTimeout(fetchAgent, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    currentUser?.id,
    setAgentClass,
    setAgentId,
    setAgentName,
    setLastFetchedUserId
  ]);

  useEffect(() => {
    if (agentName && isJoinedCompetition && rankingList.length > 0) {
      const userAgent = rankingList.find((a) => a.isUser);
      if (userAgent) {
        setUserRank(userAgent.rank);
        setUserProfit(userAgent.profit);
      }
    } else {
      setUserRank(null);
      setUserProfit(null);
    }
  }, [agentName, isJoinedCompetition, rankingList]);

  // Actions
  const handleLogin = (username: string, email?: string) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      level: 1,
      achievements: [],
      avatarFrame: 'default'
    };
    setCurrentUser(newUser);
    setIsLoginModalOpen(false);
    notify(
      t.notifications.auth.title,
      t.notifications.auth.message.replace('{name}', username),
      'success'
    );

    if (pendingAction === 'createAgent') {
      setIsCreateModalOpen(true);
      setPendingAction(null);
    }
  };

  const handleLogout = () => {
    clearUser();
    clearAgent();
    notify(
      t.notifications.logout.title,
      t.notifications.logout.message,
      'info'
    );
  };

  const handleCreateAgent = (
    newAgentId: string | null,
    name: string,
    _prompt: string,
    archetype: string,
    stats: AgentStats,
    modules: AgentModule[]
  ) => {
    setAgentId(newAgentId);
    setAgentName(name);
    setAgentClass(archetype);
    setAgentStats(stats);
    setAgentModules(modules);

    // Add user agent to chart and ranking
    const newRankingList = [
      ...rankingList,
      {
        id: 'user',
        rank: rankingList.length + 1,
        name,
        class: archetype,
        profit: '+0.0%',
        rawProfit: 100,
        status: '在线' as const,
        isUser: true
      }
    ];
    setRankingList(newRankingList);

    // Add to chart data
    const newChartData = chartData.map((p) => ({ ...p, [name]: 100 }));
    setChartData(newChartData);

    notify(
      t.notifications.agent_deployed.title,
      t.notifications.agent_deployed.message.replace('{name}', name),
      'success'
    );
    setIsCreateModalOpen(false);
  };

  const handleDeleteAgent = async () => {
    if (!agentId) {
      notify('删除失败', '未找到当前 Agent 的 ID。', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || '删除 Agent 失败');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '删除 Agent 时出现错误';
      notify('删除失败', message, 'error');
      setConfirmModal({ ...confirmModal, isOpen: false });
      return;
    }

    if (agentName) {
      setRankingList(rankingList.filter((a) => !a.isUser));
      setChartData(
        chartData.map((p) => {
          const newP = { ...p };
          delete newP[agentName];
          return newP;
        })
      );
    }

    clearAgent();
    notify(
      t.notifications.agent_deleted.title,
      t.notifications.agent_deleted.message,
      'success'
    );
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      action: () => {}
    });
  };

  const handleJoinCompetition = () => {
    setIsJoinedCompetition(true);
    setIsJoinCompetitionModalOpen(false);
    notify(
      t.notifications.joined.title,
      t.notifications.joined.message,
      'success'
    );
  };

  const handleWithdraw = () => {
    setIsJoinedCompetition(false);
    notify(
      t.notifications.withdrawn.title,
      t.notifications.withdrawn.message,
      'info'
    );
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      action: () => {}
    });
  };

  const handleSavePrompt = (newPrompt: string) => {
    if (editingCapability) {
      updateCustomPrompt(editingCapability, newPrompt);
      notify(
        t.notifications.prompt_saved.title,
        t.notifications.prompt_saved.message.replace(
          '{capability}',
          editingCapability
        ),
        'success'
      );
      setEditingCapability(null);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className='w-full h-screen flex flex-col bg-cp-black text-cp-text overflow-hidden'>
      <MatrixRain theme={theme} />

      {/* Top Bar */}
      <header className='shrink-0 h-[60px] glass-header backdrop-blur-md flex items-center justify-between px-6 z-50'>
        <div className='flex items-center gap-4'>
          <Link href='/' className='flex items-center gap-3 group'>
            <Hexagon
              className='text-cp-yellow group-hover:scale-110 transition-transform'
              size={28}
              strokeWidth={1.5}
            />
            <div className='hidden md:block'>
              <h1 className='text-sm font-bold font-serif tracking-[0.45em] uppercase text-cp-text'>
                {t.app.title}
              </h1>
              <p className='text-[10px] font-mono text-cp-text-muted tracking-[0.35em]'>
                {t.app.subtitle}
              </p>
            </div>
          </Link>
        </div>

        {/* Right Controls */}
        <div className='flex items-center gap-3'>
          <div className='hidden md:flex items-center gap-2 px-3 py-1.5 border border-cp-yellow/30 bg-cp-yellow/5'>
            <TrendingUp size={14} className='text-cp-yellow' />
            <span className='text-[10px] font-mono text-cp-text-muted tracking-widest'>
              {t.app.volatility}:
            </span>
            <span className='text-[10px] font-bold text-cp-yellow'>
              {t.app.high}
            </span>
          </div>

          <button
            onClick={() => setIsNotifHistoryOpen(true)}
            className='p-2 text-cp-text-muted hover:text-cp-yellow transition-colors relative'>
            <Bell size={18} />
            {notificationHistory.length > 0 && (
              <span className='absolute top-1 right-1 w-2 h-2 bg-cp-yellow rounded-full' />
            )}
          </button>

          <button
            onClick={toggleTheme}
            className='p-2 text-cp-text-muted hover:text-cp-yellow transition-colors'
            title={t.app.theme_toggle}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={toggleLanguage}
            className='p-2 text-cp-text-muted hover:text-cp-yellow transition-colors'
            title={t.app.lang_toggle}>
            <Globe size={18} />
          </button>

          {currentUser ? (
            <div className='flex items-center gap-3'>
              <div className='hidden md:flex flex-col items-end'>
                <span className='text-[10px] text-cp-text-muted tracking-widest uppercase'>
                  {t.app.operator_id}
                </span>
                <span className='text-sm font-mono text-cp-yellow'>
                  {currentUser.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className='p-2 text-cp-text-muted hover:text-cp-red transition-colors'
                title={t.app.logout}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className='px-4 py-2 btn-gold text-xs font-bold tracking-widest'>
              {t.app.login}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex min-h-0 overflow-hidden'>
        {/* Left Sidebar */}
        <aside className='w-[380px] shrink-0 glass-panel border-r-0 flex flex-col z-40'>
          {/* Tab Headers */}
          <div className='flex shrink-0 h-[40px] border-b border-white/[0.02]'>
            <button
              onClick={() => setActiveSideTab('MY_AGENT')}
              className={`flex-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                activeSideTab === 'MY_AGENT'
                  ? 'text-cp-yellow border-b-2 border-cp-yellow'
                  : 'text-cp-text-muted'
              }`}>
              <User size={14} /> {t.nav.my_team}
            </button>
            <button
              onClick={() => setActiveSideTab('RANKING')}
              className={`flex-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                activeSideTab === 'RANKING'
                  ? 'text-cp-yellow border-b-2 border-cp-yellow'
                  : 'text-cp-text-muted'
              }`}>
              <BarChart3 size={14} /> {t.nav.leaderboard}
            </button>
          </div>

          {/* Tab Content */}
          <div className='flex-1 overflow-hidden min-h-0'>
            {activeSideTab === 'MY_AGENT' ? (
              <div className='h-full overflow-y-auto custom-scrollbar p-4'>
                {agentName ? (
                  <AgentPartyFrame
                    agentName={agentName}
                    agentClass={agentClass}
                    agentLevel={1}
                    agentStats={agentStats}
                    isJoined={isJoinedCompetition}
                    rank={userRank ?? undefined}
                    profit={userProfit ?? undefined}
                    onToggleJoin={() => {
                      if (isJoinedCompetition) {
                        setConfirmModal({
                          isOpen: true,
                          title: t.confirm_modal.withdraw_title,
                          message: t.confirm_modal.withdraw_message,
                          action: handleWithdraw
                        });
                      } else {
                        setIsJoinCompetitionModalOpen(true);
                      }
                    }}
                    onSelectCapability={(cap) => setSelectedCapability(cap)}
                    onEditCapability={(cap) => setEditingCapability(cap)}
                    onEditAgent={() => setIsEditAgentModalOpen(true)}
                    onOpenChat={() => setIsChatOpen(true)}
                    onDeleteAgent={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: t.confirm_modal.delete_agent_title,
                        message: t.confirm_modal.delete_agent_message,
                        action: handleDeleteAgent
                      });
                    }}
                  />
                ) : (
                  <CompetitionInviteCard
                    isLoggedIn={!!currentUser}
                    onJoin={() => {
                      if (currentUser) {
                        setIsCreateModalOpen(true);
                      } else {
                        setPendingAction('createAgent');
                        setIsLoginModalOpen(true);
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              <RankingList
                data={rankingList}
                onSelectAgent={(name) =>
                  setHighlightedAgent(highlightedAgent === name ? null : name)
                }
                onInspectAgent={(name) => setInspectingAgent(name)}
                onHoverAgent={setHoveredAgent}
                activeAgent={highlightedAgent}
              />
            )}
          </div>
        </aside>

        {/* Center Panel */}
        <main className='flex-1 flex flex-col min-h-0 bg-gradient-to-br from-cp-black to-cp-dim overflow-hidden relative'>
          {/* Chart Panel */}
          <div className='flex-1 min-h-0 p-4 flex flex-col z-10'>
            <div className='flex items-center justify-between mb-4 shrink-0'>
              <div className='flex items-center gap-3'>
                <h2 className='text-lg font-serif font-bold text-cp-text tracking-wide'>
                  {t.ranking.live_battle}
                </h2>
                <span className='w-2 h-2 rounded-full bg-cp-yellow animate-pulse' />
              </div>
            </div>
            <div className='flex-1 min-h-0 glass-panel rounded-lg overflow-hidden'>
              <EquityChart
                data={chartData}
                highlightedAgent={hoveredAgent ?? highlightedAgent}
                onChartClick={(name) =>
                  setHighlightedAgent(highlightedAgent === name ? null : name)
                }
                onChartHover={setHoveredAgent}
                theme={theme}
              />
            </div>
          </div>

          {/* Bottom Panel */}
          <div className='h-[280px] shrink-0 glass-panel border-t-0 border-l-0 border-r-0 z-20'>
            <SeasonInfoPanel
              agentName={agentName}
              isJoined={isJoinedCompetition}
              onOpenPass={() => setIsSeasonPassOpen(true)}
            />
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
      {/* Notifications */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
        onNotificationClick={() => setIsNotifHistoryOpen(true)}
      />

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginScreen
          onLogin={handleLogin}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {isCreateModalOpen && (
        <CreateAgentModal
          onCreate={handleCreateAgent}
          onClose={() => setIsCreateModalOpen(false)}
          onNotify={notify}
        />
      )}

      {isEditAgentModalOpen && agentName && (
        <EditAgentModal
          initialName={agentName}
          initialClass={agentClass}
          initialStats={agentStats}
          initialPrompt=''
          onSave={(name, cls, stats, modules) => {
            setAgentName(name);
            setAgentClass(cls);
            setAgentStats(stats);
            setAgentModules(modules);
          }}
          onClose={() => setIsEditAgentModalOpen(false)}
        />
      )}

      {isSeasonPassOpen && (
        <SeasonPassModal
          onClose={() => setIsSeasonPassOpen(false)}
          level={currentUser?.level || 0}
          onJoin={() => setIsSeasonPassOpen(false)}
        />
      )}

      {isJoinCompetitionModalOpen && (
        <CompetitionJoinModal
          isOpen={true}
          onClose={() => setIsJoinCompetitionModalOpen(false)}
          onJoin={handleJoinCompetition}
        />
      )}

      {selectedCapability && (
        <CapabilityModal
          capability={selectedCapability}
          customPrompt={customPrompts[selectedCapability]}
          onClose={() => setSelectedCapability(null)}
          onNotify={notify}
        />
      )}

      {editingCapability && (
        <PromptEditModal
          capability={editingCapability}
          initialPrompt={customPrompts[editingCapability] || ''}
          onSave={handleSavePrompt}
          onClose={() => setEditingCapability(null)}
        />
      )}

      {inspectingAgent && (
        <ExternalAgentModal
          agentName={inspectingAgent}
          onClose={() => setInspectingAgent(null)}
        />
      )}

      {readingArticle && (
        <ArticleModal
          article={readingArticle}
          onClose={() => setReadingArticle(null)}
        />
      )}

      {isNotifHistoryOpen && (
        <NotificationHistoryModal
          notifications={notificationHistory}
          onClose={() => setIsNotifHistoryOpen(false)}
          onClear={clearHistory}
        />
      )}
    </div>
  );
}
