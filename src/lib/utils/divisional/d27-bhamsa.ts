/**
 * D27 - Bhamsa/Nakshatramsa Chart (Division by 27)
 * 
 * Signifies: Strengths, weaknesses, vitality, and overall health
 * 
 * This is a wrapper around the unified divisional chart builder.
 * It exists for backward compatibility and convenient imports.
 * 
 * @version 1.0.0
 * @created February 26, 2026
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';
import { buildDivisionalHouses, BHAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

/**
 * Build Bhamsa (D27) houses
 * 
 * D27 divides each sign into 27 equal parts of ~1.11° each.
 * Used to assess general strengths, weaknesses, vitality, and health.
 * 
 * @param planets - All planetary positions
 * @param ascendant - Ascendant data
 * @returns Array of 12 houses with planets in D27 positions
 */
export function buildBhamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, BHAMSA_CONFIG);
}

export default buildBhamsaHouses;
