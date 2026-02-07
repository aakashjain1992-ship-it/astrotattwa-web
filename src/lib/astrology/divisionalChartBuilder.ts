/**
 * Unified Divisional Chart Builder
 * 
 * Consolidates duplicate logic from d2-hora.ts, d3-drekkana.ts, d7-saptamsa.ts, d12-dwadasamsa.ts
 * Reduces ~150 lines of duplicate code to a single configurable function
 * 
 * @version 1.0.0
 * @created February 7, 2026
 */

import type { PlanetData, AscendantData } from '@/types/chart-display';
import type { HouseInfo } from '@/types/chart-display';
import { RASHI_NAMES, PLANET_SYMBOLS } from '@/types/chart-display';

// ===== DIVISION CONFIGURATIONS =====

/**
 * Configuration for a divisional chart calculation
 */
export interface DivisionConfig {
  /** Division type identifier */
  type: 'D1' | 'D2' | 'D3' | 'D4' | 'D7' | 'D9' | 'D10' | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D40' | 'D45' | 'D60';
  
  /** Display name */
  name: string;
  
  /** Sanskrit name */
  sanskritName: string;
  
  /** Number of divisions per sign (e.g., 2 for Hora, 3 for Drekkana) */
  divisor: number;
  
  /** Sign calculation function - takes longitude, returns sign number (1-12) */
  calculateSign: (longitude: number) => number;
}

/**
 * Hora (D2) Configuration
 * Divides each sign into 2 parts (15° each)
 * Odd signs: First half → Leo, Second half → Cancer
 * Even signs: First half → Cancer, Second half → Leo
 */
export const HORA_CONFIG: DivisionConfig = {
  type: 'D2',
  name: 'Hora',
  sanskritName: 'Horā',
  divisor: 2,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const isFirstHalf = degreeInSign < 15;
    const isOddSign = signIndex % 2 === 0; // 0,2,4,6,8,10 are odd signs (Aries, Gemini, etc.)
    
    if (isOddSign) {
      return isFirstHalf ? 5 : 4; // Leo : Cancer
    } else {
      return isFirstHalf ? 4 : 5; // Cancer : Leo
    }
  },
};

/**
 * Drekkana (D3) Configuration
 * Divides each sign into 3 parts (10° each)
 * Start from the sign itself, count 0, 4, 8 signs ahead
 */
