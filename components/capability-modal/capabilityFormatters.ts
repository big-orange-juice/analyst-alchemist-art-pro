export type StockSelectionResponse = {
  trading_date?: unknown;
  timestamp?: unknown;
  candidates?: unknown;
};

type Language = 'zh' | 'en';

export type FormatterI18n = {
  t: (key: string) => string;
  language: Language;
};

export const looksLikeJsonText = (text: string) => {
  const t = (text ?? '').trim();
  return t.startsWith('{') || t.startsWith('[');
};

export const tryParseJsonText = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const humanizeMatchReason = (reason: string, i18n?: FormatterI18n) => {
  const trimmed = (reason ?? '').trim();
  if (!trimmed) return '';

  // Common pattern: "xxx <= 1.23 (当前 0.98)" / "xxx >= 12 (当前值 15)"
  const m = trimmed.match(
    /^(.*?)(<=|>=)\s*([+-]?\d+(?:\.\d+)?)\s*\((?:当前|当前值|current|current value)\s*([+-]?\d+(?:\.\d+)?)\)\s*$/i
  );
  if (!m) return trimmed;

  const rawLabel = (m[1] ?? '').trim();
  const op = m[2];
  const threshold = m[3];
  const current = m[4];

  const unit = rawLabel.includes('%') ? '%' : '';

  const metric = (() => {
    const lang: Language = i18n?.language ?? 'zh';
    if (/\bPB\b/i.test(rawLabel) || rawLabel.includes('市净率')) return 'PB';
    if (/\bPE\b/i.test(rawLabel) || rawLabel.includes('市盈率')) return 'PE';
    if (/\bPEG\b/i.test(rawLabel)) return 'PEG';
    if (rawLabel.includes('净资产收益率')) return 'ROE';
    if (/\bRSI\b/i.test(rawLabel)) return 'RSI';
    if (rawLabel.includes('成交额') || rawLabel.includes('流动性'))
      return lang === 'en' ? 'Turnover' : '成交额';
    if (rawLabel.includes('毛利率'))
      return lang === 'en' ? 'Gross margin' : '毛利率';
    if (rawLabel.includes('换手率'))
      return lang === 'en' ? 'Turnover rate' : '换手率';
    if (rawLabel.includes('营收增长'))
      return lang === 'en' ? 'Revenue growth' : '营收增长';
    if (rawLabel.includes('净利润增长'))
      return lang === 'en' ? 'Net profit growth' : '净利润增长';
    if (rawLabel.includes('30日波动率'))
      return lang === 'en' ? '30D volatility' : '30日波动率';
    if (rawLabel.includes('3月最大回撤'))
      return lang === 'en' ? '3M max drawdown' : '3月最大回撤';
    if (rawLabel.includes('近3月涨幅'))
      return lang === 'en' ? '3M return' : '近3月涨幅';

    return rawLabel
      .replace(/^最大/, '')
      .replace(/^最小/, '')
      .replace(/^最低/, '')
      .replace(/^最小允许的/, '')
      .trim();
  })();

  const t = i18n?.t;
  const opWord =
    op === '<='
      ? t?.('capability_formatters.op_lte') ?? '<='
      : t?.('capability_formatters.op_gte') ?? '>=';
  const currentLabel = t?.('capability_formatters.current') ?? 'Current';

  const isZh = (i18n?.language ?? 'zh') === 'zh';
  if (isZh) {
    return `${metric}${opWord}${threshold}${unit}（${currentLabel}${current}${unit}）`;
  }
  return `${metric} ${opWord} ${threshold}${unit} (${currentLabel}: ${current}${unit})`;
};

export const formatStockSelectionResponse = (
  data: StockSelectionResponse,
  i18n?: FormatterI18n
) => {
  const t = i18n?.t;
  const date = data?.trading_date ? String(data.trading_date) : '';
  const candidatesRaw = Array.isArray(data?.candidates)
    ? (data.candidates as unknown[])
    : [];

  const lines: string[] = [];
  const title = t?.('capability_formatters.hit_conditions') ?? 'Hit conditions';
  lines.push(`# ${title}${date ? ` @ ${date}` : ''}`);

  if (!candidatesRaw.length) {
    lines.push(
      `- ${t?.('capability_formatters.no_candidates') ?? '(no candidates)'}`
    );
    return lines.join('\n');
  }

  candidatesRaw.forEach((c, idx) => {
    const obj =
      c && typeof c === 'object' ? (c as Record<string, unknown>) : {};
    const name = obj.name ? String(obj.name) : '';
    const symbol = obj.symbol ? String(obj.symbol) : '';
    const candidateLabel =
      t?.('capability_formatters.candidate') ?? 'Candidate';
    const title = name || symbol || `${candidateLabel} ${idx + 1}`;
    const titleWithSymbol = name && symbol ? `${title} (${symbol})` : title;

    lines.push('');
    lines.push(`## ${idx + 1}. ${titleWithSymbol}`);
    lines.push('');

    const reasons = Array.isArray(obj.match_reasons)
      ? (obj.match_reasons as unknown[])
      : [];

    if (!reasons.length) {
      lines.push(
        `- ${
          t?.('capability_formatters.no_reasons') ?? '(no reasons provided)'
        }`
      );
      return;
    }

    reasons.forEach((r) => {
      const text = typeof r === 'string' ? r : String(r ?? '');
      const human = humanizeMatchReason(text, i18n);
      if (human) lines.push(`- ${human}`);
    });

    lines.push('');
  });

  return lines.join('\n');
};

