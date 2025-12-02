import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';

type RouteParams = {
  slug: string;
};

// GET single subcategory
export const GET = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');

    const { slug } = await context.params;
    const { error } = await authenticateRequest(req);
    if (error) return error;

    const slugValue = slug;
    if (!slugValue) {
      return NextResponse.json(
        { error: 'Invalid subcategory slug' },
        { status: 400 }
      );
    }

    const subcategory = await prisma.subCategory.findUnique({
      where: { slug: slugValue },
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
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subcategory,
    });
  }
);

// PUT - Update subcategory
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
        { error: 'Invalid subcategory slug' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, slug, categoryId } = body;

    const subcategory = await prisma.subCategory.update({
      where: { slug: slugValue },
      data: {
        name: name ?? '',
        slug: slug ?? '',
        categoryId: categoryId ? Number(categoryId) : null,
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

    return NextResponse.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subcategory,
    });
  }
);

// DELETE subcategory
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
        { error: 'Invalid subcategory slug' },
        { status: 400 }
      );
    }

    await prisma.subCategory.delete({
      where: { slug: slugValue },
    });

    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  }
);
