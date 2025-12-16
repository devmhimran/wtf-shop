import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import { $Enums, Prisma } from '@/generated/prisma/client';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const orderStatus = searchParams.get('status') || '';
  const deliveryMethod = searchParams.get('deliveryMethod') || '';

  const year = searchParams.get('year') || '';
  const month = searchParams.get('month') || '';
  const date = searchParams.get('date') || '';

  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const buildDayRange = (d: Date): Prisma.DateTimeFilter => ({
    gte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
    lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
  });

  const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
    gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
    lte: new Date(y, m, 0, 23, 59, 59, 999),
  });

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  // Build where clause
  const whereCondition: Prisma.OrderWhereInput[] = [];

  // Search by email, stripeId, or orderId
  if (search) {
    whereCondition.push({
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { stripeId: { contains: search, mode: 'insensitive' } },
        { orderId: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  // Filter by status
  if (orderStatus) {
    whereCondition.push({
      status: orderStatus as $Enums.OrderStatus,
    });
  }

  // Filter by delivery method
  if (deliveryMethod) {
    whereCondition.push({
      deliveryMethod: deliveryMethod as $Enums.DeliveryMethod,
    });
  }

  if (date) {
    // Specific date
    const filterDate = new Date(date);
    if (!isNaN(filterDate.getTime())) {
      whereCondition.push({
        createdAt: buildDayRange(filterDate),
      });
    }
  } else if (month && year) {
    // Month + Year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      whereCondition.push({
        createdAt: buildMonthRange(yearNum, monthNum),
      });
    }
  } else if (month) {
    // Month only - across multiple years
    const monthNum = parseInt(month);
    if (monthNum >= 1 && monthNum <= 12) {
      const currentYear = new Date().getFullYear();
      const years = [
        currentYear - 2,
        currentYear - 1,
        currentYear,
        currentYear + 1,
        currentYear + 2,
      ];

      // Create OR condition for month across multiple years
      whereCondition.push({
        OR: years.map((y) => ({
          createdAt: buildMonthRange(y, monthNum),
        })),
      });
    }
  } else if (year) {
    // Year only
    const yearNum = parseInt(year);
    if (yearNum > 0) {
      whereCondition.push({
        createdAt: {
          gte: new Date(yearNum, 0, 1, 0, 0, 0, 0),
          lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
        },
      });
    }
  }

  const where: Prisma.OrderWhereInput = whereCondition.length
    ? { AND: whereCondition }
    : {};

  // Get orders with selected fields only
  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        orderId: true,
        email: true,
        status: true,
        paymentStatus: true,
        deliveryMethod: true,
        stripeId: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    message: 'Orders fetched successfully',
    data: orders,
    meta: {
      count: orders.length,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});
