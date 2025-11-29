import { NextResponse } from 'next/server';

export function applyBackendCookies(
  response: NextResponse,
  setCookieHeader: string | null
) {
  if (!setCookieHeader) return;

  // split multiple cookies properly
  const cookies = setCookieHeader.split(/,(?=[^ ;]+=)/);

  cookies.forEach((cookieStr) => {
    // match "name=value"
    const match = cookieStr.match(/([^=]+)=([^;]+)/);

    if (!match) return;

    const [, name, value] = match;

    if (!name || !value) return;

    response.cookies.set(name.trim(), value.trim(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  });
}
