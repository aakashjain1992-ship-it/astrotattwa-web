/**
 * Dig Bala — Directional Strength (0–60 virupas)
 *
 * Each planet has a "strongest house" (dig peak). Strength is proportional
 * to angular distance from the weakest house (opposite the peak).
 *
 * Dig peak houses:
 *   Sun, Mars   → 10th house
 *   Moon, Venus → 4th house
 *   Jupiter, Mercury → 1st house (Lagna)
 *   Saturn      → 7th house
 */

/** Map of planet → house of maximum directional strength */
const DIG_PEAK: Record<string, number> = {
  Sun:     10,
  Mars:    10,
  Moon:    4,
  Venus:   4,
  Jupiter: 1,
  Mercury: 1,
  Saturn:  7,
}

/**
 * Compute Dig Bala (directional strength) for a planet.
 *
 * @param planet - Planet name
 * @param house  - Whole-Sign house from Lagna (1–12)
 * @returns Dig Bala in virupas (0–60)
 */
export function computeDigBala(planet: string, house: number): number {
  const peak = DIG_PEAK[planet]
  if (peak === undefined) return 0

  // Weak house is 6 houses away from peak (opposite in the 12-sign wheel)
  const weakHouse = ((peak - 1 + 6) % 12) + 1

  // Circular distance from weak house (0 = at weak point, 6 = at peak)
  let dist = Math.abs(house - weakHouse)
  if (dist > 6) dist = 12 - dist

  // Scale: 0 virupas at weak house, 60 at peak
  return Math.round(((dist / 6) * 60) * 100) / 100
}
