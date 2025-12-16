import { catchAsyncNext } from '@/lib/catch-async';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/prisma/prisma';

const stripe = new Stripe(process.env.NEXT_PUBLIC_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { amount, email, metadata, items } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { success: false, message: 'Valid amount is required' },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { success: false, message: 'Email is required' },
      { status: 400 }
    );
  }

  // Check product availability if items are provided
  if (items && Array.isArray(items) && items.length > 0) {
    const unavailableItems: string[] = [];
    const availabilityCheck = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: {
          quantity: true,
          color: { select: { name: true } },
          size: { select: { name: true } },
          product: { select: { title: true } },
        },
      });

      if (!variant) {
        unavailableItems.push(
          `Product variant not found for ${item.color} - ${item.size}`
        );
        availabilityCheck.push({
          productId: item.productId,
          variantId: item.variantId,
          color: item.color,
          size: item.size,
          requested: item.quantity,
          available: 0,
          status: 'not_found',
        });
      } else if (variant.quantity < item.quantity) {
        unavailableItems.push(
          `Insufficient stock for ${variant.product?.title || 'Product'} (${
            variant.color?.name || item.color
          } - ${variant.size?.name || item.size}). Requested: ${
            item.quantity
          }, Available: ${variant.quantity}`
        );
        availabilityCheck.push({
          productId: item.productId,
          variantId: item.variantId,
          color: variant.color?.name || item.color,
          size: variant.size?.name || item.size,
          title: variant.product?.title || 'Product',
          requested: item.quantity,
          available: variant.quantity,
          status: 'insufficient',
        });
      } else {
        availabilityCheck.push({
          productId: item.productId,
          variantId: item.variantId,
          color: variant.color?.name || item.color,
          size: variant.size?.name || item.size,
          title: variant.product?.title || 'Product',
          requested: item.quantity,
          available: variant.quantity,
          status: 'available',
        });
      }
    }

    // If there are unavailable items, return error with details
    if (unavailableItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Some items are not available',
          errors: unavailableItems,
          availabilityCheck,
        },
        { status: 400 }
      );
    }
  }

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'aud',
      receipt_email: email,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create payment intent',
      },
      { status: 500 }
    );
  }
});
