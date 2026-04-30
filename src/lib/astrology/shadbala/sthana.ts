/**
 * Sthana Bala — Positional Strength
 *
 * Five sub-components:
 *   1. Uchcha Bala     — exaltation proximity (0–60 virupas)
 *   2. Saptavargaja    — dignity across 7 vargas (0–45 virupas)
 *   3. Ojayugma Bala   — odd/even sign fitness (0–30 virupas)
 *   4. Kendradi Bala   — kendra/panapara/apoklima placement (5/7/10 virupas)
 *   5. Drekkana Bala   — decanate gender fit (0 or 15 virupas)
 */

import type { SthanaBala } from './types'
import { DIVISION_CONFIGS } from '@/lib/astrology/divisionalChartBuilder'
import { getSimpleDignity } from '@/lib/astrology/strength/dignityEngine'
import { getNaturalRelationship, SIGN_LORDS } from '@/lib/astrology/strength/relationships'

// ── Exaltation points (absolute sidereal longitude) ──────────────────────────
const EXALT_POINTS: Record<string, number> = {
  Sun:     10,   // 10° Aries
  Moon:    33,   // 3° Taurus
  Mars:    298,  // 28° Capricorn (270° + 28° = 298°)
  Mercury: 165,  // 15° Virgo
  Jupiter: 95,   // 5° Cancer
  Venus:   357,  // 27° Pisces
  Saturn:  200,  // 20° Libra
}

// ── 1. Uchcha Bala ───────────────────────────────────────────────────────────

/**
 * Compute Uchcha Bala (exaltation strength).
 * Arc distance from the debilitation point, scaled 0–60.
 */
function uchchaBala(planet: string, longitude: number): number {
  const exaltLon = EXALT_POINTS[planet]
  if (exaltLon === undefined) return 0
  const debilLon = (exaltLon + 180) % 360
  let diff = Math.abs(longitude - debilLon)
  if (diff > 180) diff = 360 - diff
  return diff / 3  // 0 at debil, 60 at exalt
}

// ── 2. Saptavargaja Bala ─────────────────────────────────────────────────────

/**
 * Map varga sign + planet to a virupa score for Saptavargaja.
 * Exalted/MT/Own = 45, Debilitated = 0, Friend-range in between.
 */
/**
 * Saptavargaja dignity scores per BPHS:
 * Exalted=45, MT=30, Own=22.5, Great Friend=15, Friend=7.5, Neutral=3.75, Enemy=1.875, Debilitated=0
 */
function dignityScore(planet: string, vargaSign: number): number {
  const dignity = getSimpleDignity(planet, vargaSign)
  if (dignity === 'exalted')     return 45
  if (dignity === 'moolatrikona') return 30
  if (dignity === 'own_sign')     return 22.5
  if (dignity === 'debilitated')  return 0
  // 'neutral' — refine with natural relationship to sign lord
  const lord = SIGN_LORDS[vargaSign]
  if (!lord || lord === planet) return 22.5  // own sign guard
  const rel = getNaturalRelationship(planet, lord)
  if (rel === 'great_friend') return 15
  if (rel === 'friend')       return 7.5
  if (rel === 'great_enemy')  return 1.875
  if (rel === 'enemy')        return 3.75
  return 3.75  // neutral (compound neutral maps to this)
}

/**
 * Compute Saptavargaja Bala — average dignity score across 7 vargas:
 * D1, D2, D3, D7, D9, D12, D30.
 */
function saptavargajaBala(planet: string, longitude: number, d1Sign: number): number {
  const vargas: { key: keyof typeof DIVISION_CONFIGS; sign: number }[] = [
    { key: 'D2',  sign: DIVISION_CONFIGS.D2.calculateSign(longitude) },
    { key: 'D3',  sign: DIVISION_CONFIGS.D3.calculateSign(longitude) },
    { key: 'D7',  sign: DIVISION_CONFIGS.D7.calculateSign(longitude) },
    { key: 'D9',  sign: DIVISION_CONFIGS.D9.calculateSign(longitude) },
    { key: 'D12', sign: DIVISION_CONFIGS.D12.calculateSign(longitude) },
    { key: 'D30', sign: DIVISION_CONFIGS.D30.calculateSign(longitude) },
  ]

  // D1 uses the natal sign directly
  const d1Score = dignityScore(planet, d1Sign)
  let total = d1Score
  for (const v of vargas) {
    total += dignityScore(planet, v.sign)
  }
  // Average of 7 scores; classical max is 45 per varga
  return total / 7
}

