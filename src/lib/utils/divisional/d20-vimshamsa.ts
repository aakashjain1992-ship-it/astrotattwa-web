/**
 * D20 - Vimshamsa Chart (Division by 20)
 * 
 * Signifies: Spiritual progress, religious inclinations, and worship
 * 
 * This is a wrapper around the unified divisional chart builder.
 * It exists for backward compatibility and convenient imports.
 * 
 * @version 1.0.0
 * @created February 26, 2026
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';
import { buildDivisionalHouses, VIMSHAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

/**
 * Build Vimshamsa (D20) houses
 * 
 * D20 divides each sign into 20 equal parts of 1.5° each.
 * Used to assess spiritual progress, religious devotion, and worship practices.
 * 
 * @param planets - All planetary positions
 * @param ascendant - Ascendant data
 * @returns Array of 12 houses with planets in D20 positions
 */
export function buildVimsamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, VIMSHAMSA_CONFIG);
}

export default buildVimsamsaHouses;
