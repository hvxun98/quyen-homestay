import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Domain } from './config';

export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const rawHost = req.headers.get('host') || '';
  const hostname = rawHost.split(':')[0];
  const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL || '';
  const parts = extractUrlParts(apiUrl);
  const sl = hostname.split('.')[0];
  const slugCompany = !apiUrl?.includes(sl) && sl !== 'localhost' ? hostname.split('.')[0] : '';
  if (!parts.length) return response;

  const mainDomain = parts.slice(-2).join('.');
  const adminDomain = parts.slice(1).join('.');

  let domainType = Domain.main;

  switch (hostname) {
    case mainDomain:
      domainType = Domain.main;
      break;
    case adminDomain:
      domainType = Domain.admin;
      break;
    default:
      domainType = Domain.company;
      break;
  }

  response.cookies.set('slugCompany', slugCompany);
  response.cookies.set('domainType', domainType, { path: '/' });

  return response;
}

function extractUrlParts(url: string): string[] {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.');
  } catch (error) {
    console.error('Invalid URL:', error);
    return [];
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets).*)'
  ]
};
