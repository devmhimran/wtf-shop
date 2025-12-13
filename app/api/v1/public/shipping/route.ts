import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { quantity, region } = await req.json();

  if (!quantity || quantity < 1) {
    return NextResponse.json(
      { success: false, message: 'Valid quantity is required' },
      { status: 400 }
    );
  }

  if (!region || !['INSIDE_AU', 'OUTSIDE_AU'].includes(region)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Valid region is required (INSIDE_AU or OUTSIDE_AU)',
      },
      { status: 400 }
    );
  }

  // Find applicable shipping charge based on quantity and region
  const shippingCharge = await prisma.shippingCharge.findFirst({
    where: {
      region: region,
      minQty: {
        lte: quantity,
      },
      OR: [
        {
          maxQty: {
            gte: quantity,
          },
        },
        {
          maxQty: null,
        },
      ],
    },
    orderBy: {
      minQty: 'desc',
    },
  });

  if (!shippingCharge) {
    return NextResponse.json(
      {
        success: false,
        message: 'No shipping charge found for this quantity and region',
      },
      { status: 404 }
    );
  }

  // Calculate total shipping cost
  let totalShippingCost = shippingCharge.baseCharge;

  // Add additional charge per item if applicable
  if (shippingCharge.additionalChargePerItem) {
    const additionalItems = quantity - shippingCharge.minQty;
    if (additionalItems > 0) {
      totalShippingCost +=
        additionalItems * shippingCharge.additionalChargePerItem;
    }
  }

  // Check if free shipping applies
  if (shippingCharge.freeShipping) {
    totalShippingCost = 0;
  }

  return NextResponse.json({
    success: true,
    message: 'Shipping cost calculated successfully',
    data: {
      region: shippingCharge.region,
      quantity: quantity,
      baseCharge: shippingCharge.baseCharge,
      additionalChargePerItem: shippingCharge.additionalChargePerItem,
      freeShipping: shippingCharge.freeShipping,
      totalShippingCost: totalShippingCost,
      minQty: shippingCharge.minQty,
      maxQty: shippingCharge.maxQty,
    },
  });
});
