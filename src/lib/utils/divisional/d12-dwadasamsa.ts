/**
* Dwadasamsa (D12) Divisional Chart
 * 
 * REFACTORED: Now uses unified divisionalChartBuilder
 * This file maintained for backward compatibility
 * 
 * @deprecated Import directly from divisionalChartBuilder instead:
 * import { buildDivisionalHouses, DWADASAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder'
 */

import { 
  buildDivisionalHouses, 
  DWADASAMSA_CONFIG,
  type DivisionConfig 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

/**
 * Calculate Dwadasamsa sign for a given longitude
 * @deprecated Use DWADASAMSA_CONFIG.calculateSign() directly
 */
export function getDwadamsamsaSign(longitude: number): number {
  return DWADASAMSA_CONFIG.calculateSign(longitude);
}

/**
 * Build Dwadasamsa (D12) houses
 * @deprecated Use buildDivisionalHouses(planets, ascendant, DWADASAMSA_CONFIG) instead
 */
export function buildDwadamsamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, DWADASAMSA_CONFIG);
}

// Export config for direct usage
export { DWADASAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
