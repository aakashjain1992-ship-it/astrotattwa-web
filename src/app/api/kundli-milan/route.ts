import { NextRequest } from 'next/server'
import { z } from 'zod'
import { calculateBirthChart } from '@/lib/astrology/core/calculate'
import { convert12to24 } from '@/lib/astrology/time'
import { successResponse, withErrorHandling, validationError } from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'
import { extractMilanData, ashtkootScore } from '@/lib/astrology/kundliMilan'
import { analyzeYogas } from '@/lib/astrology/yogas'
import type { DoshaResult } from '@/lib/astrology/yogas/types'

const personSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  gender: z.enum(['male', 'female', 'Male', 'Female']).default('Male'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  timePeriod: z.enum(['AM', 'PM']),
  birthPlace: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1),
})

const milanSchema = z.object({
  person1: personSchema,
  person2: personSchema,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMangalDosha(chartData: any): DoshaResult | null {
  try {
    const { Ascendant: ascendant, ...planets } = chartData.planets
    const yogaResult = analyzeYogas({ planets, ascendant })
    return yogaResult.allDoshas.find(d => d.id === 'mangal') ?? null
  } catch {
    return null
  }
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.strict)

  const body = await req.json()
  const parsed = milanSchema.safeParse(body)
  if (!parsed.success) {
    throw validationError(parsed.error.errors.map(e => e.message).join('; '))
  }

  const { person1, person2 } = parsed.data

  const [chart1, chart2] = await Promise.all([
    calculateBirthChart({
      name: person1.name,
      gender: person1.gender,
      birthDate: person1.birthDate,
      birthTime: convert12to24(person1.birthTime, person1.timePeriod),
      birthPlace: person1.birthPlace ?? '',
      timePeriod: person1.timePeriod,
      latitude: person1.latitude,
      longitude: person1.longitude,
      timezone: person1.timezone,
    }),
    calculateBirthChart({
      name: person2.name,
      gender: person2.gender,
      birthDate: person2.birthDate,
      birthTime: convert12to24(person2.birthTime, person2.timePeriod),
      birthPlace: person2.birthPlace ?? '',
      timePeriod: person2.timePeriod,
      latitude: person2.latitude,
      longitude: person2.longitude,
      timezone: person2.timezone,
    }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p1 = extractMilanData(person1.name, chart1 as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p2 = extractMilanData(person2.name, chart2 as any)

  // Run yoga engine for each person to get accurate Mangal dosha with cancellations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mangal1, mangal2] = [extractMangalDosha(chart1 as any), extractMangalDosha(chart2 as any)]

  const result = ashtkootScore(p1, p2, mangal1, mangal2)

  return successResponse(result)
})
