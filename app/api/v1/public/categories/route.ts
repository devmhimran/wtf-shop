import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            slug: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }
    : {};

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: limit,
      include: {
        image: true,
        _count: {
          select: {
            subcategories: true,
            products: true,
          },
        },
      },
    }),
    prisma.category.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: categories,
    meta: {
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});
