'use client';

import { useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';
import type { RunHistoryItem } from '@/lib/runHistory';
import { useAgentStore, useUserStore } from '@/store';
import { AppNotification } from '@/types';
import StockSymbolSelectorModal, {
  StockSearchItem
} from '@/components/StockSymbolSelectorModal';
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
  const { t, language } = useLanguage();
  const agentId = useAgentStore((s) => s.agentId);
  const currentUser = useUserStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [history, setHistory] = useState<RunHistoryItem[]>(() => []);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(20);
  const [historyTotal, setHistoryTotal] = useState<number | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const historyListRef = useRef<HTMLDivElement | null>(null);

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
        const stockName = typeof x?.stock_name === 'string' ? x.stock_name : '';
        const stockCode = typeof x?.stock_code === 'string' ? x.stock_code : '';
        const recommendation =
          typeof x?.recommendation === 'string' ? x.recommendation : '';

        const baseTitle =
          stockName && stockCode
            ? `${stockName} (${stockCode})`
            : stockName ||
              stockCode ||
              (typeof x?.symbol === 'string'
                ? `${t('capability_modal.stock_symbol')}:${x.symbol}`
                : t('capability_modal.execute'));

        // 列表不展示详情：只保留股票名称（时间已在上方显示）
        const summary = baseTitle;
        const item: RunHistoryItem = { id, ts, ok, summary };

        // 详情优先取 analysis_result，以保证“历史渲染 = 发起渲染”的数据结构一致
        if (x?.analysis_result && typeof x.analysis_result === 'object') {
          item.outputData = {
            ...(x.analysis_result as Record<string, unknown>),
            stock_name: stockName,
            stock_code: stockCode,
            recommendation
          };
        } else {
          const rawOutput = x?.output ?? x?.result ?? x?.detail ?? undefined;
          if (typeof rawOutput === 'string') item.output = rawOutput;
          else if (rawOutput !== undefined) item.outputData = rawOutput;
          else item.outputData = x;
        }
        if (x?.input !== undefined) item.input = x.input;
        return item;
      })
      .filter((x) => Boolean(x?.id));
  };

  const applyHistoryOutput = (item: RunHistoryItem) => {
    // 历史记录里已带详情（与发起请求返回一致）：直接用 formatter 渲染
    if (item.outputData !== undefined) {
      const mdText =
        formatStockAnalysisResponse(item.outputData as Record<string, any>, {
          t,
          language
        }) || t('stock_selection_panel.unable_format');
      setOutput(mdText);
      return;
    }

    const raw = typeof item.output === 'string' ? item.output : '';
    if (!raw.trim()) return;

    const maybeJson = tryParseJsonText(raw);
    if (maybeJson != null) {
      const mdText =
        formatStockAnalysisResponse(maybeJson as Record<string, any>, {
          t,
          language
        }) || t('stock_selection_panel.unable_format');
      setOutput(mdText);
      return;
    }

    if (looksLikeJsonText(raw)) {
      setOutput(raw);
      return;
    }

    setOutput(raw);
  };

  const refreshHistory = async () => {
    setHistoryPage(1);
    setHistoryTotal(null);
    await fetchHistoryPage(1);
  };

  const fetchHistoryPage = async (page: number) => {
    setIsHistoryLoading(true);
    try {
      const res = await apiFetch<any>(
        `/api/research/stock-analysis/list?page=${encodeURIComponent(
          String(page)
        )}&page_size=${encodeURIComponent(String(historyPageSize))}`,
        { method: 'GET', errorHandling: 'ignore' }
      );

      const items = Array.isArray(res?.items) ? res.items : [];
      const total =
        typeof res?.total === 'number'
          ? res.total
          : typeof res?.count === 'number'
          ? res.count
          : null;
      setHistoryTotal(total);

      const mapped = mapServerHistory(items);
      setHistory((prev) => {
        if (page <= 1) return mapped;
        const merged = [...prev, ...mapped];
        const seen = new Set<string>();
        return merged.filter((x) => {
          const key = String(x.id || '');
          if (!key) return false;
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

  const [stockSymbol, setStockSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockSearchItem | null>(
    null
  );
  const [stockPickerOpen, setStockPickerOpen] = useState(false);
  const [tradingDate, setTradingDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newsSource, setNewsSource] = useState('');

  const pickStockSymbol = (it: StockSearchItem | null) => {
    if (!it) return '';
    const v =
      (typeof it.symbol === 'string' && it.symbol) ||
      (typeof it.stock_code === 'string' && it.stock_code) ||
      (typeof it.ts_code === 'string' && it.ts_code) ||
      (typeof it.code === 'string' && it.code) ||
      '';
    return String(v || '').trim();
  };

  const pickStockName = (it: StockSearchItem | null) => {
    if (!it) return '';
    const v =
      (typeof it.name === 'string' && it.name) ||
      (typeof it.stock_name === 'string' && it.stock_name) ||
      (typeof it.full_name === 'string' && it.full_name) ||
      '';
    return String(v || '').trim();
  };

  const stockLabel = (() => {
    const name = pickStockName(selectedStock);
    if (name) return name;
    if (stockSymbol) return stockSymbol;
    return '';
  })();

  const handleExecute = async () => {
    setIsLoading(true);

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

    if (!stockSymbol.trim()) {
      onNotify?.(
        t('capability_modal.stock_symbol'),
        t('common.select') || '请选择',
        'warning'
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
        const normalized = {
          ...(maybeJson as Record<string, any>),
          stock_code: stockSymbol
        };
        finalOutput =
          formatStockAnalysisResponse(normalized, {
            t,
            language
          }) || t('stock_selection_panel.unable_format');
        setOutput(finalOutput);
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
    <>
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
                      <div className='h-4 w-12 bg-white/10 border border-white/10' />
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
                    key={item.id}
                    type='button'
                    onClick={() => applyHistoryOutput(item)}
                    className='w-full text-left cursor-pointer border border-cp-border bg-black/30 p-3 hover:border-cp-yellow transition-colors'>
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
                  </button>
                ))}
              </div>
            )}

            {isHistoryLoading && history.length ? (
              <div className='mt-3 space-y-3 animate-pulse'>
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div
                    key={idx}
                    className='border border-cp-border bg-black/30 p-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='h-3 w-28 bg-white/10' />
                      <div className='h-4 w-12 bg-white/10 border border-white/10' />
                    </div>
                    <div className='mt-2 h-4 w-2/3 bg-white/10' />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1'>
              <div className='flex flex-col gap-2'>
                <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                  {t('capability_modal.stock_symbol')}
                </span>
                <button
                  type='button'
                  onClick={() => setStockPickerOpen(true)}
                  className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none text-left hover:border-cp-yellow/60 transition-colors'>
                  {stockLabel || t('common.select')}
                </button>
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

              {/* <div className='flex flex-col gap-2'>
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
              </div> */}
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

      <StockSymbolSelectorModal
        open={stockPickerOpen}
        value={selectedStock ? [selectedStock] : []}
        onClose={() => setStockPickerOpen(false)}
        onConfirm={(selected) => {
          const next = selected[0] ?? null;
          const sym = pickStockSymbol(next);
          if (sym) setStockSymbol(sym);
          setSelectedStock(next);
          setStockPickerOpen(false);
        }}
      />
    </>
  );
}
