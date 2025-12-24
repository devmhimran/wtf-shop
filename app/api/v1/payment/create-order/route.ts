import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { generateOrderId } from '@/lib/generate-order-id';
import imagekit from '@/lib/image-kit';
import { transporter } from '@/lib/mailer';
import { orderAdminEmailTemplate, orderEmailTemplate } from '@/lib/utils';

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
  try {
    const formData = await req.formData();

    const jsonData = formData.get('data') as string;

    if (!jsonData) {
      return NextResponse.json(
        { success: false, message: 'Order data is required' },
        { status: 400 }
      );
    }

    const {
      email,
      phone,
      address,
      state,
      postalCode,
      country,
      deliveryMethod,
      items,
      subtotal,
      shippingCost,
      total,
      stripeId,
      paymentStatus,
    } = JSON.parse(jsonData);

    // Validation
    if (!email || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email and items are required' },
        { status: 400 }
      );
    }

    if (deliveryMethod === 'SHIPPING' && (!address || !country)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Shipping address is required for delivery',
        },
        { status: 400 }
      );
    }

    const orderId = await generateOrderId();

    // Check inventory availability for all items before processing
    const unavailableItems: string[] = [];
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: {
          quantity: true,
          color: { select: { name: true } },
          size: { select: { name: true } },
        },
      });

      if (!variant) {
        unavailableItems.push(
          `Product variant (Color: ${item.color}, Size: ${item.size}) not found`
        );
      } else if (variant.quantity < item.quantity) {
        unavailableItems.push(
          `Insufficient stock for ${item.color} / ${item.size.toUpperCase()}: ${
            variant.quantity
          } available, ${item.quantity} requested`
        );
      }
    }

    if (unavailableItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Some items are out of stock or have insufficient quantity',
          errors: unavailableItems,
        },
        { status: 400 }
      );
    }

    // Process custom images for each item
    const processedItems = await Promise.all(
      items.map(async (item: OrderItem, itemIndex: number) => {
        let uploadedImages: {
          imageUrl: string;
          imageName: string;
          note: string;
        }[] = [];

        if (item.customImages && item.customImages.length > 0) {
          // Get custom image files from formData
          const imageFiles: File[] = [];
          formData.forEach((value, key) => {
            if (
              key.startsWith(`customImages_${itemIndex}_`) &&
              value instanceof File
            ) {
              imageFiles.push(value);
            }
          });

          // Upload each image to ImageKit
          uploadedImages = await Promise.all(
            imageFiles.map(async (file, fileIndex) => {
              const buffer = Buffer.from(await file.arrayBuffer());

              // Ensure fileName is provided
              const fileName =
                file.name ||
                item.customImages?.[fileIndex]?.imageName ||
                `custom-image-${Date.now()}-${fileIndex}.jpg`;

              const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: fileName,
                folder:
                  process.env.IMAGE_KIT_CUSTOMIZE_FOLDER_NAME ||
                  'custom-what_the_funk_custom_orders',
                useUniqueFileName: true,
              });

              return {
                imageUrl: uploadResponse.url,
                imageName: uploadResponse.name,
                note: item.customImages?.[fileIndex]?.note || '',
              };
            })
          );
        }

        return {
          productId: item.productId,
          variantId: item.variantId,
          color: item.color,
          size: item.size,
          printSide: item.printSide,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          customNote: item.customNote || null,
          customImages: uploadedImages.length
            ? {
                create: uploadedImages,
              }
            : undefined,
        };
      })
    );

    // Create order with items and reduce variant quantities
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
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
          subtotal,
          shippingCost: shippingCost || 0,
          total,
          items: {
            create: processedItems,
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

      // Reduce quantity from product variants
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    try {
      await transporter.sendMail({
        from: `"What The Funk" <${process.env.GMAIL_USER}>`,
        to: order.email,
        subject: `Order Confirmation — ${order.orderId}`,
        html: orderEmailTemplate(order),
      });

      await transporter.sendMail({
        from: `"What The Funk Orders" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `New Order Received — ${order.orderId}`,
        html: orderAdminEmailTemplate(order),
      });
    } catch (err) {
      console.error('Order email failed:', err);
    }

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
