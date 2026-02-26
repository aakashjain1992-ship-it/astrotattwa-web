/**
 * Vimshamsa (D20) Divisional Chart
 * 
 * Shows spiritual progress, religious inclinations, and worship
 */

import { 
  buildDivisionalHouses, 
  VIMSHAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getVimsamsaSign(longitude: number): number {
  return VIMSHAMSA_CONFIG.calculateSign(longitude);
}

export function buildVimsamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, VIMSHAMSA_CONFIG);
}

export { VIMSHAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