// ── 3. Ojayugma Bala ─────────────────────────────────────────────────────────

/** Male planets (Oja group): prefer odd signs. Female: prefer even signs. */
const MALE_PLANETS = new Set(['Sun', 'Mars', 'Jupiter', 'Mercury', 'Saturn'])

/**
 * Compute Ojayugma Bala.
 * Male planets score 15 per chart (D1 / D9) when in odd signs.
 * Female planets score 15 per chart when in even signs.
 */
function ojayugmaBala(planet: string, longitude: number, d1Sign: number): number {
  const d9Sign = DIVISION_CONFIGS.D9.calculateSign(longitude)
  const isMale = MALE_PLANETS.has(planet)
  const d1Odd = d1Sign % 2 === 1  // 1,3,5,7,9,11 = odd
  const d9Odd = d9Sign % 2 === 1
  let score = 0
  if (isMale  &&  d1Odd)  score += 15
  if (!isMale && !d1Odd)  score += 15
  if (isMale  &&  d9Odd)  score += 15
  if (!isMale && !d9Odd)  score += 15
  return score
}

// ── 4. Kendradi Bala ─────────────────────────────────────────────────────────

/**
 * Compute Kendradi Bala based on the Whole-Sign house from Lagna.
 * Kendra (1,4,7,10) = 10, Panapara (2,5,8,11) = 7, Apoklima (3,6,9,12) = 5.
 */
function kendradiBala(house: number): number {
  if ([1, 4, 7, 10].includes(house)) return 10
  if ([2, 5, 8, 11].includes(house)) return 7
  return 5
}

// ── 5. Drekkana Bala ─────────────────────────────────────────────────────────

/** Decanate gender groups */
const MALE_DEKKANA   = new Set(['Sun', 'Mars', 'Jupiter'])
const HERMAPHRODITE  = new Set(['Mercury', 'Saturn'])
// Female: Moon, Venus

/**
 * Compute Drekkana Bala based on the decanate (10°-division) within sign.
 * 1st decanate (0–10°) → Male planets; 2nd (10–20°) → Hermaphrodite; 3rd (20–30°) → Female.
 */
function drekkanaBala(planet: string, degreeInSign: number): number {
  const decan = Math.floor(degreeInSign / 10)  // 0, 1, or 2
  if (decan === 0 && MALE_DEKKANA.has(planet))   return 15
  if (decan === 1 && HERMAPHRODITE.has(planet))  return 15
  if (decan === 2 && (planet === 'Moon' || planet === 'Venus')) return 15
  return 0
}

// ── Aggregator ────────────────────────────────────────────────────────────────

/**
 * Compute total Sthana Bala for a planet.
 *
 * @param planet     - Planet name (Sun, Moon, Mars, …)
 * @param longitude  - Absolute sidereal longitude (0–360°)
 * @param signNumber - D1 sign number (1–12)
 * @param degreeInSign - Degree within sign (0–30)
 * @param house      - Whole-Sign house from Lagna (1–12)
 */
export function computeSthanaBala(
  planet: string,
  longitude: number,
  signNumber: number,
  degreeInSign: number,
  house: number
): SthanaBala {
  const ucchaBalaVal      = uchchaBala(planet, longitude)
  const saptavargajaVal   = saptavargajaBala(planet, longitude, signNumber)
  const ojayugmaVal       = ojayugmaBala(planet, longitude, signNumber)
  const kendradiVal       = kendradiBala(house)
  const drekkanaVal       = drekkanaBala(planet, degreeInSign)

  const total =
    ucchaBalaVal +
    saptavargajaVal +
    ojayugmaVal +
    kendradiVal +
    drekkanaVal

  return {
    ucchaBala:         Math.round(ucchaBalaVal      * 100) / 100,
    saptavargajaBala:  Math.round(saptavargajaVal   * 100) / 100,
    ojayugmaBala:      Math.round(ojayugmaVal       * 100) / 100,
    kendradiBala:      Math.round(kendradiVal       * 100) / 100,
    drekkanaBala:      Math.round(drekkanaVal       * 100) / 100,
    total:             Math.round(total             * 100) / 100,
  }
}
