import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api';
import { setAccessTokenCookie } from '@/lib/serverAuth';

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
    const password =
      typeof payload?.password === 'string' ? payload.password : '';

    if (!username.trim() || !password.trim()) {
      return NextResponse.json(
        { message: '缺少参数：username/password' },
        { status: 400 }
      );
    }

    const target = process.env.API_PREFIX
      ? joinUrl(process.env.API_PREFIX, 'auth/login')
      : apiUrl('/api/v1/api/v2/auth/login');

    const res = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { message: text || '请求失败' },
        { status: res.status }
      );
    }

    try {
      const data = JSON.parse(text) as {
        access_token?: string;
        token_type?: string;
      };

      const nextRes = NextResponse.json(data, { status: res.status });

      if (data?.access_token) {
        setAccessTokenCookie(nextRes, data.access_token);
      }

      return nextRes;
    } catch (_) {
      return NextResponse.json(
        { message: '登录返回格式异常' },
        { status: 502 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
