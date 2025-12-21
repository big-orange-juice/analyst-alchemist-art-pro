'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';
import type { RunHistoryItem } from '@/lib/runHistory';
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
  const { t, get, language } = useLanguage();
  const agentId = useAgentStore((s) => s.agentId);
  const currentUser = useUserStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [history, setHistory] = useState<RunHistoryItem[]>(() => []);

  const mapServerHistory = (raw: unknown): RunHistoryItem[] => {
    const list = Array.isArray(raw) ? raw : [];
    return list
      .map((x: any, i: number) => {
        const tsRaw = x?.ts ?? x?.created_at ?? x?.createdAt ?? x?.updated_at;
        const ts =
          typeof tsRaw === 'number'
            ? tsRaw
            : typeof tsRaw === 'string'
            ? Date.parse(tsRaw) || Date.now()
            : Date.now();
        const id =
          typeof x?.id === 'string'
            ? x.id
            : typeof x?.uuid === 'string'
            ? x.uuid
            : `${ts}-${i}`;
        const ok =
          typeof x?.ok === 'boolean'
            ? x.ok
            : typeof x?.success === 'boolean'
            ? x.success
            : true;
        const summary =
          typeof x?.summary === 'string'
            ? x.summary
            : typeof x?.symbol === 'string'
            ? `${t('capability_modal.stock_symbol')}:${x.symbol}`
            : t('capability_modal.execute');
        const item: RunHistoryItem = { id, ts, ok, summary };
        if (typeof x?.output === 'string') item.output = x.output;
        if (x?.input !== undefined) item.input = x.input;
        return item;
      })
      .filter((x) => Boolean(x?.id));
  };

  const refreshHistory = async () => {
    try {
      const data = await apiFetch<any>('/api/research/stock-analysis/list', {
        method: 'GET',
        errorHandling: 'ignore'
      });
      setHistory(mapServerHistory(data));
    } catch {
      setHistory([]);
    }
  };

  const symbolOptions =
    (get('stock_analysis_panel.symbol_options') as Array<{
      value: string;
      label: string;
    }>) ?? [];

  const [stockSymbol, setStockSymbol] = useState('000859.SZ');
  const [tradingDate, setTradingDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newsSource, setNewsSource] = useState('');

  const handleExecute = async () => {
    setIsLoading(true);

    let ok = false;
    let finalOutput = '';

    if (!agentId || !currentUser?.id) {
      onNotify?.(
        t('capability_modal.missing_agent_title'),
        t('capability_modal.missing_agent_desc'),
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
        finalOutput =
          formatStockAnalysisResponse(maybeJson as Record<string, any>, {
            t,
            language
          }) || t('stock_selection_panel.unable_format');
        setOutput(finalOutput);
        ok = true;
      } else if (looksLikeJsonText(text)) {
        const message = t('stock_selection_panel.parse_failed_desc');
        onNotify?.(
          t('stock_selection_panel.parse_failed_title'),
          message,
          'error'
        );
        finalOutput = message;
        setOutput(finalOutput);
      } else {
        finalOutput = text || t('stock_selection_panel.empty_response');
        setOutput(finalOutput);
        ok = true;
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('stock_selection_panel.execute_failed_desc');
      onNotify?.(
        t('stock_selection_panel.execute_failed_title'),
        message,
        'error'
      );
      finalOutput = message;
      setOutput(finalOutput);
    } finally {
      // 历史记录由服务端持久化与查询，不再使用本地缓存。
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
          {t('capability_modal.tab_stock_analysis')}
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
          {t('capability_modal.tab_stock_analysis_history')}
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-cp-border bg-black/20 p-4'>
          {!history.length ? (
            <div className='text-xs text-cp-text-muted'>
              {t('capability_modal.history_empty')}
            </div>
          ) : (
            <div className='space-y-3'>
              {history.map((item) => (
                <div
                  key={item.id}
                  className='border border-cp-border bg-black/30 p-3 hover:border-cp-yellow transition-colors'>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='text-[11px] text-cp-text-muted font-mono'>
                      {new Date(item.ts).toLocaleString()}
                    </div>
                    <div
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                        item.ok
                          ? 'border-green-500/40 text-green-400'
                          : 'border-cp-red/40 text-cp-red'
                      }`}>
                      {item.ok ? 'OK' : 'FAIL'}
                    </div>
                  </div>
                  <div className='mt-2 text-sm text-cp-text'>
                    {item.summary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1'>
            <div className='flex flex-col gap-2'>
              <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                {t('capability_modal.stock_symbol')}
              </span>
              <select
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value)}
                className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'>
                {symbolOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex flex-col gap-2'>
              <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                {t('capability_modal.trading_date')}
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
                {t('capability_modal.news_source')}
              </span>
              <input
                type='text'
                value={newsSource}
                onChange={(e) => setNewsSource(e.target.value)}
                placeholder={t('stock_analysis_panel.news_source_ph')}
                className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none placeholder:text-cp-text-muted'
              />
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
              {t('capability_modal.execute')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
