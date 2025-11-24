import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { NextRequest, NextResponse } from 'next/server';

import { verifyAccessToken } from './jwt';
import { authApi } from './api-helper';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function authenticateRequest(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: No access token' },
        { status: 401 }
      ),
      payload: null,
    };
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      ),
      payload: null,
    };
  }

  // 3. Return payload (userId + role)
  return {
    error: null,
    payload, // { userId, role }
  };
}

export const catchError = (error: unknown) => {
  return {
    success: false,
    message: error instanceof Error ? error.message : 'Something went wrong',
  };
};

export function generateQueryString(params: Record<string, string>) {
  const isEmpty = Object.values(params).every((value) => value === '');

  if (isEmpty) {
    return '';
  }

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          value as unknown as string
        )}`
    )
    .join('&');

  return `?${queryString}`;
}

export const roleConvert = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  CUSTOMER: 'Customer',
};

export const userStatusConvert = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const authLogout = async () => {
  await authApi.logout();

  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};
