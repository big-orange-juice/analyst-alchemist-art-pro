export type StockSelectionResponse = {
  trading_date?: unknown;
  timestamp?: unknown;
  candidates?: unknown;
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

const humanizeMatchReason = (reason: string) => {
  const trimmed = (reason ?? '').trim();
  if (!trimmed) return '';

  // Common pattern: "xxx <= 1.23 (当前 0.98)" / "xxx >= 12 (当前值 15)"
  const m = trimmed.match(
    /^(.*?)(<=|>=)\s*([+-]?\d+(?:\.\d+)?)\s*\((?:当前|当前值)\s*([+-]?\d+(?:\.\d+)?)\)\s*$/
  );
  if (!m) return trimmed;

  const rawLabel = (m[1] ?? '').trim();
  const op = m[2];
  const threshold = m[3];
  const current = m[4];

  const unit = rawLabel.includes('%') ? '%' : '';

  const metric = (() => {
    if (/\bPB\b/i.test(rawLabel) || rawLabel.includes('市净率')) return 'PB';
    if (/\bPE\b/i.test(rawLabel) || rawLabel.includes('市盈率')) return 'PE';
    if (/\bPEG\b/i.test(rawLabel)) return 'PEG';
    if (rawLabel.includes('净资产收益率')) return 'ROE';
    if (/\bRSI\b/i.test(rawLabel)) return 'RSI';
    if (rawLabel.includes('成交额') || rawLabel.includes('流动性'))
      return '成交额';
    if (rawLabel.includes('毛利率')) return '毛利率';
    if (rawLabel.includes('换手率')) return '换手率';
    if (rawLabel.includes('营收增长')) return '营收增长';
    if (rawLabel.includes('净利润增长')) return '净利润增长';
    if (rawLabel.includes('30日波动率')) return '30日波动率';
    if (rawLabel.includes('3月最大回撤')) return '3月最大回撤';
    if (rawLabel.includes('近3月涨幅')) return '近3月涨幅';

    return rawLabel
      .replace(/^最大/, '')
      .replace(/^最小/, '')
      .replace(/^最低/, '')
      .replace(/^最小允许的/, '')
      .trim();
  })();

  const opWord = op === '<=' ? '不高于' : '不低于';
  return `${metric}${opWord}${threshold}${unit}（当前${current}${unit}）`;
};

export const formatStockSelectionResponse = (data: StockSelectionResponse) => {
  const date = data?.trading_date ? String(data.trading_date) : '';
  const candidatesRaw = Array.isArray(data?.candidates)
    ? (data.candidates as unknown[])
    : [];

  const lines: string[] = [];
  lines.push(`# 命中条件${date ? ` @ ${date}` : ''}`);

  if (!candidatesRaw.length) {
    lines.push('- （未返回候选标的或命中条件）');
    return lines.join('\n');
  }

  candidatesRaw.forEach((c, idx) => {
    const obj =
      c && typeof c === 'object' ? (c as Record<string, unknown>) : {};
    const name = obj.name ? String(obj.name) : '';
    const symbol = obj.symbol ? String(obj.symbol) : '';
    const title = name || symbol || `候选 ${idx + 1}`;
    const titleWithSymbol = name && symbol ? `${title} (${symbol})` : title;

    lines.push('');
    lines.push(`## ${idx + 1}. ${titleWithSymbol}`);
    lines.push('');

    const reasons = Array.isArray(obj.match_reasons)
      ? (obj.match_reasons as unknown[])
      : [];

    if (!reasons.length) {
      lines.push('- （未提供命中条件）');
      return;
    }

    reasons.forEach((r) => {
      const text = typeof r === 'string' ? r : String(r ?? '');
      const human = humanizeMatchReason(text);
      if (human) lines.push(`- ${human}`);
    });

    lines.push('');
  });

  return lines.join('\n');
};

export const formatStockAnalysisResponse = (data: Record<string, any>) => {
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
