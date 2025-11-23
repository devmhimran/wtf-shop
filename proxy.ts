import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

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

export default withAuth(
  function proxy(req) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (req.nextauth?.token as any)?.user?.role;
    const path = req.nextUrl.pathname;

    if (COMMON_PATHS.some((commonPath) => path.startsWith(commonPath))) {
      return NextResponse.next();
    }

    if (role === 'CUSTOMER') {
      if (SUPER_ADMIN_PATHS.some((adminPath) => path.startsWith(adminPath))) {
        return NextResponse.redirect(new URL('/dashboard/my-orders', req.url));
      }

      const isAllowedPath = CUSTOMER_PATHS.some((customerPath) =>
        path.startsWith(customerPath)
      );

      if (!isAllowedPath) {
        return NextResponse.redirect(new URL('/dashboard/my-orders', req.url));
      }
    }

    if (role === 'ADMIN') {
      if (
        CUSTOMER_PATHS.some((customerPath) => path.startsWith(customerPath))
      ) {
        return NextResponse.redirect(new URL('/dashboard/products', req.url));
      }

      if (
        SUPER_ADMIN_PATHS.some((superAdminPath) =>
          path.startsWith(superAdminPath)
        ) &&
        !ADMIN_PATHS.some((adminPath) => path.startsWith(adminPath))
      ) {
        return NextResponse.redirect(new URL('/dashboard/products', req.url));
      }

      const isAllowedPath = ADMIN_PATHS.some((adminPath) =>
        path.startsWith(adminPath)
      );

      if (!isAllowedPath) {
        return NextResponse.redirect(new URL('/dashboard/products', req.url));
      }
    }

    if (role === 'SUPER_ADMIN') {
      if (
        CUSTOMER_PATHS.some((customerPath) => path.startsWith(customerPath))
      ) {
        return NextResponse.redirect(new URL('/dashboard/dashboard', req.url));
      }
      return NextResponse.next();
    }

    if (!role) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
    callbacks: {
      authorized: async ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: '/signin',
      error: '/signin',
    },
  }
);

export const config = { matcher: ['/dashboard/:path*', '/c/:path*'] };
