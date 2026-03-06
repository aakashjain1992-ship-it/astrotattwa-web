/**
 * Simple Wrapper Functions for Saturn Transit APIs
 * 
 * The main calculator requires full planet data, but our lazy-load APIs
 * only have moonLongitude. These wrappers create minimal data structures.
 * 
 * @file saturnWrappers.ts
 */

import type { PlanetData, AscendantData } from '@/types/astrology';
import { calculateProfessionalSaturnAnalysis } from './calculator-PROFESSIONAL';

/**
 * Create minimal PlanetData from just longitude
 */
function createMinimalPlanetData(longitude: number, name: string): PlanetData {
  const signNumber = Math.floor(longitude / 30) + 1;
  const degreeInSign = longitude % 30;
  
  return {
    longitude,
    sign: getSignName(signNumber),
    signNumber,
    degreeInSign,
    retrograde: false,
    nakshatra: {
      name: getNakshatraName(longitude),
      pada: getNakshatraPada(longitude),
      lord: getNakshatraLord(longitude),
    },
  } as PlanetData;
}

/**
 * Get sign name from number (1-12)
 */
function getSignName(signNumber: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[signNumber - 1] || 'Unknown';
}

/**
 * Get nakshatra name from longitude
 */
function getNakshatraName(longitude: number): string {
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  const index = Math.floor(longitude / (360 / 27));
  return nakshatras[index] || 'Unknown';
}

/**
 * Get nakshatra pada (1-4)
 */
function getNakshatraPada(longitude: number): number {
  const nakshatraSpan = 360 / 27; // 13.333... degrees
  const posInNakshatra = longitude % nakshatraSpan;
  return Math.floor(posInNakshatra / (nakshatraSpan / 4)) + 1;
}

/**
 * Get nakshatra lord
 */
function getNakshatraLord(longitude: number): string {
  const lords = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
  ];
  const index = Math.floor(longitude / (360 / 27)) % 9;
  return lords[index];
}

/**
 * Calculate Sade Sati with minimal inputs
 * 
 * This is a wrapper around the professional calculator that only needs:
 * - Moon longitude
 * - Birth date
 * 
 * It creates minimal data structures for the other required parameters.
 */
export async function calculateSadeSatiFromMoon(
  moonLongitude: number,
  birthDate: Date
) {
  // Create minimal Moon planet data
  const moonPlanet = createMinimalPlanetData(moonLongitude, 'Moon');
  
  // Saturn position doesn't affect Sade Sati calculation (only Moon does)
  // So we can use a placeholder
  const saturnPlanet = createMinimalPlanetData(0, 'Saturn');
  
  // Minimal all planets (only Moon is actually used for Sade Sati)
  const allPlanets = {
    Moon: moonPlanet,
    Saturn: saturnPlanet,
  };
  
  // Minimal ascendant (not used in Sade Sati calculation)
  const ascendant: AscendantData = {
    sign: 'Aries',
    signNumber: 1,
    degreeInSign: 0,
  };
  
  // Call the professional calculator
  const result = await calculateProfessionalSaturnAnalysis(
    moonPlanet,
    saturnPlanet,
    allPlanets as any,
    ascendant,
    birthDate,
    undefined, // No dasha info
    {
      includeDashaAnalysis: false,    // Skip dasha (we don't have that data)
      calculatePeakWindows: true,
      detectRetrogradeCycles: true,
      findNakshatraCrossings: false,  // Skip (needs all planets)
      analyzeJupiterProtection: false, // Skip (needs Jupiter data)
      includeDetailedPhases: true,
    }
  );
  
  return result;
}

/**
 * Calculate Dhaiya with minimal inputs
 */
export async function calculateDhaiyaFromMoon(
  moonLongitude: number,
  birthDate: Date
) {
  // Same as Sade Sati - it only needs Moon position
  const result = await calculateSadeSatiFromMoon(moonLongitude, birthDate);
  
  // Extract just the Dhaiya data
  return {
    current: result.dhaiya.current,
    upcoming4th: result.dhaiya.upcoming4th,
    upcoming8th: result.dhaiya.upcoming8th,
  };
}
