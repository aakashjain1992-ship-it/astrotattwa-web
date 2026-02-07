/**
 * Drekkana (D3) Divisional Chart
 * 
 * REFACTORED: Now uses unified divisionalChartBuilder
 * This file maintained for backward compatibility
 * 
 * @deprecated Import directly from divisionalChartBuilder instead:
 * import { buildDivisionalHouses, DREKKANA_CONFIG } from '@/lib/astrology/divisionalChartBuilder'
 */

import { 
  buildDivisionalHouses, 
  DREKKANA_CONFIG,
  type DivisionConfig 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

/**
 * Calculate Drekkana sign for a given longitude
 * @deprecated Use DREKKANA_CONFIG.calculateSign() directly
 */
export function getDrekkanaSign(longitude: number): number {
  return DREKKANA_CONFIG.calculateSign(longitude);
}

/**
 * Build Drekkana (D3) houses
 * @deprecated Use buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG) instead
 */
export function buildDrekkanaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG);
}

// Export config for direct usage
export { DREKKANA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
