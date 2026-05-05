export interface PersonBirthInput {
  name: string
  gender: string
  birthDate: string
  birthTime: string
  timePeriod: 'AM' | 'PM'
  birthPlace?: string
  latitude: number
  longitude: number
  timezone: string
}

/** Data extracted from a calculated chart for Milan scoring */
export interface PersonMilanData {
  name: string
  moonSignNumber: number   // 1-12
  moonSign: string
  nakshatraIndex: number   // 0-26
  nakshatraName: string
  gana: string             // "Deva" | "Manushya" | "Rakshasa"
  yoni: string             // animal name e.g. "Horse"
  nadi: string             // "Adi" | "Madhya" | "Antya"
  varna: string            // Moon-sign-based: Brahmin | Kshatriya | Vaishya | Shudra
  vashya: string           // "Quadruped" | "Human" | "Water" | "Insect"
}

export interface ManglikPersonStatus {
  isManglik: boolean
  marsHouseLagna: number       // house from Lagna (0 if unknown)
  isReduced: boolean           // cancellation factors found (own sign, exalted, Jupiter etc.)
  severity: string | null      // 'weak' | 'moderate' | 'strong' | 'very_strong' | null
  chartNarrative?: string      // chart-specific prose from the yoga engine
}

export interface ManglikStatus {
  person1: ManglikPersonStatus
  person2: ManglikPersonStatus
  /** true when both are Manglik — doshas cancel each other in most traditions */
  doubleManglik: boolean
}

export interface KutaDetail {
  about: string      // what this kuta measures
  person1: string    // person 1's specific data and what it means
  person2: string    // person 2's specific data and what it means
  meaning: string    // interpretation of their combined result
}

export interface KutaResult {
  name: string
  score: number
  max: number
  description: string        // one-line explanation of the score
  note?: string              // optional dosha warning e.g. "Nadi Dosha"
  detail?: KutaDetail
}

export type VerdictLevel = 'excellent' | 'good' | 'acceptable' | 'low'

export interface MilanVerdict {
  level: VerdictLevel
  label: string
  description: string
}

export interface MilanResult {
  person1: { name: string; moonSign: string; nakshatra: string; moonSignNumber: number; nakshatraIndex: number; gana: string; yoni: string; nadi: string; vashya: string; varna: string }
  person2: { name: string; moonSign: string; nakshatra: string; moonSignNumber: number; nakshatraIndex: number; gana: string; yoni: string; nadi: string; vashya: string; varna: string }
  kutas: KutaResult[]
  totalScore: number
  maxScore: 36
  percentage: number
  verdict: MilanVerdict
  manglikStatus: ManglikStatus
}
