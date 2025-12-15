import { NextResponse } from 'next/server';
import { setAccessTokenCookie } from '@/lib/serverAuth';
import { backendUrl } from '@/lib/serverBackend';

const tryParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const extractAccessToken = (data: unknown): string | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const anyData = data as any;

  const direct =
    anyData?.access_token ?? anyData?.accessToken ?? anyData?.token;
  if (typeof direct === 'string' && direct.trim()) return direct;

  const nested =
    anyData?.data?.access_token ??
    anyData?.data?.accessToken ??
    anyData?.data?.token ??
    anyData?.result?.access_token ??
    anyData?.result?.accessToken ??
    anyData?.result?.token;
  if (typeof nested === 'string' && nested.trim()) return nested;

  return undefined;
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

    const target = backendUrl('auth/login');

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

    const parsed = tryParseJson(text);
    const token = extractAccessToken(parsed);
    const upstreamSetCookie = res.headers.get('set-cookie');

    // 如果后端既没有返回 token，也没有下发 cookie，则认为登录并未真正建立会话。
    if (!token && !upstreamSetCookie) {
      return NextResponse.json(
        { message: '登录返回缺少凭证（token/cookie）' },
        { status: 502 }
      );
    }

    const nextRes =
      parsed != null
        ? NextResponse.json(parsed, { status: res.status })
        : new Response(text, {
            status: res.status,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });

    // 兼容：后端如果使用 cookie session，这里把 set-cookie 透传回浏览器。
    if (upstreamSetCookie) {
      try {
        (nextRes as any).headers?.set?.('set-cookie', upstreamSetCookie);
      } catch {
        // ignore
      }
    }

    // 兼容：后端返回 bearer token，则写入我们自己的 HttpOnly cookie。
    if (token && 'cookies' in nextRes) {
      try {
        setAccessTokenCookie(nextRes as any, token);
      } catch {
        // ignore
      }
    }

    return nextRes as any;
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
