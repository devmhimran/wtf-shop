import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const termsAndConditions = await prisma.termsAndConditions.findFirst();

  return NextResponse.json({
    success: true,
    data: termsAndConditions,
  });
});

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, content, metaTitle, metaDescription, isActive } = body;

  const termsAndConditions = await prisma.termsAndConditions.upsert({
    where: { isSingleton: true },
    update: {
      title,
      content,
      metaTitle,
      metaDescription,
      isActive,
    },
    create: {
      isSingleton: true,
      title,
      content,
      metaTitle,
      metaDescription,
      isActive,
    },
  });

  return NextResponse.json({
    success: true,
    data: termsAndConditions,
    message: 'Terms and Conditions page saved successfully',
  });
});
