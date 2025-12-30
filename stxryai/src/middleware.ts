import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from './lib/supabase/middleware';
import { 
  rateLimiter, 
  getRateLimitKey, 
  getClientIdentifier, 
  getIPFromHeaders,
  RateLimiter
} from './lib/api/rate-limiter';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/user-dashboard',
  '/user-profile',
  '/settings',
  '/story-creation-studio',
  '/personalization-studio',
];

// Routes that require admin/moderator role
const ADMIN_ROUTES = ['/admin'];
// Routes that require owner role
const OWNER_ROUTES = ['/admin/owner-dashboard'];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/authentication', '/auth'];

// API endpoints with custom rate limits
const API_RATE_LIMITS: Record<string, keyof typeof RateLimiter.CONFIGS> = {
  '/api/auth': 'auth',
  '/api/ai': 'ai',
  '/api/narrative-engine': 'ai',
  '/api/character-sheet': 'ai',
  '/api/webhooks': 'webhook',
  '/api/share/card': 'strict',
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

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Skip rate limiting for webhooks from trusted sources (they have their own signature verification)
    const isWebhook = pathname.startsWith('/api/webhooks/');
    
    // Determine rate limit config based on endpoint
    let rateLimitConfig = RateLimiter.CONFIGS.default;
    for (const [prefix, configKey] of Object.entries(API_RATE_LIMITS)) {
      if (pathname.startsWith(prefix)) {
        rateLimitConfig = RateLimiter.CONFIGS[configKey];
        break;
      }
    }

    // Get client identifier
    const ip = getIPFromHeaders(request.headers);
    const clientId = getClientIdentifier(user?.id, ip);
    const rateLimitKey = getRateLimitKey(clientId, pathname.split('/').slice(0, 4).join('/'));

    // Check rate limit
    const result = rateLimiter.check(rateLimitKey, rateLimitConfig);

    // Set rate limit headers
    response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));

    // Block if rate limited (except webhooks which have their own protection)
    if (!result.allowed && !isWebhook) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
            'Retry-After': String(result.retryAfter),
          },
        }
      );
    }

    return response;
  }

  // Check authentication for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Check if user is authenticated
  const hasValidSession = !!user;

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !hasValidSession) {
    const loginUrl = new URL('/authentication', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check owner routes - requires authenticated owner
  const isOwnerRoute = OWNER_ROUTES.some((route) => pathname.startsWith(route));
  
  if (isOwnerRoute) {
    if (!hasValidSession) {
      return NextResponse.redirect(new URL('/authentication', request.url));
    }

    // Check owner status by querying user_profiles
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single();

    const isOwner = profile?.role === 'owner';

    if (!isOwner) {
      // Not an owner - redirect to home with error message
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }
  }

  // Check admin routes - requires authenticated admin/moderator/owner
  if (isAdminRoute) {
    if (!hasValidSession) {
      return NextResponse.redirect(new URL('/authentication', request.url));
    }

    // Check admin status by querying user_profiles
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin === true || 
                    profile?.role === 'admin' || 
                    profile?.role === 'moderator' ||
                    profile?.role === 'owner';

    if (!isAdmin) {
      // Not an admin - redirect to home with error message
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }
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
