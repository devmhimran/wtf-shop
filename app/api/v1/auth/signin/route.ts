import { NextRequest, NextResponse } from 'next/server';

import { comparePassword } from '@/lib/bcrypt';
import {
  ACCESS_TOKEN_EXPIRES,
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_EXPIRES,
} from '@/lib/jwt';
import { prisma } from '@/prisma/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.isDelete) {
      return NextResponse.json(
        { error: 'Your account has been deleted' },
        { status: 403 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account is not active. Please contact support' },
        { status: 403 }
      );
    }

    const accessToken = await generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const res = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        role: user.role,
      },
    });

    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_EXPIRES,
    });

    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRES,
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
