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

export const roleConvert = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  CUSTOMER: 'Customer',
};
