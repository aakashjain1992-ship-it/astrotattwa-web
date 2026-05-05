/**
 * Naisargika Bala — Natural Strength (fixed constants)
 *
 * Each planet has an inherent, unchanging strength that reflects its
 * natural luminosity and significance in the cosmos.
 *
 * Order (descending): Sun > Moon > Venus > Jupiter > Mercury > Mars > Saturn
 */

/** Fixed Naisargika Bala virupas per planet */
export const NAISARGIKA_BALA: Record<string, number> = {
  Sun:     60,
  Moon:    51.43,
  Venus:   45,
  Jupiter: 34.29,
  Mercury: 25.71,
  Mars:    17.14,
  Saturn:  8.57,
}

/**
 * Return the Naisargika (natural) Bala for a planet.
 *
 * @param planet - Planet name
 * @returns Fixed natural strength in virupas, or 0 if not a classical planet
 */
export function computeNaisargikaBala(planet: string): number {
  return NAISARGIKA_BALA[planet] ?? 0
}
