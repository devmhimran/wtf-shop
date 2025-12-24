import { hashPassword } from '@/lib/bcrypt';
import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const body = await req.json();
  const { code, newPassword, email } = body;

  const otpRecord = await prisma.forgotPassword.findUnique({
    where: {
      code: code.toString(),
      is_valid: true,
      email,
    },
  });

  if (!otpRecord) {
    throw new Error(
      'Your session has expired. Please request a new password reset.'
    );
  }

  await prisma.user.update({
    where: { email },
    data: { password: await hashPassword(newPassword) },
  });

  await prisma.forgotPassword.delete({
    where: { id: otpRecord.id },
  });

  return NextResponse.json({
    success: true,
    message: 'Password has been reset successfully',
  });
});
