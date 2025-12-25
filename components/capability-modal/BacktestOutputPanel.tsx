'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { copyToClipboard } from '@/lib/clipboard';
import type { ChartDataPoint } from '@/types';
import EquityChart from '@/components/EquityChart';

type Props = {
  isLoading: boolean;
  output: string;
  chartData: ChartDataPoint[];
};

export default function BacktestOutputPanel({
  isLoading,
  output,
  chartData
}: Props) {
  const { t } = useLanguage();

  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const value = output || '';
    if (!value.trim()) return;

    const ok = await copyToClipboard(value);
    setCopyStatus(ok ? 'ok' : 'fail');

    if (resetTimerRef.current != null) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(
      () => setCopyStatus('idle'),
      1200
    );
  };

  return (
    <div className='flex-1 p-8 flex flex-col bg-transparent gap-6 min-h-0'>
      <div className='flex-1 flex flex-col min-h-0'>
        <div className='flex items-center justify-between mb-4'>
          <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
            {t('capability_modal.output_label')}
          </label>
          {isLoading && (
            <span className='text-[11px] text-cp-yellow tracking-widest'>
              {t('capability_modal.loading') || '执行中...'}
            </span>
          )}
        </div>

        <div className='flex-1 mb-4 border border-cp-border bg-cp-dark/20 p-4 hover-card relative'>
          <div className='text-xs text-cp-text-muted tracking-widest uppercase mb-2'>
            收益率曲线
          </div>
          <div className='h-64'>
            <EquityChart data={chartData} theme='dark' />
          </div>
          {!chartData.length && !isLoading && (
            <div className='text-[11px] text-cp-text-muted mt-2 absolute bottom-4'>
              暂无曲线数据
            </div>
          )}
        </div>

        <div className='mt-6 flex justify-end'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={handleCopy}
              disabled={isLoading || !output.trim()}
              className='px-6 py-3 btn-outline text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label={t('common.copy')}>
              <Copy size={16} />
              {copyStatus === 'ok'
                ? t('common.copied')
                : copyStatus === 'fail'
                ? t('common.copy_failed')
                : t('common.copy')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
