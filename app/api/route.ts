import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    date: new Date().toISOString(),
    message: 'Hello from the Whatthefunk API!',
  });
}
