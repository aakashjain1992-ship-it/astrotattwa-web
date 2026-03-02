/**
 * Saturn Ephemeris Service
 * 
 * Calculates Saturn's actual position at any date using Swiss Ephemeris
 * and finds exact sign ingress/egress dates
 * 
 * @file saturnEphemeris.ts
 * @version 2.0.0
 */

import { sweCalcSidereal, sweJuldayUTC, getBodyIds } from "@/lib/astrology/swissEph";

/**
 * Saturn position at a specific date
 */
export interface SaturnPosition {
  date: Date;
  longitude: number;
  sign: number;
  degreeInSign: number;
  isRetrograde: boolean;
  speed: number;
}

/**
 * Saturn ingress event (entering a new sign)
 */
export interface SaturnIngress {
  sign: number;
  signName: string;
  entryDate: Date;
  exitDate: Date;
  durationDays: number;
  retrogradeStations?: RetrogradeStation[];
}

/**
 * Saturn retrograde station
 */
export interface RetrogradeStation {
  date: Date;
  type: 'station_retrograde' | 'station_direct';
  degree: number;
}

/**
 * Calculate Saturn's position at any date
 */
export async function calculateSaturnAtDate(date: Date): Promise<SaturnPosition> {
  const bodies = await getBodyIds();
  const jdUt = await sweJuldayUTC(date);
  
  const result = await sweCalcSidereal(jdUt, bodies.SATURN);
  
  const sign = Math.floor(result.lon / 30) + 1;
  const degreeInSign = result.lon % 30;
  
  return {
    date,
    longitude: result.lon,
    sign,
    degreeInSign,
    isRetrograde: result.speed < 0,
    speed: result.speed,
  };
}

/**
 * Find exact date when Saturn enters a specific degree
 * Uses binary search for accuracy
 */
export async function findSaturnAtDegree(
  targetDegree: number,
  startDate: Date,
  endDate: Date,
  tolerance: number = 0.01
): Promise<Date> {
  let low = startDate.getTime();
  let high = endDate.getTime();
  
  while (high - low > 86400000) { // 1 day in milliseconds
    const mid = new Date((low + high) / 2);
    const position = await calculateSaturnAtDate(mid);
    
    const diff = position.longitude - targetDegree;
    
    if (Math.abs(diff) < tolerance) {
      return mid;
    }
    
    if (diff < 0) {
      low = mid.getTime();
    } else {
      high = mid.getTime();
    }
  }
  
  return new Date((low + high) / 2);
}

/**
 * Calculate exact Saturn ingress dates for a sign
 * Accounts for retrograde motion
 */
export async function calculateSaturnIngress(
  targetSign: number,
  approximateStartDate: Date
): Promise<SaturnIngress> {
  const signNames = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  // Saturn takes ~2.5 years per sign
  const searchWindowDays = 1095; // 3 years
  
  // Find entry date (0° of sign)
  const targetEntryDegree = (targetSign - 1) * 30;
  const searchStart = new Date(approximateStartDate);
  searchStart.setDate(searchStart.getDate() - 180); // 6 months before
  
  const searchEnd = new Date(approximateStartDate);
  searchEnd.setDate(searchEnd.getDate() + 180); // 6 months after
  
  const entryDate = await findSaturnAtDegree(
    targetEntryDegree,
    searchStart,
    searchEnd
  );
  
  // Find exit date (30° of sign = 0° of next sign)
  const targetExitDegree = targetSign * 30;
  const exitSearchStart = new Date(entryDate);
  const exitSearchEnd = new Date(entryDate);
  exitSearchEnd.setDate(exitSearchEnd.getDate() + searchWindowDays);
  
  const exitDate = await findSaturnAtDegree(
    targetExitDegree,
    exitSearchStart,
    exitSearchEnd
  );
  
  const durationDays = Math.floor(
    (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Detect retrograde stations (simplified - would need more work for accuracy)
  const retrogradeStations = await detectRetrogradeStations(
    entryDate,
    exitDate,
    targetSign
  );
  
  return {
    sign: targetSign,
    signName: signNames[targetSign - 1],
    entryDate,
    exitDate,
    durationDays,
    retrogradeStations,
  };
}

/**
 * Detect retrograde stations within a period
 */
async function detectRetrogradeStations(
  startDate: Date,
  endDate: Date,
  sign: number
): Promise<RetrogradeStation[]> {
  const stations: RetrogradeStation[] = [];
  
  // Sample every 7 days
  const current = new Date(startDate);
  let previousSpeed: number | null = null;
  
  while (current < endDate) {
    const position = await calculateSaturnAtDate(current);
    
    if (previousSpeed !== null) {
      // Detect speed change (retrograde station)
      if (previousSpeed > 0 && position.speed < 0) {
        stations.push({
          date: new Date(current),
          type: 'station_retrograde',
          degree: position.degreeInSign,
        });
      } else if (previousSpeed < 0 && position.speed > 0) {
        stations.push({
          date: new Date(current),
          type: 'station_direct',
          degree: position.degreeInSign,
        });
      }
    }
    
    previousSpeed = position.speed;
    current.setDate(current.getDate() + 7); // Advance 1 week
  }
  
  return stations;
}

/**
 * Calculate all Saturn ingresses for a person's lifetime
 * (from birth to 100 years)
 */
export async function calculateLifetimeSaturnIngresses(
  birthDate: Date
): Promise<SaturnIngress[]> {
  const ingresses: SaturnIngress[] = [];
  
  // Calculate current Saturn position at birth
  const birthSaturn = await calculateSaturnAtDate(birthDate);
  
  // Saturn completes zodiac in ~29.5 years
  // So 100 years ≈ 3.4 cycles = ~40 sign transits
  
  let currentDate = new Date(birthDate);
  let currentSign = birthSaturn.sign;
  
  for (let i = 0; i < 40; i++) {
    try {
      const nextSign = (currentSign % 12) + 1;
      const ingress = await calculateSaturnIngress(nextSign, currentDate);
      
      ingresses.push(ingress);
      
      currentDate = ingress.exitDate;
      currentSign = nextSign;
      
      // Stop if we've reached 100 years from birth
      const age = (currentDate.getTime() - birthDate.getTime()) 
        / (1000 * 60 * 60 * 24 * 365.25);
      
      if (age > 100) break;
    } catch (error) {
      console.error(`Failed to calculate ingress for sign ${currentSign}:`, error);
      break;
    }
  }
  
  return ingresses;
}

/**
 * Get Saturn's current transit position
 */
export async function getCurrentSaturnTransit(): Promise<SaturnPosition> {
  return calculateSaturnAtDate(new Date());
}

/**
 * Calculate when Saturn will be at specific degree relative to Moon
 * Used for peak activation windows
 */
export async function findSaturnPeakWindow(
  moonDegree: number,
  searchStartDate: Date,
  searchEndDate: Date
): Promise<{ peakStart: Date; peakEnd: Date } | null> {
  // Peak window is ±5° from Moon degree
  const peakStartDegree = (moonDegree - 5 + 360) % 360;
  const peakEndDegree = (moonDegree + 5) % 360;
  
  try {
    const peakStart = await findSaturnAtDegree(
      peakStartDegree,
      searchStartDate,
      searchEndDate
    );
    
    const peakEnd = await findSaturnAtDegree(
      peakEndDegree,
      peakStart,
      searchEndDate
    );
    
    return { peakStart, peakEnd };
  } catch {
    return null;
  }
}
