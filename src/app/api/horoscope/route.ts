// GET /api/horoscope?type=daily&rashi=aries&sign_type=moon&date=2026-04-11
import { NextRequest } from 'next/server'
import { withErrorHandling, successResponse, validationError, notFoundError } from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'
import { supabaseAdmin } from '@/lib/supabase/server-admin'
import { RASHI_SLUGS } from '@/lib/horoscope/rashiMap'

const VALID_TYPES    = ['daily', 'weekly', 'monthly'] as const
const VALID_SIGN_TYPES = ['moon', 'sun'] as const

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.lenient)

  const { searchParams } = req.nextUrl
  const type      = searchParams.get('type')     ?? 'daily'
  const rashi     = searchParams.get('rashi')    ?? 'aries'
  const signType  = searchParams.get('sign_type') ?? 'moon'
  const dateParam = searchParams.get('date')     ?? new Date().toISOString().slice(0, 10)

  if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
    throw validationError('type must be daily, weekly, or monthly')
  }
  if (!RASHI_SLUGS.includes(rashi)) {
    throw validationError('invalid rashi slug')
  }
  if (!VALID_SIGN_TYPES.includes(signType as typeof VALID_SIGN_TYPES[number])) {
    throw validationError('sign_type must be moon or sun')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    throw validationError('date must be YYYY-MM-DD')
  }

  // Find the horoscope whose period covers the requested date
  const { data, error } = await supabaseAdmin
    .from('horoscopes')
    .select('id, rashi, type, sign_type, period_start, period_end, content_en, content_hi, planet_context, published_at')
    .eq('type', type)
    .eq('rashi', rashi)
    .eq('sign_type', signType)
    .lte('period_start', dateParam)
    .gte('period_end', dateParam)
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (!data) {
    // Fallback: return the most recent available horoscope for this rashi+type
    const { data: fallback, error: fbErr } = await supabaseAdmin
      .from('horoscopes')
      .select('id, rashi, type, sign_type, period_start, period_end, content_en, content_hi, planet_context, published_at')
      .eq('type', type)
      .eq('rashi', rashi)
      .eq('sign_type', signType)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fbErr) throw new Error(fbErr.message)
    if (!fallback) throw notFoundError('horoscope')

    return successResponse({ ...fallback, isFallback: true })
  }

  return successResponse({ ...data, isFallback: false })
})
