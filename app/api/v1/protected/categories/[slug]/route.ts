import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';

type RouteParams = {
  slug: string;
};

// GET single category
export const GET = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { slug } = await context.params;

    const { error } = await authenticateRequest(req);
    if (error) return error;

    const slugValue = slug;
    if (!slugValue) {
      return NextResponse.json(
        { error: 'Invalid category slug' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { slug: slugValue },
      include: {
        subcategories: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  }
);

// PUT - Update category
export const PUT = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { slug: slugValue } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!slugValue) {
      return NextResponse.json(
        { error: 'Invalid category slug' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, slug } = body;

    const category = await prisma.category.update({
      where: { slug: slugValue },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  }
);

// DELETE category
export const DELETE = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { slug: slugValue } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!slugValue) {
      return NextResponse.json(
        { error: 'Invalid category slug' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { slug: slugValue },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  }
);
