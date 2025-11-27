import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';

// GET all categories
export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error } = await authenticateRequest(req);
  if (error) return error;

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

// POST - Create new category
export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  // Only ADMIN and SUPER_ADMIN can create categories
  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, slug } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: 'Category name and slug are required' },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Category created successfully',
      data: category,
    },
    { status: 201 }
  );
});
