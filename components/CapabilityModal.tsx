'use client';

import React, { useMemo, useState } from 'react';
import MarkdownIt from 'markdown-it';
import { X, Cpu, Play, RotateCcw, Save } from 'lucide-react';
import {
  AgentCapability,
  AGENT_CAPABILITY_DETAILS,
  AppNotification
} from '@/types';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';
import { useAgentStore, useUserStore } from '@/store';

interface CapabilityModalProps {
  capability: AgentCapability;
  customPrompt?: string;
  onClose: () => void;
  onNotify?: (
    title: string,
    message: string,
    type: AppNotification['type']
  ) => void;
}

export default function CapabilityModal({
  capability,
  onClose,
  onNotify
}: CapabilityModalProps) {
  const { t } = useLanguage();
  const { agentId } = useAgentStore();
  const { currentUser } = useUserStore();
  const details = AGENT_CAPABILITY_DETAILS[capability];
  const label = t(details.labelKey);
  const role = t(details.roleKey);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stockSymbol, setStockSymbol] = useState('000859.SZ');
  const [tradingDate, setTradingDate] = useState(() => {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  });
  const [newsSource, setNewsSource] = useState('');

  const isStockAnalysis = useMemo(
    () => capability === 'STOCK_ANALYSIS',
    [capability]
  );
  const isStockSelection = useMemo(
    () => capability === 'STRATEGY_PICKING',
    [capability]
  );

  const md = useMemo(() => new MarkdownIt({ breaks: true }), []);
  const renderedOutput = useMemo(
    () => (output ? md.render(output) : ''),
    [md, output]
  );

  const INDUSTRY_OPTIONS = useMemo(() => ['科技', '消费', '医药'], []);
  const THEME_OPTIONS = useMemo(() => ['AI', '新能源', '高股息'], []);
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [theme, setTheme] = useState(THEME_OPTIONS[0]);
  const [userCustomInput, setUserCustomInput] = useState('');
  const [needLlmAnalysis, setNeedLlmAnalysis] = useState(false);

  const formatStockAnalysisResponse = (data: Record<string, any>) => {
    if (!data) return '';
    const lines: string[] = [];
    lines.push(`# ${data.symbol || '标的'} @ ${data.trading_date || ''}`);

    if (data.comprehensive_rating) {
      const comp = data.comprehensive_rating;
      lines.push(
        `**综合评级：${comp.rating || ''}**  分数：${
          comp.overall_score ?? ''
        }  置信度：${comp.confidence ?? ''}`
      );
      if (comp.reasoning) lines.push(`> ${comp.reasoning}`);
    }

    if (data.technical_analysis) {
      const t = data.technical_analysis;
      lines.push('## 技术分析');
      lines.push(
        `- 建议：${t.recommendation || ''}（信心 ${t.confidence ?? ''}）`
      );
      if (t.reasoning) lines.push(t.reasoning);
    }

    if (data.fundamental_analysis) {
      const f = data.fundamental_analysis;
      lines.push('## 基本面分析');
      lines.push(
        `- 建议：${f.recommendation || ''}（信心 ${f.confidence ?? ''}）`
      );
      if (f.reasoning) lines.push(f.reasoning);
      if (Array.isArray(f.key_factors) && f.key_factors.length) {
        lines.push('- 关键因素:');
        f.key_factors.forEach((k: string) => lines.push(`  - ${k}`));
      }
    }

    if (data.news_analysis) {
      const n = data.news_analysis;
      lines.push('## 新闻解读');
      if (n.sentiment_summary) lines.push(n.sentiment_summary);
      if (Array.isArray(n.recent_news)) {
        n.recent_news.forEach((item: any) => {
          lines.push(
            `- **${item.title || ''}** (${item.date || ''}) — 情绪: ${
              item.sentiment || ''
            }`
          );
          if (item.summary) lines.push(`  - ${item.summary}`);
          if (item.source) lines.push(`  - 来源: ${item.source}`);
          if (item.url) lines.push(`  - [链接](${item.url})`);
        });
      }
    }

    if (data.financial_report) {
      const fr = data.financial_report;
      lines.push('## 财报摘要');
      if (fr.summary) lines.push(fr.summary);
      if (Array.isArray(fr.highlights)) {
        fr.highlights.forEach((h: string) => lines.push(`- ${h}`));
      }
    }

    return lines.join('\n\n');
  };

  const handleExecute = async () => {
    setIsLoading(true);

    if (isStockAnalysis) {
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
        const data = await apiFetch<Record<string, any>>(
          '/api/stock-analysis',
          {
            method: 'POST',
            body: payload,
            parseAs: 'json',
            errorHandling: 'ignore'
          }
        );
        setOutput(formatStockAnalysisResponse(data) || JSON.stringify(data));
      } catch (err) {
        const message = err instanceof Error ? err.message : '执行出错';
        onNotify?.('执行失败', message, 'error');
        setOutput(message);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    if (isStockSelection) {
      if (!agentId || !currentUser?.id) {
        onNotify?.(
          t('capability_modal.missing_agent_title') || '缺少 Agent',
          t('capability_modal.missing_agent_desc') || '请先创建或选择 Agent。',
          'error'
        );
        setIsLoading(false);
        return;
      }
      try {
        const payload = {
          agent_id: agentId,
          user_id: currentUser.id,
          industry,
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
        setOutput(text);
      } catch (err) {
        const message = err instanceof Error ? err.message : '执行出错';
        onNotify?.('执行失败', message, 'error');
        setOutput(message);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    setTimeout(() => {
      setOutput(t('capability_modal.mock_response'));
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/70 p-4 modal-animate'>
      <div className='w-full md:max-w-6xl h-[85vh] glass-panel border border-cp-yellow/50 ring-1 ring-cp-yellow/20 flex flex-col shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 bg-white/[0.02] border-b border-cp-border shrink-0'>
          <div className='flex items-center gap-4'>
            <div className='w-10 h-10 border border-cp-border flex items-center justify-center text-cp-yellow bg-white/[0.02]'>
              <Cpu size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-serif tracking-wide uppercase text-white'>
                {label} {t('capability_modal.module')}
              </h2>
              <p className='text-xs text-cp-text-muted font-sans mt-0.5'>
                {t('capability_modal.role')} {role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        <div className='relative flex-1 flex flex-col md:flex-row overflow-hidden bg-transparent'>
          {/* Input */}
          <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cp-border p-6 flex flex-col bg-white/[0.02] hover-card m-2 gap-4 overflow-y-auto custom-scrollbar min-h-0'>
            <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
              {t('capability_modal.input_label')}
            </label>

            {isStockAnalysis ? (
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
            ) : isStockSelection ? (
              <div className='space-y-4'>
                <div className='flex flex-col gap-2'>
                  <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                    行业
                  </span>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex flex-col gap-2'>
                  <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                    主题
                  </span>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'>
                    {THEME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex flex-col gap-2'>
                  <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
                    用户输入内容
                  </span>
                  <textarea
                    value={userCustomInput}
                    onChange={(e) => setUserCustomInput(e.target.value)}
                    placeholder='例如：偏好价值/成长，持有周期，风险偏好等'
                    className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none placeholder:text-cp-text-muted resize-none min-h-[196px]'
                  />
                </div>

                <label className='flex items-center justify-between gap-3 bg-black/20 border border-cp-border px-3 py-2 hover:border-cp-yellow transition-colors select-none cursor-pointer'>
                  <span className='text-xs text-cp-text-muted uppercase tracking-widest'>
                    是否启用大模型分析
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
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className='flex-1 bg-black/20 border border-white/[0.02] p-4 text-cp-text font-mono text-sm focus:border-cp-yellow focus:outline-none resize-none hover-card'
                placeholder={t('capability_modal.input_placeholder')}
              />
            )}

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

          {/* Output */}
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
              <div className='relative flex-1 min-h-0 border border-cp-border bg-cp-dark/20 p-6 font-sans text-sm text-cp-text overflow-y-auto custom-scrollbar leading-relaxed hover-card'>
                {isLoading ? (
                  <div className='space-y-3 animate-pulse'>
                    <div className='h-4 bg-white/10 rounded w-1/3' />
                    <div className='h-4 bg-white/10 rounded w-2/3' />
                    <div className='h-4 bg-white/10 rounded w-5/6' />
                    <div className='h-4 bg-white/10 rounded w-4/5' />
                  </div>
                ) : output ? (
                  <div
                    className='prose prose-invert max-w-none prose-pre:bg-black/40 prose-pre:text-white prose-code:text-cp-yellow'
                    dangerouslySetInnerHTML={{ __html: renderedOutput }}
                  />
                ) : (
                  <span className='text-gray-600 italic'>
                    {t('capability_modal.waiting')}
                  </span>
                )}
              </div>
              <div className='mt-6 flex justify-end'>
                <button className='px-6 py-3 btn-outline text-xs flex items-center gap-2'>
                  <Save size={16} /> {t('capability_modal.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
