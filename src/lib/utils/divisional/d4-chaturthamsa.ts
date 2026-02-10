/**
 * Chaturthamsa (D4) Divisional Chart
 * 
 * Shows property, assets, fixed resources, and general fortune
 */

import { 
  buildDivisionalHouses, 
  CHATURTHAMSA_CONFIG 
} from '@/lib/astrology/divisionalChartBuilder';
import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

export function getChaturtamsaSign(longitude: number): number {
  return CHATURTHAMSA_CONFIG.calculateSign(longitude);
}

export function buildChaturtamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, CHATURTHAMSA_CONFIG);
}

export { CHATURTHAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';
