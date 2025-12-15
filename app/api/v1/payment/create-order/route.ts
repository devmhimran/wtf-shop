import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { generateOrderId } from '@/lib/generate-order-id';

interface CustomImage {
  imagePreview: string;
  imageName: string;
  note: string;
}

interface OrderItem {
  productId: number;
  variantId: number;
  color: string;
  size: string;
  printSide: string;
  quantity: number;
  price: number;
  total: number;
  customNote: string | null;
  customImages?: CustomImage[];
}

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const {
    email,
    phone,
    address,
    state,
    postalCode,
    country,
    deliveryMethod,
    items,
    subTotal,
    shippingCost,
    total,
    stripeId,
    paymentStatus,
  } = await req.json();

  // Validation
  if (!email || !items || items.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Email and items are required' },
      { status: 400 }
    );
  }

  if (deliveryMethod === 'SHIPPING' && (!address || !country)) {
    return NextResponse.json(
      { success: false, message: 'Shipping address is required for delivery' },
      { status: 400 }
    );
  }

  try {
    // Generate unique order ID
    const orderId = await generateOrderId();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderId,
        email,
        phone: phone || null,
        address: address || null,
        state: state || null,
        postalCode: postalCode || null,
        country: country || null,
        deliveryMethod: deliveryMethod || 'SHIPPING',
        status: 'PENDING',
        paymentStatus: paymentStatus || 'PAID',
        stripeId: stripeId || null,
        subTotal,
        shippingCost: shippingCost || 0,
        total,
        items: {
          create: items.map((item: OrderItem) => ({
            productId: item.productId,
            variantId: item.variantId,
            color: item.color,
            size: item.size,
            printSide: item.printSide,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            customNote: item.customNote || null,
            customImages: item.customImages?.length
              ? {
                  create: item.customImages.map((img: CustomImage) => ({
                    imageUrl: img.imagePreview,
                    imageName: img.imageName,
                    note: img.note,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            customImages: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.orderId,
        order,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    );
  }
});
