/**
 * Bhamsa (D27) Divisional Chart
 * 
 * Shows strengths, weaknesses, vitality, and overall health
 */

import { 
  buildDivisionalHouses, 
  BHAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getBhamsaSign(longitude: number): number {
  return BHAMSA_CONFIG.calculateSign(longitude);
}

export function buildBhamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, BHAMSA_CONFIG);
}

export { BHAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
