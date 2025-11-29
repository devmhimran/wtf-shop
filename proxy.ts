import { NextRequest, NextResponse } from 'next/server';

import { verifyAccessToken } from '@/lib/jwt';
import { baseURL } from './lib/axios';

const SUPER_ADMIN_PATHS = [
  '/dashboard/',
  '/dashboard/products',
  '/dashboard/custom-products',
  '/dashboard/orders',
  '/dashboard/customers',
  '/dashboard/users',
  '/dashboard/categories',
  '/dashboard/sub-categories',
  '/dashboard/colors',
  '/dashboard/sizes',
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
  let payload = accessToken
    ? await verifyAccessToken(accessToken).catch(() => null)
    : null;

  // 🔥 If access token invalid => try refresh
  if (!payload) {
    const cookieHeader = req.headers.get('cookie') || '';

    const refreshRes = await fetch(`${baseURL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // IMPORTANT
      headers: {
        cookie: cookieHeader, // send cookies manually
      },
    });

    // Refresh worked?
    if (refreshRes.ok) {
      const setCookies = refreshRes.headers.get('set-cookie');

      const response = NextResponse.next();

      // Write new cookies back to browser
      if (setCookies) {
        const cookies = setCookies.split(',');
        cookies.forEach((c) => {
          const parts = c.split(';')[0];
          const [name, value] = parts.split('=');
          response.cookies.set(name.trim(), value.trim(), { path: '/' });
        });
      }

      // Verify new access token
      accessToken = refreshRes.headers
        .get('set-cookie')
        ?.match(/accessToken=([^;]+)/)?.[1];

      payload = accessToken
        ? await verifyAccessToken(accessToken).catch(() => null)
        : null;

      if (!payload) {
        return NextResponse.redirect(new URL('/signin', req.url));
      }

      return response;
    }

    // refresh failed => force login
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  // 🔥 ROLE CHECKING
  const role = payload.role;
  const path = req.nextUrl.pathname;

  if (COMMON_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // CUSTOMER
  if (role === 'CUSTOMER') {
    if (SUPER_ADMIN_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/my-orders', req.url));
    }
    const allowed = CUSTOMER_PATHS.some((p) => path.startsWith(p));
    if (!allowed)
      return NextResponse.redirect(new URL('/dashboard/my-orders', req.url));
  }

  // ADMIN
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
  }

  // SUPER_ADMIN
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
