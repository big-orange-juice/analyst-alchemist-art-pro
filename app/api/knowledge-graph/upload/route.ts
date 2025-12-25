import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeader } from '@/lib/serverAuth';
import { backendURL } from '@/lib/serverBackend';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ message: '未登录' }, { status: 401 });
    }

    const form = await req.formData();
    const scenarioRaw = form.get('scenario');
    const scenario = typeof scenarioRaw === 'string' ? scenarioRaw.trim() : '';
    const file = form.get('file');

    if (!scenario) {
      return NextResponse.json({ message: '缺少 scenario' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: '缺少 file' }, { status: 400 });
    }

    const fd = new FormData();
    fd.append('scenario', scenario);
    fd.append('file', file, file.name);

    const targetUrl = backendURL('knowledge-graph/upload');
    const res = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        Authorization: auth
      },
      body: fd
    });

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
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ message }, { status: 500 });
  }
}
