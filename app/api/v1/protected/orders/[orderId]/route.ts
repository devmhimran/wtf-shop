import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

type RouteParams = {
  orderId: string;
};

export const GET = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { orderId } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get order with all details
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                catalogId: true,
                productType: true,
                mainImage: {
                  select: {
                    id: true,
                    fileUrl: true,
                    fileName: true,
                    title: true,
                    alt: true,
                  },
                },
              },
            },
            // variant: {
            //   select: {
            //     id: true,
            //     price: true,
            //     quantity: true,
            //     color: {
            //       select: {
            //         id: true,
            //         name: true,
            //         hex: true,
            //       },
            //     },
            //     size: {
            //       select: {
            //         id: true,
            //         name: true,
            //       },
            //     },
            //   },
            // },
            customImages: {
              select: {
                id: true,
                imageUrl: true,
                imageName: true,
                note: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order details fetched successfully',
      data: order,
    });
  }
);
