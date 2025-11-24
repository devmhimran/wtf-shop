import { UserRole } from '@/types';
import { SignJWT, jwtVerify } from 'jose';

export const ACCESS_TOKEN_EXPIRES = 45 * 60;
export const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60;

function getAccessSecret() {
  return new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_ACCESS_SECRET!);
}

function getRefreshSecret() {
  return new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_REFRESH_SECRET!);
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

// Verify Refresh Token
export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return payload as { userId: number };
  } catch {
    return null;
  }
}
