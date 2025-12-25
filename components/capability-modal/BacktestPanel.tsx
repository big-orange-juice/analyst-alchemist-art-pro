'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { useLanguage } from '@/lib/useLanguage';
import type { AppNotification, ChartDataPoint } from '@/types';

export type PnlCurvePoint = {
  snapshot_date: string;
  cumulative_return_pct: number;
  [k: string]: unknown;
};

type BacktestPnlCurveResponse = {
  activity?: {
    status?: string;
    [k: string]: unknown;
  };
  points?: PnlCurvePoint[];
  [k: string]: unknown;
};

type BacktestHistoryItem = {
  id?: string;
  activity_id?: string;
  activity_name?: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  points?: PnlCurvePoint[];
  items?: unknown;
  [k: string]: unknown;
};

type BacktestHistoryResponse = {
  page?: number;
  page_size?: number;
  total?: number;
  items?: BacktestHistoryItem[];
  [k: string]: unknown;
};

type Props = {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setOutput: (v: string) => void;
  setChartData: (v: ChartDataPoint[]) => void;
  onNotify?: (
    title: string,
    message: string,
    type?: AppNotification['type']
  ) => void;
};

const formatDateInput = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const addDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

const formatDateTimeToSecond = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

export default function BacktestPanel({
  isLoading,
  setIsLoading,
  setOutput,
  setChartData,
  onNotify
}: Props) {
  const { t } = useLanguage();
  const mountedRef = useRef(true);

  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [history, setHistory] = useState<BacktestHistoryItem[]>(() => []);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(20);
  const [historyTotal, setHistoryTotal] = useState<number | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const historyListRef = useRef<HTMLDivElement | null>(null);

  const now = useMemo(() => new Date(), []);
  const today = now;
  const defaultTimestamp = useMemo(() => formatDateTimeToSecond(now), [now]);

  const [activityName, setActivityName] = useState(
    `历史回测 ${defaultTimestamp}`
  );
  const [description, setDescription] = useState(
    `自动创建于 ${defaultTimestamp}`
  );
  const [startDate, setStartDate] = useState(
    formatDateInput(addDays(today, -1))
  );
  const [endDate, setEndDate] = useState(formatDateInput(today));
  const [initialCapital, setInitialCapital] = useState(100000);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const toChartData = (points: PnlCurvePoint[]): ChartDataPoint[] => {
    return points.map((p) => ({
      time: String(p.snapshot_date ?? ''),
      pnl: 100 + Number(p.cumulative_return_pct ?? 0)
    }));
  };

  const fetchHistoryPage = async (page: number) => {
    setIsHistoryLoading(true);
    try {
      const res = await apiFetch<BacktestHistoryResponse>(
        `/api/backtests/history?page=${encodeURIComponent(
          String(page)
        )}&page_size=${encodeURIComponent(String(historyPageSize))}`,
        { method: 'GET', errorHandling: 'ignore' }
      );

      const items = Array.isArray(res?.items) ? res.items : [];
      const total =
        typeof res?.total === 'number'
          ? res.total
          : typeof (res as any)?.count === 'number'
          ? (res as any).count
          : null;
      setHistoryTotal(total);

      setHistory((prev) => {
        if (page <= 1) return items;
        const merged = [...prev, ...items];
        const seen = new Set<string>();
        return merged.filter((x, idx) => {
          const key =
            typeof x?.id === 'string'
              ? x.id
              : typeof (x as any)?.activity_id === 'string'
              ? String((x as any).activity_id)
              : `idx:${idx}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
    } catch {
      if (page <= 1) setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const refreshHistory = async () => {
    setHistoryPage(1);
    setHistoryTotal(null);
    await fetchHistoryPage(1);
  };

  const canLoadMore = () => {
    if (isHistoryLoading) return false;
    if (historyTotal == null) return true;
    return history.length < historyTotal;
  };

  const handleHistoryScroll = () => {
    const el = historyListRef.current;
    if (!el) return;
    if (!canLoadMore()) return;

    const thresholdPx = 120;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > thresholdPx) return;

    const nextPage = historyPage + 1;
    setHistoryPage(nextPage);
    void fetchHistoryPage(nextPage);
  };

  const applyHistoryItem = async (item: BacktestHistoryItem) => {
    const rawPoints = Array.isArray(item?.points)
      ? item.points
      : Array.isArray((item as any)?.items)
      ? ((item as any).items as unknown[])
          .map((x) => x as any as PnlCurvePoint)
          .filter((p) => p && typeof p === 'object')
      : [];

    if (rawPoints.length) {
      setChartData(toChartData(rawPoints));
      setOutput(
        `回测历史\n\n- ${
          item.activity_name || item.id || 'Backtest'
        }\n- points: ${rawPoints.length}`
      );
      return;
    }

    // 若后端 history 暂未包含 points，降级用已有 pnl_curve 接口拉曲线
    const id =
      typeof item?.id === 'string'
        ? item.id
        : typeof (item as any)?.activity_id === 'string'
        ? String((item as any).activity_id)
        : '';
    if (!id) return;

    try {
      const result = await apiFetch<BacktestPnlCurveResponse>(
        `/api/backtests/pnl_curve?activity_id=${encodeURIComponent(id)}`,
        { method: 'GET', errorHandling: 'ignore' }
      );
      const points = Array.isArray(result?.points) ? result.points : [];
      setChartData(toChartData(points));
      setOutput(`回测历史\n\n- id: ${id}\n- points: ${points.length}`);
    } catch {
      // ignore
    }
  };

  const pollPnlCurve = async (id: string) => {
    const intervalMs = 10000;

    while (mountedRef.current) {
      try {
        const result = await apiFetch<BacktestPnlCurveResponse>(
          `/api/backtests/pnl_curve?activity_id=${encodeURIComponent(id)}`,
          {
            method: 'GET',
            errorHandling: 'ignore'
          }
        );

        const points = Array.isArray(result?.points) ? result.points : [];
        if (points.length > 0) {
          setChartData(toChartData(points));
        }

        if (result?.activity?.status === 'closed') {
          return { done: true, points };
        }
      } catch {
        // ignore and continue polling
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    return null;
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setOutput('');
    setChartData([]);

    let finalOutput = '';

    try {
      const payload = {
        activity_name: activityName || 'Backtest',
        description,
        start_date: startDate,
        end_date: endDate,
        initial_capital: Number(initialCapital) || 100000
      };

      const created = await apiFetch<{ id: string | number }, typeof payload>(
        '/api/backtests',
        {
          method: 'POST',
          body: payload,
          errorHandling: 'ignore'
        }
      );

      const id = created?.id != null ? String(created.id) : '';
      if (!id) {
        throw new Error('回测创建失败：缺少 id');
      }

      onNotify?.(
        '回测已开始',
        '回测可能需要较长时间，无需一直等待；你可以先操作其他功能，结果生成后会自动更新到这里。',
        'info'
      );

      finalOutput = `回测已创建\n\n- id: ${id}\n\n提示：回测可能需要较长时间，无需一直等待；你可以先操作其他功能，结果生成后会自动更新收益率曲线。\n\n正在拉取收益率曲线...`;
      setOutput(finalOutput);

      const polled = await pollPnlCurve(id);
      // 组件卸载/弹窗关闭时，停止轮询即可
      if (!polled) return;

      const curve = polled.points;

      if (curve.length > 0) {
        finalOutput = `回测完成\n\n- id: ${id}\n- points: ${curve.length}`;
        setOutput(finalOutput);
        onNotify?.('回测完成', '已生成收益率曲线', 'success');
      } else {
        finalOutput = `回测完成\n\n- id: ${id}\n- points: 0`;
        setOutput(finalOutput);
        onNotify?.('回测完成', '暂无收益率曲线数据', 'warning');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '回测执行失败';
      finalOutput = message;
      setOutput(finalOutput);
      onNotify?.('回测失败', message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cp-border p-6 flex flex-col bg-white/[0.02] hover-card m-2 gap-4 min-h-0'>
      <div
        role='tablist'
        className='flex items-center gap-4 border-b border-cp-border'>
        <button
          type='button'
          onClick={() => setActiveTab('form')}
          role='tab'
          aria-selected={activeTab === 'form'}
          className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors -mb-px border-b-2 ${
            activeTab === 'form'
              ? 'border-cp-yellow text-cp-yellow'
              : 'border-transparent text-cp-text-muted hover:text-white'
          }`}>
          {t('capability_modal.tab_backtest')}
        </button>
        <button
          type='button'
          onClick={() => {
            void refreshHistory();
            setActiveTab('history');
          }}
          role='tab'
          aria-selected={activeTab === 'history'}
          className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors -mb-px border-b-2 ${
            activeTab === 'history'
              ? 'border-cp-yellow text-cp-yellow'
              : 'border-transparent text-cp-text-muted hover:text-white'
          }`}>
          {t('capability_modal.tab_backtest_history')}
        </button>
      </div>

      {activeTab === 'history' ? (
        <div
          ref={historyListRef}
          onScroll={handleHistoryScroll}
          className='flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-cp-border bg-black/20 p-4'>
          {isHistoryLoading && !history.length ? (
            <div className='space-y-3 animate-pulse'>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className='border border-cp-border bg-black/30 p-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='h-3 w-28 bg-white/10' />
                    <div className='h-4 w-14 bg-white/10 border border-white/10' />
                  </div>
                  <div className='mt-2 h-4 w-3/4 bg-white/10' />
                </div>
              ))}
            </div>
          ) : !history.length ? (
            <div className='text-xs text-cp-text-muted'>
              {t('capability_modal.history_empty')}
            </div>
          ) : (
            <div className='space-y-3'>
              {history.map((item) => (
                <button
                  key={
                    (typeof item?.id === 'string' && item.id) ||
                    (typeof (item as any)?.activity_id === 'string' &&
                      String((item as any).activity_id)) ||
                    JSON.stringify(item)
                  }
                  type='button'
                  onClick={() => void applyHistoryItem(item)}
                  className='w-full text-left cursor-pointer border border-cp-border bg-black/30 p-3 hover:border-cp-yellow transition-colors'>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='text-[11px] text-cp-text-muted font-mono'>
                      {item.created_at
                        ? new Date(String(item.created_at)).toLocaleString()
                        : item.updated_at
                        ? new Date(String(item.updated_at)).toLocaleString()
                        : ''}
                    </div>
                    <div
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                        item.status === 'closed'
                          ? 'border-green-500/40 text-green-400'
                          : 'border-cp-border text-cp-text-muted'
                      }`}>
                      {String(item.status ?? '').toUpperCase() || '—'}
                    </div>
                  </div>
                  <div className='mt-2 text-sm text-cp-text'>
                    {item.activity_name ||
                      item.description ||
                      item.id ||
                      'Backtest'}
                  </div>
                </button>
              ))}

              {isHistoryLoading && (
                <div className='pt-2 space-y-3 animate-pulse'>
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div
                      key={idx}
                      className='border border-cp-border bg-black/30 p-3'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='h-3 w-28 bg-white/10' />
                        <div className='h-4 w-14 bg-white/10 border border-white/10' />
                      </div>
                      <div className='mt-2 h-4 w-2/3 bg-white/10' />
                    </div>
                  ))}
                </div>
              )}

              {!isHistoryLoading &&
                historyTotal != null &&
                history.length >= historyTotal && (
                  <div className='text-xs text-cp-text-muted pt-2'>
                    {t('capability_modal.history_end') || '已加载全部'}
                  </div>
                )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1'>
            <div className='flex flex-col gap-2'>
              <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                回测名称
              </span>
              <input
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder='例如：策略 A 近 30 天回测'
                className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none placeholder:text-cp-text-muted'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                描述
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='可选：补充策略/假设等'
                className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none placeholder:text-cp-text-muted resize-none min-h-[96px]'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                起止日期
              </span>
              <div className='grid grid-cols-2 gap-3'>
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'
                />
                <input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'
                />
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                初始资金
              </span>
              <input
                type='number'
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'
              />
            </div>
            <div className='border border-cp-border bg-black/20 p-3 text-[11px] text-cp-text-muted'>
              执行后将在右侧展示收益率曲线。
            </div>
          </div>

          <div className='shrink-0 pt-4'>
            <button
              onClick={handleExecute}
              disabled={isLoading}
              className='w-full py-4 btn-gold flex items-center justify-center gap-2 disabled:opacity-50'>
              {isLoading ? (
                <RotateCcw className='animate-spin' size={18} />
              ) : (
                <Play size={18} />
              )}
              开始回测
            </button>
          </div>
        </>
      )}
    </div>
  );
}
