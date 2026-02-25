/**
 * Chart Helper Utilities
 * Functions for building house data for divisional charts
 * 
 * FIXED ISSUES:
 * ✅ Removed code duplication for D9 and D10 (now uses divisionalChartBuilder)
 * ✅ Removed duplicate type definitions (now imports from @/types/astrology)
 * ✅ Removed unnecessary type aliases (HouseData → HouseInfo)
 */

import type { 
  HouseInfo,
  PlanetDisplayInfo,
  HouseNumber,
  RashiNumber,
  PlanetKey,
  StatusFlag,
  PlanetData,
  AscendantData
} from '@/types/astrology';

import { RASHI_NAMES, PLANET_SYMBOLS } from '@/types/astrology';
import { buildDivisionalHouses, NAVAMSA_CONFIG, DASAMSA_CONFIG } from '@/lib/astrology/divisionalChartBuilder';

// ============================================
// CONSTANTS
// ============================================

export const PLANET_ORDER = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
] as const;

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
): HouseInfo[] {
  const ascSignNumber = ascendant.signNumber; // 1-12
  const houses: HouseInfo[] = [];

  // Create 12 empty houses starting from ascendant sign
  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const rasiNumber = ((ascSignNumber - 1 + i) % 12) + 1;
    
    houses.push({
      houseNumber: houseNumber as HouseNumber,
      rasiNumber: rasiNumber as RashiNumber,
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
    
    const statusFlags: StatusFlag[] = [];
    if (planetData.retrograde) statusFlags.push('R');
    if (planetData.combust) statusFlags.push('C');
    if (planetData.exalted) statusFlags.push('↑');
    if (planetData.debilitated) statusFlags.push('↓');
    
    const planet: PlanetDisplayInfo = {
      key: planetKey as PlanetKey,
      symbol: PLANET_SYMBOLS[planetKey] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
      fullData: planetData,
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
 * Build houses for Moon Chart (Chandra Lagna)
 * Uses Moon's position as the ascendant instead of actual ascendant
 */
export function buildMoonHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  // Get Moon's position to use as the ascendant
  const moonData = planets['Moon'];
  if (!moonData) {
    // Fallback to regular lagna chart if Moon data is missing
    return buildLagnaHouses(planets, ascendant);
  }

  const moonSignNumber = moonData.signNumber; // 1-12
  const houses: HouseInfo[] = [];

  // Create 12 empty houses starting from Moon's sign
  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const rasiNumber = ((moonSignNumber - 1 + i) % 12) + 1;
    
    houses.push({
      houseNumber: houseNumber as HouseNumber,
      rasiNumber: rasiNumber as RashiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1, // House 1 = Moon's position
    });
  }

  // Place planets in houses based on their sign relative to Moon
  Object.entries(planets).forEach(([planetKey, planetData]) => {
    const planetSignNumber = planetData.signNumber;
    
    // Calculate which house this sign falls into relative to Moon's sign
    const houseIndex = (planetSignNumber - moonSignNumber + 12) % 12;
    
    const statusFlags: StatusFlag[] = [];
    if (planetData.retrograde) statusFlags.push('R');
    if (planetData.combust) statusFlags.push('C');
if (planetData.exalted) statusFlags.push('↑');
if (planetData.debilitated) statusFlags.push('↓');

    const planet: PlanetDisplayInfo = {
      key: planetKey as PlanetKey,
      symbol: PLANET_SYMBOLS[planetKey] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
      fullData: planetData,
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
 * 
 * FIXED: Now uses divisionalChartBuilder instead of duplicate logic
 * @deprecated Use buildDivisionalHouses(planets, ascendant, NAVAMSA_CONFIG) directly
 */
export function buildNavamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, NAVAMSA_CONFIG);
}

/**
 * Build houses for D10 (Dasamsa) chart
 * Career and profession chart - each sign divided into 10 parts (3° each)
 * 
 * FIXED: Now uses divisionalChartBuilder instead of duplicate logic
 * @deprecated Use buildDivisionalHouses(planets, ascendant, DASAMSA_CONFIG) directly
 */
export function buildDasamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, DASAMSA_CONFIG);
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
): HouseInfo[] {
  // For whole-sign system, use buildLagnaHouses
  // Other house systems can be implemented later
  return buildLagnaHouses(planets, ascendant);
}
