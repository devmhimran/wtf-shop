import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';

type RouteParams = {
  id: string;
};

// GET single size
export const GET = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    const { error } = await authenticateRequest(req);
    if (error) return error;

    if (!context?.params) throw new Error('Missing params');
    const { id } = await context.params;

    if (isNaN(+id)) {
      return NextResponse.json({ error: 'Invalid size ID' }, { status: 400 });
    }

    const size = await prisma.size.findUnique({
      where: { id: +id },
    });

    if (!size) {
      return NextResponse.json({ error: 'Size not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: size,
    });
  }
);

// PUT - Update size
export const PUT = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const idNumber = Number(id);
    if (isNaN(idNumber)) {
      return NextResponse.json({ error: 'Invalid size ID' }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Size name is required' },
        { status: 400 }
      );
    }

    const size = await prisma.size.update({
      where: { id: idNumber },
      data: { name },
    });

    return NextResponse.json({
      success: true,
      message: 'Size updated successfully',
      data: size,
    });
  }
);

// DELETE size
export const DELETE = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const idNumber = Number(id);

    if (isNaN(idNumber)) {
      return NextResponse.json({ error: 'Invalid size ID' }, { status: 400 });
    }

    await prisma.size.delete({
      where: { id: idNumber },
    });

    return NextResponse.json({
      success: true,
      message: 'Size deleted successfully',
    });
  }
);
