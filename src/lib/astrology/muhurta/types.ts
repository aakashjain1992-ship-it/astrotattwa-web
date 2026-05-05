export type MuhurtaGrade = 'excellent' | 'good' | 'acceptable' | 'avoid'

export interface MuhurtaCheck {
  name: string
  passed: boolean
  detail: string
  weight: number
}

export interface MuhurtaLagnaWindow {
  lagnaName: string
  startTime: string
  endTime: string
  isFavorable: boolean
}

export interface PersonalCompatibility {
  moonOk: boolean      // wedding Moon not in 6/8/12 from natal Moon
  taraOk: boolean      // Tarabalam favorable
  moonDetail: string
  taraDetail: string
}

export interface MuhurtaDateResult {
  date: string          // YYYY-MM-DD
  dayOfWeek: string
  score: number         // 0-100
  grade: MuhurtaGrade
  tithi: { name: string; paksha: string; number: number; isAuspicious: boolean }
  nakshatra: { name: string; index: number; isAuspicious: boolean }
  vara: { name: string; isAuspicious: boolean }
  isKharMaas: boolean
  isAdhikMaas: boolean
  jupiterRetrograde: boolean
  venusRetrograde: boolean
  jupiterCombust: boolean
  venusCombust: boolean
  lagnaWindows: MuhurtaLagnaWindow[]
  checks: MuhurtaCheck[]
  person1Compat?: PersonalCompatibility
  person2Compat?: PersonalCompatibility
}

export interface RestrictedPeriod {
  start: string
  end: string
  reason: string
}

export interface MuhurtaSummary {
  total: number
  excellent: number
  good: number
  acceptable: number
  avoid: number
}

export interface MuhurtaResponse {
  dates: MuhurtaDateResult[]
  summary: MuhurtaSummary
  restrictedPeriods: RestrictedPeriod[]
}

export interface MuhurtaPersonInput {
  name: string
  moonSignNumber: number   // 1-12
  nakshatraIndex: number   // 0-26 (0-indexed)
}

export interface MuhurtaRequest {
  startDate: string        // YYYY-MM-DD
  endDate: string          // YYYY-MM-DD
  latitude: number
  longitude: number
  timezone: string
  person1?: MuhurtaPersonInput
  person2?: MuhurtaPersonInput
}
