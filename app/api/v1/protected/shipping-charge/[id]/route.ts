import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

type RouteParams = {
  id: string;
};

const shippingSchema = z
  .object({
    region: z
      .enum(['INSIDE_AU', 'OUTSIDE_AU'], {
        message: 'Region must be either INSIDE_AU or OUTSIDE_AU',
      })
      .optional(),
    minQty: z
      .number()
      .int()
      .min(1, { message: 'Minimum quantity must be at least 1' })
      .optional(),
    maxQty: z.number().int().min(1).optional(),
    baseCharge: z
      .number()
      .min(0, { message: 'Base charge must be a positive number' })
      .optional(),
    additionalChargePerItem: z.number().min(0).optional(),
    freeShipping: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (
        data.minQty !== undefined &&
        data.maxQty !== undefined &&
        data.maxQty <= data.minQty
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Maximum quantity must be greater than minimum quantity',
      path: ['maxQty'],
    }
  );

export const DELETE = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: shippingChargeId } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const id = Number(shippingChargeId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid shipping charge ID' },
        { status: 400 }
      );
    }

    await prisma.shippingCharge.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Shipping charge deleted successfully',
    });
  }
);

export const PUT = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: shippingChargeId } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const id = Number(shippingChargeId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid shipping charge ID' },
        { status: 400 }
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

    const shippingCharge = await prisma.shippingCharge.update({
      where: { id },
      data: {
        region,
        minQty,
        maxQty,
        baseCharge,
        additionalChargePerItem,
        freeShipping,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Shipping charge updated successfully',
        data: shippingCharge,
      },
      { status: 200 }
    );
  }
);
