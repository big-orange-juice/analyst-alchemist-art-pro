'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Cpu, Play, RotateCcw, Save, X } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { apiFetch, ApiError } from '@/lib/http';
import { useLanguage } from '@/lib/useLanguage';
import { copyToClipboard } from '@/lib/clipboard';

type ContentMode = 'url' | 'text' | 'file';

type ArticleAnalysisPayload = {
  agent_id: string;
  user_id: string;
  content_type: string;
  content_data: string;
  analysis_focus: string[];
  symbol?: string;
  trading_date?: string;
};

interface ArticleAnalysisModalProps {
  agentId: string | null;
  userId: string | null;
  onClose: () => void;
  onNotify?: (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'market'
  ) => void;
}

const parseFocusList = (raw: string) => {
  return raw
    .split(/\r?\n|,|，|;|；/g)
    .map((s) => s.trim())
    .filter(Boolean);
};

export default function ArticleAnalysisModal({
  agentId,
  userId,
  onClose,
  onNotify
}: ArticleAnalysisModalProps) {
  const { t } = useLanguage();

  const [mode, setMode] = useState<ContentMode>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [contentType, setContentType] = useState<
    'url' | 'pdf' | 'excel' | 'image' | 'text'
  >('url');
  const [symbol, setSymbol] = useState('');
  const [tradingDate, setTradingDate] = useState('');
  const [analysisFocusRaw, setAnalysisFocusRaw] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultText, setResultText] = useState<string>('');

  const md = useMemo(() => new MarkdownIt({ linkify: true, breaks: true }), []);
  const renderedOutput = useMemo(
    () => md.render(resultText || ''),
    [md, resultText]
  );

  const tt = (key: string) => t(`article_analysis_modal.${key}`);

  const tmd = (key: string) => tt(`md_${key}`);

  const safeText = (v: unknown) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const formatList = (title: string, items: unknown) => {
    const arr = Array.isArray(items) ? items : [];
    if (!arr.length) return '';
    const lines = [title, ...arr.map((x) => `- ${safeText(x)}`), ''];
    return lines.join('\n');
  };

  const formatResultToMarkdown = (res: unknown) => {
    if (typeof res === 'string') return res;
    if (!res || typeof res !== 'object') return safeText(res);

    const root = res as Record<string, unknown>;
    const extracted =
      root.extracted_content && typeof root.extracted_content === 'object'
        ? (root.extracted_content as Record<string, unknown>)
        : null;
    const structured =
      root.structured_info && typeof root.structured_info === 'object'
        ? (root.structured_info as Record<string, unknown>)
        : null;
    const analyses =
      root.analyses && typeof root.analyses === 'object'
        ? (root.analyses as Record<string, unknown>)
        : null;
    const advice =
      root.investment_advice && typeof root.investment_advice === 'object'
        ? (root.investment_advice as Record<string, unknown>)
        : null;

    const symbolText = safeText(root.symbol);
    const tradingDateText = safeText(root.trading_date);
    const contentTypeText = safeText(root.content_type);
    const timestampText = safeText(root.timestamp);

    const lines: string[] = [];
    lines.push(`# ${tmd('title')}${symbolText ? `: ${symbolText}` : ''}`);
    const metaParts = [
      contentTypeText ? `${tmd('content_type')}: ${contentTypeText}` : '',
      tradingDateText ? `${tmd('trading_date')}: ${tradingDateText}` : '',
      timestampText ? `${tmd('timestamp')}: ${timestampText}` : ''
    ].filter(Boolean);
    if (metaParts.length) lines.push(metaParts.join('  |  '));
    lines.push('');

    if (extracted) {
      lines.push(`## ${tmd('extracted')}`);
      const summary = safeText(extracted.summary);
      const textLength = safeText(extracted.text_length);
      const hasTables = safeText(extracted.has_tables);
      const hasImages = safeText(extracted.has_images);
      if (summary) lines.push(`**${tmd('summary')}:** ${summary}`);
      const extractedMeta = [
        textLength ? `${tmd('text_length')}: ${textLength}` : '',
        hasTables ? `${tmd('has_tables')}: ${hasTables}` : '',
        hasImages ? `${tmd('has_images')}: ${hasImages}` : ''
      ].filter(Boolean);
      if (extractedMeta.length) lines.push(extractedMeta.join('  |  '));
      lines.push('');
    }

    if (structured) {
      lines.push(`## ${tmd('structured')}`);
      const theme = safeText(structured.document_theme);
      const category = safeText(structured.document_category);
      if (theme) lines.push(`- ${tmd('doc_theme')}: ${theme}`);
      if (category) lines.push(`- ${tmd('doc_category')}: ${category}`);

      const keyMetrics =
        structured.key_metrics && typeof structured.key_metrics === 'object'
          ? (structured.key_metrics as Record<string, unknown>)
          : null;
      if (keyMetrics) {
        const revenue = safeText(keyMetrics.revenue);
        const profit = safeText(keyMetrics.profit);
        const growth = safeText(keyMetrics.growth_rate);
        const metricParts = [
          revenue ? `${tmd('revenue')}: ${revenue}` : '',
          profit ? `${tmd('profit')}: ${profit}` : '',
          growth ? `${tmd('growth')}: ${growth}` : ''
        ].filter(Boolean);
        if (metricParts.length)
          lines.push(`- ${tmd('key_metrics')}: ${metricParts.join('  |  ')}`);
      }

      const summary = safeText(structured.summary);
      if (summary) {
        lines.push('');
        lines.push(`> ${summary}`);
        lines.push('');
      }

      lines.push(
        formatList(`### ${tmd('events')}`, structured.important_events)
      );
      lines.push(
        formatList(`### ${tmd('risk_factors')}`, structured.risk_factors)
      );
      lines.push(
        formatList(
          `### ${tmd('investment_views')}`,
          structured.investment_views
        )
      );
    }

    if (analyses) {
      lines.push(`## ${tmd('analyses')}`);

      const appendAnalysis = (title: string, key: string) => {
        const a = analyses[key];
        if (!a || typeof a !== 'object') return;
        const obj = a as Record<string, unknown>;
        lines.push(`### ${title}`);
        Object.entries(obj).forEach(([k, v]) => {
          if (v === null || v === undefined) return;
          if (k === 'reasoning') return;
          if (Array.isArray(v)) {
            if (!v.length) return;
            lines.push(`- ${k}：`);
            v.forEach((item) => lines.push(`  - ${safeText(item)}`));
            return;
          }
          lines.push(`- ${k}：${safeText(v)}`);
        });
        const reasoning = safeText(obj.reasoning);
        if (reasoning) {
          lines.push('');
          lines.push(`> ${reasoning}`);
        }
        lines.push('');
      };

      appendAnalysis(tmd('macro_analysis'), 'macro_analysis');
      appendAnalysis(tmd('technical_analysis'), 'technical_analysis');
      appendAnalysis(tmd('fundamental_analysis'), 'fundamental_analysis');
      appendAnalysis(tmd('sentiment_analysis'), 'sentiment_analysis');
      appendAnalysis(tmd('risk_analysis'), 'risk_analysis');
    }

    if (advice) {
      lines.push(`## ${tmd('investment_advice')}`);
      const rating = safeText(advice.rating);
      const position = safeText(advice.position_suggestion);
      const confidence = safeText(advice.confidence);
      const targetPrice = safeText(advice.target_price);

      if (rating) lines.push(`- ${tmd('rating')}: **${rating}**`);
      if (position) lines.push(`- ${tmd('position')}: ${position}`);
      if (targetPrice) lines.push(`- ${tmd('target_price')}: ${targetPrice}`);
      if (confidence) lines.push(`- ${tmd('confidence')}: ${confidence}`);
      lines.push('');

      lines.push(formatList(`### ${tmd('key_risks')}`, advice.key_risks));
      lines.push(formatList(`### ${tmd('action_plan')}`, advice.action_plan));

      const reasoning = safeText(advice.reasoning);
      if (reasoning) {
        lines.push(`### ${tmd('explain')}`);
        lines.push(reasoning);
        lines.push('');
      }
    }

    return lines.filter(Boolean).join('\n');
  };

  const symbolOptions = useMemo(
    () => [
      { value: '', labelKey: 'not_set' },
      { value: 'AAPL', labelKey: 'symbol_aapl' },
      { value: '600519.SH', labelKey: 'symbol_600519' },
      { value: '000001.SZ', labelKey: 'symbol_000001' },
      { value: '000859.SZ', labelKey: 'symbol_000859' }
    ],
    []
  );

  const tradingDateOptions = useMemo(() => {
    const options: string[] = [''];
    const now = new Date();
    for (let i = 0; i < 60; i += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      options.push(`${yyyy}-${mm}-${dd}`);
    }
    return options;
  }, []);

  const contentData = mode === 'url' ? url.trim() : mode === 'text' ? text : '';

  const focusList = useMemo(
    () => parseFocusList(analysisFocusRaw),
    [analysisFocusRaw]
  );

  const canSubmit =
    !!agentId && !!userId && mode !== 'file' && contentData.trim();

  const isContentTypeLocked = mode === 'url' || mode === 'text';

  const handleSubmit = async () => {
    if (!agentId || !userId) {
      onNotify?.(tt('missing_title'), tt('missing_desc'), 'warning');
      return;
    }

    if (!canSubmit) return;

    const payload: ArticleAnalysisPayload = {
      agent_id: String(agentId),
      user_id: String(userId),
      content_type: contentType,
      content_data: String(contentData),
      analysis_focus: focusList,
      ...(symbol.trim() ? { symbol: symbol.trim() } : {}),
      ...(tradingDate.trim() ? { trading_date: tradingDate.trim() } : {})
    };

    setIsSubmitting(true);
    setResultText('');

    try {
      const res = await apiFetch<any>('/api/v2/research/article-analysis', {
        method: 'POST',
        body: payload,
        errorHandling: 'ignore'
      });

      const formatted = formatResultToMarkdown(res);
      setResultText(formatted || tt('empty_response'));
      onNotify?.(tt('ok_title'), tt('ok_message'), 'success');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : tt('fail_title');
      setResultText(message);
      onNotify?.(tt('fail_title'), message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    const value = resultText || '';
    if (!value.trim()) return;
    const ok = await copyToClipboard(value);
    onNotify?.(
      t('common.copy'),
      ok ? t('common.copied') : t('common.copy_failed'),
      ok ? 'success' : 'error'
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/70 p-4 modal-animate'>
      <div className='w-full md:max-w-6xl h-[85vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl'>
        <div className='flex items-center justify-between p-6 bg-white/[0.02] border-b border-cp-border shrink-0'>
          <div className='flex items-center gap-4'>
            <div className='w-10 h-10 border border-cp-border flex items-center justify-center text-cp-yellow bg-white/[0.02]'>
              <Cpu size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-serif tracking-wide uppercase text-white'>
                {tt('title')}
              </h2>
              <p className='text-xs text-cp-text-muted font-sans mt-0.5'>
                {tt('subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'
            aria-label='close'>
            <X size={24} />
          </button>
        </div>

        <div className='relative flex-1 flex flex-col md:flex-row overflow-hidden bg-transparent'>
          {/* Form */}
          <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cp-border p-6 flex flex-col bg-white/[0.02] hover-card m-2 gap-4 overflow-y-auto custom-scrollbar min-h-0'>
            {!agentId || !userId ? (
              <p className='text-cp-red text-xs'>{tt('missing_desc')}</p>
            ) : null}

            <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
              {tt('input_label')}
            </label>

            <div
              role='tablist'
              className='flex items-center gap-4 border-b border-cp-border'>
              <button
                onClick={() => {
                  setMode('url');
                  setContentType('url');
                }}
                role='tab'
                aria-selected={mode === 'url'}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                  mode === 'url'
                    ? 'border-cp-yellow text-cp-yellow'
                    : 'border-transparent text-cp-text-muted hover:text-white'
                }`}>
                {tt('mode_url')}
              </button>

              <button
                onClick={() => {
                  setMode('text');
                  setContentType('text');
                }}
                role='tab'
                aria-selected={mode === 'text'}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                  mode === 'text'
                    ? 'border-cp-yellow text-cp-yellow'
                    : 'border-transparent text-cp-text-muted hover:text-white'
                }`}>
                {tt('mode_text')}
              </button>

              <button
                onClick={() => {
                  setMode('file');
                  setContentType((prev) =>
                    prev === 'pdf' || prev === 'excel' || prev === 'image'
                      ? prev
                      : 'pdf'
                  );
                }}
                role='tab'
                aria-selected={mode === 'file'}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                  mode === 'file'
                    ? 'border-cp-yellow text-cp-yellow'
                    : 'border-transparent text-cp-text-muted hover:text-white'
                }`}>
                {tt('mode_file')}
              </button>
            </div>

            <div className='grid grid-cols-1 gap-5'>
              <div className='space-y-2'>
                <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                  {tt('content_type')}
                </label>
                <select
                  value={contentType}
                  disabled={isContentTypeLocked}
                  onChange={(e) =>
                    setContentType(
                      e.target.value as
                        | 'url'
                        | 'pdf'
                        | 'excel'
                        | 'image'
                        | 'text'
                    )
                  }
                  className={`w-full px-4 py-3 bg-black/40 border border-cp-border text-white font-mono text-xs outline-none focus:border-cp-yellow ${
                    isContentTypeLocked
                      ? 'text-cp-text-muted cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}>
                  <option value='url' className='bg-black text-white'>
                    {tt('content_type_url')}
                  </option>
                  <option value='text' className='bg-black text-white'>
                    {tt('content_type_text')}
                  </option>
                  <option value='pdf' className='bg-black text-white'>
                    {tt('content_type_pdf')}
                  </option>
                  <option value='excel' className='bg-black text-white'>
                    {tt('content_type_excel')}
                  </option>
                  <option value='image' className='bg-black text-white'>
                    {tt('content_type_image')}
                  </option>
                </select>
              </div>

              {mode === 'url' ? (
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {tt('content_data')}
                  </label>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className='w-full px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                    placeholder={tt('url_ph')}
                  />
                </div>
              ) : null}

              {mode === 'text' ? (
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {tt('content_data')}
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className='w-full min-h-[180px] px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm resize-y custom-scrollbar'
                    placeholder={tt('text_ph')}
                  />
                </div>
              ) : null}

              {mode === 'file' ? (
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {tt('content_data')}
                  </label>
                  <div className='w-full px-4 py-3 bg-white/[0.01] border border-cp-border text-cp-text-muted font-mono text-xs outline-none cursor-not-allowed'>
                    {tt('file_disabled')}
                  </div>
                </div>
              ) : null}

              <div className='space-y-2'>
                <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                  {tt('focus')}
                </label>
                <textarea
                  value={analysisFocusRaw}
                  onChange={(e) => setAnalysisFocusRaw(e.target.value)}
                  className='w-full min-h-[90px] px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm resize-y custom-scrollbar'
                  placeholder={tt('focus_ph')}
                />
                {focusList.length ? (
                  <div className='text-[11px] text-cp-text-muted font-mono'>
                    {focusList.map((f) => `#${f}`).join(' ')}
                  </div>
                ) : null}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {tt('symbol')}
                  </label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className='w-full px-4 py-3 bg-black/40 border border-cp-border text-white outline-none font-mono text-sm focus:border-cp-yellow'>
                    {symbolOptions.map((opt) => (
                      <option
                        key={opt.value || '__empty__'}
                        value={opt.value}
                        className='bg-black text-white'>
                        {tt(opt.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {tt('trading_date')}
                  </label>
                  <select
                    value={tradingDate}
                    onChange={(e) => setTradingDate(e.target.value)}
                    className='w-full px-4 py-3 bg-black/40 border border-cp-border text-white outline-none font-mono text-sm focus:border-cp-yellow'>
                    {tradingDateOptions.map((d) => (
                      <option
                        key={d || '__empty__'}
                        value={d}
                        className='bg-black text-white'>
                        {d || tt('not_set')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className='w-full py-4 btn-gold flex items-center justify-center gap-2 disabled:opacity-50 mt-auto'>
                {isSubmitting ? (
                  <RotateCcw className='animate-spin' size={18} />
                ) : (
                  <Play size={18} />
                )}
                {tt('submit')}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className='flex-1 p-8 flex flex-col bg-transparent gap-6 min-h-0'>
            <div className='flex items-center justify-between mb-4'>
              <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
                {tt('response')}
              </label>
              <div className='flex items-center gap-4'>
                {isSubmitting && (
                  <span className='text-[11px] text-cp-yellow tracking-widest'>
                    {tt('submitting')}
                  </span>
                )}
                <button
                  type='button'
                  onClick={handleCopy}
                  disabled={isSubmitting || !resultText.trim()}
                  className='text-xs text-cp-text-muted hover:text-white transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  aria-label={t('common.copy')}>
                  <Copy size={14} />
                  {t('common.copy')}
                </button>
                <button
                  type='button'
                  onClick={() => setResultText('')}
                  className='text-xs text-cp-text-muted hover:text-white transition-colors uppercase tracking-widest'>
                  {tt('clear')}
                </button>
              </div>
            </div>

            <div className='relative flex-1 min-h-0 border border-cp-border bg-cp-dark/20 p-6 font-sans text-sm text-cp-text overflow-y-auto custom-scrollbar leading-relaxed hover-card'>
              {isSubmitting ? (
                <div className='space-y-3 animate-pulse'>
                  <div className='h-4 bg-white/10 rounded w-1/3' />
                  <div className='h-4 bg-white/10 rounded w-2/3' />
                  <div className='h-4 bg-white/10 rounded w-5/6' />
                  <div className='h-4 bg-white/10 rounded w-4/5' />
                </div>
              ) : resultText ? (
                <div
                  className={[
                    'max-w-none',
                    '[&_h1]:text-lg [&_h1]:font-serif [&_h1]:tracking-widest [&_h1]:text-cp-yellow [&_h1]:uppercase [&_h1]:mb-4',
                    '[&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-serif [&_h2]:tracking-wide [&_h2]:text-white [&_h2]:mb-3',
                    '[&_h3]:mt-5 [&_h3]:text-sm [&_h3]:font-serif [&_h3]:tracking-wide [&_h3]:text-white [&_h3]:mb-2',
                    '[&_p]:text-sm [&_p]:text-cp-text-muted [&_p]:leading-relaxed [&_p]:my-2',
                    '[&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc',
                    '[&_ol]:my-3 [&_ol]:pl-5 [&_ol]:list-decimal',
                    '[&_li]:text-sm [&_li]:text-cp-text [&_li]:my-1',
                    '[&_strong]:text-cp-yellow [&_strong]:font-semibold',
                    '[&_em]:text-cp-text-muted',
                    '[&_a]:text-cp-yellow [&_a]:underline [&_a:hover]:opacity-90',
                    '[&_code]:text-cp-yellow [&_code]:font-mono',
                    '[&_pre]:bg-black/40 [&_pre]:text-white [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-cp-border',
                    '[&_blockquote]:border-l-2 [&_blockquote]:border-cp-border [&_blockquote]:pl-4 [&_blockquote]:text-cp-text-muted'
                  ].join(' ')}
                  dangerouslySetInnerHTML={{ __html: renderedOutput }}
                />
              ) : (
                <span className='text-gray-600 italic'>{tt('waiting')}</span>
              )}
            </div>

            <div className='mt-6 flex justify-end'>
              <button className='px-6 py-3 btn-outline text-xs flex items-center gap-2'>
                <Save size={16} />
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
