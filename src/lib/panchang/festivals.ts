// ─────────────────────────────────────────────────────────────────────────────
// Festival helpers
// Runtime types and mapper for the festival_calendar Supabase table.
// All festival data lives in the DB — edit via Supabase dashboard or SQL.
// ─────────────────────────────────────────────────────────────────────────────
import type { FestivalData } from './types'

export type FestivalRow = {
  id: string
  date: string
  name: string
  type: string
  description?: string
  image_url?: string
  tithi_number?: number
  tithi_start?: string
  tithi_end?: string
}

export function mapFestivalRow(row: FestivalRow): FestivalData {
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    type: row.type as FestivalData['type'],
    description: row.description,
    image_url: row.image_url,
    tithi_number: row.tithi_number,
    tithi_start: row.tithi_start,
    tithi_end: row.tithi_end,
  }
}
