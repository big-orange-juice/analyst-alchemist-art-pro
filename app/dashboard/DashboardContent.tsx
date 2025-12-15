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

import { AgentCapability } from '@/types';
import type {
  AgentStats,
  AgentModule,
  RankingItem,
  ChartDataPoint
} from '@/types';

// Components
import MatrixRain from '@/components/MatrixRain';
import RankingList from '@/components/RankingList';
import AgentPartyFrame from '@/components/AgentPartyFrame';
import SeasonInfoPanel from '@/components/SeasonInfoPanel';
import CompetitionInviteCard from '@/components/CompetitionInviteCard';
import NotificationSystem from '@/components/NotificationSystem';
import ChatWidget from '@/components/ChatWidget';
import LoginScreen from '@/components/LoginScreen';
import CreateAgentModal from '@/components/CreateAgentModal';
import EditAgentModal from '@/components/EditAgentModal';
import CompetitionJoinModal from '@/components/CompetitionJoinModal';
import CapabilityModal from '@/components/CapabilityModal';
import PromptEditModal from '@/components/PromptEditModal';
import ExternalAgentModal from '@/components/ExternalAgentModal';
import ArticleModal from '@/components/ArticleModal';
import NotificationHistoryModal from '@/components/NotificationHistoryModal';
import { ApiError, apiFetch } from '@/lib/http';
import EquityChart from '@/components/EquityChart';
import ArticleAnalysisModal from '@/components/ArticleAnalysisModal';
import { translations } from '@/i18n/locales';

