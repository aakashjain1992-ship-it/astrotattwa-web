// GET /api/panchang/ip-location
// Detects user's approximate location from IP address.
// Returns: { lat, lng, city, country, timezone }
// Uses ipapi.co (free, no key needed, 1000 req/day limit).
import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, successResponse } from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'

// Default fallback: Delhi, India
const DELHI_DEFAULT = {
  lat: 28.6139,
  lng: 77.209,
  city: 'Delhi',
  state: 'Delhi',
  country: 'India',
  timezone: 'Asia/Kolkata',
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard)

  // Get client IP from headers (behind reverse proxy)
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || null

  // Skip for localhost / private IPs
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return successResponse(DELHI_DEFAULT)
  }

  try {
    // ipapi.co free tier: https://ipapi.co/{ip}/json/
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { 'User-Agent': 'astrotattwa.com/1.0' },
      signal: AbortSignal.timeout(3000),
    })

    if (!res.ok) return successResponse(DELHI_DEFAULT)

    const json = await res.json()
    if (json.error) return successResponse(DELHI_DEFAULT)

    return successResponse({
      lat: json.latitude ?? DELHI_DEFAULT.lat,
      lng: json.longitude ?? DELHI_DEFAULT.lng,
      city: json.city ?? DELHI_DEFAULT.city,
      state: json.region ?? DELHI_DEFAULT.state,
      country: json.country_name ?? DELHI_DEFAULT.country,
      timezone: json.timezone ?? DELHI_DEFAULT.timezone,
    })
  } catch {
    return successResponse(DELHI_DEFAULT)
  }
})
