import { NextResponse } from 'next/server';
import { getAuthHeader } from '@/lib/serverAuth';
import { backendURL } from '@/lib/serverBackend';

const tryParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const keyword = (searchParams.get('keyword') ?? '').trim();
    const limitRaw = searchParams.get('limit');
    const limit = (() => {
      const n = Number(limitRaw);
      if (!Number.isFinite(n) || n <= 0) return 50;
      return Math.floor(n);
    })();

    const target = backendURL('/stock-basic/search');
    if (keyword) target.searchParams.set('keyword', keyword);
    target.searchParams.set('limit', String(limit));

    const auth = await getAuthHeader(req);

    const res = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        ...(auth ? { Authorization: auth } : {})
      }
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

    if (maybe != null) return NextResponse.json(maybe, { status: res.status });
    return new Response(text, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
