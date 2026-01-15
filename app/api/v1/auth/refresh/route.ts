import { NextRequest } from 'next/server';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from '@/lib/jwt';
import { prisma } from '@/prisma/prisma';
import { createResponse, setAuthCookies } from '@/lib/auth-response';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return createResponse({ error: 'Refresh token required' }, 400);
    }

    /* --------------------------------------------------
       Verify JWT signature & payload
    -------------------------------------------------- */

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return createResponse({ error: 'Invalid refresh token' }, 401);
    }

    /* --------------------------------------------------
       Validate refresh token from DB
    -------------------------------------------------- */

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date()
    ) {
      return createResponse({ error: 'Invalid refresh token' }, 401);
    }

    const user = storedToken.user;

    if (!user || user.isDelete || !user.isActive) {
      return createResponse({ error: 'Account not accessible' }, 403);
    }

    /* --------------------------------------------------
       Rotate refresh token (secure)
    -------------------------------------------------- */

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const newAccessToken = await generateAccessToken(user.id, user.role);
    const newRefreshToken = await generateRefreshToken(user.id, user.role);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        deviceInfo: req.headers.get('user-agent'),
        ipAddress:
          req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES),
      },
    });

    /* --------------------------------------------------
       Clean up tokens that are revoked OR expired
    -------------------------------------------------- */
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        OR: [{ isRevoked: true }, { expiresAt: { lt: new Date() } }],
      },
    });

    /* --------------------------------------------------
       Response + cookies
    -------------------------------------------------- */

    const res = createResponse(
      {
        message: 'Token refreshed successfully',
        user: {
          id: user.id,
          role: user.role,
        },
      },
      200
    );

    setAuthCookies(
      res,
      newAccessToken,
      newRefreshToken,
      ACCESS_TOKEN_EXPIRES,
      REFRESH_TOKEN_EXPIRES
    );

    return res;
  } catch (err) {
    console.error('Refresh error', err);
    return createResponse({ error: 'Internal server error' }, 500);
  }
}
