import { NextResponse } from 'next/server';
import { getAuthHeader } from '@/lib/serverAuth';
import { backendUrl } from '@/lib/serverBackend';

const tryParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

type StockSelectionRequest = {
  agent_id: string;
  user_id: string;
  industry?: string;
  theme?: string;
  user_custom_input?: string;
  need_llm_analysis?: boolean;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Partial<StockSelectionRequest>;

    const agentId =
      typeof payload?.agent_id === 'string' ? payload.agent_id : '';
    const userId = typeof payload?.user_id === 'string' ? payload.user_id : '';

    const industry =
      typeof payload?.industry === 'string' ? payload.industry : undefined;
    const theme =
      typeof payload?.theme === 'string' ? payload.theme : undefined;
    const userCustomInput =
      typeof payload?.user_custom_input === 'string'
        ? payload.user_custom_input
        : undefined;
    const needLlmAnalysis =
      typeof payload?.need_llm_analysis === 'boolean'
        ? payload.need_llm_analysis
        : false;

    if (!agentId.trim() || !userId.trim()) {
      return NextResponse.json(
        { message: '缺少参数：agent_id/user_id' },
        { status: 400 }
      );
    }

    const auth = await getAuthHeader(req);

    const target = backendUrl('/research/stock-selection');
    const res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {})
      },
      body: JSON.stringify({
        agent_id: agentId,
        user_id: userId,
        industry,
        theme,
        user_custom_input: userCustomInput,
        need_llm_analysis: needLlmAnalysis
      })
    });

    const text = await res.text();

    if (!res.ok) {
      const maybe = tryParseJson(text);
      if (maybe) return NextResponse.json(maybe, { status: res.status });
      return NextResponse.json(
        { message: text || '请求失败' },
        { status: res.status }
      );
    }

    // Prefer JSON for structured UI rendering, but tolerate plain text.
    const okJson = tryParseJson(text);
    if (okJson != null) {
      return NextResponse.json(okJson, { status: res.status });
    }

    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
