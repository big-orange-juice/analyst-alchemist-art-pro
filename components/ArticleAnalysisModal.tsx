'use client';

import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { apiFetch, ApiError } from '@/lib/http';

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
  language: 'zh' | 'en';
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
  language,
  onClose,
  onNotify
}: ArticleAnalysisModalProps) {
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
    lines.push(`# 文章分析结果${symbolText ? `：${symbolText}` : ''}`);
    const metaParts = [
      contentTypeText ? `内容类型：${contentTypeText}` : '',
      tradingDateText ? `交易日：${tradingDateText}` : '',
      timestampText ? `时间：${timestampText}` : ''
    ].filter(Boolean);
    if (metaParts.length) lines.push(metaParts.join('  |  '));
    lines.push('');

    if (extracted) {
      lines.push('## 提取内容');
      const summary = safeText(extracted.summary);
      const textLength = safeText(extracted.text_length);
      const hasTables = safeText(extracted.has_tables);
      const hasImages = safeText(extracted.has_images);
      if (summary) lines.push(`**摘要：** ${summary}`);
      const extractedMeta = [
        textLength ? `文本长度：${textLength}` : '',
        hasTables ? `包含表格：${hasTables}` : '',
        hasImages ? `包含图片：${hasImages}` : ''
      ].filter(Boolean);
      if (extractedMeta.length) lines.push(extractedMeta.join('  |  '));
      lines.push('');
    }

    if (structured) {
      lines.push('## 结构化信息');
      const theme = safeText(structured.document_theme);
      const category = safeText(structured.document_category);
      if (theme) lines.push(`- 文档主题：${theme}`);
      if (category) lines.push(`- 文档类别：${category}`);

      const keyMetrics =
        structured.key_metrics && typeof structured.key_metrics === 'object'
          ? (structured.key_metrics as Record<string, unknown>)
          : null;
      if (keyMetrics) {
        const revenue = safeText(keyMetrics.revenue);
        const profit = safeText(keyMetrics.profit);
        const growth = safeText(keyMetrics.growth_rate);
        const metricParts = [
          revenue ? `营收：${revenue}` : '',
          profit ? `利润：${profit}` : '',
          growth ? `增长率：${growth}` : ''
        ].filter(Boolean);
        if (metricParts.length)
          lines.push(`- 关键指标：${metricParts.join('  |  ')}`);
      }

      const summary = safeText(structured.summary);
      if (summary) {
        lines.push('');
        lines.push(`> ${summary}`);
        lines.push('');
      }

      lines.push(formatList('### 重要事件', structured.important_events));
      lines.push(formatList('### 风险因素', structured.risk_factors));
      lines.push(formatList('### 投资观点', structured.investment_views));
    }

    if (analyses) {
      lines.push('## 分析结论');

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

      appendAnalysis('宏观分析', 'macro_analysis');
      appendAnalysis('技术分析', 'technical_analysis');
      appendAnalysis('基本面分析', 'fundamental_analysis');
      appendAnalysis('情绪分析', 'sentiment_analysis');
      appendAnalysis('风险分析', 'risk_analysis');
    }

    if (advice) {
      lines.push('## 投资建议');
      const rating = safeText(advice.rating);
      const position = safeText(advice.position_suggestion);
      const confidence = safeText(advice.confidence);
      const targetPrice = safeText(advice.target_price);

      if (rating) lines.push(`- 评级：**${rating}**`);
      if (position) lines.push(`- 仓位建议：${position}`);
      if (targetPrice) lines.push(`- 目标价：${targetPrice}`);
      if (confidence) lines.push(`- 置信度：${confidence}`);
      lines.push('');

      lines.push(formatList('### 关键风险', advice.key_risks));
      lines.push(formatList('### 行动计划', advice.action_plan));

      const reasoning = safeText(advice.reasoning);
      if (reasoning) {
        lines.push('### 解释');
        lines.push(reasoning);
        lines.push('');
      }
    }

    return lines.filter(Boolean).join('\n');
  };

  const symbolOptions = useMemo(
    () => [
      { value: '', labelZh: '不指定', labelEn: 'Not set' },
      { value: 'AAPL', labelZh: '苹果（AAPL）', labelEn: 'Apple (AAPL)' },
      {
        value: '600519.SH',
        labelZh: '贵州茅台（600519.SH）',
        labelEn: 'Kweichow Moutai (600519.SH)'
      },
      {
        value: '000001.SZ',
        labelZh: '平安银行（000001.SZ）',
        labelEn: 'Ping An Bank (000001.SZ)'
      },
      {
        value: '000859.SZ',
        labelZh: '中信国安（000859.SZ）',
        labelEn: 'CITIC Guoan (000859.SZ)'
      }
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

  const copy =
    language === 'zh'
      ? {
          title: '生成报告',
          subtitle: 'POST /api/v2/research/article-analysis',
          mode_url: '在线链接',
          mode_text: '粘贴文本',
          mode_file: '文件上传',
          content_type: '内容类型',
          content_data: '内容',
          focus: '分析关注点（每行/逗号分隔）',
          symbol: '股票代码（可选）',
          trading_date: '交易日（可选）',
          url_ph: 'https://...',
          text_ph: '在此粘贴文章/研报纯文本...',
          focus_ph: '例如：估值，行业景气，财务质量，风险点',
          response: '响应结果',
          clear: '清空',
          submit: '生成',
          cancel: '取消',
          missing: '缺少用户或Agent信息，请先登录并创建Agent。',
          ok: '请求已提交',
          fail: '生成失败'
        }
      : {
          title: 'Generate Report',
          subtitle: 'POST /api/v2/research/article-analysis',
          mode_url: 'Use online URL',
          mode_text: 'Paste plain text',
          mode_file: 'Upload file (disabled)',
          content_type: 'content_type',
          content_data: 'content_data',
          focus: 'analysis_focus (newline/comma separated)',
          symbol: 'symbol (optional)',
          trading_date: 'trading_date (optional)',
          url_ph: 'https://...',
          text_ph: 'Paste article/report plain text here...',
          focus_ph: 'e.g. valuation, catalysts, financials, risks',
          response: 'Response',
          clear: 'Clear',
          submit: 'Generate',
          cancel: 'Cancel',
          missing:
            'Missing user/agent. Please login and create an agent first.',
          ok: 'Request submitted',
          fail: 'Request failed'
        };

  const isContentTypeLocked = mode === 'url' || mode === 'text';

  const handleSubmit = async () => {
    if (!agentId || !userId) {
      onNotify?.(copy.fail, copy.missing, 'warning');
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
      setResultText(formatted || '（空响应）');
      onNotify?.(copy.ok, copy.subtitle, 'success');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : copy.fail;
      setResultText(message);
      onNotify?.(copy.fail, message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[170] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 modal-animate'>
      <div className='w-full max-w-6xl h-[85vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow shadow-2xl flex flex-col relative overflow-hidden'>
        <button
          onClick={onClose}
          className='absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10'
          aria-label='close'>
          <X size={24} />
        </button>

        <div className='p-8 md:p-10 border-b border-cp-border bg-white/[0.02] shrink-0'>
          <h2 className='text-2xl md:text-3xl font-serif font-bold text-white'>
            {copy.title}
          </h2>
          <p className='text-cp-text-muted text-sm mt-2 font-mono'>
            {copy.subtitle}
          </p>
          {!agentId || !userId ? (
            <p className='text-cp-red text-xs mt-3'>{copy.missing}</p>
          ) : null}
        </div>

        <div className='relative flex-1 flex flex-col md:flex-row overflow-hidden bg-transparent'>
          {/* Form */}
          <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cp-border p-8 md:p-10 overflow-y-auto custom-scrollbar min-h-0 bg-white/[0.02]'>
            <div
              role='tablist'
              className='flex items-center gap-4 mb-6 border-b border-cp-border'>
              <button
                onClick={() => {
                  setMode('url');
                  setContentType('url');
                }}
                role='tab'
                aria-selected={mode === 'url'}
                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                  mode === 'url'
                    ? 'border-cp-yellow text-cp-yellow'
                    : 'border-transparent text-cp-text-muted hover:text-white'
                }`}>
                {copy.mode_url}
              </button>

              <button
                onClick={() => {
                  setMode('text');
                  setContentType('text');
                }}
                role='tab'
                aria-selected={mode === 'text'}
                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                  mode === 'text'
                    ? 'border-cp-yellow text-cp-yellow'
                    : 'border-transparent text-cp-text-muted hover:text-white'
                }`}>
                {copy.mode_text}
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
                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                  mode === 'file'
                    ? 'border-cp-yellow text-cp-yellow'
                    : 'border-transparent text-cp-text-muted hover:text-white'
                }`}>
                {copy.mode_file}
              </button>
            </div>

            <div className='grid grid-cols-1 gap-5'>
              <div className='space-y-2'>
                <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                  {copy.content_type}
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
                    URL 链接
                  </option>
                  <option value='text' className='bg-black text-white'>
                    纯文本
                  </option>
                  <option value='pdf' className='bg-black text-white'>
                    PDF 文档
                  </option>
                  <option value='excel' className='bg-black text-white'>
                    Excel 表格
                  </option>
                  <option value='image' className='bg-black text-white'>
                    图片
                  </option>
                </select>
              </div>

              {mode === 'url' ? (
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {copy.content_data}
                  </label>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className='w-full px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                    placeholder={copy.url_ph}
                  />
                </div>
              ) : null}

              {mode === 'text' ? (
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {copy.content_data}
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className='w-full min-h-[180px] px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm resize-y custom-scrollbar'
                    placeholder={copy.text_ph}
                  />
                </div>
              ) : null}

              {mode === 'file' ? (
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {copy.content_data}
                  </label>
                  <div className='w-full px-4 py-3 bg-white/[0.01] border border-cp-border text-cp-text-muted font-mono text-xs outline-none cursor-not-allowed'>
                    文件上传暂不可用
                  </div>
                </div>
              ) : null}

              <div className='space-y-2'>
                <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                  {copy.focus}
                </label>
                <textarea
                  value={analysisFocusRaw}
                  onChange={(e) => setAnalysisFocusRaw(e.target.value)}
                  className='w-full min-h-[90px] px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm resize-y custom-scrollbar'
                  placeholder={copy.focus_ph}
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
                    {copy.symbol}
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
                        {language === 'zh' ? opt.labelZh : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {copy.trading_date}
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
                        {d || (language === 'zh' ? '不指定' : 'Not set')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-2'>
                <button
                  onClick={onClose}
                  className='px-6 py-3 btn-outline text-xs'>
                  {copy.cancel}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className='px-8 py-3 btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed'>
                  {isSubmitting ? '...' : copy.submit}
                </button>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className='flex-1 p-8 md:p-10 flex flex-col bg-transparent gap-6 min-h-0'>
            <div className='flex items-center justify-between'>
              <div className='text-xs font-bold uppercase tracking-widest text-cp-text-muted'>
                {copy.response}
              </div>
              <div className='flex items-center gap-4'>
                {isSubmitting && (
                  <span className='text-[11px] text-cp-yellow tracking-widest'>
                    {language === 'zh' ? '生成中...' : 'Loading...'}
                  </span>
                )}
                <button
                  onClick={() => setResultText('')}
                  className='text-xs text-cp-text-muted hover:text-white transition-colors uppercase tracking-widest'>
                  {copy.clear}
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
                <span className='text-gray-600 italic'>
                  {language === 'zh'
                    ? '等待生成结果...'
                    : 'Waiting for result...'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
