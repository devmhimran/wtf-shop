import { catchAsyncNext } from '@/lib/catch-async';
import { NextRequest, NextResponse } from 'next/server';

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const formData = await req.formData();

  const jsonData = formData.get('data') as string;

  if (!jsonData) {
    return NextResponse.json(
      { success: false, message: 'Order data is required' },
      { status: 400 }
    );
  }

  const { name, email, phone, address, country, state, items } =
    JSON.parse(jsonData);

  // Validation
  if (!email || !items || items.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Email and items are required' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: 'Order received successfully' },
    { status: 200 }
  );
});
