/**
 * Vargottama Detection
 * 
 * Vargottama = A planet in the same zodiac sign in both D1 (Rashi/Lagna) 
 * and D9 (Navamsa) charts. This gives exceptional strength to that planet.
 * 
 * Example: Jupiter in Sagittarius in D1 AND Sagittarius in D9 = Vargottama Jupiter
 */

import type { HouseInfo as HouseData } from '@/types/astrology';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface VargottamaPlanet {
  /** Planet key (e.g., "Jupiter", "Moon") */
  key: string;
  
  /** Planet symbol for display (e.g., "Ju", "Mo") */
  symbol: string;
  
  /** Zodiac sign (e.g., "Sagittarius", "Cancer") */
  sign: string;
  
  /** House number in D1 chart (1-12) */
  houseInD1: number;
  
  /** Degree in D1 */
  degreeInD1: number;
  
  /** Degree in D9 */
  degreeInD9: number;
  
  /** Strength level based on degree proximity */
  strength: 'very_strong' | 'strong' | 'moderate';
}

// ChartInsight type matching ChartFocusMode expectations
export interface ChartInsight {
  type: 'strength' | 'challenge' | 'highlight';
  icon: string;
  text: string;  // ← FIXED: Using 'text' instead of 'title' and 'description'
}

// ============================================
// CORE DETECTION FUNCTION
// ============================================

/**
 * Detect Vargottama planets by comparing D1 and D9 charts
 * 
 * @param d1Houses - Houses from D1 (Lagna/Rashi) chart
 * @param d9Houses - Houses from D9 (Navamsa) chart
 * @returns Array of planets that are vargottama
 */
export function detectVargottama(
  d1Houses: HouseData[],
  d9Houses: HouseData[]
): VargottamaPlanet[] {
  const vargottamaPlanets: VargottamaPlanet[] = [];
  
  // Build planet position maps for quick lookup
  const d1PlanetMap = buildPlanetMap(d1Houses);
  const d9PlanetMap = buildPlanetMap(d9Houses);
  
  // Check each planet
  for (const [planetKey, d1Position] of d1PlanetMap.entries()) {
    const d9Position = d9PlanetMap.get(planetKey);
    
    if (!d9Position) continue;
    
    // Check if same sign in both charts
    if (d1Position.sign === d9Position.sign) {
      vargottamaPlanets.push({
        key: planetKey,
        symbol: getSymbol(planetKey),
        sign: d1Position.sign,
        houseInD1: d1Position.houseNumber,
        degreeInD1: d1Position.degree,
        degreeInD9: d9Position.degree,
        strength: calculateStrength(d1Position.degree, d9Position.degree),
      });
    }
  }
  
  return vargottamaPlanets;
}

// ============================================
// INSIGHT GENERATION
// ============================================

/**
 * Generate ChartInsight[] format for vargottama planets
 * ⭐ FIXED: Now uses 'text' field to match ChartFocusMode expectations
 * 
 * @param vargottamaPlanets - Array of detected vargottama planets
 * @returns Array of insights in ChartInsight format
 */
export function getVargottamaInsights(
  vargottamaPlanets: VargottamaPlanet[]
): ChartInsight[] {
  const insights: ChartInsight[] = [];
  
  if (vargottamaPlanets.length === 0) return insights;
  
  // Sort by strength for better display
  const sorted = [...vargottamaPlanets].sort((a, b) => {
    const strengthOrder = { very_strong: 0, strong: 1, moderate: 2 };
    return strengthOrder[a.strength] - strengthOrder[b.strength];
  });
  
  // Individual planet insights (no header, direct to highlights)
  sorted.forEach(planet => {
    const houseOrdinal = getOrdinalSuffix(planet.houseInD1);
    const strengthDesc = getStrengthDescription(planet.strength);
    
    insights.push({
      type: 'strength',
      icon: '⭐',
      text: `${planet.key} vargottama in ${planet.sign} (${planet.houseInD1}${houseOrdinal} house) - same sign in D1 & D9. ${strengthDesc}`,
    });
  });
  
  return insights;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

interface PlanetPosition {
  sign: string;
  degree: number;
  houseNumber: number;
}

/**
 * Build a map of planet positions from houses
 */
function buildPlanetMap(houses: HouseData[]): Map<string, PlanetPosition> {
  const map = new Map<string, PlanetPosition>();
  
  houses.forEach((house, index) => {
    house.planets.forEach(planet => {
      map.set(planet.key, {
        sign: planet.sign,
        degree: planet.degreeInSign,
        houseNumber: index + 1,
      });
    });
  });
  
  return map;
}

/**
 * Calculate strength based on degree proximity
 * Very strong if within 3°, strong if within 10°, otherwise moderate
 */
function calculateStrength(d1Degree: number, d9Degree: number): 'very_strong' | 'strong' | 'moderate' {
  const diff = Math.abs(d1Degree - d9Degree);
  
  if (diff <= 3) return 'very_strong';
  if (diff <= 10) return 'strong';
  return 'moderate';
}

/**
 * Get strength description for display
 */
function getStrengthDescription(strength: VargottamaPlanet['strength']): string {
  switch (strength) {
    case 'very_strong':
      return 'Exceptionally strong - degrees very close';
    case 'strong':
      return 'Strong placement - excellent results';
    case 'moderate':
      return 'Moderate strength - beneficial';
  }
}

/**
 * Get planet symbol (first 2 letters)
 */
function getSymbol(planetKey: string): string {
  return planetKey.substring(0, 2);
}

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

// ============================================
// ADDITIONAL UTILITIES
// ============================================

/**
 * Check if a specific planet is vargottama
 */
export function isPlanetVargottama(
  planetKey: string,
  d1Houses: HouseData[],
  d9Houses: HouseData[]
): boolean {
  const vargottama = detectVargottama(d1Houses, d9Houses);
  return vargottama.some(p => p.key === planetKey);
}

/**
 * Get vargottama status for all planets
 */
export function getVargottamaStatus(
  d1Houses: HouseData[],
  d9Houses: HouseData[]
): Record<string, boolean> {
  const vargottama = detectVargottama(d1Houses, d9Houses);
  const status: Record<string, boolean> = {};
  
  vargottama.forEach(planet => {
    status[planet.key] = true;
  });
  
  return status;
}
