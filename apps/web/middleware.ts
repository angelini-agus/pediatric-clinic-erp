import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * Next.js middleware — route protection (JWT auth) + role separation.
 *
 * Public routes: '/', '/login', '/register', '/turnos'.
 * If the JWT cookie is missing on a private route, the user is redirected to /login.
 *
 * Role separation:
 *  - PATIENT accounts live in /portal (never in the staff dashboard).
 *  - Staff accounts (ADMIN/DOCTOR/SECRETARY/SUPER_ADMIN) never enter /portal.
 *  - Authenticated users visiting /login go to their home (portal or dashboard).
 *
 * NOTE: the role is read from the (unverified) JWT payload only to route the
 * user — every API call re-validates the token server-side.
 */

const TOKEN_COOKIE_NAME = 'token';
// Routes accessible without authentication.
// '/' → public landing page
// '/login' → auth page
// '/register' → patient self-registration (staff is created by an admin)
// '/turnos' → future public patient portal
const PUBLIC_ROUTES = ['/', '/login', '/register', '/turnos'];

const PORTAL_HOME = '/portal';
const STAFF_HOME = '/dashboard';

/**
 * Decodes the JWT payload role without verifying the signature.
 * Routing-only helper: never trust it for authorization.
 */
function decodeRole(token: string): string | null {
  const segments = token.split('.');
  const payloadSegment = segments[1];

  if (segments.length !== 3 || payloadSegment === undefined || payloadSegment.length === 0) {
    return null;
  }

  try {
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const parsed: unknown = JSON.parse(atob(padded));

    if (typeof parsed === 'object' && parsed !== null && 'role' in parsed) {
      const { role } = parsed;
      return typeof role === 'string' ? role : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isPortalRoute = pathname === PORTAL_HOME || pathname.startsWith(`${PORTAL_HOME}/`);

  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const hasToken = Boolean(token);
  const role = token !== undefined ? decodeRole(token) : null;
  const isPatient = role === 'PATIENT';

  // Unauthenticated → redirect to login
  if (!isPublicRoute && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting /login → home according to their role
  if (pathname === '/login' && hasToken) {
    return NextResponse.redirect(new URL(isPatient ? PORTAL_HOME : STAFF_HOME, request.url));
  }

  // Patients never enter the staff area
  if (hasToken && isPatient && !isPortalRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL(PORTAL_HOME, request.url));
  }

  // Staff never enters the patient portal
  if (hasToken && role !== null && !isPatient && isPortalRoute) {
    return NextResponse.redirect(new URL(STAFF_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, API routes and static files.
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
