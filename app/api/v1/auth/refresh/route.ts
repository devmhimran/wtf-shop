import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from '@/lib/jwt';
import { prisma } from '@/prisma/prisma';

const REFRESH_TOKEN_REUSE_WINDOW = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
    });

    if (!user) {
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
    const isWithinReuseWindow =
      storedToken && now - updatedAt <= REFRESH_TOKEN_REUSE_WINDOW;

    if (!isSameToken && !isWithinReuseWindow) {
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
      user: {
        id: user.id,
        role: user.role,
      },
    });

    res.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: ACCESS_TOKEN_EXPIRES,
    });

    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRES,
    });

    return res;
  } catch (err) {
    console.error('Refresh error', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
