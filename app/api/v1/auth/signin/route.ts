import { NextRequest } from 'next/server';
import { prisma } from '@/prisma/prisma';
import { comparePassword } from '@/lib/bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from '@/lib/jwt';
import { createResponse, setAuthCookies } from '@/lib/auth-reponse';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return createResponse({ error: 'Missing required fields' }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      !user.password ||
      !(await comparePassword(password, user.password))
    ) {
      return createResponse(
        { error: 'The email or password you entered is incorrect' },
        401
      );
    }

    if (user.isDelete) {
      return createResponse({ error: 'Your account has been deleted' }, 403);
    }

    if (!user.isActive) {
      return createResponse(
        { error: 'Your account is not active. Contact support.' },
        403
      );
    }

    const accessToken = await generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const res = createResponse(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          role: user.role,
        },
      },
      200
    );

    setAuthCookies(
      res,
      accessToken,
      refreshToken,
      ACCESS_TOKEN_EXPIRES,
      REFRESH_TOKEN_EXPIRES
    );

    return res;
  } catch (error) {
    console.error(error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
}
