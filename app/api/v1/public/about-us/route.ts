import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextResponse } from 'next/server';

export const GET = catchAsyncNext(async () => {
  const aboutUs = await prisma.aboutUs.findFirst();

  return NextResponse.json({
    success: true,
    message: 'About Us page fetched successfully',
    data: aboutUs,
  });
});
