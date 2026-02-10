/**
 * Saptamsa (D7) Divisional Chart
 * 
 * REFACTORED: Now uses unified divisionalChartBuilder
 * This file maintained for backward compatibility
 * 
 * @deprecated Import directly from divisionalChartBuilder instead:
 * import { buildDivisionalHouses, SAPTAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder'
 */

import { 
  buildDivisionalHouses, 
  SAPTAMSA_CONFIG,
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

/**
 * Calculate Saptamsa sign for a given longitude
 * @deprecated Use SAPTAMSA_CONFIG.calculateSign() directly
 */
export function getSaptamsaSign(longitude: number): number {
  return SAPTAMSA_CONFIG.calculateSign(longitude);
}

/**
 * Build Saptamsa (D7) houses
 * @deprecated Use buildDivisionalHouses(planets, ascendant, SAPTAMSA_CONFIG) instead
 */
export function buildSaptamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SAPTAMSA_CONFIG);
}

// Export config for direct usage
export { SAPTAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
