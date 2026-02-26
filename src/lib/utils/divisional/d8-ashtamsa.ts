/**
 * Ashtamsa (D8) Divisional Chart
 * 
 * Shows sudden events, accidents, longevity, and hidden matters
 */

import { 
  buildDivisionalHouses, 
  ASHTAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getAshtamsaSign(longitude: number): number {
  return ASHTAMSA_CONFIG.calculateSign(longitude);
}

export function buildAshtamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, ASHTAMSA_CONFIG);
}

export { ASHTAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
