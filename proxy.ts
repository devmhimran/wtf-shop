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
  const pathname = request.nextUrl.pathname;

  // If user is authenticated and trying to access signin page, redirect them away
  if ((refreshToken || accessToken) && pathname === '/signin') {
    const payload = await verifyRefreshToken(refreshToken!);

    if (payload) {
      const { role } = payload;
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');

      // If callbackUrl exists, redirect there
      if (callbackUrl) {
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }

      // Otherwise redirect based on role
      if (role === 'CUSTOMER') {
        return NextResponse.redirect(new URL('/c/my-orders', request.url));
      } else if (role === 'ADMIN') {
        return NextResponse.redirect(
          new URL('/dashboard/products', request.url)
        );
      } else if (role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/', request.url));
      }
    }
  }

  // Allow unauthenticated access to signin page
  if (pathname === '/signin') {
    return NextResponse.next();
  }

  if (!refreshToken && !accessToken) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!refreshToken) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  const payload = await verifyRefreshToken(refreshToken);

  if (!payload) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  const { role } = payload;
  const path = pathname;

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
  matcher: ['/dashboard/:path*', '/c/:path*', '/my-profile', '/signin'],
};
