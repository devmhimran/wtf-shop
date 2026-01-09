export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/prisma/prisma';
import { createResponse, setAuthCookies } from '@/lib/auth-response';

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value;

    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        await prisma.user.update({
          where: { id: payload.userId },
          data: { refreshToken: null, refreshTokenUpdatedAt: null },
        });
      }
    }

    const res = createResponse({ message: 'Logged out successfully' }, 200);

    setAuthCookies(res, '', '', 0, 0);

    return res;
  } catch (err) {
    console.error('Logout error', err);
    return NextResponse.json({ message: 'Logged out' }, { status: 200 });
  }
}
