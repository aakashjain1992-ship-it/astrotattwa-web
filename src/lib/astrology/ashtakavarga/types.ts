/**
 * Ashtakavarga Types
 *
 * Type definitions for the Ashtakavarga planetary transit scoring system.
 * Ashtakavarga assigns "bindus" (transit points) to each of the 12 signs,
 * derived from classical Brihat Parashara Hora Shastra tables.
 */

export type AshtakavargaPlanet =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'

export type SignStrength = 'strong' | 'moderate' | 'weak'

/** Input for Ashtakavarga computation */
export interface AshtakavargaInput {
  planets: {
    Sun: { signNumber: number }
    Moon: { signNumber: number }
    Mars: { signNumber: number }
    Mercury: { signNumber: number }
    Jupiter: { signNumber: number }
    Venus: { signNumber: number }
    Saturn: { signNumber: number }
  }
  ascendant: { signNumber: number }
}

/**
 * Bhinnashtakavarga table for a single planet.
 * bindus[0] = Aries (sign 1), bindus[11] = Pisces (sign 12).
 */
export interface BhinnashtakavargaTable {
  /** Planet name */
  planet: AshtakavargaPlanet
  /** 12 bindu values, index 0 = Aries (sign 1), index 11 = Pisces (sign 12) */
  bindus: number[]
  /** Sum of all 12 bindus */
  total: number
  /** Count of signs where bindus >= 4 (favorable transit threshold) */
  goodSignCount: number
}

/**
 * Full Ashtakavarga result containing all 7 individual tables
 * plus the composite Sarvashtakavarga.
 *
 * Individual table interpretation: >= 4 bindus = favorable transit for that planet.
 * Sarvashtakavarga interpretation: >= 28 = strong, 25-27 = moderate, < 25 = weak.
 */
export interface AshtakavargaResult {
  version: 1
  /** 7 individual Bhinnashtakavarga tables (Sun through Saturn) */
  bhinnashtakavarga: BhinnashtakavargaTable[]
  /** 12 values — sum of all 7 individual tables per sign */
  sarvashtakavarga: number[]
  /** Total of all sarvashtakavarga values — should be ~337 */
  sarvaTotal: number
  /** Strength classification for each of the 12 signs */
  signStrengths: SignStrength[]
  /** ISO timestamp of when this was computed */
  generatedAt: string
}

/** 12 sign names in order (index 0 = Aries = sign 1) */
export const SIGN_NAMES: string[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]
