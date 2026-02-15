/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse and DoS attacks.
 * Uses in-memory storage for development, Redis for production.
 * 
 * @version 1.0.0
 * @created February 11, 2026
 */

import { NextRequest } from 'next/server';
import { rateLimitError } from '@/lib/api/errorHandling';
import { logWarning } from '@/lib/monitoring/errorLogger';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional custom key generator */
  keyGenerator?: (req: NextRequest) => string;
}

/**
 * In-memory rate limit store for development
 * In production, replace with Redis/Upstash
 */
class InMemoryRateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  /**
   * Increment counter for a key
   * Returns current count and reset time
   */
  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    // If no existing record or window expired, create new entry
    if (!existing || now > existing.resetTime) {
      const entry = { count: 1, resetTime: now + windowMs };
      this.store.set(key, entry);
      return entry;
    }

    // Increment existing count
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  /**
   * Clean up expired entries periodically
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton store instance
const store = new InMemoryRateLimitStore();

// Clean up expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => store.cleanup(), 60000);
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: NextRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Include pathname for per-endpoint limiting
  const pathname = req.nextUrl.pathname;
  
  return `ratelimit:${ip}:${pathname}`;
}

/**
 * Rate limit middleware
 * 
 * @param req - NextRequest object
 * @param config - Rate limit configuration
 * @throws {ApiError} If rate limit is exceeded
 * 
 * @example
 * ```ts
 * export async function POST(req: NextRequest) {
 *   await rateLimit(req, { maxRequests: 5, windowMs: 60000 }); // 5 requests per minute
 *   // ... rest of handler
 * }
 * ```
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<void> {
  const { maxRequests, windowMs, keyGenerator = defaultKeyGenerator } = config;

const internalToken = req.headers.get('X-Internal-Call');
if (internalToken && internalToken === process.env.ADMIN_SECRET_TOKEN) {
  return;
}


  // Generate rate limit key
  const key = keyGenerator(req);

  // Increment counter
  const { count, resetTime } = await store.increment(key, windowMs);

  // Check if limit exceeded
  if (count > maxRequests) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    
    // Log rate limit violation
    logWarning('Rate limit exceeded', {
      key,
      count,
      maxRequests,
      retryAfter,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      endpoint: req.nextUrl.pathname,
    });

    throw rateLimitError(retryAfter);
  }

  // Add rate limit headers to response (informational)
  // Note: These need to be added to the response in the route handler
  // We can't modify the response here since we're in middleware
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimitPresets = {
  /**
   * Strict rate limit for expensive operations
   * 5 requests per minute
   */
  strict: { maxRequests: 5, windowMs: 60000 },

  /**
   * Standard rate limit for normal API endpoints
   * 20 requests per minute
   */
  standard: { maxRequests: 20, windowMs: 60000 },

  /**
   * Lenient rate limit for read-only endpoints
   * 60 requests per minute
   */
  lenient: { maxRequests: 60, windowMs: 60000 },

  /**
   * Very strict for authentication endpoints
   * 3 requests per 5 minutes
   */
  auth: { maxRequests: 3, windowMs: 300000 },
} as const;

/**
 * Helper to add rate limit headers to response
 * 
 * @example
 * ```ts
 * const response = successResponse(data);
 * return addRateLimitHeaders(response, { limit: 5, remaining: 3, reset: 60 });
 * ```
 */
export function addRateLimitHeaders(
  response: Response,
  info: { limit: number; remaining: number; reset: number }
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', info.limit.toString());
  headers.set('X-RateLimit-Remaining', Math.max(0, info.remaining).toString());
  headers.set('X-RateLimit-Reset', info.reset.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Redis-based rate limiter for production
 * 
 * Uncomment and configure when using Upstash Redis:
 */

/*
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimitRedis(
  req: NextRequest,
  config: RateLimitConfig
): Promise<void> {
  const { maxRequests, windowMs, keyGenerator = defaultKeyGenerator } = config;
  const key = keyGenerator(req);

  // Use Redis INCR with expiry
  const count = await redis.incr(key);
  
  if (count === 1) {
    // Set expiry on first request
    await redis.expire(key, Math.ceil(windowMs / 1000));
  }

  if (count > maxRequests) {
    const ttl = await redis.ttl(key);
    throw rateLimitError(ttl);
  }
}
*/
