// GET /api/horoscope/history?type=daily&rashi=aries&sign_type=moon
// Returns past N horoscopes (7 daily / 4 weekly / 6 monthly)
import { NextRequest } from 'next/server'
import { withErrorHandling, successResponse, validationError } from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'
import { supabaseAdmin } from '@/lib/supabase/server-admin'
import { RASHI_SLUGS } from '@/lib/horoscope/rashiMap'

const HISTORY_LIMITS: Record<string, number> = { daily: 7, weekly: 4, monthly: 6 }

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.lenient)

  const { searchParams } = req.nextUrl
  const type     = searchParams.get('type')      ?? 'daily'
  const rashi    = searchParams.get('rashi')     ?? 'aries'
  const signType = searchParams.get('sign_type') ?? 'moon'

  if (!HISTORY_LIMITS[type]) throw validationError('type must be daily, weekly, or monthly')
  if (!RASHI_SLUGS.includes(rashi)) throw validationError('invalid rashi slug')
  if (!['moon', 'sun'].includes(signType)) throw validationError('sign_type must be moon or sun')

  const limit = HISTORY_LIMITS[type]

  const { data, error } = await supabaseAdmin
    .from('horoscopes')
    .select('id, period_start, period_end, content_en, content_hi, published_at')
    .eq('type', type)
    .eq('rashi', rashi)
    .eq('sign_type', signType)
    .order('period_start', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return successResponse(data ?? [])
})
