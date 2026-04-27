/**
 * POST /api/yogas
 *
 * Body: { planets, ascendant, birthDateUtc?, nakshatraLord?, balanceYears? }
 *
 * - planets, ascendant: required (full chart payload)
 * - birthDateUtc + nakshatraLord + balanceYears: optional. If supplied,
 *   we compute current Mahadasha/Antardasha/Pratyantar to feed dasha activation.
 *
 * If the user is logged in, the result is persisted to `charts.yoga_analysis`
 * for the chart whose `chartId` is supplied in the body (optional).
 *
 * Rate limit: standard. Auth: optional (engine works for guests).
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import {
  successResponse,
  withErrorHandling,
  validationError,
} from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'
import { logError } from '@/lib/monitoring/errorLogger'

import { analyzeYogas } from '@/lib/astrology/yogas'
import type {
  CurrentDashaContext,
  YogaEngineInput,
} from '@/lib/astrology/yogas'
import { getCurrentPeriods } from '@/lib/astrology/core/dasa'
import type { PlanetData, AscendantData, PlanetKey } from '@/types/astrology'

const VALID_NAK_LORDS: ReadonlySet<string> = new Set([
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
])

const REQUIRED_PLANETS: ReadonlyArray<PlanetKey> = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
]

function getChunkedCookie(req: NextRequest, baseName: string) {
  const direct = req.cookies.get(baseName)?.value
  if (direct) return direct
  const parts: string[] = []
  for (let i = 0; i < 50; i++) {
    const part = req.cookies.get(`${baseName}.${i}`)?.value
    if (!part) break
    parts.push(part)
  }
  return parts.length ? parts.join('') : undefined
}

function createSupabase(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getChunkedCookie(req, name)
        },
        set() {},
        remove() {},
      },
    },
  )
}

function isValidPlanetData(p: unknown): p is PlanetData {
  if (!p || typeof p !== 'object') return false
  const x = p as Record<string, unknown>
  return (
    typeof x.signNumber === 'number' &&
    typeof x.longitude === 'number' &&
    typeof x.sign === 'string'
  )
}

function isValidAscendant(a: unknown): a is AscendantData {
  if (!a || typeof a !== 'object') return false
  const x = a as Record<string, unknown>
  return typeof x.signNumber === 'number' && typeof x.sign === 'string'
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard)

  const body = await req.json().catch(() => ({}))
  const planets = body?.planets
  const ascendant = body?.ascendant
  const chartId: string | null =
    typeof body?.chartId === 'string' && body.chartId.length > 0 ? body.chartId : null

  // Validate ascendant
  if (!isValidAscendant(ascendant)) {
    return validationError('Missing or invalid ascendant data.')
  }

  // Validate planets — all 9 required
  if (!planets || typeof planets !== 'object') {
    return validationError('Missing planets payload.')
  }
  for (const k of REQUIRED_PLANETS) {
    if (!isValidPlanetData(planets[k])) {
      return validationError(`Missing or invalid planet data for ${k}.`)
    }
  }

  // Optional: derive current dasha
  let currentDasha: CurrentDashaContext | undefined
  const birthDateUtc = typeof body?.birthDateUtc === 'string' ? body.birthDateUtc : null
  const nakLord = typeof body?.nakshatraLord === 'string' ? body.nakshatraLord : null
  const balanceYears = Number(body?.balanceYears)

  if (
    birthDateUtc &&
    nakLord &&
    VALID_NAK_LORDS.has(nakLord) &&
    Number.isFinite(balanceYears) &&
    balanceYears >= 0
  ) {
    try {
      const birthDate = new Date(birthDateUtc)
      if (!isNaN(birthDate.getTime())) {
        const periods = getCurrentPeriods(birthDate, nakLord as never, balanceYears)
        if (periods) {
          currentDasha = {
            mahadasha: periods.mahadasha.lord as PlanetKey,
            antardasha: periods.antardasha.lord as PlanetKey,
            pratyantar: periods.pratyantar.lord as PlanetKey,
          }
        }
      }
    } catch (err) {
      logError('yogas.currentDasha', err)
    }
  }

  // Run the engine
  const input: YogaEngineInput = {
    planets: planets as Record<string, PlanetData>,
    ascendant: ascendant as AscendantData,
    currentDasha,
  }
  const result = analyzeYogas(input)

  // Persist for logged-in users when chartId is supplied
  if (chartId) {
    const supabase = createSupabase(req)
    const { data: auth } = await supabase.auth.getUser()
    if (auth?.user) {
      const { error: dbError } = await supabase
        .from('charts')
        .update({ yoga_analysis: result })
        .eq('id', chartId)
        .eq('user_id', auth.user.id)
      if (dbError) {
        // Non-fatal — log and continue. User still gets the analysis.
        logError('yogas.persist', dbError)
      }
    }
  }

  return successResponse(result)
})
