/**
 * In-Memory Rate Limiter
 * 
 * Simple sliding window rate limiter for API protection.
 * For production with multiple instances, consider using Redis (Upstash).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;   // Seconds until next request allowed
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // Default configs for different endpoints
  static readonly CONFIGS = {
    default: { windowMs: 60 * 1000, maxRequests: 100 },         // 100/min
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },        // 10/15min (login attempts)
    ai: { windowMs: 60 * 1000, maxRequests: 20 },               // 20/min (AI generations)
    webhook: { windowMs: 60 * 1000, maxRequests: 500 },         // 500/min (webhooks)
    upload: { windowMs: 60 * 1000, maxRequests: 10 },           // 10/min (file uploads)
    strict: { windowMs: 60 * 1000, maxRequests: 30 },           // 30/min (sensitive endpoints)
  } as const;

  constructor() {
    // Cleanup expired entries every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  /**
   * Check if request is allowed and update counter
   */
  check(key: string, config: RateLimitConfig = RateLimiter.CONFIGS.default): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    // No existing entry or window expired - allow and start new window
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Window still active
    if (entry.count < config.maxRequests) {
      entry.count++;
      return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt,
      };
    }

    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  /**
   * Get rate limit status without incrementing counter
   */
  peek(key: string, config: RateLimitConfig = RateLimiter.CONFIGS.default): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: now + config.windowMs,
      };
    }

    return {
      allowed: entry.count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetAt: entry.resetAt,
      retryAfter: entry.count >= config.maxRequests 
        ? Math.ceil((entry.resetAt - now) / 1000) 
        : undefined,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get current store size (for monitoring)
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy the limiter (cleanup interval)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Generate rate limit key from request
 */
export function getRateLimitKey(
  identifier: string,
  endpoint?: string
): string {
  if (endpoint) {
    return `${identifier}:${endpoint}`;
  }
  return identifier;
}

/**
 * Get client identifier from request
 * Priority: User ID > IP Address
 */
export function getClientIdentifier(
  userId?: string | null,
  ip?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (ip) {
    return `ip:${ip}`;
  }
  return 'anonymous';
}

/**
 * Get IP address from request headers
 */
export function getIPFromHeaders(headers: Headers): string | null {
  // Check common headers in order of reliability
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs; use the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return null;
}

export type { RateLimitConfig, RateLimitResult };
export { RateLimiter };

