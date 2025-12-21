import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/serverBackend';

export async function GET() {
  try {
    const target = backendUrl('stock-activities');
    const res = await fetch(target, { method: 'GET' });

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
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
