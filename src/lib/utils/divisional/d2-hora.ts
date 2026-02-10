/** Hora (D2) Divisional Chart
 * 
 * REFACTORED: Now uses unified divisionalChartBuilder
 * This file maintained for backward compatibility
 * 
 * @deprecated Import directly from divisionalChartBuilder instead:
 * import { buildDivisionalHouses, HORA_CONFIG } from '@/lib/astrology/divisionalChartBuilder'
 */

import { 
  buildDivisionalHouses, 
  HORA_CONFIG,
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

/**
 * Calculate Hora sign for a given longitude
 * @deprecated Use HORA_CONFIG.calculateSign() directly
 */
export function getHoraSign(longitude: number): number {
  return HORA_CONFIG.calculateSign(longitude);
}

/**
 * Build Hora (D2) houses
 * @deprecated Use buildDivisionalHouses(planets, ascendant, HORA_CONFIG) instead
 */
export function buildHoraHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, HORA_CONFIG);
}

// Export config for direct usage
export { HORA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
