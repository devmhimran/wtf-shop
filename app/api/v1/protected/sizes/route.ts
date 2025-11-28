import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import * as z from 'zod';

const sizeSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long' }),
});

// GET all sizes
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

  const [sizes, totalCount] = await Promise.all([
    prisma.size.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: limit,
    }),
    prisma.size.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: sizes,
    meta: {
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

// POST - Create new size
export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  // Only ADMIN and SUPER_ADMIN can create sizes
  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsedBody = sizeSchema.parse(body);
  const { name } = parsedBody;

  if (!name) {
    return NextResponse.json(
      { error: 'Size name is required' },
      { status: 400 }
    );
  }

  const size = await prisma.size.create({
    data: {
      name,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Size created successfully',
      data: size,
    },
    { status: 201 }
  );
});
