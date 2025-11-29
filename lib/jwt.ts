import { UserRole } from '@/types';
import { SignJWT, jwtVerify } from 'jose';

export const ACCESS_TOKEN_EXPIRES = 1 * 10; // 30 minutes in seconds
export const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60; // 7 days in seconds

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set');
  return new TextEncoder().encode(secret);
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET not set');
  return new TextEncoder().encode(secret);
}

export async function generateAccessToken(userId: number, role: UserRole) {
  return await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRES}s`)
    .sign(getAccessSecret());
}

export async function generateRefreshToken(userId: number, role: UserRole) {
  return await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRES}s`)
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return payload as { userId: number; role: UserRole };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return payload as { userId: number; role: UserRole };
  } catch {
    return null;
  }
}
