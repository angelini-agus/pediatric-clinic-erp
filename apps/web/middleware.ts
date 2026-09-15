import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * Next.js middleware — route protection (JWT auth).
 *
 * Protects every private route (dashboard, etc.).
 * Public routes: '/', '/login', '/turnos' — accessible without a token.
 * If the JWT cookie is missing on a private route, the user is redirected to /login.
 * Authenticated users visiting /login are redirected to /dashboard.
 */

const TOKEN_COOKIE_NAME = 'token';
// Routes accessible without authentication.
// '/' → public landing page
// '/login' → auth page
// '/register' → patient self-registration (staff is created by an admin)
// '/turnos' → future public patient portal
const PUBLIC_ROUTES = ['/', '/login', '/register', '/turnos'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const hasToken = Boolean(request.cookies.get(TOKEN_COOKIE_NAME)?.value);

  // Unauthenticated → redirect to login
  if (!isPublicRoute && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting /login → redirect to dashboard
  // (Do NOT redirect from other public routes like '/' to avoid loops)
  if (pathname === '/login' && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, API routes and static files.
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
