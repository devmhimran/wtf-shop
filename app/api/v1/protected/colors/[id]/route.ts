import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';

type RouteParams = {
  id: string;
};

// GET single color
export const GET = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: colorId } = await context.params;

    const { error } = await authenticateRequest(req);
    if (error) return error;

    const id = Number(colorId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid color ID' }, { status: 400 });
    }

    const color = await prisma.color.findUnique({
      where: { id },
    });

    if (!color) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: color,
    });
  }
);

// PUT - Update color
export const PUT = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: colorId } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const id = Number(colorId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid color ID' }, { status: 400 });
    }

    const body = await req.json();
    const { name, hex } = body;

    const color = await prisma.color.update({
      where: { id: +id },
      data: {
        ...(name && { name }),
        ...(hex !== undefined && { hex }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Color updated successfully',
      data: color,
    });
  }
);

// DELETE color
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
      return NextResponse.json({ error: 'Invalid color ID' }, { status: 400 });
    }

    await prisma.color.delete({
      where: { id: idNumber },
    });

    return NextResponse.json({
      success: true,
      message: 'Color deleted successfully',
    });
  }
);
