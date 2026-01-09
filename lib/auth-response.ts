import { NextResponse } from 'next/server';

export const getOrigin = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_BASE_SITE_URL || 'https://wtf-shop.vercel.app'
    : 'https://wtf-shop.vercel.app';
};

export const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function createResponse(data: unknown, status: number = 200) {
  const res = NextResponse.json(data, { status });

  const origin = getOrigin();

  res.headers.set('Access-Control-Allow-Origin', origin);
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));

  return res;
}

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
  accessAge: number,
  refreshAge: number
) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as
      | 'none'
      | 'lax'
      | 'strict',
    path: '/',
  };

  res.cookies.set('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: accessAge,
  });

  res.cookies.set('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: refreshAge,
  });
}
