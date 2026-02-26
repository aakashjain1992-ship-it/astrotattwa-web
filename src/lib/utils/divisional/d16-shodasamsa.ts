/**
 * D16 - Shodasamsa Chart (Division by 16)
 * 
 * Signifies: Vehicles, conveyances, luxuries, and material comforts
 * 
 * This is a wrapper around the unified divisional chart builder.
 * It exists for backward compatibility and convenient imports.
 * 
 * @version 1.0.0
 * @created February 26, 2026
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';
import { buildDivisionalHouses, SHODASAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

/**
 * Build Shodasamsa (D16) houses
 * 
 * D16 divides each sign into 16 equal parts of 1.875° each.
 * Used to assess vehicles, material comforts, luxuries, and happiness.
 * 
 * @param planets - All planetary positions
 * @param ascendant - Ascendant data
 * @returns Array of 12 houses with planets in D16 positions
 */
export function buildShodasamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SHODASAMSA_CONFIG);
}

export default buildShodasamsaHouses;
