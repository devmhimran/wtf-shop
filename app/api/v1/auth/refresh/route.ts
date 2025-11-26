export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from '@/lib/jwt';
import { prisma } from '@/prisma/prisma';

const REFRESH_TOKEN_REUSE_WINDOW = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    // DEBUG: Log all cookies received
    console.log('📦 Cookies received:', req.cookies.getAll());

    const refreshToken = req.cookies.get('refreshToken')?.value;
    console.log('🔑 Refresh token found:', !!refreshToken);

    if (!refreshToken) {
      console.error('❌ No refresh token in cookies');
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      console.error('❌ Refresh token is invalid or expired');
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.refreshToken) {
      console.error('❌ User not found or no refresh token in DB');
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const now = Date.now();
    const storedToken = user.refreshToken;
    const updatedAt = user.refreshTokenUpdatedAt
      ? user.refreshTokenUpdatedAt.getTime()
      : 0;

    const isSameToken = storedToken === refreshToken;
    const isWithinReuseWindow = now - updatedAt <= REFRESH_TOKEN_REUSE_WINDOW;

    if (!isSameToken && !isWithinReuseWindow) {
      console.error('❌ Token rotation outside reuse window');
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const newAccessToken = await generateAccessToken(user.id, user.role);
    const newRefreshToken = await generateRefreshToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenUpdatedAt: new Date(),
      },
    });

    const res = NextResponse.json({
      message: 'Token refreshed successfully',
      user: { id: user.id, role: user.role },
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const isCrossDomain =
      process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost') === false;

    res.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction || isCrossDomain,
      sameSite: isCrossDomain ? 'none' : 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_EXPIRES,
    });

    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction || isCrossDomain,
      sameSite: isCrossDomain ? 'none' : 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRES,
    });

    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res;
  } catch (err) {
    console.error('❌ Refresh error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
