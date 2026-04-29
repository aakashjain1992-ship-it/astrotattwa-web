// GET /api/panchang
// Query params: date (YYYY-MM-DD), lat, lng, timezone, location (display name)
// Logic: cache-first in panchang_cache, compute if miss, merge festivals.
import { NextRequest } from 'next/server'
import { withErrorHandling, successResponse, validationError } from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'
import { supabaseAdmin } from '@/lib/supabase/server-admin'
import { computePanchang } from '@/lib/panchang/compute'
import { mapFestivalRow } from '@/lib/panchang/festivals'
import type { FestivalRow } from '@/lib/panchang/festivals'
import { getRedis } from '@/lib/redis'

const PANCHANG_TTL = 24 * 60 * 60 // 24 hours in seconds

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.lenient) // 60/min — public read-only endpoint

  const { searchParams } = req.nextUrl
  const dateParam = searchParams.get('date')
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const timezoneParam = searchParams.get('timezone')
  const locationParam = searchParams.get('location') ?? ''

  // ── Validate inputs ────────────────────────────────────────────────
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    throw validationError('date parameter is required in YYYY-MM-DD format')
  }
  const lat = latParam ? parseFloat(latParam) : NaN
  const lng = lngParam ? parseFloat(lngParam) : NaN
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw validationError('lat and lng parameters are required and must be valid coordinates')
  }
  const timezone = timezoneParam ?? 'Asia/Kolkata'

  // ── Cache key ──────────────────────────────────────────────────────
  // v8: Anandadi formula fixed for Shravana–Revati (Abhijeet position in 28-nakshatra cycle, Apr 2026)
  const CACHE_VERSION = 'v8'
  const latR = lat.toFixed(2)
  const lngR = lng.toFixed(2)
  const cacheKey = `${CACHE_VERSION}_${dateParam}_${latR}_${lngR}`

  const redis = getRedis()

  // ── 1. Redis cache (hot path ~0.3ms) ───────────────────────────────
  try {
    const hit = await redis.get(`panchang:${cacheKey}`)
    if (hit) {
      const festivals = await fetchFestivals(dateParam)
      return successResponse({ ...JSON.parse(hit), festivals }, { cached: true, source: 'redis' })
    }
  } catch {
    // Redis down — continue to Supabase
  }

  // ── 2. Supabase cache (warm path ~10ms) ───────────────────────────
  const { data: cached } = await supabaseAdmin
    .from('panchang_cache')
    .select('data, computed_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached) {
    const ageMs = Date.now() - new Date(cached.computed_at).getTime()
    if (ageMs < 24 * 60 * 60 * 1000) {
      // Backfill Redis so next request is hot
      try { await redis.setex(`panchang:${cacheKey}`, PANCHANG_TTL, JSON.stringify(cached.data)) } catch {}
      const festivals = await fetchFestivals(dateParam)
      return successResponse({ ...cached.data, festivals }, { cached: true, source: 'supabase' })
    }
  }

  // ── 3. Compute fresh (cold path) ───────────────────────────────────
  const panchangData = await computePanchang({
    date: dateParam,
    lat,
    lng,
    timezone,
    locationName: locationParam,
  })

  // ── Store in Redis + Supabase ──────────────────────────────────────
  try { await redis.setex(`panchang:${cacheKey}`, PANCHANG_TTL, JSON.stringify(panchangData)) } catch {}

  const { error: upsertError } = await supabaseAdmin
    .from('panchang_cache')
    .upsert({
      cache_key: cacheKey,
      date: dateParam,
      lat: parseFloat(latR),
      lng: parseFloat(lngR),
      location_name: locationParam,
      timezone,
      data: panchangData,
      computed_at: new Date().toISOString(),
    }, { onConflict: 'cache_key' })

  if (upsertError) {
    console.error('panchang_cache upsert error:', upsertError.message)
  }

  // ── Merge festivals ────────────────────────────────────────────────
  const festivals = await fetchFestivals(dateParam)
  return successResponse({ ...panchangData, festivals }, { cached: false })
})

async function fetchFestivals(date: string) {
  const { data } = await supabaseAdmin
    .from('festival_calendar')
    .select('*')
    .eq('date', date)
    .order('type')

  if (!data) return []
  return (data as FestivalRow[]).map(mapFestivalRow)
}
