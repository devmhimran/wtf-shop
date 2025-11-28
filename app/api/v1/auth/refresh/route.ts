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

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      console.error('❌ No refresh token in cookies');
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // 1. Verify the token signature and expiration
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      console.error('❌ Refresh token is invalid or expired');
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // 2. Get user and verify they exist
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        refreshToken: true,
      },
    });

    if (!user) {
      console.error('❌ User not found');
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // 3. SIMPLE CHECK: Token exists in database (user hasn't logged out)
    // Don't do complex timestamp checks - just verify it matches
    if (user.refreshToken !== refreshToken) {
      console.error(
        '❌ Token does not match stored token (user may have logged out)'
      );
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // 4. Generate new tokens
    const newAccessToken = await generateAccessToken(user.id, user.role);
    const newRefreshToken = await generateRefreshToken(user.id, user.role);

    // 5. Update database with new refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenUpdatedAt: new Date(),
      },
    });

    // 6. Create response with new tokens
    const res = NextResponse.json({
      message: 'Token refreshed successfully',
      user: { id: user.id, role: user.role },
    });

    res.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_EXPIRES,
    });

    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRES,
    });

    res.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private'
    );

    console.log('✅ Token refreshed successfully for user:', user.id);
    return res;
  } catch (err) {
    console.error('❌ Refresh error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
