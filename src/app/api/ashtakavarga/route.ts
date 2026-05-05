import { NextRequest } from 'next/server'
import { computeAshtakavarga } from '@/lib/astrology/ashtakavarga'
import type { AshtakavargaInput } from '@/lib/astrology/ashtakavarga'
import {
  successResponse,
  withErrorHandling,
  validationError,
} from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const REQUIRED_PLANETS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
] as const

export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard)

  const body: unknown = await req.json()

  if (!body || typeof body !== 'object') {
    throw validationError('Request body must be a JSON object')
  }

  const { planets, ascendant } = body as Record<string, unknown>

  // Validate ascendant
  if (
    !ascendant ||
    typeof ascendant !== 'object' ||
    typeof (ascendant as Record<string, unknown>).signNumber !== 'number'
  ) {
    throw validationError('ascendant.signNumber is required and must be a number')
  }

  const ascSignNumber = (ascendant as { signNumber: number }).signNumber
  if (!Number.isInteger(ascSignNumber) || ascSignNumber < 1 || ascSignNumber > 12) {
    throw validationError('ascendant.signNumber must be an integer between 1 and 12')
  }

  // Validate planets object exists
  if (!planets || typeof planets !== 'object') {
    throw validationError(
      `planets is required. Must include: ${REQUIRED_PLANETS.join(', ')}`
    )
  }

  const planetsMap = planets as Record<string, unknown>

  // Validate each required planet
  for (const name of REQUIRED_PLANETS) {
    const planet = planetsMap[name]
    if (!planet || typeof planet !== 'object') {
      throw validationError(
        `planets.${name} is required`,
        { required: REQUIRED_PLANETS }
      )
    }
    const signNum = (planet as Record<string, unknown>).signNumber
    if (typeof signNum !== 'number' || !Number.isInteger(signNum) || signNum < 1 || signNum > 12) {
      throw validationError(
        `planets.${name}.signNumber must be an integer between 1 and 12`,
        { received: signNum }
      )
    }
  }

  // Build typed input — we've validated all fields above
  const input: AshtakavargaInput = {
    planets: {
      Sun:     { signNumber: (planetsMap.Sun     as { signNumber: number }).signNumber },
      Moon:    { signNumber: (planetsMap.Moon    as { signNumber: number }).signNumber },
      Mars:    { signNumber: (planetsMap.Mars    as { signNumber: number }).signNumber },
      Mercury: { signNumber: (planetsMap.Mercury as { signNumber: number }).signNumber },
      Jupiter: { signNumber: (planetsMap.Jupiter as { signNumber: number }).signNumber },
      Venus:   { signNumber: (planetsMap.Venus   as { signNumber: number }).signNumber },
      Saturn:  { signNumber: (planetsMap.Saturn  as { signNumber: number }).signNumber },
    },
    ascendant: { signNumber: ascSignNumber },
  }

  const result = computeAshtakavarga(input)

  return successResponse(result)
})
