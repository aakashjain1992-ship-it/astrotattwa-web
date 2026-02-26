/**
 * Siddhamsa (D24) Divisional Chart
 * 
 * Shows education, learning, knowledge, and academic success
 */

import { 
  buildDivisionalHouses, 
  SIDDHAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getSiddhamsaSign(longitude: number): number {
  return SIDDHAMSA_CONFIG.calculateSign(longitude);
}

export function buildSiddhamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SIDDHAMSA_CONFIG);
}

export { SIDDHAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
