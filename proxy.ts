import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { baseUrl } from '@/lib/axios';

const SUPER_ADMIN_PATHS = [
  '/dashboard/',
  '/dashboard/products',
  '/dashboard/custom-products',
  '/dashboard/orders',
  '/dashboard/customers',
  '/dashboard/users',
];

const ADMIN_PATHS = [
  '/dashboard/products',
  '/dashboard/custom-products',
  '/dashboard/orders',
  '/dashboard/customers',
];

const CUSTOMER_PATHS = ['/c/my-orders'];
const COMMON_PATHS = ['/my-profile'];

export async function proxy(req: NextRequest) {
  let accessToken = req.cookies.get('accessToken')?.value;
  let payload = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!payload) {
    const cookieHeader = req.headers.get('cookie') || '';

    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: cookieHeader },
    });

    if (refreshRes.ok) {
      const setCookie = refreshRes.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/accessToken=([^;]+)/);
        if (match) accessToken = match[1];
      }
      payload = accessToken ? await verifyAccessToken(accessToken) : null;
    }
  }

  if (!payload) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  const role = payload.role;
  const path = req.nextUrl.pathname;

  if (COMMON_PATHS.some((commonPath) => path.startsWith(commonPath))) {
    return NextResponse.next();
  }

  if (role === 'CUSTOMER') {
    if (SUPER_ADMIN_PATHS.some((adminPath) => path.startsWith(adminPath))) {
      return NextResponse.redirect(new URL('/dashboard/my-orders', req.url));
    }
    const isAllowedPath = CUSTOMER_PATHS.some((p) => path.startsWith(p));
    if (!isAllowedPath)
      return NextResponse.redirect(new URL('/dashboard/my-orders', req.url));
  }

  if (role === 'ADMIN') {
    if (CUSTOMER_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/products', req.url));
    }
    if (
      SUPER_ADMIN_PATHS.some((p) => path.startsWith(p)) &&
      !ADMIN_PATHS.some((p) => path.startsWith(p))
    ) {
      return NextResponse.redirect(new URL('/dashboard/products', req.url));
    }
    const isAllowedPath = ADMIN_PATHS.some((p) => path.startsWith(p));
    if (!isAllowedPath)
      return NextResponse.redirect(new URL('/dashboard/products', req.url));
  }

  if (role === 'SUPER_ADMIN') {
    if (CUSTOMER_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/c/:path*', '/my-profile'],
};
