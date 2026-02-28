/**
 * Khavedamsa (D40) Divisional Chart
 * 
 * Shows auspicious and inauspicious effects, maternal lineage,
 * and overall well-being in life events
 */

import { 
  buildDivisionalHouses, 
  KHAVEDAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getKhavedamsaSign(longitude: number): number {
  return KHAVEDAMSA_CONFIG.calculateSign(longitude);
}

export function buildKhavedamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, KHAVEDAMSA_CONFIG);
}

export { KHAVEDAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
