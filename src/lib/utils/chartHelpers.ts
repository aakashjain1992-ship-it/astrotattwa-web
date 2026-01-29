/**
 * Chart Helper Utilities
 * 
 * Functions for calculating house placements, status flags, 
 * and transforming API data for chart visualization.
 */

import type {
  PlanetData,
  AscendantData,
  ChartData,
  PlanetDisplayInfo,
  HouseInfo,
  StatusFlag,
  PlanetKey,
} from '@/types/chart-display';
import { PLANET_SYMBOLS, RASHI_NAMES, HOUSE_SIGNIFICATIONS } from '@/types/chart-display';

/**
 * Calculate which house a planet is in using WHOLE SIGN HOUSES (Vedic system)
 * 
 * In Whole Sign Houses, each sign = one house completely
 * Example: If Ascendant is in Gemini, entire Gemini = House 1
 * 
 * @param planetLongitude - Absolute longitude of the planet (0-360)
 * @param ascendantLongitude - Absolute longitude of the ascendant (0-360)
 * @returns House number (1-12)
 */
export function getPlanetHouse(planetLongitude: number, ascendantLongitude: number): number {
  // Get the sign number (1-12) for both planet and ascendant
  // Each sign spans 30 degrees: Aries (0-30) = 1, Taurus (30-60) = 2, etc.
  const planetSign = Math.floor(planetLongitude / 30) + 1;
  const ascendantSign = Math.floor(ascendantLongitude / 30) + 1;
  
  // Calculate house number from sign difference
  // House 1 = Ascendant sign
  // House 2 = Next sign after Ascendant, etc.
  let house = planetSign - ascendantSign + 1;
  
  // Handle wrap-around (signs 1-12 are circular)
  if (house <= 0) house += 12;
  if (house > 12) house -= 12;
  
  return house;
}

/**
 * Calculate which rashi (sign) is in a given house
 * 
 * @param houseNumber - House number (1-12)
 * @param ascendantSignNumber - Sign number of the ascendant (1-12)
 * @returns Rashi number (1-12)
 */
export function getHouseRashi(houseNumber: number, ascendantSignNumber: number): number {
  const rashi = ((ascendantSignNumber + houseNumber - 2) % 12) + 1;
  return rashi;
}

/**
 * Generate status flags for a planet based on its conditions
 */
export function getPlanetStatusFlags(planet: PlanetData): StatusFlag[] {
  const flags: StatusFlag[] = [];
  
  if (planet.retrograde) flags.push('R');
  if (planet.combust) flags.push('C');
  if (planet.combustionOrbDeg !== undefined) flags.push('D');
  if (Math.abs(planet.speed) < 0.1) flags.push('S');
  if (planet.exalted) flags.push('↑');
  if (planet.debilitated) flags.push('↓');
  
  return flags;
}

/**
 * Transform planet data into display format
 */
export function transformPlanetForDisplay(
  planetKey: PlanetKey,
  planetData: PlanetData
): PlanetDisplayInfo {
  return {
    key: planetKey,
    symbol: PLANET_SYMBOLS[planetKey],
    degree: Math.round(planetData.degreeInSign),
    statusFlags: getPlanetStatusFlags(planetData),
    longitude: planetData.longitude,
    fullData: planetData,
  };
}

/**
 * Build all 12 houses with their planets
 */
export function buildHouses(chartData: ChartData): HouseInfo[] {
  const ascendantLongitude = chartData.ascendant.longitude;
  const ascendantSignNumber = chartData.ascendant.signNumber;
  
  const planetDisplays: PlanetDisplayInfo[] = Object.entries(chartData.planets).map(
    ([key, data]) => transformPlanetForDisplay(key as PlanetKey, data)
  );
  
  const houses: HouseInfo[] = Array.from({ length: 12 }, (_, i) => {
    const houseNumber = (i + 1) as HouseInfo['houseNumber'];
    const rasiNumber = getHouseRashi(houseNumber, ascendantSignNumber) as HouseInfo['rasiNumber'];
    
    return {
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    };
  });
  
  for (const planet of planetDisplays) {
    const houseNumber = getPlanetHouse(planet.longitude, ascendantLongitude);
    const house = houses[houseNumber - 1];
    house.planets.push(planet);
  }
  
  for (const house of houses) {
    house.planets.sort((a, b) => a.degree - b.degree);
  }
  
  return houses;
}

export function getHouseSignification(houseNumber: number): string {
  return HOUSE_SIGNIFICATIONS[houseNumber] || '';
}

export function formatDegree(decimalDegree: number): string {
  const degrees = Math.floor(decimalDegree);
  const minutesDecimal = (decimalDegree - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  
  return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.toString().padStart(2, '0')}"`;
}

export function getPlanetColorClass(planetKey: PlanetKey): string {
  if (['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(planetKey)) {
    return 'text-blue-600 dark:text-blue-400';
  }
  if (['Sun', 'Mars', 'Saturn'].includes(planetKey)) {
    return 'text-orange-600 dark:text-orange-400';
  }
  if (['Rahu', 'Ketu'].includes(planetKey)) {
    return 'text-purple-600 dark:text-purple-400';
  }
  return 'text-slate-600 dark:text-slate-400';
}

export function isBenefic(planetKey: PlanetKey): boolean {
  return ['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(planetKey);
}

export function isMalefic(planetKey: PlanetKey): boolean {
  return ['Sun', 'Mars', 'Saturn'].includes(planetKey);
}

export function getStatusFlagExplanation(flag: StatusFlag): string {
  const explanations: Record<StatusFlag, string> = {
    'R': 'Retrograde - Moving backward in the zodiac',
    'C': 'Combust - Too close to the Sun, weakened',
    'D': 'Deep Combust - Very close to Sun, severely weakened',
    'S': 'Stationary - Moving very slowly, about to change direction',
    '↑': 'Exalted - In sign of exaltation, very strong',
    '↓': 'Debilitated - In sign of debilitation, weakened',
  };
  
  return explanations[flag] || '';
}
