/**
 * Navamsa (D9) Divisional Chart
 * 
 * THE MOST IMPORTANT divisional chart after D1 (Rasi)
 * Shows: spouse characteristics, dharma, inner strength, spiritual life
 */

import { 
  buildDivisionalHouses, 
  NAVAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getNavamsaSign(longitude: number): number {
  return NAVAMSA_CONFIG.calculateSign(longitude);
}

export function buildNavamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, NAVAMSA_CONFIG);
}

export { NAVAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
