/**
 * Strength Analyzer
 * 
 * Analyzes planetary strength, dignity, and special conditions
 * Implements factors from professional astrology documents
 * 
 * @file strengthAnalyzer.ts
 * @version 2.0.0
 */

import type { PlanetData, AscendantData } from '@/types/astrology';

/**
 * Planet strength assessment
 */
export interface StrengthAssessment {
  planet: string;
  overallStrength: 'strong' | 'moderate' | 'weak';
  dignity: 'exalted' | 'own_sign' | 'friendly' | 'neutral' | 'enemy' | 'debilitated';
  isPakshaBala: boolean; // Waxing vs Waning (for Moon)
  housePosition: number;
  houseStrength: 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult';
  isYogakaraka: boolean; // For Saturn
  aspects: string[]; // Which planets aspect it
  recommendations: string[];
}

/**
 * Exaltation and debilitation degrees
 */
const DIGNITY_TABLE: Record<string, {
  exalted: { sign: number; degree: number };
  debilitated: { sign: number; degree: number };
  ownSigns: number[];
}> = {
  Sun: {
    exalted: { sign: 1, degree: 10 },      // Aries 10°
    debilitated: { sign: 7, degree: 10 },   // Libra 10°
    ownSigns: [5],                          // Leo
  },
  Moon: {
    exalted: { sign: 2, degree: 3 },        // Taurus 3°
    debilitated: { sign: 8, degree: 3 },    // Scorpio 3°
    ownSigns: [4],                          // Cancer
  },
  Mars: {
    exalted: { sign: 10, degree: 28 },     // Capricorn 28°
    debilitated: { sign: 4, degree: 28 },   // Cancer 28°
    ownSigns: [1, 8],                       // Aries, Scorpio
  },
  Mercury: {
    exalted: { sign: 6, degree: 15 },      // Virgo 15°
    debilitated: { sign: 12, degree: 15 },  // Pisces 15°
    ownSigns: [3, 6],                       // Gemini, Virgo
  },
  Jupiter: {
    exalted: { sign: 4, degree: 5 },       // Cancer 5°
    debilitated: { sign: 10, degree: 5 },   // Capricorn 5°
    ownSigns: [9, 12],                      // Sagittarius, Pisces
  },
  Venus: {
    exalted: { sign: 12, degree: 27 },     // Pisces 27°
    debilitated: { sign: 6, degree: 27 },   // Virgo 27°
    ownSigns: [2, 7],                       // Taurus, Libra
  },
  Saturn: {
    exalted: { sign: 7, degree: 20 },      // Libra 20°
    debilitated: { sign: 1, degree: 20 },   // Aries 20°
    ownSigns: [10, 11],                     // Capricorn, Aquarius
  },
};

/**
 * Yogakaraka combinations for each Lagna
 */
const YOGAKARAKA_TABLE: Record<number, {
  saturn: boolean;
  mars: boolean;
  venus: boolean;
}> = {
  1: { saturn: false, mars: false, venus: false },  // Aries
  2: { saturn: true, mars: false, venus: false },   // Taurus - Saturn is Yogakaraka
  3: { saturn: false, mars: false, venus: false },  // Gemini
  4: { saturn: false, mars: true, venus: false },   // Cancer
  5: { saturn: false, mars: true, venus: false },   // Leo
  6: { saturn: false, mars: false, venus: false },  // Virgo
  7: { saturn: true, mars: false, venus: false },   // Libra - Saturn is Yogakaraka
  8: { saturn: false, mars: false, venus: false },  // Scorpio
  9: { saturn: false, mars: false, venus: false },  // Sagittarius
  10: { saturn: false, mars: false, venus: true },  // Capricorn - Venus is Yogakaraka
  11: { saturn: false, mars: false, venus: true },  // Aquarius - Venus is Yogakaraka
  12: { saturn: false, mars: false, venus: false }, // Pisces
};

/**
 * Analyze Moon's strength
 */
export function analyzeMoonStrength(
  moon: PlanetData,
  ascendant: AscendantData,
  planets: Record<string, PlanetData>
): StrengthAssessment {
  const dignity = getDignity('Moon', moon.signNumber, moon.degreeInSign);
  const housePosition = getHouseFromLagna(moon.signNumber, ascendant.signNumber);
  const houseStrength = getHouseStrength(housePosition);
  
  // Paksha Bala (Waxing/Waning)
  const sun = planets.Sun;
  const longitudeDiff = (moon.longitude - sun.longitude + 360) % 360;
  const isWaxing = longitudeDiff > 0 && longitudeDiff < 180;
  
  // Check afflictions
  const afflictingPlanets = findAfflictions(moon, planets);
  
  // Overall strength
  let overallStrength: 'strong' | 'moderate' | 'weak';
  
  if (
    (dignity === 'exalted' || dignity === 'own_sign') &&
    isWaxing &&
    houseStrength !== 'difficult' &&
    afflictingPlanets.length === 0
  ) {
    overallStrength = 'strong';
  } else if (
    dignity === 'debilitated' ||
    !isWaxing ||
    houseStrength === 'difficult' ||
    afflictingPlanets.length >= 2
  ) {
    overallStrength = 'weak';
  } else {
    overallStrength = 'moderate';
  }
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (overallStrength === 'weak') {
    recommendations.push('Moon strengthening remedies recommended');
    if (!isWaxing) {
      recommendations.push('Waning Moon - may increase sensitivity');
    }
    if (afflictingPlanets.length > 0) {
      recommendations.push(`Afflicted by: ${afflictingPlanets.join(', ')}`);
    }
  }
  
  if (dignity === 'exalted') {
    recommendations.push('Exalted Moon provides emotional resilience');
  }
  
  return {
    planet: 'Moon',
    overallStrength,
    dignity,
    isPakshaBala: isWaxing,
    housePosition,
    houseStrength,
    isYogakaraka: false,
    aspects: [],
    recommendations,
  };
}

