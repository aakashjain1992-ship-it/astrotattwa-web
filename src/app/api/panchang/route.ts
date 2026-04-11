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

  // ── Check cache ────────────────────────────────────────────────────
  const { data: cached } = await supabaseAdmin
    .from('panchang_cache')
    .select('data, computed_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached) {
    const ageMs = Date.now() - new Date(cached.computed_at).getTime()
    if (ageMs < 24 * 60 * 60 * 1000) {
      // Fetch festivals for this date
      const festivals = await fetchFestivals(dateParam)
      const data = { ...cached.data, festivals }
      return successResponse(data, { cached: true })
    }
  }

  // ── Compute fresh ──────────────────────────────────────────────────
  const panchangData = await computePanchang({
    date: dateParam,
    lat,
    lng,
    timezone,
    locationName: locationParam,
  })

  // ── Store in cache ─────────────────────────────────────────────────
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
    // Non-fatal — log but still return data
    console.error('panchang_cache upsert error:', upsertError.message)
  }

  // ── Merge festivals ────────────────────────────────────────────────
  const festivals = await fetchFestivals(dateParam)
  const result = { ...panchangData, festivals }

  return successResponse(result, { cached: false })
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
