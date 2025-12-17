import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/user-dashboard',
  '/user-profile',
  '/settings',
  '/story-creation-studio',
  '/personalization-studio',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/authentication', '/auth'];

// API rate limiting config
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // requests per window
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Add rate limit headers
    const response = await updateSession(request);
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT.maxRequests));
    response.headers.set('X-RateLimit-Window', String(RATE_LIMIT.windowMs));

    return response;
  }

  // Update Supabase session and get response
  const response = await updateSession(request);

  // Check authentication for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Get auth status from cookies (session refresh happens in updateSession)
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.includes('auth-token') || cookie.name.includes('sb-')
  );

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !hasAuthCookie) {
    const loginUrl = new URL('/authentication', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && hasAuthCookie) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/user-dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Add Netlify-specific headers for edge caching
  if (process.env.NETLIFY) {
    // Cache public pages at edge
    if (!isProtectedRoute && !pathname.startsWith('/api/')) {
      response.headers.set(
        'Netlify-CDN-Cache-Control',
        'public, max-age=0, stale-while-revalidate=60'
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};
