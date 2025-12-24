import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const body = await req.json();
  const { email, code } = body;

  const otpRecord = await prisma.forgotPassword.findUnique({
    where: {
      code: code.toString(),
      is_valid: true,
      email,
    },
  });

  if (!otpRecord) {
    throw new Error('Invalid or expired verification code');
  }

  const now = new Date();
  const codeCreatedAt = new Date(otpRecord.createdAt);
  const timeDifferenceInMinutes =
    (now.getTime() - codeCreatedAt.getTime()) / (1000 * 60);

  if (timeDifferenceInMinutes > 15) {
    await prisma.forgotPassword.update({
      where: { id: otpRecord.id },
      data: { is_valid: false },
    });
    throw new Error('Verification code has expired. Please request a new one.');
  }

  return NextResponse.json({
    success: true,
    message: 'Verification code confirmed successfully',
    codeId: otpRecord.id,
  });
});
