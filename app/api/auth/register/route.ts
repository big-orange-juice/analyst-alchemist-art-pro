import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api';

const joinUrl = (base: string, path: string) => {
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = path.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedPath}`;
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const username =
      typeof payload?.username === 'string' ? payload.username : '';
    const email = typeof payload?.email === 'string' ? payload.email : '';
    const password =
      typeof payload?.password === 'string' ? payload.password : '';

    if (!username.trim() || !email.trim() || !password.trim()) {
      return NextResponse.json(
        { message: '缺少参数：username/email/password' },
        { status: 400 }
      );
    }

    const target = process.env.API_PREFIX
      ? joinUrl(process.env.API_PREFIX, 'auth/register')
      : apiUrl('/api/v1/api/v2/auth/register');

    const res = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
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
      const nextRes = NextResponse.json(data, { status: res.status });

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) nextRes.headers.set('set-cookie', setCookie);

      return nextRes;
    } catch (_) {
      const headers = new Headers();
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) headers.set('set-cookie', setCookie);
      return new Response(text, { status: res.status, headers });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
