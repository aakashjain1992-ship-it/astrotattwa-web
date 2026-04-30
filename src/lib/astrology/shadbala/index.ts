/**
 * Shadbala — Six-Strength Planetary Strength System
 *
 * Orchestrator for the complete Shadbala calculation.
 * Computes all 6 components for 7 classical planets and returns
 * a structured result with totals, required minimums, and labels.
 *
 * Six components:
 *   1. Sthana Bala   — positional strength
 *   2. Dig Bala      — directional strength
 *   3. Kala Bala     — temporal strength
 *   4. Chesta Bala   — motional strength
 *   5. Naisargika Bala — natural/inherent strength
 *   6. Drik Bala     — aspectual strength
 */

import type { PlanetShadbala, ShadbalaInput, ShadbalaResult } from './types'
import { computeSthanaBala } from './sthana'
import { computeDigBala }    from './digbala'
import { computeKalaBala }   from './kalabala'
import { computeChestaBala } from './chesta'
import { computeNaisargikaBala } from './naisargika'
import { computeDrikBala }   from './drikbala'

/** Classical planets processed by Shadbala (Rahu and Ketu excluded) */
const SHADBALA_PLANETS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
] as const

/** Classical minimum virupas required for each planet to be considered "strong" */
export const REQUIRED_MINIMUM: Record<string, number> = {
  Sun:     390,
  Moon:    360,
  Mars:    300,
  Mercury: 420,
  Jupiter: 390,
  Venus:   330,
  Saturn:  300,
}

/**
 * Determine qualitative strength label from total vs. required minimum.
 * ≥100% → 'strong', ≥75% → 'adequate', <75% → 'weak'
 */
function strengthLabel(total: number, required: number): 'strong' | 'adequate' | 'weak' {
  const pct = total / required
  if (pct >= 1.0)  return 'strong'
  if (pct >= 0.75) return 'adequate'
  return 'weak'
}

/**
 * Compute Whole-Sign house of a planet from Lagna.
 * Formula: ((planetSign − ascendantSign + 12) % 12) + 1
 */
function wholeSignHouse(planetSign: number, ascendantSign: number): number {
  return ((planetSign - ascendantSign + 12) % 12) + 1
}

/**
 * Compute complete Shadbala for all 7 classical planets.
 *
 * @param input - Parsed birth data with planet positions, ascendant, and timing info
 * @returns ShadbalaResult with per-planet scores, totals, and strength labels
 */
export function computeShadbala(input: ShadbalaInput): ShadbalaResult {
  const { planets, ascendant, sunriseJD, sunsetJD, julianDayUT } = input

  const moonData = planets['Moon']
  const sunData  = planets['Sun']
  const moonLon  = moonData?.longitude ?? 0
  const sunLon   = sunData?.longitude  ?? 0

  const results: PlanetShadbala[] = []

  for (const planet of SHADBALA_PLANETS) {
    const data = planets[planet]
    if (!data) continue  // skip if planet not present in input

    const house = wholeSignHouse(data.signNumber, ascendant.signNumber)

    // 1. Sthana Bala
    const sthanaBala = computeSthanaBala(
      planet,
      data.longitude,
      data.signNumber,
      data.degreeInSign,
      house
    )

    // 2. Dig Bala
    const digBalaRaw = computeDigBala(planet, house)

    // 3. Kala Bala
    const kalaBala = computeKalaBala(
      planet,
      julianDayUT,
      sunriseJD,
      sunsetJD,
      julianDayUT,
      moonLon,
      sunLon
    )

    // 4. Chesta Bala
    const chestaBalaRaw = computeChestaBala(
      planet,
      data.speed,
      data.retrograde,
      data.combust,
      moonLon,
      sunLon
    )

    // 5. Naisargika Bala
    const naisargikaBalaRaw = computeNaisargikaBala(planet)

    // 6. Drik Bala
    const drikBalaRaw = computeDrikBala(
      planet,
      data.signNumber,
      planets,
      moonLon,
      sunLon
    )

    // Total — Drik Bala is added (it can reduce total when negative)
    const total =
      sthanaBala.total +
      digBalaRaw +
      kalaBala.total +
      chestaBalaRaw +
      naisargikaBalaRaw +
      drikBalaRaw

    const required = REQUIRED_MINIMUM[planet] ?? 300
    const strengthPercent = Math.round((total / required) * 10000) / 100

    const r = (v: number) => Math.round(v * 100) / 100

    results.push({
      planet,
      sthanaBala,
      digBala:         r(digBalaRaw),
      kalaBala,
      chestaBala:      r(chestaBalaRaw),
      naisargikaBala:  r(naisargikaBalaRaw),
      drikBala:        r(drikBalaRaw),
      total:           r(total),
      requiredMinimum: required,
      strengthPercent,
      strengthLabel:   strengthLabel(total, required),
    })
  }

  return {
    version: 1,
    planets: results,
    generatedAt: new Date().toISOString(),
  }
}

// Re-export types for consumers
export type { ShadbalaInput, ShadbalaResult, PlanetShadbala } from './types'
