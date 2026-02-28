/**
 * Shashtiamsa (D60) Divisional Chart
 * 
 * Shows past life karma, subtle karmic influences, and hidden destiny.
 * The most detailed and refined divisional chart revealing deep karmic patterns.
 */

import { 
  buildDivisionalHouses, 
  SHASHTIAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getShashtiamsaSign(longitude: number): number {
  return SHASHTIAMSA_CONFIG.calculateSign(longitude);
}

export function buildShashtiamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SHASHTIAMSA_CONFIG);
}

export { SHASHTIAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
