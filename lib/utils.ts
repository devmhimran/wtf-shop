import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { NextRequest, NextResponse } from 'next/server';

import { verifyAccessToken } from './jwt';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      payload: null,
    };
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return {
      error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
      payload: null,
    };
  }

  return {
    error: null,
    payload,
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
