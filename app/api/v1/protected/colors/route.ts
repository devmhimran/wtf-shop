import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';

// GET all colors
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
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }
    : {};

  const [colors, totalCount] = await Promise.all([
    prisma.color.findMany({
      where,
      orderBy: { id: 'asc' },
      skip,
      take: limit,
    }),
    prisma.color.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: colors,
    meta: {
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

// POST - Create new color
export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  // Only ADMIN and SUPER_ADMIN can create colors
  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, hex } = body;

  if (!name) {
    return NextResponse.json(
      { error: 'Color name is required' },
      { status: 400 }
    );
  }

  const color = await prisma.color.create({
    data: {
      name,
      hex: hex || null,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Color created successfully',
      data: color,
    },
    { status: 201 }
  );
});
