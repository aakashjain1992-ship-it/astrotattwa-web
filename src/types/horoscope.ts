export type HoroscopeType = 'daily' | 'weekly' | 'monthly'
export type SignType      = 'moon' | 'sun'
export type HoroscopeLang = 'en' | 'hi'

export interface HoroscopeContent {
  overview:       string
  career:         string
  love:           string
  health:         string
  lucky_colour:   string
  lucky_number:   string
  favourable_time: string
  remedy:         string
}

export interface HoroscopeRow {
  id:            string
  rashi:         string
  type:          HoroscopeType
  sign_type:     SignType
  period_start:  string   // YYYY-MM-DD
  period_end:    string   // YYYY-MM-DD
  content_en:    HoroscopeContent
  content_hi:    HoroscopeContent
  planet_context: Record<string, unknown>
  published_at:  string
  isFallback?:   boolean
}
