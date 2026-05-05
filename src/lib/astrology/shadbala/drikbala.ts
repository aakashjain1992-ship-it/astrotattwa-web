/**
 * Drik Bala — Aspectual Strength (−30 to +30 virupas)
 *
 * Computed from aspects received by the planet from other planets.
 * Each benefic aspect adds +15, each malefic aspect subtracts 15.
 * Result is clamped to [−30, +30].
 *
 * Benefic/malefic classification per BPHS:
 *   - Natural benefics (Jupiter, Venus): always beneficial
 *   - Natural malefics (Sun, Mars, Saturn): always malefic
 *   - Moon: benefic in waxing phase (0–180°), malefic in waning (180–360°)
 *   - Mercury: benefic when associated with benefics, malefic with malefics.
 *     Approximation: check majority of planets in same/adjacent signs; default benefic.
 *   - Rahu/Ketu: skipped (no Shadbala for nodes)
 */

import { getAspectedSigns } from '@/lib/astrology/strength/aspectEngine'
import type { ShadbalaInput } from './types'

const NATURAL_MALEFICS = new Set(['Sun', 'Mars', 'Saturn'])
const NATURAL_BENEFICS = new Set(['Jupiter', 'Venus'])
const SKIP_PLANETS     = new Set(['Rahu', 'Ketu', 'Ascendant'])

/**
 * Compute Drik Bala for a planet.
 *
 * @param planet     - Planet name receiving aspects
 * @param planetSign - D1 sign number of the planet being assessed
 * @param allPlanets - All planet data from ShadbalaInput
 * @param moonLon    - Moon's sidereal longitude (to determine Moon's phase/nature)
 * @param sunLon     - Sun's sidereal longitude
 * @returns Drik Bala in virupas (−30 to +30)
 */
export function computeDrikBala(
  planet: string,
  planetSign: number,
  allPlanets: ShadbalaInput['planets'],
  moonLon: number,
  sunLon: number
): number {
  const moonPhase  = ((moonLon - sunLon) + 360) % 360
  const moonIsBenefic = moonPhase <= 180

  let score = 0

  for (const [other, otherData] of Object.entries(allPlanets)) {
    if (other === planet)         continue
    if (SKIP_PLANETS.has(other))  continue

    const aspectedSigns = getAspectedSigns(other, otherData.signNumber)
    if (!aspectedSigns.includes(planetSign)) continue

    // Determine if the aspecting planet is benefic
    let isBenefic: boolean
    if (other === 'Moon') {
      isBenefic = moonIsBenefic
    } else if (other === 'Mercury') {
      // Mercury takes on nature of its associates: count benefic vs malefic planets
      // sharing the same sign or within 1 sign. Default to benefic if no strong company.
      const mercSign = otherData.signNumber
      let beneficCompany = 0
      let maleficCompany = 0
      for (const [companion, cData] of Object.entries(allPlanets)) {
        if (companion === 'Mercury' || SKIP_PLANETS.has(companion)) continue
        const dist = Math.min(Math.abs(cData.signNumber - mercSign), 12 - Math.abs(cData.signNumber - mercSign))
        if (dist <= 1) {
          if (NATURAL_BENEFICS.has(companion)) beneficCompany++
          else if (NATURAL_MALEFICS.has(companion)) maleficCompany++
        }
      }
      isBenefic = maleficCompany > beneficCompany ? false : true  // default benefic when tied
    } else {
      isBenefic = !NATURAL_MALEFICS.has(other)
    }

    score += isBenefic ? 15 : -15
  }

  // Clamp to [−30, +30]
  return Math.round(Math.max(-30, Math.min(30, score)) * 100) / 100
}
