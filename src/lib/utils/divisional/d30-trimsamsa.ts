/**
 * Trimsamsa (D30) Divisional Chart
 * 
 * Shows misfortunes, weaknesses, hidden enemies, and evil influences
 */

import { 
  buildDivisionalHouses, 
  TRIMSAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getTrimsamsaSign(longitude: number): number {
  return TRIMSAMSA_CONFIG.calculateSign(longitude);
}

export function buildTrimsamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, TRIMSAMSA_CONFIG);
}

export { TRIMSAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
