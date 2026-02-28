/**
 * Akshavedamsa (D45) Divisional Chart
 * 
 * Shows character, conduct, moral values, and ethical disposition.
 * Reveals general effects and behavioral patterns.
 */

import { 
  buildDivisionalHouses, 
  AKSHAVEDAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getAkshavedamsaSign(longitude: number): number {
  return AKSHAVEDAMSA_CONFIG.calculateSign(longitude);
}

export function buildAkshavedamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, AKSHAVEDAMSA_CONFIG);
}

export { AKSHAVEDAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
