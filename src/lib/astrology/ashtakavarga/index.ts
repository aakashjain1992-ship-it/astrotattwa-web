/**
 * Ashtakavarga Computation Engine
 *
 * Computes the Bhinnashtakavarga (individual planet tables) and
 * Sarvashtakavarga (composite sum) from a birth chart.
 *
 * Algorithm:
 *   For each target planet T and each of 12 signs S:
 *     For each reference point R (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna):
 *       house = ((S - rSign + 12) % 12) + 1
 *       If house is in T's contribution table for R → add 1 bindu to sign S
 *
 * Index convention: bindus[0] = Aries (sign 1), bindus[11] = Pisces (sign 12)
 */

import { ASHTAKAVARGA_TABLES, type ReferencePoint } from './tables'
import type {
  AshtakavargaInput,
  AshtakavargaResult,
  BhinnashtakavargaTable,
  AshtakavargaPlanet,
  SignStrength,
} from './types'

export type { AshtakavargaInput, AshtakavargaResult, BhinnashtakavargaTable }
export { SIGN_NAMES } from './types'

const PLANETS: AshtakavargaPlanet[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
]

const REFERENCE_POINTS: ReferencePoint[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Lagna',
]

/**
 * Pre-built Set lookup tables for O(1) membership checks.
 * Shape: CONTRIBUTING_HOUSES[targetPlanet][referencePoint] = Set<number>
 */
const CONTRIBUTING_HOUSES: Record<string, Record<string, Set<number>>> = Object.fromEntries(
  Object.entries(ASHTAKAVARGA_TABLES).map(([planet, refMap]) => [
    planet,
    Object.fromEntries(
      Object.entries(refMap).map(([ref, houses]) => [ref, new Set(houses)])
    ),
  ])
)

/**
 * Compute the full Ashtakavarga analysis for a birth chart.
 *
 * @param input - Planet sign positions (1-12) and ascendant sign number (1-12)
 * @returns Complete AshtakavargaResult with individual tables and Sarvashtakavarga
 */
export function computeAshtakavarga(input: AshtakavargaInput): AshtakavargaResult {
  const bhinnashtakavarga: BhinnashtakavargaTable[] = []
  const sarva = new Array<number>(12).fill(0)

  for (const targetPlanet of PLANETS) {
    const bindus = new Array<number>(12).fill(0)
    const planetTables = CONTRIBUTING_HOUSES[targetPlanet]

    for (const refPoint of REFERENCE_POINTS) {
      // Resolve sign number for this reference point (1-12)
      const refSign =
        refPoint === 'Lagna'
          ? input.ascendant.signNumber
          : input.planets[refPoint].signNumber

      const contributingHouses = planetTables[refPoint]
      if (!contributingHouses) continue

      // For each of 12 signs, check if it receives a bindu from this reference point
      for (let sign = 1; sign <= 12; sign++) {
        // House number counted from refSign to sign (1-based, 1-12)
        const house = ((sign - refSign + 12) % 12) + 1
        if (contributingHouses.has(house)) {
          bindus[sign - 1] += 1 // index 0 = sign 1 (Aries)
        }
      }
    }

    const total = bindus.reduce((a, b) => a + b, 0)
    const goodSignCount = bindus.filter((b) => b >= 4).length

    bhinnashtakavarga.push({ planet: targetPlanet, bindus, total, goodSignCount })

    // Accumulate into Sarvashtakavarga
    for (let i = 0; i < 12; i++) {
      sarva[i] += bindus[i]
    }
  }

  const sarvaTotal = sarva.reduce((a, b) => a + b, 0)

  const signStrengths: SignStrength[] = sarva.map((b) =>
    b >= 28 ? 'strong' : b >= 25 ? 'moderate' : 'weak'
  )

  return {
    version: 1,
    bhinnashtakavarga,
    sarvashtakavarga: sarva,
    sarvaTotal,
    signStrengths,
    generatedAt: new Date().toISOString(),
  }
}
