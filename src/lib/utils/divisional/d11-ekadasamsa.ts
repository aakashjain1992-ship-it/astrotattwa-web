/**
 * D11 - Ekadasamsa Chart (Division by 11)
 * 
 * Signifies: Gains, honors, achievements, and fulfillment
 * 
 * This is a wrapper around the unified divisional chart builder.
 * It exists for backward compatibility and convenient imports.
 * 
 * @version 1.0.0
 * @created February 26, 2026
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';
import { buildDivisionalHouses, EKADASAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

/**
 * Build Ekadasamsa (D11) houses
 * 
 * D11 divides each sign into 11 equal parts of ~2.73° each.
 * Used to assess gains, honors, achievements, and general fulfillment.
 * 
 * @param planets - All planetary positions
 * @param ascendant - Ascendant data
 * @returns Array of 12 houses with planets in D11 positions
 */
export function buildEkadasamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, EKADASAMSA_CONFIG);
}

export default buildEkadasamsaHouses;
