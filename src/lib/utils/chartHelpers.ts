/**
 * Chart Helper Utilities
 * Functions for building house data for divisional charts
 */

import type { HouseData, PlanetInHouse } from '@/components/chart/diamond';

// ============================================
// CONSTANTS
// ============================================

export const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
  Ascendant: 'Asc',
};

export const PLANET_ORDER = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
] as const;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PlanetData {
  longitude: number;
  sign: string;
  signNumber: number;
  degreeInSign: number;
  retrograde?: boolean;
  combust?: boolean;
  exalted?: boolean;
  debilitated?: boolean;
  nakshatra?: {
    name: string;
    pada: number;
    lord: string;
  };
}

export interface AscendantData {
  sign: string;
  signNumber: number;
  degreeInSign: number;
}

// ============================================
// HOUSE BUILDING FUNCTIONS
// ============================================

/**
 * Build houses for D1 (Lagna/Rashi) chart
 * Places planets in houses based on their zodiac sign position
 */
export function buildLagnaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseData[] {
  const ascSignNumber = ascendant.signNumber; // 1-12
  const houses: HouseData[] = [];

  // Create 12 empty houses starting from ascendant sign
  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const rasiNumber = ((ascSignNumber - 1 + i) % 12) + 1;
    
    houses.push({
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }

  // Place planets in houses based on their sign
  Object.entries(planets).forEach(([planetKey, planetData]) => {
    const planetSignNumber = planetData.signNumber;
    
    // Calculate which house this sign falls into
    // House 1 = ascendant sign, House 2 = next sign, etc.
    const houseIndex = (planetSignNumber - ascSignNumber + 12) % 12;
    
    // Build status flags
    const statusFlags: string[] = [];
    if (planetData.retrograde) statusFlags.push('R');
    if (planetData.combust) statusFlags.push('C');
    if (planetData.exalted) statusFlags.push('Ex');
    if (planetData.debilitated) statusFlags.push('Db');

    const planet: PlanetInHouse = {
      key: planetKey,
      symbol: PLANET_SYMBOLS[planetKey] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
    };

    houses[houseIndex].planets.push(planet);
  });

  // Sort planets in each house by degree
  houses.forEach(house => {
    house.planets.sort((a, b) => a.degree - b.degree);
  });

  return houses;
}

/**
 * Build houses for D9 (Navamsa) chart
 * Each sign is divided into 9 parts (3°20' each)
 */
export function buildNavamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseData[] {
  // Calculate Navamsa positions
  const getNavamsaSign = (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30); // 0-11
    const degreeInSign = longitude % 30;
    const navamsaPada = Math.floor(degreeInSign / (30 / 9)); // 0-8
    
    // Navamsa calculation: depends on the element of the sign
    // Fire signs (0,4,8): start from Aries (0)
    // Earth signs (1,5,9): start from Capricorn (9)
    // Air signs (2,6,10): start from Libra (6)
    // Water signs (3,7,11): start from Cancer (3)
    const elementOffset = [0, 9, 6, 3][signIndex % 4];
    
    return ((elementOffset + navamsaPada) % 12) + 1; // 1-12
  };

  // Get ascendant navamsa sign
  const ascNavamsaSign = getNavamsaSign(
    (ascendant.signNumber - 1) * 30 + ascendant.degreeInSign
  );

  const houses: HouseData[] = [];

  // Create 12 empty houses
  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const rasiNumber = ((ascNavamsaSign - 1 + i) % 12) + 1;
    
    houses.push({
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }

  // Place planets based on navamsa position
  Object.entries(planets).forEach(([planetKey, planetData]) => {
    const navamsaSign = getNavamsaSign(planetData.longitude);
    const houseIndex = (navamsaSign - ascNavamsaSign + 12) % 12;
    
    const statusFlags: string[] = [];
    if (planetData.retrograde) statusFlags.push('R');

    houses[houseIndex].planets.push({
      key: planetKey,
      symbol: PLANET_SYMBOLS[planetKey] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
    });
  });

  return houses;
}

/**
 * Build houses for D10 (Dasamsa) chart
 * Career and profession chart - each sign divided into 10 parts (3° each)
 */
export function buildDasamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseData[] {
  const getDasamsaSign = (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30); // 0-11
    const degreeInSign = longitude % 30;
    const dasamsaPart = Math.floor(degreeInSign / 3); // 0-9
    
    // Dasamsa: Odd signs start from same sign, even signs start from 9th
    const isOddSign = signIndex % 2 === 0;
    const startSign = isOddSign ? signIndex : (signIndex + 8) % 12;
    
    return ((startSign + dasamsaPart) % 12) + 1; // 1-12
  };

  const ascDasamsaSign = getDasamsaSign(
    (ascendant.signNumber - 1) * 30 + ascendant.degreeInSign
  );

  const houses: HouseData[] = [];

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const rasiNumber = ((ascDasamsaSign - 1 + i) % 12) + 1;
    
    houses.push({
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }

  Object.entries(planets).forEach(([planetKey, planetData]) => {
    const dasamsaSign = getDasamsaSign(planetData.longitude);
    const houseIndex = (dasamsaSign - ascDasamsaSign + 12) % 12;
    
    const statusFlags: string[] = [];
    if (planetData.retrograde) statusFlags.push('R');

    houses[houseIndex].planets.push({
      key: planetKey,
      symbol: PLANET_SYMBOLS[planetKey] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
    });
  });

  return houses;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get sign name from sign number (1-12)
 */
export function getSignName(signNumber: number): string {
  return RASHI_NAMES[(signNumber - 1 + 12) % 12];
}

/**
 * Get sign number from longitude (0-360)
 */
export function getSignFromLongitude(longitude: number): number {
  return Math.floor(longitude / 30) + 1; // 1-12
}

/**
 * Get degree within sign from longitude
 */
export function getDegreeInSign(longitude: number): number {
  return longitude % 30;
}

/**
 * Format degree for display (e.g., "15°23'")
 */
export function formatDegree(degree: number): string {
  const deg = Math.floor(degree);
  const min = Math.round((degree - deg) * 60);
  return `${deg}°${min}'`;
}

/**
 * Check if a planet is retrograde based on its speed
 */
export function isRetrograde(speed: number): boolean {
  return speed < 0;
}

// ============================================
// BACKWARD COMPATIBILITY FUNCTIONS
// (Used by NorthIndianChart.tsx and admin/chart-test)
// ============================================

export type HouseSystem = 'whole-sign' | 'placidus' | 'koch' | 'equal';

/**
 * Get human-readable name for house system
 */
export function getHouseSystemName(system: HouseSystem): string {
  const names: Record<HouseSystem, string> = {
    'whole-sign': 'Whole Sign',
    'placidus': 'Placidus',
    'koch': 'Koch',
    'equal': 'Equal House',
  };
  return names[system] || system;
}

/**
 * Build houses for chart display (backward compatible version)
 * Used by existing NorthIndianChart.tsx
 */
export function buildHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData,
  houseSystem: HouseSystem = 'whole-sign'
): HouseData[] {
  // For whole-sign system, use buildLagnaHouses
  // Other house systems can be implemented later
  return buildLagnaHouses(planets, ascendant);
}
