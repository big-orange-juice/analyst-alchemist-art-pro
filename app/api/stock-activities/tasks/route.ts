import { NextResponse } from 'next/server';
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

export async function POST(req: Request) {
  try {
    const auth = await getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ message: '未登录' }, { status: 401 });
    }

    const payload = await req.json();
    const activityId = (payload as any)?.activity_id;

    if (activityId === undefined || activityId === null || activityId === '') {
      return NextResponse.json(
        { message: '缺少参数：activity_id' },
        { status: 400 }
      );
    }

    const target = backendUrl('/api/v2/stock-activities/tasks');
    const res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth
      },
      body: JSON.stringify({ activity_id: activityId })
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
