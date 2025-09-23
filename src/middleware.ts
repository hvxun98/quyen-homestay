import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const access = req.headers.get('authorization')?.replace('Bearer ', '');
  const url = req.nextUrl;
  if (url.pathname.startsWith('/dashboard')) {
    if (!access) return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/dashboard/:path*'] };
