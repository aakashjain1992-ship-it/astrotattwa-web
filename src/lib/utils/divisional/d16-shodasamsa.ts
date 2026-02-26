/**
 * Shodasamsa (D16) Divisional Chart
 * 
 * Shows vehicles, conveyances, luxuries, and material comforts
 */

import { 
  buildDivisionalHouses, 
  SHODASAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getShodasamsaSign(longitude: number): number {
  return SHODASAMSA_CONFIG.calculateSign(longitude);
}

export function buildShodasamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SHODASAMSA_CONFIG);
}

export { SHODASAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
