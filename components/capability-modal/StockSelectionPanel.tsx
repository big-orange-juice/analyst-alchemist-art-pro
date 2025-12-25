'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';
import type { RunHistoryItem } from '@/lib/runHistory';
import { useAgentStore, useUserStore } from '@/store';
import { AppNotification } from '@/types';
import SwIndustrySelectorModal, {
  type SwIndustry
} from '@/components/SwIndustrySelectorModal';
import {
  formatStockSelectionResponse,
  looksLikeJsonText,
  StockSelectionResponse,
  tryParseJsonText
} from './capabilityFormatters';

type Props = {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setOutput: (v: string) => void;
  customPrompt?: string;
  onNotify?: (
    title: string,
    message: string,
    type?: AppNotification['type']
  ) => void;
};

export default function StockSelectionPanel({
  isLoading,
  onNotify,
  setIsLoading,
  setOutput,
  customPrompt
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
            : typeof x?.theme === 'string'
            ? `${t('stock_selection_panel.theme_label')}:${x.theme}`
            : typeof x?.selection_criteria?.industry === 'string'
            ? `${t('stock_selection_panel.industry_label')}:${
                x.selection_criteria.industry
              }`
            : t('capability_modal.execute');
        const item: RunHistoryItem = { id, ts, ok, summary };
        const rawOutput = x?.output ?? x?.result ?? x?.detail ?? undefined;
        if (typeof rawOutput === 'string') item.output = rawOutput;
        else if (rawOutput !== undefined) item.outputData = rawOutput;
        else item.outputData = x;
        if (x?.input !== undefined) item.input = x.input;
        return item;
      })
      .filter((x) => Boolean(x?.id));
  };

  const applyHistoryOutput = (item: RunHistoryItem) => {
    // 历史记录里已带详情（与发起请求返回一致）：直接用 formatter 渲染
    if (item.outputData !== undefined) {
      const mdText = formatStockSelectionResponse(
        item.outputData as StockSelectionResponse,
        { t, language }
      );
      setOutput(mdText || t('stock_selection_panel.unable_format'));
      return;
    }

    const raw = typeof item.output === 'string' ? item.output : '';
    if (!raw.trim()) return;

    const maybeJson = tryParseJsonText(raw);
    if (maybeJson != null) {
      const mdText = formatStockSelectionResponse(
        maybeJson as StockSelectionResponse,
        { t, language }
      );
      setOutput(mdText || t('stock_selection_panel.unable_format'));
      return;
    }

    // 看起来是 JSON 但 parse 失败：给出原文，便于排查
    if (looksLikeJsonText(raw)) {
      setOutput(raw);
      return;
    }

    setOutput(raw);
  };

  const refreshHistory = async () => {
    try {
      const data = await apiFetch<any>('/api/research/stock-selection/list', {
        method: 'GET',
        errorHandling: 'ignore'
      });
      const mapped = mapServerHistory(data);
      setHistory(mapped);
    } catch {
      setHistory([]);
    }
  };
  const themeOptions =
    (get('stock_selection_panel.theme_options') as Array<{
      value: string;
      label: string;
    }>) ?? [];

  const [industry, setIndustry] = useState<SwIndustry | null>(null);
  const [theme, setTheme] = useState('');
  const [userCustomInput, setUserCustomInput] = useState(customPrompt || '');
  const [needLlmAnalysis, setNeedLlmAnalysis] = useState(false);
  const [industryPickerOpen, setIndustryPickerOpen] = useState(false);

  const industryLabel = useMemo(
    () => industry?.industry_name || '',
    [industry]
  );

  useEffect(() => {
    setUserCustomInput(customPrompt || '');
  }, [customPrompt]);

  useEffect(() => {
    if (!theme && themeOptions.length) setTheme(themeOptions[0].value);
  }, [theme, themeOptions]);

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

    try {
      const payload = {
        agent_id: agentId,
        user_id: currentUser.id,
        industry: industry?.industry_name,
        theme,
        user_custom_input: userCustomInput,
        need_llm_analysis: needLlmAnalysis
      };

      const text = await apiFetch<string, typeof payload>(
        '/api/research/stock-selection',
        {
          method: 'POST',
          body: payload,
          parseAs: 'text',
          errorHandling: 'ignore'
        }
      );

      const maybeJson = tryParseJsonText(text);
      if (maybeJson != null) {
        const mdText = formatStockSelectionResponse(
          maybeJson as StockSelectionResponse,
          { t, language }
        );
        finalOutput = mdText || t('stock_selection_panel.unable_format');
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
        // 如果后端返回的是自然语言说明，直接以文本（Markdown）展示即可
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
            {t('capability_modal.tab_stock_selection')}
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
            {t('capability_modal.tab_stock_selection_history')}
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
          </div>
        ) : (
          <>
            <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1'>
              <div className='flex flex-col gap-2'>
                <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                  {t('stock_selection_panel.industry_label')}
                </span>
                <button
                  type='button'
                  onClick={() => setIndustryPickerOpen(true)}
                  className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none text-left hover:border-cp-yellow/60 transition-colors'>
                  {industryLabel || t('common.select')}
                </button>
              </div>

              <div className='flex flex-col gap-2'>
                <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                  {t('stock_selection_panel.theme_label')}
                </span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'>
                  {themeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col gap-2'>
                <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                  {t('stock_selection_panel.user_input_label')}
                </span>
                <textarea
                  value={userCustomInput}
                  onChange={(e) => setUserCustomInput(e.target.value)}
                  placeholder={t('stock_selection_panel.user_input_ph')}
                  className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none placeholder:text-cp-text-muted resize-none min-h-[196px]'
                />
              </div>

              <label className='flex items-center justify-between gap-3 bg-black/20 border border-cp-border px-3 py-2 hover:border-cp-yellow transition-colors select-none cursor-pointer'>
                <span className='text-xs text-cp-text-muted uppercase tracking-widest'>
                  {t('stock_selection_panel.enable_llm')}
                </span>

                <span className='relative inline-flex items-center'>
                  <input
                    type='checkbox'
                    checked={needLlmAnalysis}
                    onChange={(e) => setNeedLlmAnalysis(e.target.checked)}
                    className='sr-only'
                  />
                  <span
                    className={`h-6 w-11 border border-cp-border transition-colors ${
                      needLlmAnalysis
                        ? 'bg-cp-yellow/20 border-cp-yellow'
                        : 'bg-black/40'
                    }`}
                  />
                  <span
                    className={`absolute left-1 top-1 h-4 w-4 transition-transform ${
                      needLlmAnalysis
                        ? 'translate-x-5 bg-cp-yellow'
                        : 'translate-x-0 bg-white/60'
                    }`}
                  />
                </span>
              </label>
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

      <SwIndustrySelectorModal
        open={industryPickerOpen}
        multiple={false}
        value={industry ? [industry] : []}
        onClose={() => setIndustryPickerOpen(false)}
        onConfirm={(selected) => {
          setIndustry(selected[0] ?? null);
          setIndustryPickerOpen(false);
        }}
      />
    </>
  );
}
