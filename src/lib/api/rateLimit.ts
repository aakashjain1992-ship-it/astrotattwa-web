import { NextRequest } from 'next/server'
import { rateLimitError } from '@/lib/api/errorHandling'
import { logWarning } from '@/lib/monitoring/errorLogger'
import { getRedis } from '@/lib/redis'

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (req: NextRequest) => string
}

// Atomic Lua script: INCR + set EXPIRE only on first request
// Returns [count, ttl_seconds]
const RATE_LIMIT_SCRIPT = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  local ttl = redis.call('TTL', KEYS[1])
  return {count, ttl}
`

function defaultKeyGenerator(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  return `ratelimit:${ip}:${req.nextUrl.pathname}`
}

export async function rateLimit(req: NextRequest, config: RateLimitConfig): Promise<void> {
  const { maxRequests, windowMs, keyGenerator = defaultKeyGenerator } = config

  // Internal cron calls bypass rate limiting
  const internalToken = req.headers.get('X-Internal-Call')
  if (internalToken && internalToken === process.env.ADMIN_SECRET_TOKEN) return

  const key = keyGenerator(req)
  const windowSeconds = Math.ceil(windowMs / 1000)

  let count = 0
  let retryAfter = windowSeconds

  try {
    const result = await getRedis().eval(RATE_LIMIT_SCRIPT, 1, key, String(windowSeconds)) as [number, number]
    count = result[0]
    retryAfter = result[1] > 0 ? result[1] : windowSeconds
  } catch {
    // Redis unavailable — fail open (allow request through)
    return
  }

  if (count > maxRequests) {
    logWarning('Rate limit exceeded', {
      key,
      count,
      maxRequests,
      retryAfter,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      endpoint: req.nextUrl.pathname,
    })
    throw rateLimitError(retryAfter)
  }
}

export const RateLimitPresets = {
  strict:   { maxRequests: 5,  windowMs: 60000  },   // 5/min
  standard: { maxRequests: 20, windowMs: 60000  },   // 20/min
  lenient:  { maxRequests: 60, windowMs: 60000  },   // 60/min
  auth:     { maxRequests: 3,  windowMs: 300000 },   // 3/5min
} as const

export function addRateLimitHeaders(
  response: Response,
  info: { limit: number; remaining: number; reset: number }
): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', info.limit.toString())
  headers.set('X-RateLimit-Remaining', Math.max(0, info.remaining).toString())
  headers.set('X-RateLimit-Reset', info.reset.toString())
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
