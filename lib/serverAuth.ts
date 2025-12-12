import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

export const ACCESS_TOKEN_COOKIE = 'aa_access_token';

export const getAuthHeader = async (req: Request) => {
  const direct = req.headers.get('authorization');
  if (direct) return direct;

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return undefined;

  return `Bearer ${token}`;
};

export const setAccessTokenCookie = (
  res: NextResponse,
  accessToken: string
) => {
  res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
};

export const clearAccessTokenCookie = (res: NextResponse) => {
  res.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
};
