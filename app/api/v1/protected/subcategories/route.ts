import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';

// GET all subcategories
export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error } = await authenticateRequest(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const where: {
    OR?: Array<{
      name?: { contains: string; mode: 'insensitive' };
      slug?: { contains: string; mode: 'insensitive' };
    }>;
    categoryId?: number;
  } = {};

  if (search) {
    where.OR = [
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
    ];
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  const [subcategories, totalCount] = await Promise.all([
    prisma.subCategory.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
    prisma.subCategory.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: subcategories,
    meta: {
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

// POST - Create new subcategory
export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  // Only ADMIN and SUPER_ADMIN can create subcategories
  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, slug, categoryId } = body;

  if (!name || !slug || !categoryId) {
    return NextResponse.json(
      { error: 'Subcategory name, slug, and categoryId are required' },
      { status: 400 }
    );
  }

  const subcategory = await prisma.subCategory.create({
    data: {
      name,
      slug,
      categoryId: Number(categoryId),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory,
    },
    { status: 201 }
  );
});
