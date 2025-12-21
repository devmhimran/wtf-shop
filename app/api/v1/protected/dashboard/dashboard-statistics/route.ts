import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get('year');

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  if (isNaN(year)) {
    return NextResponse.json(
      { error: 'Invalid year parameter' },
      { status: 400 }
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PAID',
      createdAt: {
        gte: new Date(year, 0, 1, 0, 0, 0, 0),
        lte: new Date(year, 11, 31, 23, 59, 59, 999),
      },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  const monthlyData = Array.from({ length: 12 }, (_, index) => ({
    month: new Date(year, index).toLocaleString('en-US', { month: 'short' }),
    monthNumber: index + 1,
    sales: 0,
    orderCount: 0,
  }));

  orders.forEach((order) => {
    const monthIndex = order.createdAt.getMonth();
    monthlyData[monthIndex].sales += order.total;
    monthlyData[monthIndex].orderCount += 1;
  });

  monthlyData.forEach((data) => {
    data.sales = Math.round(data.sales * 100) / 100;
  });

  return NextResponse.json({
    success: true,
    data: {
      year,
      monthlyData,
      totalSales: monthlyData.reduce((sum, month) => sum + month.sales, 0),
      totalOrders: monthlyData.reduce(
        (sum, month) => sum + month.orderCount,
        0
      ),
    },
  });
});
