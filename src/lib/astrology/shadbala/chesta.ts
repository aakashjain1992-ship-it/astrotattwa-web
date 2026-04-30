/**
 * Chesta Bala — Motional Strength (0–60 virupas)
 *
 * Measures the vigor/intentionality of a planet's motion:
 *   - Retrograde planets: maximum strength (60) — intensely engaged
 *   - Slower-than-average direct motion: partially strong (30–60)
 *   - Faster-than-average direct motion: standard (30)
 *   - Combust: 0 — motion suppressed by solar proximity
 *
 * Special rules:
 *   - Sun: always 30 (mean motion, no chesta variation)
 *   - Moon: uses lunar phase (same formula as Paksha Bala) — peaks at full Moon
 */

/** Average daily motion (degrees/day) for outer/inner planets */
const AVG_SPEED: Record<string, number> = {
  Mars:    0.524,
  Mercury: 1.383,
  Jupiter: 0.083,
  Venus:   1.2,
  Saturn:  0.033,
}

/**
 * Compute Chesta Bala for a planet.
 *
 * @param planet     - Planet name
 * @param speed      - Current speed in degrees/day (negative = retrograde)
 * @param retrograde - Whether the planet is retrograde
 * @param combust    - Whether the planet is combust (suppresses chesta to 0)
 * @param moonLon    - Moon's sidereal longitude (used for Moon's phase-based chesta)
 * @param sunLon     - Sun's sidereal longitude
 * @returns Chesta Bala in virupas (0–60)
 */
export function computeChestaBala(
  planet: string,
  speed: number,
  retrograde: boolean,
  combust: boolean,
  moonLon: number,
  sunLon: number
): number {
  if (combust) return 0
  if (planet === 'Sun') return 30

  if (planet === 'Moon') {
    // Moon's chesta = lunar phase strength (peaks at full Moon)
    const phase = ((moonLon - sunLon) + 360) % 360
    const value = phase <= 180 ? phase / 3 : (360 - phase) / 3
    return Math.round(value * 100) / 100
  }

  if (retrograde) return 60

  const avgSpeed = AVG_SPEED[planet]
  if (!avgSpeed) return 30

  const absSpeed = Math.abs(speed)
  const ratio = absSpeed / avgSpeed

  // Faster than average → 30 virupas
  if (ratio >= 1) return 30

  // Slower than average (approaching stationary) → 30–60 virupas
  const value = 30 + (1 - ratio) * 30
  return Math.round(value * 100) / 100
}
