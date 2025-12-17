'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import type { AppNotification, ChartDataPoint } from '@/types';

export type PnlCurvePoint = {
  snapshot_date: string;
  cumulative_return_pct: number;
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
  const mountedRef = useRef(true);

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
    formatDateInput(addDays(today, -30))
  );
  const [endDate, setEndDate] = useState(formatDateInput(today));
  const [initialCapital, setInitialCapital] = useState(100000);
  const [timeGranularity, setTimeGranularity] = useState<'daily'>('daily');
  const [status, setStatus] = useState<'draft'>('draft');

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const pollPnlCurve = async (id: string) => {
    const maxAttempts = 60;
    const intervalMs = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (!mountedRef.current) return [] as PnlCurvePoint[];

      try {
        const curve = await apiFetch<PnlCurvePoint[]>(
          `/api/backtests/${encodeURIComponent(id)}/pnl_curve`,
          {
            method: 'GET',
            errorHandling: 'ignore'
          }
        );

        if (Array.isArray(curve) && curve.length > 0) return curve;
      } catch {
        // ignore and continue polling
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    return [] as PnlCurvePoint[];
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setOutput('');
    setChartData([]);

    try {
      const payload = {
        activity_name: activityName || 'Backtest',
        description,
        start_date: startDate,
        end_date: endDate,
        initial_capital: Number(initialCapital) || 100000,
        time_granularity: timeGranularity,
        status
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

      setOutput(`回测已创建\n\n- id: ${id}\n\n正在拉取收益率曲线...`);

      const curve = await pollPnlCurve(id);
      if (!curve.length) {
        throw new Error('收益率曲线暂无数据（轮询超时）');
      }

      const chart: ChartDataPoint[] = curve.map((p) => ({
        time: String(p.snapshot_date ?? ''),
        pnl: 100 + Number(p.cumulative_return_pct ?? 0)
      }));

      setChartData(chart);
      setOutput(`回测完成\n\n- id: ${id}\n- points: ${curve.length}`);
      onNotify?.('回测完成', '已生成收益率曲线', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : '回测执行失败';
      setOutput(message);
      onNotify?.('回测失败', message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cp-border p-6 flex flex-col bg-white/[0.02] hover-card m-2 gap-4 overflow-y-auto custom-scrollbar min-h-0'>
      <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
        历史验证（回测）
      </label>

      <div className='space-y-4'>
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

        <div className='flex flex-col gap-2'>
          <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
            time_granularity
          </span>
          <select
            value={timeGranularity}
            onChange={(e) => setTimeGranularity(e.target.value as 'daily')}
            disabled
            className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none disabled:opacity-60'>
            <option value='daily'>daily</option>
          </select>
        </div>

        <div className='flex flex-col gap-2'>
          <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
            status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft')}
            disabled
            className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none disabled:opacity-60'>
            <option value='draft'>draft</option>
          </select>
        </div>
        <div className='border border-cp-border bg-black/20 p-3 text-[11px] text-cp-text-muted'>
          执行后将在右侧展示收益率曲线。
        </div>
      </div>

      <button
        onClick={handleExecute}
        disabled={isLoading}
        className='w-full py-4 btn-gold flex items-center justify-center gap-2 disabled:opacity-50 mt-auto'>
        {isLoading ? (
          <RotateCcw className='animate-spin' size={18} />
        ) : (
          <Play size={18} />
        )}
        开始回测
      </button>
    </div>
  );
}
