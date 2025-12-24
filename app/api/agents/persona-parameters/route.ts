import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeader } from '@/lib/serverAuth';
import { backendUrl } from '@/lib/serverBackend';

type DetailError = {
  detail?: Array<{ loc?: unknown; msg?: string; type?: string }>;
  message?: string;
};

const tryParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ message: '未登录' }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    const agentId = payload?.agent_id;
    const personaParameters = payload?.persona_parameters;

    if (
      agentId === undefined ||
      agentId === null ||
      String(agentId).trim() === ''
    ) {
      return NextResponse.json(
        { message: '缺少参数：agent_id' },
        { status: 400 }
      );
    }

    if (
      !personaParameters ||
      typeof personaParameters !== 'object' ||
      Array.isArray(personaParameters)
    ) {
      return NextResponse.json(
        { message: '缺少参数：persona_parameters（必须是对象）' },
        { status: 400 }
      );
    }

    const target = backendUrl('agents/persona-parameters');
    const res = await fetch(target, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth
      },
      body: JSON.stringify({
        agent_id: agentId,
        persona_parameters: personaParameters
      })
    });

    const text = await res.text();
    const maybe = tryParseJson(text);

    if (!res.ok) {
      if (maybe) return NextResponse.json(maybe, { status: res.status });
      return NextResponse.json(
        { message: text || '请求失败' },
        { status: res.status }
      );
    }

    if (maybe) return NextResponse.json(maybe, { status: res.status });
    return new Response(text, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    const body: DetailError = { message };
    return NextResponse.json(body, { status: 500 });
  }
}
