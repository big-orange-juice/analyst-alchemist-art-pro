import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeader } from '@/lib/serverAuth';
import { backendURL } from '@/lib/serverBackend';

const coerceInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
};

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ message: '未登录' }, { status: 401 });
    }

    const skip = coerceInt(req.nextUrl.searchParams.get('skip'), 0);
    const limit = coerceInt(req.nextUrl.searchParams.get('limit'), 20);

    const targetUrl = backendURL('knowledge-graph/kb');
    targetUrl.searchParams.set('skip', String(skip));
    targetUrl.searchParams.set('limit', String(limit));

    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: auth
      }
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

    return NextResponse.json([], { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