export const DREKKANA_CONFIG: DivisionConfig = {
  type: 'D3',
  name: 'Drekkana',
  sanskritName: 'Dreṣkāṇa',
  divisor: 3,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const drekkanaIndex = Math.floor(degreeInSign / 10); // 0, 1, or 2
    const offsets = [0, 4, 8];
    const resultSignIndex = (signIndex + offsets[drekkanaIndex]) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Saptamsa (D7) Configuration
 * Divides each sign into 7 parts (~4.29° each)
 * Odd signs start from themselves, even signs start from 7th sign
 */
export const SAPTAMSA_CONFIG: DivisionConfig = {
  type: 'D7',
  name: 'Saptamsa',
  sanskritName: 'Saptāṁśa',
  divisor: 7,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const saptamsaPart = Math.floor(degreeInSign / (30 / 7));
    const isOddSign = signIndex % 2 === 0;
    const startSign = isOddSign ? signIndex : (signIndex + 6) % 12;
    const resultSignIndex = (startSign + saptamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Dwadasamsa (D12) Configuration
 * Divides each sign into 12 parts (2.5° each)
 * Start from the sign itself
 */
export const DWADASAMSA_CONFIG: DivisionConfig = {
  type: 'D12',
  name: 'Dwadasamsa',
  sanskritName: 'Dvādaśāṁśa',
  divisor: 12,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const dwadamsamsaPart = Math.floor(degreeInSign / 2.5);
    const resultSignIndex = (signIndex + dwadamsamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

// ===== DIVISIONAL CHART BUILDER =====

/**
 * Builds houses for any divisional chart using configuration
 * 
 * This replaces:
 * - buildHoraHouses() from d2-hora.ts
 * - buildDrekkanaHouses() from d3-drekkana.ts
 * - buildSaptamsaHouses() from d7-saptamsa.ts
 * - buildDwadamsamsaHouses() from d12-dwadasamsa.ts
 * 
 * @param planets - Record of all planet positions
 * @param ascendant - Ascendant data
 * @param config - Division configuration (HORA_CONFIG, DREKKANA_CONFIG, etc.)
 * @returns Array of 12 houses with planets distributed
 * 
 * @example
 * ```ts
 * // Instead of: buildHoraHouses(planets, ascendant)
 * const horaHouses = buildDivisionalHouses(planets, ascendant, HORA_CONFIG);
 * 
 * // Instead of: buildDrekkanaHouses(planets, ascendant)
 * const drekkanaHouses = buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG);
 * ```
 */
export function buildDivisionalHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData,
  config: DivisionConfig
): HouseInfo[] {
  // Step 1: Calculate ascendant's divisional sign
  const ascLongitude = (ascendant.signNumber - 1) * 30 + ascendant.degreeInSign;
  const ascDivisionalSign = config.calculateSign(ascLongitude);
  
  // Step 2: Initialize 12 houses starting from ascendant's divisional sign
  const houses: HouseInfo[] = [];
  
  for (let i = 0; i < 12; i++) {
    const houseNumber = (i + 1) as HouseInfo['houseNumber'];
    const rasiNumber = (((ascDivisionalSign - 1 + i) % 12) + 1) as HouseInfo['rasiNumber'];
    
    houses.push({
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }
  
  // Step 3: Distribute planets into houses
  Object.entries(planets).forEach(([planetKey, planetData]) => {
    // Calculate planet's divisional sign
    const planetDivisionalSign = config.calculateSign(planetData.longitude);
    
    // Find which house this sign corresponds to
    const houseIndex = (planetDivisionalSign - ascDivisionalSign + 12) % 12;
    
    // Build status flags
    const statusFlags: string[] = [];
    if (planetData.retrograde) statusFlags.push('R');
    if (planetData.combust) statusFlags.push('C');
    if (planetData.exalted) statusFlags.push('E');
    if (planetData.debilitated) statusFlags.push('D');
    
    // Add planet to house
    houses[houseIndex].planets.push({
      key: planetKey as PlanetData['key'],
      symbol: PLANET_SYMBOLS[planetKey as PlanetData['key']] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
      fullData: planetData,
    });
  });
  
  // Step 4: Sort planets within each house by degree
  houses.forEach(house => {
    house.planets.sort((a, b) => a.degree - b.degree);
  });
  
  return houses;
}

// ===== CONVENIENCE FUNCTIONS (BACKWARD COMPATIBILITY) =====

/**
 * Build Hora (D2) chart
 * @deprecated Use buildDivisionalHouses(planets, ascendant, HORA_CONFIG) instead
 */
export function buildHoraHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, HORA_CONFIG);
}

/**
 * Build Drekkana (D3) chart
 * @deprecated Use buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG) instead
 */
export function buildDrekkanaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG);
}

/**
 * Build Saptamsa (D7) chart
 * @deprecated Use buildDivisionalHouses(planets, ascendant, SAPTAMSA_CONFIG) instead
 */
export function buildSaptamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SAPTAMSA_CONFIG);
}

/**
 * Build Dwadasamsa (D12) chart
 * @deprecated Use buildDivisionalHouses(planets, ascendant, DWADASAMSA_CONFIG) instead
 */
export function buildDwadamsamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, DWADASAMSA_CONFIG);
}

// ===== EXPORT ALL CONFIGS FOR EASY ACCESS =====

export const DIVISION_CONFIGS = {
  D2: HORA_CONFIG,
  D3: DREKKANA_CONFIG,
  D7: SAPTAMSA_CONFIG,
  D12: DWADASAMSA_CONFIG,
} as const;

/**
 * Get division config by type
 * @param type - Division type (D2, D3, D7, D12, etc.)
 * @returns Division configuration or undefined if not found
 */
export function getDivisionConfig(type: DivisionConfig['type']): DivisionConfig | undefined {
  return DIVISION_CONFIGS[type as keyof typeof DIVISION_CONFIGS];
}
