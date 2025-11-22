import { SignJWT, jwtVerify } from 'jose';

const ACCESS_TOKEN_EXPIRES = 1 * 5;
const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60;

function getAccessSecret() {
  return new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_ACCESS_SECRET!);
}

function getRefreshSecret() {
  return new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_REFRESH_SECRET!);
}

export async function generateAccessToken(userId: number) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRES}s`)
    .sign(getAccessSecret());
}

export async function generateRefreshToken(userId: number) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRES}s`)
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return payload as { userId: number };
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
