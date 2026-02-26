/**
 * D6 - Shashtamsa Chart (Division by 6)
 * 
 * Signifies: Diseases, debts, enemies, and obstacles
 * 
 * This is a wrapper around the unified divisional chart builder.
 * It exists for backward compatibility and convenient imports.
 * 
 * @version 1.0.0
 * @created February 26, 2026
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';
import { buildDivisionalHouses, SHASHTAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

/**
 * Build Shashtamsa (D6) houses
 * 
 * D6 divides each sign into 6 equal parts of 5° each.
 * Used to assess health issues, enemies, debts, and obstacles.
 * 
 * @param planets - All planetary positions
 * @param ascendant - Ascendant data
 * @returns Array of 12 houses with planets in D6 positions
 */
export function buildShashtamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SHASHTAMSA_CONFIG);
}

export default buildShashtamsaHouses;
