/**
 * Panchamamsa (D5) Divisional Chart
 * 
 * Shows fame, power, authority, and influence
 */

import { 
  buildDivisionalHouses, 
  PANCHAMAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getPanchamamsaSign(longitude: number): number {
  return PANCHAMAMSA_CONFIG.calculateSign(longitude);
}

export function buildPanchamamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, PANCHAMAMSA_CONFIG);
}

export { PANCHAMAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
