/**
 * POST /api/shadbala
 *
 * Computes Shadbala (six-strength) planetary strength for 7 classical planets.
 *
 * Request body:
 * {
 *   planets: Record<string, { longitude, speed, retrograde, signNumber, degreeInSign, combust }>,
 *   ascendant: { longitude, signNumber, degreeInSign },
 *   birthDate: string,        // "YYYY-MM-DD"
 *   birthTime: string,        // "HH:MM"
 *   latitude: number,
 *   longitude: number,        // birth place longitude
 *   julianDayUT: number,
 * }
 *
 * Sunrise/sunset are computed server-side from julianDayUT and location,
 * or approximated if the Swiss Ephemeris call fails.
 */

import { NextRequest } from 'next/server'
import { computeShadbala } from '@/lib/astrology/shadbala'
import {
  successResponse,
  withErrorHandling,
  validationError,
} from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'
import { computeRiseSet } from '@/lib/panchang/ephemeris'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Approximate sunrise/sunset when Swiss Ephemeris computation fails */
function approximateSunriseSunset(julianDayUT: number): { sunriseJD: number; sunsetJD: number } {
  // Truncate to calendar day + 6h UTC as approximate sunrise (noon ≈ JD fraction 0.5)
  const dayStart = Math.floor(julianDayUT - 0.5) + 0.5  // previous midnight UTC
  const sunriseJD = dayStart + 0.25   // ~6 AM UTC
  const sunsetJD  = dayStart + 0.75   // ~6 PM UTC
  return { sunriseJD, sunsetJD }
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard)

  const body = await req.json() as Record<string, unknown>

  // ── Validate required top-level fields ────────────────────────────────────
  if (!body.planets || typeof body.planets !== 'object') {
    throw validationError('Missing required field: planets')
  }
  if (!body.ascendant || typeof body.ascendant !== 'object') {
    throw validationError('Missing required field: ascendant')
  }
  if (typeof body.julianDayUT !== 'number') {
    throw validationError('Missing required field: julianDayUT (number)')
  }
  if (typeof body.latitude !== 'number') {
    throw validationError('Missing required field: latitude (number)')
  }
  if (typeof body.longitude !== 'number') {
    throw validationError('Missing required field: longitude (number)')
  }

  const julianDayUT = body.julianDayUT as number
  const latitude    = body.latitude    as number
  const longitude   = body.longitude   as number
  const birthDate   = typeof body.birthDate === 'string' ? body.birthDate : ''
  const birthTime   = typeof body.birthTime === 'string' ? body.birthTime : ''

  // ── Compute sunrise/sunset via Swiss Ephemeris (fallback to approximation) ─
  let sunriseJD: number
  let sunsetJD:  number

  try {
    // Derive IANA timezone from coordinates (simple UTC-offset approach)
    // Use Intl.DateTimeFormat offset from Julian Day
    const msFromEpoch = (julianDayUT - 2440587.5) * 86400000
    const birthDate_  = new Date(msFromEpoch)
    // Best-effort: use 'UTC' if we can't determine timezone
    // The ephemeris computes from local midnight; slight offset is acceptable
    const timezone = 'UTC'

    const riseSet = await computeRiseSet(
      birthDate || birthDate_.toISOString().slice(0, 10),
      latitude,
      longitude,
      timezone
    )
    sunriseJD = riseSet.sunriseJD
    sunsetJD  = riseSet.sunsetJD
  } catch {
    // Fall back to simple JD arithmetic approximation
    const approx = approximateSunriseSunset(julianDayUT)
    sunriseJD = approx.sunriseJD
    sunsetJD  = approx.sunsetJD
  }

  // ── Assemble engine input ─────────────────────────────────────────────────
  const result = computeShadbala({
    planets:              body.planets as Parameters<typeof computeShadbala>[0]['planets'],
    ascendant:            body.ascendant as Parameters<typeof computeShadbala>[0]['ascendant'],
    birthDate,
    birthTime,
    latitude,
    birthplaceLongitude:  longitude,
    julianDayUT,
    sunriseJD,
    sunsetJD,
  })

  return successResponse(result)
})
