/**
 * Chart Calculation Request Validation Schema - Day 1, Task 1
 * 
 * Zod schema for validating POST /api/chart/calculate requests
 * 
 * Usage in API route:
 * ```ts
 * const result = chartCalculationSchema.safeParse(requestBody);
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'ValidationError', details: result.error.issues },
 *     { status: 400 }
 *   );
 * }
 * ```
 */

import { z } from 'zod';

// ===== MAIN VALIDATION SCHEMA =====

export const chartCalculationSchema = z.object({
  // Basic Info
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be 100 characters or less')
    .trim(),

  gender: z.enum(['male', 'female'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Gender must be either "male" or "female"',
  }),

  // Birth Details
  birthDate: z
    .string({
      required_error: 'Birth date is required',
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Birth date must be in YYYY-MM-DD format (e.g., 1992-03-25)'
    )
    .refine(
      (date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      },
      { message: 'Invalid birth date' }
    )
    .refine(
      (date) => {
        const year = parseInt(date.split('-')[0]);
        const currentYear = new Date().getFullYear();
        return year >= 1900 && year <= currentYear;
      },
      { message: 'Birth year must be between 1900 and current year' }
    ),

  birthTime: z
    .string({
      required_error: 'Birth time is required',
    })
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Birth time must be in HH:MM format (e.g., 11:55)'
    ),

  timePeriod: z.enum(['AM', 'PM'], {
    required_error: 'Time period (AM/PM) is required',
    invalid_type_error: 'Time period must be either "AM" or "PM"',
  }),

  // Location Details
  cityId: z
    .string({
      required_error: 'City selection is required',
    })
    .uuid('Invalid city ID format'),

  latitude: z
    .number({
      required_error: 'Latitude is required',
      invalid_type_error: 'Latitude must be a number',
    })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: z
    .number({
      required_error: 'Longitude is required',
      invalid_type_error: 'Longitude must be a number',
    })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),

  timezone: z
    .string({
      required_error: 'Timezone is required',
    })
    .min(1, 'Timezone cannot be empty')
    .refine(
      (tz) => {
        // Basic timezone format validation
        // Examples: Asia/Kolkata, America/New_York, UTC, GMT+5:30
        return /^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$|^GMT[+-]?\d{1,2}(:\d{2})?$/.test(tz);
      },
      { message: 'Invalid timezone format' }
    ),
});

// ===== TYPE INFERENCE =====

export type ChartCalculationInput = z.infer<typeof chartCalculationSchema>;

// ===== EXAMPLE USAGE IN API ROUTE =====

/**
 * Example API route usage:
 * 
 * ```typescript
 * // app/api/chart/calculate/route.ts
 * 
 * import { NextRequest, NextResponse } from 'next/server';
 * import { chartCalculationSchema } from '@/lib/validation/chart-calculation';
 * 
 * export async function POST(request: NextRequest) {
 *   try {
 *     const body = await request.json();
 *     
 *     // Validate request
 *     const validationResult = chartCalculationSchema.safeParse(body);
 *     
 *     if (!validationResult.success) {
 *       return NextResponse.json(
 *         {
 *           error: 'ValidationError',
 *           message: 'Invalid input data',
 *           details: validationResult.error.issues.map(issue => ({
 *             field: issue.path.join('.'),
 *             message: issue.message,
 *           })),
 *         },
 *         { status: 400 }
 *       );
 *     }
 *     
 *     const validatedData = validationResult.data;
 *     
 *     // Proceed with calculation...
 *     // const chart = await calculateChart(validatedData);
 *     
 *     return NextResponse.json({ success: true });
 *     
 *   } catch (error) {
 *     console.error('Chart calculation error:', error);
 *     return NextResponse.json(
 *       { error: 'InternalError', message: 'Failed to calculate chart' },
 *       { status: 500 }
 *     );
 *   }
 * }
 * ```
 */

// ===== TEST DATA =====

export const validTestRequest: ChartCalculationInput = {
  name: 'Aakash Jain',
  gender: 'male',
  birthDate: '1992-03-25',
  birthTime: '11:55',
  timePeriod: 'AM',
  cityId: '550e8400-e29b-41d4-a716-446655440000',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 'Asia/Kolkata',
};

// ===== VALIDATION ERRORS REFERENCE =====

/**
 * Common Validation Errors and Their Messages:
 * 
 * 1. Missing name:
 *    "Name is required"
 * 
 * 2. Invalid gender:
 *    "Gender must be either 'male' or 'female'"
 * 
 * 3. Invalid date format:
 *    "Birth date must be in YYYY-MM-DD format (e.g., 1992-03-25)"
 * 
 * 4. Invalid time format:
 *    "Birth time must be in HH:MM format (e.g., 11:55)"
 * 
 * 5. Missing time period:
 *    "Time period (AM/PM) is required"
 * 
 * 6. Invalid city ID:
 *    "Invalid city ID format"
 * 
 * 7. Invalid coordinates:
 *    "Latitude must be between -90 and 90"
 *    "Longitude must be between -180 and 180"
 * 
 * 8. Invalid timezone:
 *    "Invalid timezone format"
 */
