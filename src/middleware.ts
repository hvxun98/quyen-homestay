// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth', // nếu có endpoint auth
  '/favicon.ico'
];
const isPublic = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p)) ||
  pathname.startsWith('/_next') ||
  pathname.startsWith('/images') ||
  pathname.startsWith('/assets');

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  // Chỉ protect các route app
  const token =
    req.cookies.get('__Secure-next-auth.session-token')?.value ||
    req.cookies.get('__Host-next-auth.session-token')?.value ||
    req.cookies.get('next-auth.session-token')?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname); // để login xong quay lại
    return NextResponse.redirect(url);
  }

  // TODO: (tuỳ) validate token decode/exp ở đây nếu muốn
  return NextResponse.next();
}

// Chỉ match các trang app, tránh đụng file tĩnh
export const config = {
  matcher: ['/((?!_next|images|assets|favicon.ico).*)']
};
