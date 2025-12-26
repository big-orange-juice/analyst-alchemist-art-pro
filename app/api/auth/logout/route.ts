import { NextResponse } from 'next/server';
import { clearAccessTokenCookie } from '@/lib/serverAuth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAccessTokenCookie(res);
  return res;
}