type StockActivity = {
  id: number | string;
  user_id?: number | string;
  activity_name?: string;
  activity_type?: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  initial_capital?: string;
  index_sort?: number;
};

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const loginParam = searchParams.get('login');

  // Stores
  const { currentUser, setCurrentUser, clearUser } = useUserStore();
  const {
    agentId,
    agentName,
    agentClass,
    setAgentRaw,
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
    isJoinCompetitionModalOpen,
    isNotifHistoryOpen,
    confirmModal,
    readingArticle,
    pendingAction,
    setIsLoginModalOpen,
    setIsCreateModalOpen,
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
  const [isArticleAnalysisOpen, setIsArticleAnalysisOpen] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userProfit, setUserProfit] = useState<string | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<StockActivity | null>(
    null
  );

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
    if (loginParam === 'true' && !currentUser && !isLoginModalOpen) {
      setIsLoginModalOpen(true);
    }
  }, [currentUser, isLoginModalOpen, loginParam, setIsLoginModalOpen]);

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
    apiFetch<{ rankings: RankingItem[]; chartData: ChartDataPoint[] }>(
      '/api/rankings'
    )
      .then((data) => {
        setRankingList(data.rankings);
        setChartData(data.chartData);
      })
      .catch(() => {
        // keep silent to preserve existing UX
      });
  }, [setChartData, setRankingList]);

  // Fetch current activity (no token required)
  useEffect(() => {
    let cancelled = false;

    apiFetch<StockActivity[]>('/api/stock-activities', {
      unauthorizedHandling: 'ignore'
    })
      .then((data) => {
        if (cancelled) return;
        const list: StockActivity[] = Array.isArray(data) ? data : [];
        const running = list
          .filter((a) => a?.status === 'running')
          .sort((a, b) => (b.index_sort ?? 0) - (a.index_sort ?? 0));
        setCurrentActivity(running[0] ?? list[0] ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setCurrentActivity(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
        const data = await apiFetch<any>(query, { signal: controller.signal });
        if (cancelled) return;

        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.agents)
          ? (data as any).agents
          : [];

        if (!list.length) return;

        const agent = list[0] as any;
        setAgentRaw(
          agent && typeof agent === 'object'
            ? (agent as Record<string, unknown>)
            : null
        );
        const resolvedAgentId =
          agent?.agent_id ?? agent?.id ?? agent?.agentId ?? null;
        const workflowId = agent?.workflow_id ?? agent?.workflowId ?? null;
        const agentNameValue = agent?.agent_name ?? agent?.agentName ?? null;

        setAgentId(resolvedAgentId != null ? String(resolvedAgentId) : null);
        setAgentName(agentNameValue ? String(agentNameValue) : null);
        if (workflowId) setAgentClass(String(workflowId));
        setLastFetchedUserId(resolvedUserId);
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
  const handleLogin = (incoming: {
    id?: string;
    username: string;
    email?: string;
  }) => {
    const nextUserId = incoming.id || incoming.username;

    // 如果是切换身份，清理与用户相关的 Agent 状态
    if (currentUser && currentUser.id !== nextUserId) {
      clearAgent();
    }

    const newUser = {
      id: nextUserId,
      username: incoming.username,
      email: incoming.email,
      level: 1,
      achievements: [],
      avatarFrame: 'default'
    };
    setCurrentUser(newUser);
    setIsLoginModalOpen(false);

    // 登录成功后清理 URL 上的 login=true，避免刷新反复触发登录弹窗
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('login') === 'true') {
          url.searchParams.delete('login');
          window.history.replaceState({}, '', url.toString());
        }
      } catch {
        // ignore
      }
    }

    notify(
      t.notifications.auth.title,
      t.notifications.auth.message.replace('{name}', incoming.username),
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

  const handleLogoutClick = () => {
    setConfirmModal({
      isOpen: true,
      title: t.confirm_modal.logout_title,
      message: t.confirm_modal.logout_message,
      action: () => {
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          action: () => {}
        });
        handleLogout();
      }
    });
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
      notify(
        t.notifications.delete_failed.title,
        t.notifications.delete_failed.missing_agent_id,
        'error'
      );
      return;
    }

    try {
      await apiFetch(`/api/agents/${encodeURIComponent(agentId)}`, {
        method: 'DELETE',
        parseAs: 'text',
        errorHandling: 'ignore'
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : t.notifications.delete_failed.generic_error;
      notify(t.notifications.delete_failed.title, message, 'error');
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

  const handleJoinCompetition = async (payload?: {
    activity_id?: string;
    cycle?: number;
  }) => {
    const activityId =
      (payload?.activity_id as any) ?? (currentActivity as any)?.id;
    if (!activityId) {
      notify(
        t.notifications.join_failed.title,
        t.notifications.join_failed.missing_activity_id,
        'error'
      );
      return;
    }

    const cycleValue = typeof payload?.cycle === 'number' ? payload.cycle : 0;
    if (!Number.isFinite(cycleValue) || cycleValue < 5) {
      notify(
        t.notifications.join_failed.title,
        '执行周期最小值为 5 分钟',
        'error'
      );
      return;
    }

    try {
      await apiFetch('/api/stock-activities/tasks', {
        method: 'POST',
        body: {
          activity_id: String(activityId),
          cycle: cycleValue
        },
        errorHandling: 'ignore'
      });

      setIsJoinedCompetition(true);
      setIsJoinCompetitionModalOpen(false);
      notify(
        t.notifications.joined.title,
        t.notifications.joined.message,
        'success'
      );
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : t.notifications.join_failed.title;
      notify(t.notifications.join_failed.title, msg, 'error');
    }
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
    if (!editingCapability) return;
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
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className='h-screen bg-cp-black text-cp-text relative flex flex-col overflow-hidden'>
      <MatrixRain theme={theme} />

      {/* Top Bar */}
      <header className='shrink-0 h-[60px] glass-header backdrop-blur-md flex items-center justify-between px-6 z-50'>
        <div className='flex items-center gap-4'>
          <Link href='/' className='flex items-center gap-3 group'>
            <Hexagon
              className='text-cp-yellow group-hover:scale-110 transition-transform'
              size={28}
            />
            <div className='flex flex-col'>
              <h1 className='text-sm font-serif font-bold tracking-widest text-cp-text group-hover:text-cp-yellow transition-colors'>
                {t.app.title}
              </h1>
              <p className='text-[10px] text-cp-text-muted tracking-widest uppercase'>
                {currentActivity?.activity_name || t.app.subtitle}
              </p>
            </div>
          </Link>
        </div>

        {/* Right Controls */}
        <div className='flex items-center gap-3'>
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
                onClick={handleLogoutClick}
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
              <div className='h-full min-h-0 custom-scrollbar p-4 overflow-y-auto'>
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
                    onSelectCapability={(cap) => {
                      if (cap === AgentCapability.ARTICLE_WRITING) {
                        setIsArticleAnalysisOpen(true);
                        return;
                      }
                      setSelectedCapability(cap);
                    }}
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
                activeAgent={hoveredAgent ?? highlightedAgent}
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
            />
          </div>
        </main>
      </div>

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

      {/* 暂时隐藏：活动通行证 */}
      {false && null}

      {isJoinCompetitionModalOpen && (
        <CompetitionJoinModal
          isOpen={true}
          onClose={() => setIsJoinCompetitionModalOpen(false)}
          onJoin={(payload) => handleJoinCompetition(payload)}
          activity={currentActivity}
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

      {isArticleAnalysisOpen && (
        <ArticleAnalysisModal
          agentId={agentId}
          userId={currentUser?.id ? String(currentUser.id) : null}
          onClose={() => setIsArticleAnalysisOpen(false)}
          onNotify={notify}
        />
      )}
    </div>
  );
}
