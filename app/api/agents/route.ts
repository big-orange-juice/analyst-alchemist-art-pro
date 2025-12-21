import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeader } from '@/lib/serverAuth';
import { backendURL, backendUrl } from '@/lib/serverBackend';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('user_id');
  const skip = searchParams.get('skip') ?? '0';
  const limit = searchParams.get('limit') ?? '10';
  if (!userId) {
    return NextResponse.json({ message: '缺少 user_id' }, { status: 400 });
  }

  const targetUrl = backendURL('agents');
  targetUrl.searchParams.set('user_id', userId);
  targetUrl.searchParams.set('skip', skip);
  targetUrl.searchParams.set('limit', limit);

  const auth = await getAuthHeader(req);
  if (!auth) {
    return NextResponse.json({ message: '未登录' }, { status: 401 });
  }
  const res = await fetch(targetUrl.toString(), {
    method: 'GET',
    headers: { Authorization: auth }
  });
  const text = await res.text();

  if (!res.ok) {
    return NextResponse.json(
      { message: text || '请求失败' },
      { status: res.status }
    );
  }

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data, { status: res.status });
  } catch (_) {
    return new Response(text, { status: res.status });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const auth = await getAuthHeader(req);

    const agentName =
      typeof payload?.agent_name === 'string' ? payload.agent_name : '';
    const workflowId =
      typeof payload?.workflow_id === 'string' ? payload.workflow_id : '';
    const personaId =
      typeof payload?.persona_id === 'string' ? payload.persona_id : '';

    const isV2Create =
      agentName.trim() && workflowId.trim() && personaId.trim();

    const target = isV2Create ? backendUrl('/agents') : backendUrl('agents');

    if (isV2Create) {
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
    }

    const res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {})
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { message: text || '请求失败' },
        { status: res.status }
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: res.status });
    } catch (_) {
      return new Response(text, { status: res.status });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
