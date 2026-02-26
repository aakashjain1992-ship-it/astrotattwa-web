/**
 * Ekadasamsa (D11) Divisional Chart
 * 
 * Shows gains, honors, achievements, and fulfillment
 */

import { 
  buildDivisionalHouses, 
  EKADASAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getEkadasamsaSign(longitude: number): number {
  return EKADASAMSA_CONFIG.calculateSign(longitude);
}

export function buildEkadasamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, EKADASAMSA_CONFIG);
}

export { EKADASAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
