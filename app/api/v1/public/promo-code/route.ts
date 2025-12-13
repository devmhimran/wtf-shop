import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { promoCode } = await req.json();

  if (!promoCode) {
    return NextResponse.json(
      { success: false, message: 'Promo code is required' },
      { status: 400 }
    );
  }

  // Find promo code (case insensitive)
  const promo = await prisma.promoCode.findFirst({
    where: {
      code: {
        equals: promoCode,
        mode: 'insensitive',
      },
    },
  });

  if (!promo) {
    return NextResponse.json(
      { success: false, message: 'Invalid promo code' },
      { status: 404 }
    );
  }

  // Check if promo code is active (within date range)
  const now = new Date();
  const isActive = now >= promo.startDate && now <= promo.endDate;

  if (!isActive) {
    return NextResponse.json(
      {
        success: false,
        message: 'Promo code has expired or is not yet active',
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Promo code applied successfully',
    data: {
      code: promo.code,
      title: promo.title,
      amount: promo.amount,
      startDate: promo.startDate,
      endDate: promo.endDate,
    },
  });
});
