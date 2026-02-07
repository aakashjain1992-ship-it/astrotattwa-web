/**
 * Dasamsa (D10) Divisional Chart
 * 
 * Shows career, profession, status, achievements, and public life
 */

import { 
  buildDivisionalHouses, 
  DASAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getDasamsaSign(longitude: number): number {
  return DASAMSA_CONFIG.calculateSign(longitude);
}

export function buildDasamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, DASAMSA_CONFIG);
}

export { DASAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
