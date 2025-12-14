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

    const res = await fetch(backendUrl('agents'), {
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
