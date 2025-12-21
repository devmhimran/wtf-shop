import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');

  const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 10;

  const recentOrders = await prisma.order.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      orderId: true,
      email: true,
      status: true,
      paymentStatus: true,
      deliveryMethod: true,
      total: true,
      subtotal: true,
      shippingCost: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      orders: recentOrders,
      count: recentOrders.length,
    },
  });
});
