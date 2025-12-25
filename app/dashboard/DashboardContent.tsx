'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import KnowledgeBaseModal from '@/components/KnowledgeBaseModal';
import CompetitionJoinModal from '@/components/CompetitionJoinModal';
import CapabilityModal from '@/components/CapabilityModal';
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

type ActivityIsRunningResponse = {
  activity_id?: string;
  user_id?: string;
  is_running?: boolean;
  [k: string]: unknown;
};

type MyRankResponse = {
  activity_id?: number | string;
  user_id?: number | string;
  agent_id?: number | string;
  rank?: number;
  return_rate?: number | string;
  [k: string]: unknown;
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
    agentRaw,
    setAgentRaw,
    agentStats,
    isJoinedCompetition,
    lastFetchedUserId,
    setAgentName,
    setAgentClass,
    setAgentStats,
    setAgentModules,
    setLastFetchedUserId,
    setAgentId,
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
    setTheme,
    setActiveSideTab,
    setIsChatOpen,
    setHighlightedAgent,
    setInspectingAgent,
    setSelectedCapability
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

  const rankingListRef = useRef<RankingItem[]>([]);
  const chartDataRef = useRef<ChartDataPoint[]>([]);

  useEffect(() => {
    rankingListRef.current = rankingList;
  }, [rankingList]);

  useEffect(() => {
    chartDataRef.current = chartData;
  }, [chartData]);

  // Local state
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isArticleAnalysisOpen, setIsArticleAnalysisOpen] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userProfit, setUserProfit] = useState<string | null>(null);
  const myRankTimerRef = useRef<number | null>(null);
  const myRankAbortRef = useRef<AbortController | null>(null);
  const myRankSeqRef = useRef(0);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<StockActivity | null>(
    null
  );
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

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
    // Rankings/curves now come from stock-activities leaderboard endpoints.
  }, [setChartData, setRankingList]);

  // Fetch current activity (no token required)
  useEffect(() => {
    let cancelled = false;

    setActivityLoading(true);
    setActivityError(null);

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
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : t.activity_panel?.fetch_failed ?? 'Fetch failed';
        setActivityError(message);
        setCurrentActivity(null);
      })
      .finally(() => {
        if (cancelled) return;
        setActivityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [t.activity_panel?.fetch_failed]);

  // After agent is resolved, query user activity status
  useEffect(() => {
    if (!agentId) return;
    if (!currentActivity) return;

    const resolvedActivityId =
      (currentActivity as any)?.id ?? (currentActivity as any)?.activity_id;
    if (!resolvedActivityId) return;

    const controller = new AbortController();
    let cancelled = false;

    apiFetch<ActivityIsRunningResponse>(
      `/api/stock-activities/is-running?activity_id=${encodeURIComponent(
        String(resolvedActivityId)
      )}`,
      {
        signal: controller.signal,
        errorHandling: 'ignore'
      }
    )
      .then((data) => {
        if (cancelled) return;

        // 以 is_running 为准：true=参赛中，false=未参赛
        const joined = Boolean(data?.is_running);
        setIsJoinedCompetition(joined);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // keep existing UX: failure should not block the page
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [agentId, currentActivity, setIsJoinedCompetition]);

  // Simulation removed: live data comes from stock-activities leaderboard endpoints.

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

  // Show user's rank/profit in agent panel (source of truth: /stock-activities/me/rank)
  useEffect(() => {
    const clearTimer = () => {
      if (myRankTimerRef.current != null) {
        window.clearTimeout(myRankTimerRef.current);
        myRankTimerRef.current = null;
      }
    };

    const abortInflight = () => {
      if (myRankAbortRef.current) {
        myRankAbortRef.current.abort();
        myRankAbortRef.current = null;
      }
    };

    const toPct = (raw: unknown) => {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n)) return null;
      if (Math.abs(n) <= 1) return n * 100;
      return n;
    };

    const fmtProfit = (raw: unknown) => {
      const pct = toPct(raw);
      if (pct == null) return null;
      return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
    };

    // Not joined: keep existing behavior as "--"
    if (!isJoinedCompetition) {
      clearTimer();
      abortInflight();
      setUserRank(null);
      setUserProfit(null);
      return;
    }

    const resolvedActivityId =
      (currentActivity as any)?.id ?? (currentActivity as any)?.activity_id;
    if (!resolvedActivityId) return;

    let cancelled = false;

    const fetchOnce = async (opts?: { resetTimer?: boolean }) => {
      const resetTimer = opts?.resetTimer ?? false;

      if (resetTimer) {
        clearTimer();
        myRankTimerRef.current = window.setTimeout(() => {
          void fetchOnce({ resetTimer: true });
        }, 60_000);
      }

      const seq = (myRankSeqRef.current += 1);

      abortInflight();
      const controller = new AbortController();
      myRankAbortRef.current = controller;

      try {
        const data = await apiFetch<MyRankResponse>(
          `/api/stock-activities/me/rank?activity_id=${encodeURIComponent(
            String(resolvedActivityId)
          )}`,
          {
            method: 'GET',
            signal: controller.signal,
            unauthorizedHandling: 'ignore',
            errorHandling: 'ignore'
          }
        );

        if (cancelled) return;
        if (seq !== myRankSeqRef.current) return;

        setUserRank(typeof data?.rank === 'number' ? data.rank : null);
        const profit = fmtProfit((data as any)?.return_rate);
        setUserProfit(profit);
      } catch {
        if (cancelled) return;
        if (seq !== myRankSeqRef.current) return;
        // keep previous values on error to avoid flicker
      } finally {
        if (myRankAbortRef.current === controller) {
          myRankAbortRef.current = null;
        }
      }
    };

    void fetchOnce({ resetTimer: true });

    return () => {
      cancelled = true;
      clearTimer();
      abortInflight();
    };
  }, [currentActivity, isJoinedCompetition]);

  // Live battle data: return-curve + leaderboard (poll every 5 minutes)
  useEffect(() => {
    const resolvedActivityId =
      (currentActivity as any)?.id ?? (currentActivity as any)?.activity_id;
    if (!resolvedActivityId) return;

    const intervalMs = 5 * 60_000;
    const limit = 10;

    let cancelled = false;
    let curveTimer: number | null = null;
    let boardTimer: number | null = null;
    let curveAbort: AbortController | null = null;
    let boardAbort: AbortController | null = null;
    let curveSeq = 0;
    let boardSeq = 0;

    const clearTimers = () => {
      if (curveTimer != null) {
        window.clearTimeout(curveTimer);
        curveTimer = null;
      }
      if (boardTimer != null) {
        window.clearTimeout(boardTimer);
        boardTimer = null;
      }
    };

    const abortAll = () => {
      if (curveAbort) {
        curveAbort.abort();
        curveAbort = null;
      }
      if (boardAbort) {
        boardAbort.abort();
        boardAbort = null;
      }
    };

    const pad2 = (n: number) => String(n).padStart(2, '0');

    const formatToMinute = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = pad2(d.getMonth() + 1);
      const dd = pad2(d.getDate());
      const hh = pad2(d.getHours());
      const mi = pad2(d.getMinutes());
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    };

    const toPctTimes100 = (raw: unknown) => {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n)) return null;
      // return_pct is ratio (e.g. 0.12), convert to percentage points.
      return n * 100;
    };

    const fmtProfit = (pctPoints: number | null) => {
      if (pctPoints == null) return '--';
      return `${pctPoints >= 0 ? '+' : ''}${pctPoints.toFixed(2)}%`;
    };

    const fetchLeaderboard = async (opts?: { resetTimer?: boolean }) => {
      const resetTimer = opts?.resetTimer ?? false;
      if (resetTimer) {
        if (boardTimer != null) window.clearTimeout(boardTimer);
        boardTimer = window.setTimeout(() => {
          void fetchLeaderboard({ resetTimer: true });
        }, intervalMs);
      }

      const seq = (boardSeq += 1);

      if (boardAbort) boardAbort.abort();
      const controller = new AbortController();
      boardAbort = controller;

      try {
        const data = await apiFetch<any[]>(
          `/api/stock-activities/leaderboard?activity_id=${encodeURIComponent(
            String(resolvedActivityId)
          )}&limit=${encodeURIComponent(String(limit))}`,
          {
            method: 'GET',
            signal: controller.signal,
            unauthorizedHandling: 'ignore',
            errorHandling: 'ignore'
          }
        );

        if (cancelled) return;
        if (seq !== boardSeq) return;

        const list = Array.isArray(data) ? data : [];
        const mapped: RankingItem[] = list
          .map((x: any, idx: number) => {
            const userName =
              typeof x?.user_name === 'string' && x.user_name
                ? x.user_name
                : typeof x?.userName === 'string'
                ? x.userName
                : '';
            const userId =
              typeof x?.user_id === 'string' || typeof x?.user_id === 'number'
                ? String(x.user_id)
                : '';
            const agentId =
              typeof x?.agent_id === 'string' || typeof x?.agent_id === 'number'
                ? String(x.agent_id)
                : '';

            const pctPoints = toPctTimes100(x?.return_pct);
            const rawProfit = 100 + (pctPoints ?? 0);

            const isUser = (() => {
              if (currentUser?.id && userId)
                return String(currentUser.id) === userId;
              if (currentUser?.username && userName)
                return String(currentUser.username) === userName;
              return false;
            })();

            return {
              id: `${userId || 'u'}:${agentId || 'a'}:${idx}`,
              rank: idx + 1,
              name: userName || userId || agentId || '—',
              class: '',
              profit: fmtProfit(pctPoints),
              rawProfit,
              status: '在线',
              isUser
            } as RankingItem;
          })
          .filter((x) => Boolean(x?.id));

        setRankingList(mapped);
      } catch {
        // keep previous values
      } finally {
        if (boardAbort === controller) boardAbort = null;
      }
    };

    const fetchReturnCurve = async (opts?: { resetTimer?: boolean }) => {
      const resetTimer = opts?.resetTimer ?? false;
      if (resetTimer) {
        if (curveTimer != null) window.clearTimeout(curveTimer);
        curveTimer = window.setTimeout(() => {
          void fetchReturnCurve({ resetTimer: true });
        }, intervalMs);
      }

      const seq = (curveSeq += 1);

      if (curveAbort) curveAbort.abort();
      const controller = new AbortController();
      curveAbort = controller;

      type CurvePoint = {
        snapshot_date?: string;
        return_pct?: number;
        daily_return_pct?: number;
      };

      type CurveSeries = {
        user_name?: string;
        curve?: CurvePoint[];
      };

      try {
        const data = await apiFetch<CurveSeries[]>(
          `/api/stock-activities/leaderboard/return-curve?activity_id=${encodeURIComponent(
            String(resolvedActivityId)
          )}`,
          {
            method: 'GET',
            signal: controller.signal,
            unauthorizedHandling: 'ignore',
            errorHandling: 'ignore'
          }
        );

        if (cancelled) return;
        if (seq !== curveSeq) return;

        const seriesList = Array.isArray(data) ? data : [];

        // Build a unified minute-based timeline
        const minuteMap = new Map<number, ChartDataPoint>();
        const names: string[] = [];
        const perNameValues = new Map<string, Map<number, number>>();

        seriesList.forEach((s) => {
          const name =
            typeof (s as any)?.user_name === 'string' && (s as any).user_name
              ? String((s as any).user_name)
              : '—';
          if (!names.includes(name)) names.push(name);

          const curve = Array.isArray((s as any)?.curve)
            ? (s as any).curve
            : [];
          const valMap = new Map<number, number>();

          curve.forEach((p: any) => {
            const rawDate = p?.snapshot_date;
            if (typeof rawDate !== 'string' || !rawDate) return;
            const dt = new Date(rawDate);
            const ts = dt.getTime();
            if (!Number.isFinite(ts)) return;
            const minuteTs = Math.floor(ts / 60_000) * 60_000;

            const pctPoints = toPctTimes100(p?.return_pct);
            if (pctPoints == null) return;
            const chartValue = 100 + Number(pctPoints.toFixed(2));
            valMap.set(minuteTs, chartValue);

            if (!minuteMap.has(minuteTs)) {
              minuteMap.set(minuteTs, {
                time: formatToMinute(new Date(minuteTs))
              });
            }
          });

          perNameValues.set(name, valMap);
        });

        const minutes = Array.from(minuteMap.keys()).sort((a, b) => a - b);
        if (!minutes.length) {
          setChartData([]);
          return;
        }

        // Carry-forward values so every series appears in the final point
        const lastSeen = new Map<string, number>();
        const points: ChartDataPoint[] = minutes.map((m) => {
          const base = minuteMap.get(m) ?? {
            time: formatToMinute(new Date(m))
          };
          const next: ChartDataPoint = { time: base.time };

          names.forEach((name) => {
            const v = perNameValues.get(name)?.get(m);
            if (typeof v === 'number' && Number.isFinite(v)) {
              lastSeen.set(name, v);
              next[name] = v;
              return;
            }

            const prev = lastSeen.get(name);
            if (typeof prev === 'number' && Number.isFinite(prev)) {
              next[name] = prev;
            }
          });

          return next;
        });

        // Cap to last 500 points for performance
        setChartData(points.slice(-500));
      } catch {
        // keep previous values
      } finally {
        if (curveAbort === controller) curveAbort = null;
      }
    };

    void fetchLeaderboard({ resetTimer: true });
    void fetchReturnCurve({ resetTimer: true });

    return () => {
      cancelled = true;
      clearTimers();
      abortAll();
    };
  }, [
    currentActivity,
    currentUser?.id,
    currentUser?.username,
    setChartData,
    setRankingList
  ]);

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

    // 如果比赛进行中，必须先退赛才能销毁 agent
    try {
      const activityId =
        (currentActivity as any)?.id ?? (currentActivity as any)?.activity_id;
      if (activityId) {
        const status = await apiFetch<ActivityIsRunningResponse>(
          `/api/stock-activities/is-running?activity_id=${encodeURIComponent(
            String(activityId)
          )}`,
          { errorHandling: 'ignore' }
        );

        if (status?.is_running === true) {
          notify(
            t.notifications.delete_failed.title,
            t.notifications.delete_failed.must_withdraw_first,
            'warning'
          );
          setConfirmModal({ ...confirmModal, isOpen: false });
          return;
        }
      }
    } catch {
      // ignore：保持原有删除流程（后端仍会兜底）
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

  const handleWithdraw = async () => {
    const activityId =
      (currentActivity as any)?.id ?? (currentActivity as any)?.activity_id;
    if (!activityId) {
      notify(
        t.notifications.withdraw_failed.title,
        t.notifications.withdraw_failed.missing_activity_id,
        'error'
      );
      return;
    }

    try {
      await apiFetch('/api/stock-activities/withdraw', {
        method: 'POST',
        body: {
          activity_id: String(activityId)
        },
        errorHandling: 'ignore'
      });

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
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : t.notifications.withdraw_failed.generic_error;
      notify(t.notifications.withdraw_failed.title, msg, 'error');
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
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
                <span className='text-sm font-mono text-cp-yellow uppercase'>
                  {String(currentUser.username || '').toUpperCase()}
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
                    onOpenKnowledge={() => setIsKnowledgeModalOpen(true)}
                    onToggleJoin={() => {
                      if (isJoinedCompetition) {
                        setConfirmModal({
                          isOpen: true,
                          title: t.confirm_modal.withdraw_title,
                          message: t.confirm_modal.withdraw_message,
                          action: () => void handleWithdraw()
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
              {chartData.length === 0 ? (
                <div className='h-full w-full p-6 flex flex-col justify-center gap-4 animate-pulse'>
                  <div className='h-4 bg-white/10 rounded w-1/4' />
                  <div className='h-4 bg-white/10 rounded w-2/5' />

                  <div className='flex-1 min-h-0 border border-white/[0.04] bg-white/[0.02] rounded' />

                  <div className='flex items-center justify-between gap-3'>
                    <div className='h-3 bg-white/10 rounded w-24' />
                    <div className='h-3 bg-white/10 rounded w-16' />
                  </div>

                  <div className='text-[11px] text-cp-text-muted tracking-widest'>
                    {t.common.loading}
                  </div>
                </div>
              ) : (
                <EquityChart
                  data={chartData}
                  highlightedAgent={hoveredAgent ?? highlightedAgent}
                  onChartClick={(name) =>
                    setHighlightedAgent(highlightedAgent === name ? null : name)
                  }
                  onChartHover={setHoveredAgent}
                  theme={theme}
                />
              )}
            </div>
          </div>

          {/* Bottom Panel */}
          <div className='h-[280px] shrink-0 glass-panel border-t-0 border-l-0 border-r-0 z-20'>
            <SeasonInfoPanel
              agentName={agentName}
              isJoined={isJoinedCompetition}
              activity={currentActivity}
              activityLoading={activityLoading}
              activityError={activityError}
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

      {isEditAgentModalOpen && agentName && agentId && (
        <EditAgentModal
          agentId={String(agentId)}
          userId={String(currentUser?.id ?? lastFetchedUserId ?? '')}
          agentName={agentName}
          personaId={String(
            (agentRaw as any)?.persona_id ?? (agentRaw as any)?.personaId ?? ''
          )}
          initialPersonaParameters={
            ((agentRaw as any)?.persona_parameters ??
              (agentRaw as any)?.personaParameters ??
              null) as Record<string, unknown> | null
          }
          onSave={async (personaParameters) => {
            try {
              await apiFetch('/api/agents/persona-parameters', {
                method: 'PUT',
                body: {
                  agent_id: agentId,
                  persona_parameters: personaParameters
                },
                errorHandling: 'ignore'
              });

              // 说明：编辑成功后无需重新获取最新 agent（页面不实时展示参数）。
              // 为保持本地状态一致性，这里仅做轻量的本地合并更新。
              setAgentRaw({
                ...((agentRaw ?? {}) as any),
                persona_parameters: personaParameters
              });

              notify('保存成功', '参数已更新', 'success');
            } catch (error) {
              const message =
                error instanceof ApiError
                  ? error.message
                  : error instanceof Error
                  ? error.message
                  : '请求失败';
              notify('保存失败', message, 'error');
            }
          }}
          onClose={() => setIsEditAgentModalOpen(false)}
        />
      )}

      {isKnowledgeModalOpen && agentName && (
        <KnowledgeBaseModal
          scenario={String((agentRaw as any)?.workflow_id ?? '')}
          userId={currentUser?.id ? String(currentUser.id) : lastFetchedUserId}
          onClose={() => setIsKnowledgeModalOpen(false)}
          onNotify={notify}
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
          onClose={() => setSelectedCapability(null)}
          onNotify={notify}
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
