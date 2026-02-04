/**
 * Chart Calculation Request Validation Schema
 * Used by POST /api/calculate
 */

import { z } from 'zod'

export const chartCalculationSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be 100 characters or less')
    .trim(),

  // Accept UI "Male/Female" and also lowercase
  gender: z
    .enum(['male', 'female', 'Male', 'Female'], { required_error: 'Gender is required' })
    .transform((val) => val.toLowerCase()),

  birthDate: z
    .string({ required_error: 'Birth date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be YYYY-MM-DD (e.g., 1992-03-25)')
    .refine((date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, { message: 'Invalid birth date' })
    .refine((date) => {
      const year = parseInt(date.split('-')[0], 10)
      const currentYear = new Date().getFullYear()
      return year >= 1900 && year <= currentYear
    }, { message: 'Birth year must be between 1900 and current year' }),

  // API expects 12-hour HH:MM + timePeriod, then converts internally.
  // We allow 00-23 too (defensive) since some clients might send 24h.
  birthTime: z
    .string({ required_error: 'Birth time is required' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Birth time must be HH:MM (e.g., 11:55)'),

  timePeriod: z.enum(['AM', 'PM'], {
    required_error: 'Time period (AM/PM) is required',
  }),

  // cities.id is int4 in Supabase: optional for calculation, useful for testing/traceability
  cityId: z.number().int().optional(),

  latitude: z
    .number({ required_error: 'Latitude is required', invalid_type_error: 'Latitude must be a number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: z
    .number({ required_error: 'Longitude is required', invalid_type_error: 'Longitude must be a number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),

  timezone: z
    .string({ required_error: 'Timezone is required' })
    .min(1, 'Timezone cannot be empty')
    .refine((tz) => /^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$|^GMT[+-]?\d{1,2}(:\d{2})?$/.test(tz), {
      message: 'Invalid timezone format',
    }),
})

export type ChartCalculationInput = z.infer<typeof chartCalculationSchema>

// Example (cityId now number)
export const validTestRequest: ChartCalculationInput = {
  name: 'Aakash Jain',
  gender: 'male',
  birthDate: '1992-03-25',
  birthTime: '11:55',
  timePeriod: 'AM',
  cityId: 1,
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
}
