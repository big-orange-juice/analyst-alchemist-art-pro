'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';
import { useAgentStore, useUserStore } from '@/store';
import { AppNotification } from '@/types';
import {
  formatStockAnalysisResponse,
  looksLikeJsonText,
  tryParseJsonText
} from './capabilityFormatters';

type Props = {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setOutput: (v: string) => void;
  onNotify?: (
    title: string,
    message: string,
    type?: AppNotification['type']
  ) => void;
};

export default function StockAnalysisPanel({
  isLoading,
  onNotify,
  setIsLoading,
  setOutput
}: Props) {
  const { t } = useLanguage();
  const agentId = useAgentStore((s) => s.agentId);
  const currentUser = useUserStore((s) => s.currentUser);

  const [stockSymbol, setStockSymbol] = useState('000859.SZ');
  const [tradingDate, setTradingDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newsSource, setNewsSource] = useState('');

  const handleExecute = async () => {
    setIsLoading(true);

    if (!agentId || !currentUser?.id) {
      onNotify?.(
        t('capability_modal.missing_agent_title') || '缺少 Agent',
        t('capability_modal.missing_agent_desc') || '请先创建或选择 Agent。',
        'error'
      );
      setIsLoading(false);
      return;
    }

    const payload = {
      agent_id: agentId,
      user_id: currentUser.id,
      symbol: stockSymbol,
      trading_date: tradingDate.replaceAll('-', ''),
      include_sources: newsSource ? [newsSource] : []
    };

    try {
      const text = await apiFetch<string, typeof payload>(
        '/api/research/stock-analysis',
        {
          method: 'POST',
          body: payload,
          parseAs: 'text',
          errorHandling: 'ignore'
        }
      );

      const maybeJson = tryParseJsonText(text);
      if (maybeJson != null) {
        setOutput(
          formatStockAnalysisResponse(maybeJson as Record<string, any>) ||
            '（暂无可展示内容）'
        );
      } else if (looksLikeJsonText(text)) {
        const message = '返回内容不是有效 JSON，无法解析。';
        onNotify?.('解析失败', message, 'error');
        setOutput(message);
      } else {
        setOutput(text || '（空响应）');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '执行出错';
      onNotify?.('执行失败', message, 'error');
      setOutput(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cp-border p-6 flex flex-col bg-white/[0.02] hover-card m-2 gap-4 overflow-y-auto custom-scrollbar min-h-0'>
      <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
        {t('capability_modal.input_label')}
      </label>

      <div className='space-y-4'>
        <div className='flex flex-col gap-2'>
          <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
            {t('capability_modal.stock_symbol') || '分析标的'}
          </span>
          <select
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
            className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'>
            <option value='000859.SZ'>中信国安（000859.SZ）</option>
            <option value='600519.SH'>贵州茅台（600519.SH）</option>
            <option value='300750.SZ'>宁德时代（300750.SZ）</option>
          </select>
        </div>

        <div className='flex flex-col gap-2'>
          <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
            {t('capability_modal.trading_date') || '交易日'}
          </span>
          <input
            type='date'
            value={tradingDate}
            onChange={(e) => setTradingDate(e.target.value)}
            className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
            {t('capability_modal.news_source') || '新闻源（可选）'}
          </span>
          <input
            type='text'
            value={newsSource}
            onChange={(e) => setNewsSource(e.target.value)}
            placeholder='Bloomberg / 同花顺 / 自定义'
            className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none placeholder:text-cp-text-muted'
          />
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
        {t('capability_modal.execute')}
      </button>
    </div>
  );
}
