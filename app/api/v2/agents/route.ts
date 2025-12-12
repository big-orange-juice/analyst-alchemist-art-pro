import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api';
import { getAuthHeader } from '@/lib/serverAuth';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const agentName =
      typeof payload?.agent_name === 'string' ? payload.agent_name : '';
    const workflowId =
      typeof payload?.workflow_id === 'string' ? payload.workflow_id : '';
    const personaId =
      typeof payload?.persona_id === 'string' ? payload.persona_id : '';

    if (!agentName.trim() || !workflowId.trim() || !personaId.trim()) {
      return NextResponse.json(
        { message: '缺少参数：agent_name/workflow_id/persona_id' },
        { status: 400 }
      );
    }

    const target = process.env.API_PREFIX
      ? new URL('/api/v2/agents', process.env.API_PREFIX).toString()
      : apiUrl('/api/v2/agents');

    const auth = await getAuthHeader(req);

    const res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {})
      },
      body: JSON.stringify({
        agent_name: agentName,
        workflow_id: workflowId,
        persona_id: personaId
      })
    });

    const text = await res.text();

    // Preserve upstream error format when it's JSON (e.g. {detail:[...]})
    const tryJson = () => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    };

    if (!res.ok) {
      const maybe = tryJson();
      if (maybe) return NextResponse.json(maybe, { status: res.status });
      return NextResponse.json(
        { message: text || '请求失败' },
        { status: res.status }
      );
    }

    const maybe = tryJson();
    if (maybe) return NextResponse.json(maybe, { status: res.status });
    return new Response(text, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
