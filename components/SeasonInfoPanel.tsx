'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Terminal,
  Crown,
  TrendingUp,
  ChevronRight,
  Target
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';
import { useUserStore } from '@/store/userStore';
import { AgentCapability, CapabilityHistoryEntry } from '@/types';

interface SeasonInfoPanelProps {
  agentName: string | null;
  isJoined?: boolean;
  onOpenPass?: () => void;
  activity?: StockActivity | null;
  activityLoading?: boolean;
  activityError?: string | null;
}

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

type HoldingsLatestItem = {
  stock_code?: string;
  stock_name?: string;
  quantity?: number;
  latest_price?: number;
  profit_loss_pct?: number;
};

type HoldingsLatestResponse = {
  items?: HoldingsLatestItem[];
};

const formatYMD = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const toPct = (raw: unknown) => {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 0;
  // If backend returns ratio like 0.12, display 12; otherwise keep as-is.
  if (Math.abs(n) <= 1) return n * 100;
  return n;
};

const formatCountdown = (sec: number) => {
  const safe = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

export default function SeasonInfoPanel({
  agentName,
  isJoined = false,
  onOpenPass,
  activity: activityProp,
  activityLoading: activityLoadingProp,
  activityError: activityErrorProp
}: SeasonInfoPanelProps) {
  const { t, get } = useLanguage();
  const tt = useCallback((key: string) => t(`season_info_panel.${key}`), [t]);
  const currentUser = useUserStore((s) => s.currentUser);
  const isLoggedIn = Boolean(currentUser);
  const [activityState, setActivityState] = useState<StockActivity | null>(
    null
  );
  const [activityLoadingState, setActivityLoadingState] = useState(false);
  const [activityErrorState, setActivityErrorState] = useState<string | null>(
    null
  );

  const activity = activityProp !== undefined ? activityProp : activityState;
  const activityLoading =
    activityLoadingProp !== undefined
      ? activityLoadingProp
      : activityLoadingState;
  const activityError =
    activityErrorProp !== undefined ? activityErrorProp : activityErrorState;
  const [activeTab, setActiveTab] = useState<'SEASON' | 'LOGS' | 'REVIEW'>(
    'SEASON'
  );

  const [logs, setLogs] = useState<
    {
      time: string;
      message: string;
      type: 'info' | 'success' | 'warn' | 'error';
    }[]
  >([]);

  const [logsLoading, setLogsLoading] = useState(false);
  const logsTimerRef = useRef<number | null>(null);
  const logsAbortRef = useRef<AbortController | null>(null);
  const logsFetchSeqRef = useRef(0);

  const [holdings, setHoldings] = useState<
    { code: string; name: string; volume: number; price: number; pnl: number }[]
  >([]);

  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const holdingsTimerRef = useRef<number | null>(null);
  const holdingsFetchSeqRef = useRef(0);
  const holdingsAbortRef = useRef<AbortController | null>(null);
  const holdingsNextAtRef = useRef<number | null>(null);
  const [holdingsCountdownSec, setHoldingsCountdownSec] = useState<
    number | null
  >(null);

  const clearHoldingsTimer = useCallback(() => {
    if (holdingsTimerRef.current != null) {
      window.clearTimeout(holdingsTimerRef.current);
      holdingsTimerRef.current = null;
    }
    holdingsNextAtRef.current = null;
    setHoldingsCountdownSec(null);
  }, []);

  const clearLogsTimer = useCallback(() => {
    if (logsTimerRef.current != null) {
      window.clearTimeout(logsTimerRef.current);
      logsTimerRef.current = null;
    }
  }, []);

  const pad2 = (n: number) => String(n).padStart(2, '0');

  const formatToMinute = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const inferLogType = (
    raw: unknown
  ): 'info' | 'success' | 'warn' | 'error' => {
    const s = typeof raw === 'string' ? raw.toLowerCase() : '';
    if (s.includes('error') || s.includes('fail') || s.includes('exception'))
      return 'error';
    if (s.includes('warn') || s.includes('risk')) return 'warn';
    if (s.includes('success') || s.includes('done') || s.includes('complete'))
      return 'success';
    return 'info';
  };

  // Real-time countdown updater
  useEffect(() => {
    const id = window.setInterval(() => {
      const nextAt = holdingsNextAtRef.current;
      if (nextAt == null) {
        setHoldingsCountdownSec(null);
        return;
      }

      const remainingMs = nextAt - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setHoldingsCountdownSec(remainingSec);
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  const fetchHoldingsLatest = useCallback(
    async (opts?: { resetTimer?: boolean }) => {
      const resetTimer = opts?.resetTimer ?? false;

      if (!isLoggedIn) return;

      const activityIdRaw = activity?.id;
      if (activityIdRaw === undefined || activityIdRaw === null) return;

      const activityId = String(activityIdRaw);
      const priceDate = formatYMD(new Date());

      if (resetTimer) {
        clearHoldingsTimer();
        holdingsNextAtRef.current = Date.now() + 60_000;
        setHoldingsCountdownSec(60);
        holdingsTimerRef.current = window.setTimeout(() => {
          void fetchHoldingsLatest({ resetTimer: true });
        }, 60_000);
      }

      const seq = (holdingsFetchSeqRef.current += 1);
      setHoldingsLoading(true);

      // Abort previous in-flight request to avoid piling up fetches.
      if (holdingsAbortRef.current) {
        holdingsAbortRef.current.abort();
      }
      const controller = new AbortController();
      holdingsAbortRef.current = controller;

      try {
        const url = `/api/stock-activities/holdings/latest?activity_id=${encodeURIComponent(
          activityId
        )}&price_date=${encodeURIComponent(priceDate)}`;

        const data = await apiFetch<HoldingsLatestResponse>(url, {
          method: 'GET',
          signal: controller.signal,
          errorHandling: 'ignore'
        });

        if (seq !== holdingsFetchSeqRef.current) return;

        const list = Array.isArray((data as any)?.items)
          ? (data as any).items
          : [];

        const mapped = (list as HoldingsLatestItem[])
          .map((x) => {
            const code = typeof x?.stock_code === 'string' ? x.stock_code : '';
            const name =
              typeof x?.stock_name === 'string' ? x.stock_name : code;
            const volume =
              typeof x?.quantity === 'number'
                ? x.quantity
                : Number(x?.quantity) || 0;
            const price =
              typeof x?.latest_price === 'number'
                ? x.latest_price
                : Number(x?.latest_price) || 0;
            const pnl = toPct(x?.profit_loss_pct);
            return { code, name, volume, price, pnl };
          })
          .filter((x) => Boolean(x.code));

        setHoldings(mapped);
      } catch {
        if (seq !== holdingsFetchSeqRef.current) return;
        setHoldings([]);
      } finally {
        if (holdingsAbortRef.current === controller) {
          holdingsAbortRef.current = null;
        }
        if (seq === holdingsFetchSeqRef.current) {
          setHoldingsLoading(false);
        }
      }
    },
    [activity?.id, clearHoldingsTimer, isLoggedIn]
  );

  // Live holdings: fetch immediately, then refresh every 1 minute.
  // Manual "Fetch now" triggers an immediate request and resets the timer.
  useEffect(() => {
    // Only start after activity is known.
    if (activity?.id === undefined || activity?.id === null) return;

    if (!isLoggedIn) {
      clearHoldingsTimer();
      if (holdingsAbortRef.current) {
        holdingsAbortRef.current.abort();
        holdingsAbortRef.current = null;
      }
      setHoldings([]);
      setHoldingsLoading(false);
      return;
    }

    void fetchHoldingsLatest({ resetTimer: true });

    return () => {
      clearHoldingsTimer();
      if (holdingsAbortRef.current) {
        holdingsAbortRef.current.abort();
        holdingsAbortRef.current = null;
      }
    };
  }, [activity?.id, clearHoldingsTimer, fetchHoldingsLatest, isLoggedIn]);

  const fetchLogsList = useCallback(
    async (opts?: { resetTimer?: boolean }) => {
      const resetTimer = opts?.resetTimer ?? false;

      if (!isLoggedIn) return;
      if (!isJoined) return;
      const activityIdRaw = activity?.id;
      if (activityIdRaw === undefined || activityIdRaw === null) return;

      const activityId = String(activityIdRaw);

      const intervalMs = 5 * 60_000;
      if (resetTimer) {
        clearLogsTimer();
        logsTimerRef.current = window.setTimeout(() => {
          void fetchLogsList({ resetTimer: true });
        }, intervalMs);
      }

      const seq = (logsFetchSeqRef.current += 1);
      setLogsLoading(true);

      if (logsAbortRef.current) {
        logsAbortRef.current.abort();
      }
      const controller = new AbortController();
      logsAbortRef.current = controller;

      try {
        const url = `/api/stock-activities/logs/list?activity_id=${encodeURIComponent(
          activityId
        )}`;

        const data = await apiFetch<{ items?: any[] }>(url, {
          method: 'GET',
          signal: controller.signal,
          errorHandling: 'ignore'
        });

        if (seq !== logsFetchSeqRef.current) return;

        const items = Array.isArray((data as any)?.items)
          ? (data as any).items
          : [];

        const mapped = items
          .map((x: any) => {
            const rawCreatedAt = x?.created_at;
            const createdAtStr =
              typeof rawCreatedAt === 'string' ? rawCreatedAt : '';
            const dt = createdAtStr ? new Date(createdAtStr) : null;
            const ts = dt ? dt.getTime() : NaN;
            const time = dt && Number.isFinite(ts) ? formatToMinute(dt) : '--';

            const message = typeof x?.message === 'string' ? x.message : '-';
            const type = inferLogType(x?.log_type);

            return {
              ts,
              time,
              message,
              type
            };
          })
          .filter((x: any) => typeof x?.message === 'string')
          .sort((a: any, b: any) => (b.ts ?? 0) - (a.ts ?? 0))
          .slice(0, 200)
          .map(({ ts: _ts, ...rest }: any) => rest);

        setLogs(mapped);
      } catch {
        if (seq !== logsFetchSeqRef.current) return;
        setLogs([]);
      } finally {
        if (logsAbortRef.current === controller) {
          logsAbortRef.current = null;
        }
        if (seq === logsFetchSeqRef.current) {
          setLogsLoading(false);
        }
      }
    },
    [activity?.id, clearLogsTimer, isJoined, isLoggedIn]
  );

  // Fetch current activity from API
  useEffect(() => {
    // If parent provides activity state, do not duplicate fetching.
    if (
      activityProp !== undefined ||
      activityLoadingProp !== undefined ||
      activityErrorProp !== undefined
    ) {
      return;
    }

    let aborted = false;
    const controller = new AbortController();
    setActivityLoadingState(true);
    setActivityErrorState(null);

    apiFetch<StockActivity[]>('/api/stock-activities', {
      unauthorizedHandling: 'ignore',
      signal: controller.signal
    })
      .then((data) => {
        if (aborted) return;
        const list: StockActivity[] = Array.isArray(data) ? data : [];
        const running = list
          .filter((a) => a?.status === 'running')
          .sort((a, b) => (b.index_sort ?? 0) - (a.index_sort ?? 0));
        setActivityState(
          (running[0] ?? list[0] ?? null) as StockActivity | null
        );
      })
      .catch((err) => {
        if (aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : t('activity_panel.fetch_failed');
        setActivityErrorState(message);
        setActivityState(null);
      })
      .finally(() => {
        if (aborted) return;
        setActivityLoadingState(false);
      });

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [activityErrorProp, activityLoadingProp, activityProp, t]);

  // Auto-switch tabs based on status
  useEffect(() => {
    if (isJoined) {
      setActiveTab('LOGS');
    } else {
      setActiveTab('SEASON');
    }
  }, [isJoined]);

  // System logs: fetch immediately, then poll every 5 minutes.
  useEffect(() => {
    if (
      !isLoggedIn ||
      !agentName ||
      !isJoined ||
      activity?.id === undefined ||
      activity?.id === null
    ) {
      clearLogsTimer();
      if (logsAbortRef.current) {
        logsAbortRef.current.abort();
        logsAbortRef.current = null;
      }
      setLogs([]);
      setLogsLoading(false);
      return;
    }

    void fetchLogsList({ resetTimer: true });

    return () => {
      clearLogsTimer();
      if (logsAbortRef.current) {
        logsAbortRef.current.abort();
        logsAbortRef.current = null;
      }
    };
  }, [
    activity?.id,
    agentName,
    clearLogsTimer,
    fetchLogsList,
    isJoined,
    isLoggedIn
  ]);

  const capabilityHistory =
    (get('capability_history') as
      | Partial<Record<AgentCapability, CapabilityHistoryEntry[]>>
      | undefined) ?? {};
  const reviewEntries: CapabilityHistoryEntry[] = [
    ...(capabilityHistory[AgentCapability.STOCK_ANALYSIS] ?? []),
    ...(capabilityHistory[AgentCapability.STRATEGY_PICKING] ?? []),
    ...(capabilityHistory[AgentCapability.BACKTESTING] ?? [])
  ];

  return (
    <div className='w-full h-full flex flex-col bg-transparent text-xs'>
      {/* Tab Header - Bottom Border Only */}
      <div className='flex items-center px-4 h-[40px] gap-6 glass-header bg-transparent overflow-x-auto custom-scrollbar shrink-0'>
        <button
          onClick={() => setActiveTab('SEASON')}
          className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors ${
            activeTab === 'SEASON' ? 'active' : ''
          }`}>
          <Crown size={12} /> {t('activity_panel.tab_overview')}
        </button>

        {agentName && (
          <>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors ${
                activeTab === 'LOGS' ? 'active' : ''
              }`}>
              <Terminal size={12} /> {t('activity_panel.tab_logs')}
            </button>
            <button
              onClick={() => setActiveTab('REVIEW')}
              className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors hover:text-white ${
                activeTab === 'REVIEW' ? 'active' : ''
              }`}>
              <Target size={12} /> {t('season_info_panel.history_review_label')}
            </button>
          </>
        )}

        <div className='flex-1'></div>

        {/* Status Indicator */}
        <div className='hidden md:block type-caption type-mono'>
          SYSTEM:{' '}
          {isJoined ? <span className='text-cp-yellow'>ACTIVE</span> : 'IDLE'}
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 min-h-0 relative overflow-hidden bg-transparent p-0'>
        {activeTab === 'SEASON' && (
          <div className='w-full h-full flex flex-col'>
            <div className='flex flex-1 min-h-0'>
              {/* Stats - No vertical border unless needed */}
              <div className='w-1/3 p-6 flex flex-col justify-center items-center gap-3 text-center bg-transparent'>
                <div className='type-eyebrow'>
                  {t('activity_panel.current_activity')}
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white type-figure leading-tight'>
                    {activity?.activity_name ||
                      (activityLoading
                        ? t('activity_panel.loading_dots')
                        : t('activity_panel.empty'))}
                  </div>
                  <div className='mt-2 type-caption type-mono text-cp-text-muted'>
                    {typeof activity?.index_sort === 'number'
                      ? t('activity_panel.period').replace(
                          '{n}',
                          String(activity.index_sort)
                        )
                      : t('activity_panel.dash')}
                  </div>
                </div>
                <div className='w-12 h-px bg-white/[0.1] my-2'></div>
                <div className='type-eyebrow'>{t('activity_panel.status')}</div>
                <div className='text-xl font-bold text-white type-figure'>
                  {activity?.status ||
                    (activityLoading
                      ? t('activity_panel.loading')
                      : t('activity_panel.unknown'))}
                </div>
              </div>

              {/* Pass Info - Clean separation */}
              <div className='flex-1 p-6 flex flex-col justify-center bg-transparent border-l border-white/[0.02]'>
                <div className='flex justify-between items-center mb-4'>
                  <span className='font-bold text-lg text-cp-text type-serif-title'>
                    {t('activity_panel.activity_info')}
                  </span>
                  {activity?.activity_type && (
                    <span className='text-cp-yellow type-caption border border-cp-yellow px-2 py-0.5'>
                      {activity.activity_type}
                    </span>
                  )}
                </div>

                {activityError ? (
                  <div className='text-xs text-cp-red font-sans leading-relaxed'>
                    {activityError}
                  </div>
                ) : (
                  <div className='flex flex-col gap-3'>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 border border-white/[0.1] flex items-center justify-center text-cp-cyan bg-white/[0.02]'>
                        <TrendingUp size={20} />
                      </div>
                      <div className='text-xs text-cp-text-muted font-sans leading-relaxed'>
                        {activity?.description || t('activity_panel.dash')}
                      </div>
                    </div>

                    <div className='text-[11px] text-cp-text-muted font-mono tracking-widest'>
                      {activity?.start_date && activity?.end_date
                        ? t('activity_panel.date_range')
                            .replace('{start}', activity.start_date)
                            .replace('{end}', activity.end_date)
                        : t('activity_panel.date_empty')}
                    </div>
                    <div className='text-[11px] text-cp-text-muted font-mono tracking-widest'>
                      {activity?.initial_capital
                        ? t('activity_panel.initial_capital').replace(
                            '{amount}',
                            activity.initial_capital
                          )
                        : t('activity_panel.initial_empty')}
                    </div>

                    {/* 暂时隐藏：活动奖励/活动通行证 */}
                    {false && (
                      <button
                        onClick={onOpenPass}
                        className='w-full py-3 glass-button flex items-center justify-center gap-2 text-xs font-bold text-cp-text-muted hover:text-white'>
                        {tt('pass_button')} <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className='flex h-full min-h-0 bg-transparent'>
            {/* Left Column: Holdings */}
            <div className='w-[35%] border-r border-white/[0.02] flex flex-col bg-white/[0.01]'>
              <div className='h-8 flex items-center justify-between px-3 border-b border-white/[0.02] bg-white/[0.02] shrink-0 gap-3'>
                <span className='type-eyebrow flex items-center gap-2'>
                  <Target size={10} /> {tt('holdings_title')}
                </span>

                <div className='flex items-center gap-2 shrink-0'>
                  <button
                    type='button'
                    onClick={() =>
                      void fetchHoldingsLatest({ resetTimer: true })
                    }
                    disabled={holdingsLoading || !activity?.id}
                    className='px-2 py-1 rounded border border-cp-yellow/40 text-cp-yellow bg-cp-yellow/5 hover:bg-cp-yellow/10 hover:border-cp-yellow/70 transition-colors type-mono text-[10px] font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-label={tt('holdings_fetch_now')}>
                    {holdingsLoading
                      ? tt('holdings_fetching')
                      : tt('holdings_fetch_now')}
                  </button>

                  {holdingsCountdownSec != null && (
                    <span className='type-mono text-[10px] text-cp-text-muted tabular-nums'>
                      {formatCountdown(holdingsCountdownSec)}
                    </span>
                  )}
                </div>
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar'>
                {holdings.map((h) => (
                  <div
                    key={h.code}
                    className='px-5 py-2 border-white/[0.02] hover:bg-white/[0.05] transition-colors group'>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-xs font-bold text-cp-text group-hover:text-white'>
                        {h.name}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          h.pnl >= 0 ? 'text-cp-yellow' : 'text-cp-red'
                        }`}>
                        {h.pnl >= 0 ? '+' : ''}
                        {h.pnl.toFixed(2)}%
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-[10px] text-cp-text-muted type-mono'>
                      <span>{h.code}</span>
                      <span>
                        {h.volume}股 / ¥{h.price}
                      </span>
                    </div>
                  </div>
                ))}
                <div className='p-2 type-caption text-gray-600 text-center italic mt-2'>
                  {tt('holdings_delay')}
                </div>
              </div>
            </div>

            {/* Right Column: Logs */}
            <div className='flex-1 flex flex-col min-h-0'>
              <div className='h-8 flex items-center px-3 border-b border-white/[0.02] bg-white/[0.02] shrink-0'>
                <span className='type-eyebrow flex items-center gap-2'>
                  <Terminal size={10} /> {tt('system_logs')}
                </span>
                <div className='flex-1' />
                {logsLoading && (
                  <span className='type-mono text-[10px] text-cp-text-muted'>
                    {t('common.loading')}
                  </span>
                )}
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar p-3 type-mono text-[11px] flex flex-col-reverse bg-transparent leading-relaxed'>
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className='mb-1.5 flex gap-2 opacity-80 hover:opacity-100 transition-opacity'>
                    <span className='text-cp-text-muted select-none shrink-0'>
                      [{log.time}]
                    </span>
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-cp-yellow'
                          : log.type === 'warn'
                          ? 'text-cp-red'
                          : log.type === 'info'
                          ? 'text-cp-cyan'
                          : 'text-cp-text-muted'
                      }>
                      {log.type === 'warn' && '! '}
                      {log.type === 'success' && '> '}
                      {log.message}
                    </span>
                  </div>
                ))}
                <div className='text-cp-text-muted mb-4 opacity-50 select-none type-mono'>
                  {tt('system_stream_start')}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'REVIEW' && (
          <div className='flex flex-col h-full min-h-0 bg-transparent'>
            <div className='flex flex-wrap items-start justify-between gap-3 p-6 border-b border-white/[0.02] bg-white/[0.02]'>
              <div>
                <div className='type-eyebrow text-cp-text'>
                  {t('season_info_panel.history_review_label')}
                </div>
                <p className='text-sm text-cp-text-muted mt-2 max-w-xl leading-relaxed'>
                  {t('season_info_panel.history_review_desc')}
                </p>
              </div>
              <div className='text-right'>
                <span className='type-caption text-cp-yellow block'>
                  {t('capability_modal.history_latency')}
                </span>
                {agentName && (
                  <span className='type-mono text-[11px] text-cp-text-muted'>
                    {agentName}
                  </span>
                )}
              </div>
            </div>
            <div className='flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 bg-transparent'>
              {reviewEntries.length ? (
                reviewEntries.map((entry, idx) => (
                  <div
                    key={`${entry.time}-${entry.tag}-${idx}`}
                    className='border border-white/[0.05] bg-white/[0.02] p-4 hover:border-cp-yellow/30 transition-colors'>
                    <div className='flex items-center justify-between type-mono text-[11px] text-cp-text-muted'>
                      <span>{entry.time}</span>
                      <span className='tracking-[0.35em]'>{entry.tag}</span>
                    </div>
                    <p className='text-sm text-white mt-2 leading-relaxed'>
                      {entry.summary}
                    </p>
                    <p className='text-xs text-cp-text-muted mt-1'>
                      {entry.detail}
                    </p>
                  </div>
                ))
              ) : (
                <div className='text-cp-text-muted text-sm font-mono'>
                  {t('capability_modal.history_empty')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
