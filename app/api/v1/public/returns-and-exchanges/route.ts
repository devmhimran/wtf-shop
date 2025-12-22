import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextResponse } from 'next/server';

export const GET = catchAsyncNext(async () => {
  const returnsAndExchanges = await prisma.returnsAndExchanges.findFirst();

  return NextResponse.json({
    success: true,
    data: returnsAndExchanges,
  });
});