export const formatStockAnalysisResponse = (
  data: Record<string, any>,
  i18n?: FormatterI18n
) => {
  const t = i18n?.t;
  if (!data) return '';
  const lines: string[] = [];
  const symbolFallback =
    t?.('capability_formatters.symbol_fallback') ?? 'Symbol';
  lines.push(`# ${data.symbol || symbolFallback} @ ${data.trading_date || ''}`);

  if (data.comprehensive_rating) {
    const comp = data.comprehensive_rating;
    const overall =
      t?.('capability_formatters.overall_rating') ?? 'Overall rating';
    const score = t?.('capability_formatters.score') ?? 'Score';
    const confidence = t?.('capability_formatters.confidence') ?? 'Confidence';
    lines.push(
      `**${overall}: ${comp.rating || ''}**  ${score}: ${
        comp.overall_score ?? ''
      }  ${confidence}: ${comp.confidence ?? ''}`
    );
    if (comp.reasoning) lines.push(`> ${comp.reasoning}`);
  }

  if (data.technical_analysis) {
    const ta = data.technical_analysis;
    lines.push(`## ${t?.('capability_formatters.technical') ?? 'Technical'}`);
    const rec = t?.('capability_formatters.recommendation') ?? 'Recommendation';
    const conf = t?.('capability_formatters.confidence_short') ?? 'Conf';
    lines.push(
      `- ${rec}: ${ta.recommendation || ''} (${conf} ${ta.confidence ?? ''})`
    );
    if (ta.reasoning) lines.push(ta.reasoning);
  }

  if (data.fundamental_analysis) {
    const f = data.fundamental_analysis;
    lines.push(
      `## ${t?.('capability_formatters.fundamental') ?? 'Fundamental'}`
    );
    const rec = t?.('capability_formatters.recommendation') ?? 'Recommendation';
    const conf = t?.('capability_formatters.confidence_short') ?? 'Conf';
    lines.push(
      `- ${rec}: ${f.recommendation || ''} (${conf} ${f.confidence ?? ''})`
    );
    if (f.reasoning) lines.push(f.reasoning);
    if (Array.isArray(f.key_factors) && f.key_factors.length) {
      lines.push(
        `- ${t?.('capability_formatters.key_factors') ?? 'Key factors'}:`
      );
      f.key_factors.forEach((k: string) => lines.push(`  - ${k}`));
    }
  }

  if (data.news_analysis) {
    const n = data.news_analysis;
    lines.push(`## ${t?.('capability_formatters.news') ?? 'News'}`);
    const sentiment = t?.('capability_formatters.sentiment') ?? 'Sentiment';
    const source = t?.('capability_formatters.source') ?? 'Source';
    const link = t?.('capability_formatters.link') ?? 'Link';
    if (n.sentiment_summary) lines.push(n.sentiment_summary);
    if (Array.isArray(n.recent_news)) {
      n.recent_news.forEach((item: any) => {
        lines.push(
          `- **${item.title || ''}** (${item.date || ''}) — ${sentiment}: ${
            item.sentiment || ''
          }`
        );
        if (item.summary) lines.push(`  - ${item.summary}`);
        if (item.source) lines.push(`  - ${source}: ${item.source}`);
        if (item.url) lines.push(`  - [${link}](${item.url})`);
      });
    }
  }

  if (data.financial_report) {
    const fr = data.financial_report;
    lines.push(
      `## ${t?.('capability_formatters.financial_report') ?? 'Financials'}`
    );
    if (fr.summary) lines.push(fr.summary);
    if (Array.isArray(fr.highlights)) {
      fr.highlights.forEach((h: string) => lines.push(`- ${h}`));
    }
  }

  return lines.join('\n\n');
};
