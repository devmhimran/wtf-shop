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

export const PATCH = catchAsyncNext(
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

    const body = await req.json();
    const { status } = body;

    // Validate status
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPING',
      'COMPLETED',
      'CANCELLED',
      'RETURNED',
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Invalid order status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: { status },
      select: {
        id: true,
        orderId: true,
        email: true,
        status: true,
        paymentStatus: true,
        deliveryMethod: true,
        total: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  }
);
