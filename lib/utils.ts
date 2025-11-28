import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { NextRequest, NextResponse } from 'next/server';

import { verifyAccessToken } from './jwt';
import { authApi } from './api-helper';
import { CommonApiResponseError, ErrorItem } from '@/types/common.types';
import { ZodError } from 'zod';

export const USER_COUNT_PER_PAGE = 10;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: unknown) => {
  let message;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }

  return message;
};

export const getErrorResponse = (error: unknown) => {
  const apiError = error as CommonApiResponseError;
  const backendErrors: ErrorItem[] = apiError?.response?.data?.error ?? [];
  if (backendErrors.length > 0) {
    // Join all messages into a single string
    return backendErrors.map((e) => e.message).join(', ');
  }

  // fallback
  return apiError?.message || 'Something went wrong';
};

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

export const authLogout = async () => {
  await authApi.logout();

  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const formatZodErrors = (zodError: ZodError) => {
  const formatted: Record<string, string> = {};

  zodError.issues.forEach((issue) => {
    const field = issue.path.join('.');
    formatted[field] = issue.message;
  });

  const combinedMessage = Object.values(formatted).join('; ');

  return {
    formatted,
    combinedMessage,
  };
};
