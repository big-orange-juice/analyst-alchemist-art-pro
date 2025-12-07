import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const res = await fetch(apiUrl('/api/v1/on-demand/stock-analysis-v2'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    } catch (err) {
      return new Response(text, { status: res.status });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
