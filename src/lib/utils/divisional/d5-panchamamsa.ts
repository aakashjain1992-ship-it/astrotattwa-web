/**
 * D5 - Panchamamsa Chart (Division by 5)
 * 
 * Signifies: Fame, power, authority, and influence
 * 
 * This is a wrapper around the unified divisional chart builder.
 * It exists for backward compatibility and convenient imports.
 * 
 * @version 1.0.0
 * @created February 26, 2026
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';
import { buildDivisionalHouses, PANCHAMAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

/**
 * Build Panchamamsa (D5) houses
 * 
 * D5 divides each sign into 5 equal parts of 6° each.
 * Used to assess fame, authority, power, and influence in life.
 * 
 * @param planets - All planetary positions
 * @param ascendant - Ascendant data
 * @returns Array of 12 houses with planets in D5 positions
 */
export function buildPanchamamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, PANCHAMAMSA_CONFIG);
}

export default buildPanchamamsaHouses;
