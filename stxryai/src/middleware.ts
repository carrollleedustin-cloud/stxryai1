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

  // Update Supabase session and get response with user info
  const { response, user } = await updateSession(request);

  // Rate limiting for API routes (early return, API routes handle their own auth)
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT.maxRequests));
    response.headers.set('X-RateLimit-Window', String(RATE_LIMIT.windowMs));
    return response;
  }

  // Check authentication for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Check if user is authenticated
  const hasValidSession = !!user;

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !hasValidSession) {
    const loginUrl = new URL('/authentication', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && hasValidSession) {
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
