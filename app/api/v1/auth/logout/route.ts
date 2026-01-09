export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import { createResponse, setAuthCookies } from '@/lib/auth-response';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });
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
