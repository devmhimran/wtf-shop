import { NextRequest, NextResponse } from 'next/server';

import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from '@/lib/jwt';
import { prisma } from '@/prisma/prisma';

const REFRESH_TOKEN_REUSE_WINDOW = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken)
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload)
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user)
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );

    const now = Date.now();
    const isOldToken = user.refreshToken !== refreshToken;
    const withinWindow =
      user.refreshTokenUpdatedAt &&
      now - user.refreshTokenUpdatedAt.getTime() < REFRESH_TOKEN_REUSE_WINDOW;

    if (isOldToken && !withinWindow) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const newAccessToken = await generateAccessToken(user.id);
    const newRefreshToken = await generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
