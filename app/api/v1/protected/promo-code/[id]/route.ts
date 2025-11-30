import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = {
  id: string;
};

export const DELETE = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: promoCodeId } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const id = Number(promoCodeId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid promo code ID' },
        { status: 400 }
      );
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  }
);

export const PUT = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: promoCodeId } = await context.params;
    const { error, payload } = await authenticateRequest(req);
    if (error) return error;
    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }
    const id = Number(promoCodeId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid promo code ID' },
        { status: 400 }
      );
    }
    const body = await req.json();
    const { code, title, amount, startDate, endDate } = body;
    await prisma.promoCode.update({
      where: { id },
      data: {
        code,
        title,
        amount,
        startDate,
        endDate,
      },
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Promo code updated successfully',
      },
      { status: 200 }
    );
  }
);
