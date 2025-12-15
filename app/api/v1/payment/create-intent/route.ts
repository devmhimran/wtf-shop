import { catchAsyncNext } from '@/lib/catch-async';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { amount, email, metadata } = await req.json();

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
