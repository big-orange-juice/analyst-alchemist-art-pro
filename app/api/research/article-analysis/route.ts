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

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const auth = await getAuthHeader(req);

    const res = await fetch(backendUrl('/api/v2/research/article-analysis'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {})
      },
      body: JSON.stringify(payload)
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
