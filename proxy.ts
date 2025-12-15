import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken } from './lib/jwt';

const SUPER_ADMIN_PATHS = [
  '/dashboard/',
  '/dashboard/products',
  '/dashboard/media-library',
  '/dashboard/promo-code',
  '/dashboard/custom-products',
  '/dashboard/orders',
  '/dashboard/customers',
  '/dashboard/users',
  '/dashboard/categories',
  '/dashboard/sub-categories',
  '/dashboard/colors',
  '/dashboard/sizes',
  '/profile',
];

const ADMIN_PATHS = [
  '/dashboard/products',
  '/dashboard/custom-products',
  '/dashboard/orders',
  '/dashboard/customers',
  '/profile',
];

const CUSTOMER_PATHS = ['/c/my-orders', '/c/profile'];
const COMMON_PATHS = ['/profile'];

export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!refreshToken && !accessToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  const payload = await verifyRefreshToken(refreshToken);

  if (!payload) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  const { role } = payload;
  const path = request.nextUrl.pathname;

  // Allow common paths
  if (COMMON_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  /** CUSTOMER */
  if (role === 'CUSTOMER') {
    if (SUPER_ADMIN_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/c/my-orders', request.url));
    }

    if (!CUSTOMER_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/c/my-orders', request.url));
    }

    return NextResponse.next();
  }

  /** ADMIN */
  if (role === 'ADMIN') {
    if (CUSTOMER_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/products', request.url));
    }

    if (
      SUPER_ADMIN_PATHS.some((p) => path.startsWith(p)) &&
      !ADMIN_PATHS.some((p) => path.startsWith(p))
    ) {
      return NextResponse.redirect(new URL('/dashboard/products', request.url));
    }

    return NextResponse.next();
  }

  /** SUPER ADMIN */
  if (role === 'SUPER_ADMIN') {
    if (CUSTOMER_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/c/:path*', '/my-profile'],
};
