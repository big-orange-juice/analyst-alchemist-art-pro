import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api';
import { getAuthHeader } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('user_id');
  const skip = searchParams.get('skip') ?? '0';
  const limit = searchParams.get('limit') ?? '10';

  if (!userId) {
    return NextResponse.json({ message: '缺少 user_id' }, { status: 400 });
  }

  const target = apiUrl(
    `/api/v1/agents?user_id=${encodeURIComponent(
      userId
    )}&skip=${encodeURIComponent(skip)}&limit=${encodeURIComponent(limit)}`
  );

  const auth = await getAuthHeader(req);
  const res = await fetch(target, {
    method: 'GET',
    headers: auth ? { Authorization: auth } : undefined
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

    const res = await fetch(apiUrl('/api/v1/agents'), {
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
