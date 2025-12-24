import { NextResponse } from 'next/server';
import { getAuthHeader } from '@/lib/serverAuth';
import { backendURL } from '@/lib/serverBackend';

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

export async function GET(req: Request) {
  try {
    const auth = await getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ message: '未登录' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get('activity_id');
    const priceDate = searchParams.get('price_date');

    if (!activityId) {
      return NextResponse.json(
        { message: '缺少参数：activity_id' },
        { status: 400 }
      );
    }

    if (!priceDate) {
      return NextResponse.json(
        { message: '缺少参数：price_date' },
        { status: 400 }
      );
    }

    const target = backendURL('stock-activities/holdings/latest');
    target.searchParams.set('activity_id', activityId);
    target.searchParams.set('price_date', priceDate);

    const res = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        Authorization: auth
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

    if (maybe) return NextResponse.json(maybe, { status: res.status });
    return new Response(text, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    const body: DetailError = { message };
    return NextResponse.json(body, { status: 500 });
  }
}
