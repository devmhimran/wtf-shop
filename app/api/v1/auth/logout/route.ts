export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import { createResponse, setAuthCookies } from '@/lib/auth-response';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      console.log({ storedToken });

      if (storedToken) {
        // 1. Revoke the current token
        await prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { isRevoked: true },
        });

        // 2. Clean up ALL revoked or expired tokens for this user
        await prisma.refreshToken.deleteMany({
          where: {
            userId: storedToken.userId,
            OR: [{ isRevoked: true }, { expiresAt: { lt: new Date() } }],
          },
        });
      }
    }

    const res = createResponse({ message: 'Logged out successfully' }, 200);

    // Clear cookies
    setAuthCookies(res, '', '', 0, 0);

    return res;
  } catch (err) {
    console.error('Logout error', err);
    return NextResponse.json({ message: 'Logged out' }, { status: 200 });
  }
}