/**
 * Analyze Saturn's strength and Yogakaraka status
 */
export function analyzeSaturnStrength(
  saturn: PlanetData,
  ascendant: AscendantData
): StrengthAssessment {
  const dignity = getDignity('Saturn', saturn.signNumber, saturn.degreeInSign);
  const housePosition = getHouseFromLagna(saturn.signNumber, ascendant.signNumber);
  const houseStrength = getHouseStrength(housePosition);
  
  // Check if Yogakaraka for this Lagna
  const lagnaSign = ascendant.signNumber;
  const isYogakaraka = YOGAKARAKA_TABLE[lagnaSign]?.saturn || false;
  
  // Overall strength
  let overallStrength: 'strong' | 'moderate' | 'weak';
  
  if (
    dignity === 'exalted' ||
    dignity === 'own_sign' ||
    isYogakaraka
  ) {
    overallStrength = 'strong';
  } else if (dignity === 'debilitated') {
    overallStrength = 'weak';
  } else {
    overallStrength = 'moderate';
  }
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (isYogakaraka) {
    recommendations.push('Saturn is Yogakaraka - brings positive results through discipline');
    recommendations.push('Sade Sati can be a growth period');
  }
  
  if (dignity === 'exalted') {
    recommendations.push('Exalted Saturn - constructive discipline');
  } else if (dignity === 'debilitated') {
    recommendations.push('Debilitated Saturn - may bring heavier lessons');
  }
  
  if (overallStrength === 'weak') {
    recommendations.push('Saturn strengthening remedies may help');
  }
  
  return {
    planet: 'Saturn',
    overallStrength,
    dignity,
    isPakshaBala: false,
    housePosition,
    houseStrength,
    isYogakaraka,
    aspects: [],
    recommendations,
  };
}

/**
 * Get planet's dignity (exalted, own sign, etc.)
 */
function getDignity(
  planet: string,
  signNumber: number,
  degreeInSign: number
): 'exalted' | 'own_sign' | 'friendly' | 'neutral' | 'enemy' | 'debilitated' {
  const table = DIGNITY_TABLE[planet];
  if (!table) return 'neutral';
  
  // Check exaltation (within 10° orb)
  if (
    table.exalted.sign === signNumber &&
    Math.abs(degreeInSign - table.exalted.degree) < 10
  ) {
    return 'exalted';
  }
  
  // Check debilitation (within 10° orb)
  if (
    table.debilitated.sign === signNumber &&
    Math.abs(degreeInSign - table.debilitated.degree) < 10
  ) {
    return 'debilitated';
  }
  
  // Check own sign
  if (table.ownSigns.includes(signNumber)) {
    return 'own_sign';
  }
  
  // Simplified - would need full friendship table
  return 'neutral';
}

/**
 * Get house position from Lagna
 */
function getHouseFromLagna(planetSign: number, lagnaSign: number): number {
  let house = planetSign - lagnaSign + 1;
  if (house <= 0) house += 12;
  return house;
}

/**
 * Get house strength classification
 */
function getHouseStrength(
  house: number
): 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult' {
  // Kendra houses (1, 4, 7, 10) - excellent
  if ([1, 4, 7, 10].includes(house)) return 'excellent';
  
  // Trikona houses (5, 9) - excellent
  if ([5, 9].includes(house)) return 'excellent';
  
  // Upachaya houses (3, 6, 11) - good (improve over time)
  if ([3, 6, 11].includes(house)) return 'good';
  
  // Dusthana houses (6, 8, 12) - difficult
  if ([8, 12].includes(house)) return 'difficult';
  
  // House 2 - neutral to challenging
  if (house === 2) return 'challenging';
  
  return 'neutral';
}

/**
 * Find planets afflicting the Moon
 */
function findAfflictions(
  moon: PlanetData,
  planets: Record<string, PlanetData>
): string[] {
  const afflicting: string[] = [];
  
  // Check conjunction with malefics (Saturn, Mars, Rahu, Ketu)
  const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu'];
  
  for (const malefic of malefics) {
    const planet = planets[malefic];
    if (!planet) continue;
    
    // Check if in same sign
    if (planet.signNumber === moon.signNumber) {
      afflicting.push(malefic);
    }
  }
  
  return afflicting;
}

/**
 * Check if Jupiter is protecting (aspecting Moon or Saturn)
 */
export function checkJupiterProtection(
  jupiter: PlanetData,
  targetPlanet: PlanetData
): boolean {
  // Jupiter aspects 5th, 7th, 9th houses from its position
  const jupiterHouse = jupiter.signNumber;
  const targetHouse = targetPlanet.signNumber;
  
  const houseDiff = (targetHouse - jupiterHouse + 12) % 12;
  
  // Jupiter aspects 5th (trine), 7th (opposite), 9th (trine)
  return [5, 7, 9].includes(houseDiff);
}
