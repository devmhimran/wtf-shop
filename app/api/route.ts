import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const res = NextResponse.json({
    date: new Date().toISOString(),
    message: 'Hello from the Whatthefunk API!',
  });
  res.headers.set('Access-Control-Allow-Origin', 'https://wtf-shop.vercel.app');
  res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res;
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set('Access-Control-Allow-Origin', 'https://wtf-shop.vercel.app');
  res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res;
}
