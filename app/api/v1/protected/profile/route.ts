import { hashPassword } from '@/lib/bcrypt';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const PUT = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  const body = await req.json();

  const updatedData: {
    name?: string;
    updatedAt: Date;
    password?: string;
  } = {
    updatedAt: new Date(),
  };

  if (body.name) {
    updatedData['name'] = body.name;
  }
  if (body.password) {
    const hashedPassword = await hashPassword(body.password);
    updatedData['password'] = hashedPassword;
  }

  const updateUser = await prisma.user.update({
    where: { id: payload.userId },
    data: updatedData,
  });

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
      updatedAt: updateUser.updatedAt,
    },
  });
});
