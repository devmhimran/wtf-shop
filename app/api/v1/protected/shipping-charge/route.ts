import { Prisma } from '@/generated/prisma/client';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

const shippingSchema = z
  .object({
    region: z.enum(['INSIDE_AU', 'OUTSIDE_AU'], {
      message: 'Region must be either INSIDE_AU or OUTSIDE_AU',
    }),
    minQty: z
      .number()
      .int()
      .min(1, { message: 'Minimum quantity must be at least 1' }),
    maxQty: z.number().int().min(1).optional(),
    baseCharge: z
      .number()
      .min(0, { message: 'Base charge must be a positive number' }),
    additionalChargePerItem: z.number().min(0).optional(),
    freeShipping: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => {
      if (data.maxQty !== undefined && data.maxQty <= data.minQty) {
        return false;
      }
      return true;
    },
    {
      message: 'Maximum quantity must be greater than minimum quantity',
      path: ['maxQty'],
    }
  );

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error } = await authenticateRequest(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const region = searchParams.get('region') || '';
  const freeShipping = searchParams.get('free_shipping') || '';
  const skip = (page - 1) * limit;

  const where: Prisma.ShippingChargeWhereInput = {};

  if (region && region !== 'all') {
    where.region = region as 'INSIDE_AU' | 'OUTSIDE_AU';
  }

  if (freeShipping && freeShipping !== 'all') {
    where.freeShipping = freeShipping === 'FREE_SHIPPING' ? true : false;
  }

  const [shippingCharges, totalCount] = await Promise.all([
    prisma.shippingCharge.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: limit,
    }),
    prisma.shippingCharge.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: shippingCharges,
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

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsedBody = shippingSchema.parse(body);
  const {
    region,
    minQty,
    maxQty,
    baseCharge,
    additionalChargePerItem,
    freeShipping,
  } = parsedBody;

  const shippingCharge = await prisma.shippingCharge.create({
    data: {
      region,
      minQty,
      maxQty,
      baseCharge,
      additionalChargePerItem,
      freeShipping,
    },
  });

  return NextResponse.json({ success: true, data: shippingCharge });
});
