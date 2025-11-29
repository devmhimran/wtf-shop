import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

const SUPER_ADMIN_PATHS = [
  '/dashboard/',
  '/dashboard/products',
  '/dashboard/media-library',
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
  const accessToken = req.cookies.get('accessToken')?.value || null;

  // ❌ If no access token → redirect
  if (!accessToken) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  // Verify token
  const payload = await verifyAccessToken(accessToken);

  // ❌ Expired/invalid access token → redirect
  // Axios will refresh automatically after loading the page
  if (!payload) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  const { role } = payload;
  const path = req.nextUrl.pathname;

  // Allow common paths
  if (COMMON_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  /** CUSTOMER */
  if (role === 'CUSTOMER') {
    if (SUPER_ADMIN_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/my-orders', req.url));
    }

    if (!CUSTOMER_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/my-orders', req.url));
    }

    return NextResponse.next();
  }

  /** ADMIN */
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

    return NextResponse.next();
  }

  /** SUPER ADMIN */
  if (role === 'SUPER_ADMIN') {
    if (CUSTOMER_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/', req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/c/:path*', '/my-profile'],
};
