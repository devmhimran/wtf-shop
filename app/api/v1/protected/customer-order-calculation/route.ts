import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  if (payload.role !== 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const findUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!findUser?.email) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const whereCondition = {
    email: findUser.email,
  };

  // Calculate monthly spending (last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Execute all queries in parallel
  const [aggregations, activeOrdersCount, completedOrdersCount, monthlyOrders] =
    await Promise.all([
      // Main aggregations
      prisma.order.aggregate({
        where: whereCondition,
        _count: { id: true },
        _sum: { total: true, shippingCost: true },
        _avg: { total: true },
      }),
      // Active orders count
      prisma.order.count({
        where: {
          ...whereCondition,
          status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'] },
        },
      }),
      // Completed orders count
      prisma.order.count({
        where: {
          ...whereCondition,
          status: { in: ['COMPLETED', 'DELIVERED'] },
        },
      }),
      // Orders from last 6 months for monthly spending
      prisma.order.findMany({
        where: {
          ...whereCondition,
          createdAt: { gte: sixMonthsAgo },
        },
        select: {
          total: true,
          createdAt: true,
        },
      }),
    ]);

  // Calculate monthly spending from fetched orders
  const monthlySpending = monthlyOrders.reduce((acc, order) => {
    const monthYear = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
    acc[monthYear] = Number(((acc[monthYear] || 0) + order.total).toFixed(2));
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    success: true,
    message: 'Order calculations fetched successfully',
    data: {
      summary: {
        totalOrders: aggregations._count.id,
        totalSpent: Number((aggregations._sum.total || 0).toFixed(2)),
        averageOrderValue: Number((aggregations._avg.total || 0).toFixed(2)),
        totalShippingPaid: Number(
          (aggregations._sum.shippingCost || 0).toFixed(2)
        ),
        activeOrdersCount,
        completedOrdersCount,
      },
      monthlySpending,
    },
  });
});
