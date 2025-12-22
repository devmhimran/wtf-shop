import { catchAsyncNext } from '@/lib/catch-async';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import { authenticateRequest } from '@/lib/utils';
import { Prisma } from '@/generated/prisma/client';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  // Build date filter for orders based on year and month
  let dateFilter: Prisma.DateTimeFilter | undefined;

  if (yearParam && monthParam) {
    const year = parseInt(yearParam);
    const month = parseInt(monthParam);

    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      dateFilter = {
        gte: new Date(year, month - 1, 1, 0, 0, 0, 0),
        lte: new Date(year, month, 0, 23, 59, 59, 999),
      };
    }
  } else if (yearParam) {
    const year = parseInt(yearParam);

    if (!isNaN(year)) {
      dateFilter = {
        gte: new Date(year, 0, 1, 0, 0, 0, 0),
        lte: new Date(year, 11, 31, 23, 59, 59, 999),
      };
    }
  }

  const [totalProducts, totalOrders, totalCustomers, salesData] =
    await Promise.all([
      prisma.product.count({
        where: {
          isDelete: false,
          //   ...(dateFilter && { createdAt: dateFilter }),
        },
      }),

      prisma.order.count({
        where: {
          ...(dateFilter && { createdAt: dateFilter }),
        },
      }),

      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          isDelete: false,
          ...(dateFilter && { createdAt: dateFilter }),
        },
      }),

      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          paymentStatus: 'PAID',
          ...(dateFilter && { createdAt: dateFilter }),
        },
      }),
    ]);

  const totalSales = salesData._sum.total || 0;

  return NextResponse.json({
    success: true,
    message: 'Dashboard calculations fetched successfully',
    data: {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalSales,
    },
  });
});
