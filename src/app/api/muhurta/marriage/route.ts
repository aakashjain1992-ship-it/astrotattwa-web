import { NextRequest } from 'next/server'
import { z } from 'zod'
import { computePanchang } from '@/lib/panchang/compute'
import { supabaseAdmin } from '@/lib/supabase/server-admin'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'
import { successResponse, errorResponse, validationError, withErrorHandling } from '@/lib/api/errorHandling'
import { scoreMuhurtaDate } from '@/lib/astrology/muhurta/marriageMuhurta'
import type { MuhurtaRequest, MuhurtaResponse, MuhurtaDateResult, RestrictedPeriod } from '@/lib/astrology/muhurta/types'

// ─── Validation Schema ────────────────────────────────────────────────────────

const PersonSchema = z.object({
  name: z.string().min(1).max(100),
  moonSignNumber: z.number().int().min(1).max(12),
  nakshatraIndex: z.number().int().min(0).max(26),
})

const RequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().default('Asia/Kolkata'),
  person1: PersonSchema.optional(),
  person2: PersonSchema.optional(),
}).refine(
  (data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    if (end < start) return false
    const diffMs = end.getTime() - start.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays <= 366
  },
  { message: 'endDate must be after startDate and within 366 days' }
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Check if a date string falls within a period [start, end] (all YYYY-MM-DD) */
function isInPeriod(date: string, start: string, end: string): boolean {
  return date >= start && date <= end
}

/** Build array of YYYY-MM-DD strings from startDate to endDate inclusive */
function buildDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T00:00:00Z')
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard)

  // Parse + validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return validationError(parsed.error.errors.map(e => e.message).join('; '))
  }

  const {
    startDate,
    endDate,
    latitude,
    longitude,
    timezone,
    person1,
    person2,
  } = parsed.data as MuhurtaRequest

  // Build full date range
  const allDates = buildDateRange(startDate, endDate)

  // Pre-filter: skip Tuesday (2) and Saturday (6) without any API calls
  const filteredDates = allDates.filter(date => {
    const dow = new Date(date + 'T00:00:00Z').getUTCDay()
    return dow !== 2 && dow !== 6
  })

  // Fetch retrograde periods for Jupiter and Venus
  const retrogradeResult = await supabaseAdmin
    .from('planet_retrograde_periods')
    .select('planet, retrograde_start, direct_start')
    .in('planet', ['Jupiter', 'Venus'])
    .lte('retrograde_start', endDate)
    .gte('direct_start', startDate)

  const retrogradePeriods: Array<{ planet: string; retrograde_start: string; direct_start: string }> =
    retrogradeResult.data ?? []

  // Fetch Khar Maas periods (Sun in Sagittarius or Pisces)
  const kharMaasResult = await supabaseAdmin
    .from('planet_sign_transits')
    .select('planet, sign_name, entry_date, exit_date')
    .eq('planet', 'Sun')
    .in('sign_name', ['Sagittarius', 'Pisces'])
    .lte('entry_date', endDate)
    .gte('exit_date', startDate)

  const kharMaasPeriods: Array<{ sign_name: string; entry_date: string; exit_date: string }> =
    kharMaasResult.data ?? []

  // Build restricted periods array for response
  const restrictedPeriods: RestrictedPeriod[] = kharMaasPeriods.map(p => ({
    start: p.entry_date > startDate ? p.entry_date : startDate,
    end: p.exit_date < endDate ? p.exit_date : endDate,
    reason: `Khar Maas — Sun in ${p.sign_name}`,
  }))

  // Process each date in batches of 10
  const allResults: MuhurtaDateResult[] = []
  const BATCH_SIZE = 10

  for (let i = 0; i < filteredDates.length; i += BATCH_SIZE) {
    const batch = filteredDates.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map(async (date) => {
        // Determine retrograde status
        const isJupiterRetro = retrogradePeriods.some(
          p => p.planet === 'Jupiter' && isInPeriod(date, p.retrograde_start, p.direct_start)
        )
        const isVenusRetro = retrogradePeriods.some(
          p => p.planet === 'Venus' && isInPeriod(date, p.retrograde_start, p.direct_start)
        )

        // Determine Khar Maas
        const isKharMaas = kharMaasPeriods.some(
          p => isInPeriod(date, p.entry_date, p.exit_date)
        )

        // Compute panchang for this date/location
        const panchang = await computePanchang({
          date,
          lat: latitude,
          lng: longitude,
          timezone,
          locationName: 'Ceremony Location',
        })

        // Score the date
        return scoreMuhurtaDate(
          date,
          panchang,
          isJupiterRetro,
          isVenusRetro,
          isKharMaas,
          person1,
          person2
        )
      })
    )

    allResults.push(...results)
  }

  // Build summary
  const summary = {
    total: allResults.length,
    excellent: allResults.filter(d => d.grade === 'excellent').length,
    good: allResults.filter(d => d.grade === 'good').length,
    acceptable: allResults.filter(d => d.grade === 'acceptable').length,
    avoid: allResults.filter(d => d.grade === 'avoid').length,
  }

  const response: MuhurtaResponse = {
    dates: allResults,
    summary,
    restrictedPeriods,
  }

  return successResponse(response)
})
