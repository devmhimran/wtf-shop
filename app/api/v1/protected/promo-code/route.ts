import { Prisma } from '@/generated/prisma/client';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

const promoCodeSchema = z
  .object({
    code: z
      .string()
      .min(3, { message: 'Code must be at least 3 characters long' })
      .max(50, { message: 'Code must not exceed 50 characters' })
      .regex(/^[A-Z0-9_-]+$/, {
        message:
          'Code must contain only uppercase letters, numbers, hyphens, and underscores',
      }),
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters long' })
      .max(100, { message: 'Title must not exceed 100 characters' }),
    amount: z.number().int().min(1, { message: 'Amount must be at least 1' }),
    startDate: z
      .string()
      .min(1, { message: 'Start date is required' })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid start date format',
      }),
    endDate: z
      .string()
      .min(1, { message: 'End date is required' })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid end date format',
      }),
  })
  .strict()
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error } = await authenticateRequest(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';
  const isActive = searchParams.get('is_active');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const whereConditions: Prisma.PromoCodeWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (startDate) {
    whereConditions.push({
      startDate: { gte: new Date(startDate) },
    });
  }

  if (endDate) {
    whereConditions.push({
      endDate: { lte: new Date(endDate) },
    });
  }

  if (isActive !== null && isActive !== undefined) {
    const now = new Date();
    if (isActive === 'true') {
      whereConditions.push({
        startDate: { lte: now },
        endDate: { gte: now },
      });
    } else if (isActive === 'false') {
      whereConditions.push({
        OR: [{ startDate: { gt: now } }, { endDate: { lt: now } }],
      });
    }
  }

  const where: Prisma.PromoCodeWhereInput = whereConditions.length
    ? { AND: whereConditions }
    : {};

  const [promoCodes, totalCount] = await Promise.all([
    prisma.promoCode.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: limit,
    }),
    prisma.promoCode.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: promoCodes,
    meta: {
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  // Only ADMIN and SUPER_ADMIN can create promo codes
  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsedBody = promoCodeSchema.parse(body);

  const { code, title, amount, startDate, endDate } = parsedBody;

  // Check if promo code already exists
  const existingPromoCode = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (existingPromoCode) {
    return NextResponse.json(
      { error: 'Promo code already exists' },
      { status: 400 }
    );
  }

  const promoCode = await prisma.promoCode.create({
    data: {
      code,
      title,
      amount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Promo code created successfully',
      data: promoCode,
    },
    { status: 201 }
  );
});
