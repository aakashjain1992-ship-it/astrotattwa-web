/**
 * D8 - Ashtamsa Chart (Division by 8)
 * 
 * Signifies: Sudden events, accidents, longevity, and hidden matters
 * 
 * This is a wrapper around the unified divisional chart builder.
 * It exists for backward compatibility and convenient imports.
 * 
 * @version 1.0.0
 * @created February 26, 2026
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';
import { buildDivisionalHouses, ASHTAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

/**
 * Build Ashtamsa (D8) houses
 * 
 * D8 divides each sign into 8 equal parts of 3.75° each.
 * Used to assess sudden events, longevity, accidents, and hidden dangers.
 * 
 * @param planets - All planetary positions
 * @param ascendant - Ascendant data
 * @returns Array of 12 houses with planets in D8 positions
 */
export function buildAshtamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, ASHTAMSA_CONFIG);
}

export default buildAshtamsaHouses;
