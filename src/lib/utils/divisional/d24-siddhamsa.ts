/**
 * D24 - Siddhamsa/Chaturvimshamsa Chart (Division by 24)
 * 
 * Signifies: Education, learning, knowledge, and academic success
 * 
 * This is a wrapper around the unified divisional chart builder.
 * It exists for backward compatibility and convenient imports.
 * 
 * @version 1.0.0
 * @created February 26, 2026
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';
import { buildDivisionalHouses, SIDDHAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

/**
 * Build Siddhamsa (D24) houses
 * 
 * D24 divides each sign into 24 equal parts of 1.25° each.
 * Used to assess education, learning abilities, and academic achievements.
 * 
 * @param planets - All planetary positions
 * @param ascendant - Ascendant data
 * @returns Array of 12 houses with planets in D24 positions
 */
export function buildSiddhamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SIDDHAMSA_CONFIG);
}

export default buildSiddhamsaHouses;
