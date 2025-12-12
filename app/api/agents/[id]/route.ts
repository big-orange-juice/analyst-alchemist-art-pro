import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api';
import { getAuthHeader } from '@/lib/serverAuth';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: '缺少 agent id' }, { status: 400 });
  }

  const target = apiUrl(`/api/v1/agents/${encodeURIComponent(id)}`);
  const auth = await getAuthHeader(_req);
  const res = await fetch(target, {
    method: 'DELETE',
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
