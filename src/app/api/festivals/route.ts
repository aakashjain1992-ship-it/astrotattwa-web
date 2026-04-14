// GET /api/festivals?year=2026
// Returns all festivals for the given year, sorted by date.
// Also accepts ?year=2026&month=4 to limit to a single month.
import { NextRequest } from 'next/server'
import { withErrorHandling, successResponse, validationError } from '@/lib/api/errorHandling'
import { supabaseAdmin } from '@/lib/supabase/server-admin'
import { mapFestivalRow } from '@/lib/panchang/festivals'
import type { FestivalRow } from '@/lib/panchang/festivals'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl
  const yearParam  = searchParams.get('year')
  const monthParam = searchParams.get('month')

  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()
  if (isNaN(year) || year < 2020 || year > 2040) {
    throw validationError('year must be a valid year between 2020 and 2040')
  }

  let from: string
  let to: string

  if (monthParam) {
    const month = parseInt(monthParam, 10)
    if (isNaN(month) || month < 1 || month > 12) {
      throw validationError('month must be 1–12')
    }
    // First and last day of the given month
    from = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()  // day 0 of next month = last day of this month
    to   = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  } else {
    from = `${year}-01-01`
    to   = `${year}-12-31`
  }

  const { data, error } = await supabaseAdmin
    .from('festival_calendar')
    .select('id, date, name, type, description, image_url, tithi_number, tithi_start, tithi_end')
    .gte('date', from)
    .lte('date', to)
    .order('date')

  if (error) throw new Error(error.message)

  const festivals = (data as FestivalRow[]).map(mapFestivalRow)
  return successResponse({ festivals, year, from, to })
})
