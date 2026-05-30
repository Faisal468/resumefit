import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Exact matches or prefix matches for public routes
const AUTH_ONLY_PREFIXES = ['/dashboard', '/export', '/diff', '/templates'];
// /blog is fully public — no auth needed
const AUTH_REDIRECTS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isAuthPage = AUTH_REDIRECTS.some(p => pathname.startsWith(p));
  const isProtected = AUTH_ONLY_PREFIXES.some(p => pathname.startsWith(p));

  // Redirect logged-in users away from login/register
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
