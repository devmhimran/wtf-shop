import { NextRequest, NextResponse } from 'next/server';

import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from '@/lib/jwt';
import { prisma } from '@/prisma/prisma';

const REFRESH_TOKEN_REUSE_WINDOW = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

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

    const userId = Number(payload.userId ?? payload.userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });

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

    if (storedToken && storedToken === refreshToken) {
      const newAccessToken = await generateAccessToken(user.id, user.role);
      const newRefreshToken = await generateRefreshToken(user.id, user.role);

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
    }

    if (storedToken && now - updatedAt <= REFRESH_TOKEN_REUSE_WINDOW) {
      const newAccessToken = await generateAccessToken(user.id, user.role);
      const newRefreshToken = await generateRefreshToken(user.id, user.role);

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
    }

    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );
  } catch (err) {
    console.error('Refresh error', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
