/**
 * Sade Sati Calculator
 * 
 * Calculates Saturn's 7.5-year challenging transit period
 * 
 * @file src/lib/astrology/sadesati/calculator.ts
 * @version 1.0.0
 * @created February 28, 2026
 */

import type { PlanetData } from '@/types/astrology';
import type {
  SadeSatiAnalysis,
  SadeSatiPeriod,
  CurrentSadeSati,
  SadeSatiHistory,
  PhaseInsights,
  SadeSatiPhase,
} from '@/types/sadesati';
import {
  SATURN_PERIOD_PER_SIGN_DAYS,
  SATURN_PERIOD_PER_SIGN_YEARS,
  SADESATI_TOTAL_DAYS,
  SADESATI_TOTAL_YEARS,
  getSignName,
  getHouseFromMoon,
  PHASE_DESCRIPTIONS,
  PHASE_EFFECTS,
  PHASE_REMEDIES,
  PHASE_AFFECTED_AREAS,
  PHASE_POSITIVE_ASPECTS,
} from './constants';

/**
 * Main function to calculate complete Sade Sati analysis
 * 
 * @param moonPlanet - Moon's planet data from birth chart
 * @param saturnPlanet - Saturn's current planet data
 * @param birthDate - Birth date
 * @param currentDate - Current date (default: now)
 * @returns Complete Sade Sati analysis
 */
export function calculateSadeSati(
  moonPlanet: PlanetData,
  saturnPlanet: PlanetData,
  birthDate: Date,
  currentDate: Date = new Date()
): SadeSatiAnalysis {
  const moonSign = moonPlanet.signNumber;
  const saturnSign = saturnPlanet.signNumber;
  
  // Calculate current Sade Sati status
  const current = calculateCurrentSadeSati(
    moonSign,
    saturnSign,
    saturnPlanet.longitude,
    currentDate
  );
  
  // Calculate historical and future Sade Sati periods
  const history = calculateSadeSatiHistory(
    moonSign,
    birthDate,
    currentDate,
    current
  );
  
  // Generate insights if Sade Sati is active
  const insights = current.isActive && current.currentPhase
    ? generatePhaseInsights(current.currentPhase.phase)
    : undefined;
  
  return {
    current,
    history,
    insights,
    metadata: {
      calculatedAt: new Date().toISOString(),
      moonSign: moonPlanet.sign,
      moonSignNumber: moonSign,
      moonNakshatra: moonPlanet.kp.nakshatraName,
      currentSaturnSign: saturnPlanet.sign,
      currentSaturnSignNumber: saturnSign,
    },
  };
}

/**
 * Check if Sade Sati is currently active and determine phase
 */
function calculateCurrentSadeSati(
  moonSign: number,
  saturnSign: number,
  saturnLongitude: number,
  currentDate: Date
): CurrentSadeSati {
  // Calculate house position of Saturn from Moon
  const houseFromMoon = getHouseFromMoon(saturnSign, moonSign);
  
  // Sade Sati is active when Saturn is in 12th, 1st, or 2nd from Moon
  const isActive = houseFromMoon === 12 || houseFromMoon === 1 || houseFromMoon === 2;
  
  if (!isActive) {
    return { isActive: false };
  }
  
  // Determine current phase
  let phase: SadeSatiPhase;
  if (houseFromMoon === 12) phase = 'Rising';
  else if (houseFromMoon === 1) phase = 'Peak';
  else phase = 'Setting';
  
  // Calculate when Saturn entered this sign
  const degreeInSign = saturnLongitude % 30;
  const daysIntoSign = (degreeInSign / 30) * SATURN_PERIOD_PER_SIGN_DAYS;
  
  const signEntryDate = new Date(currentDate);
  signEntryDate.setDate(signEntryDate.getDate() - Math.floor(daysIntoSign));
  
  // Calculate when Saturn will leave this sign
  const signExitDate = new Date(signEntryDate);
  signExitDate.setDate(signExitDate.getDate() + Math.floor(SATURN_PERIOD_PER_SIGN_DAYS));
  
  // Create current phase period
  const currentPhase: SadeSatiPeriod = {
    phase,
    description: PHASE_DESCRIPTIONS[phase],
    startDate: signEntryDate,
    endDate: signExitDate,
    durationDays: Math.floor(SATURN_PERIOD_PER_SIGN_DAYS),
    saturnSign: getSignName(saturnSign),
    saturnSignNumber: saturnSign,
    moonSign: getSignName(moonSign),
    moonSignNumber: moonSign,
    houseFromMoon: houseFromMoon as 12 | 1 | 2,
  };
  
  // Calculate all three phases of this Sade Sati cycle
  const allPhases = calculateAllThreePhases(moonSign, phase, signEntryDate);
  
  // Calculate overall Sade Sati dates
  const startDate = allPhases[0].startDate;
  const endDate = allPhases[2].endDate;
  
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemainingInPhase = Math.floor(
    (signExitDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemainingTotal = Math.floor(
    (endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    isActive: true,
    currentPhase,
    allPhases,
    startDate,
    endDate,
    totalYears: totalDays / 365.25,
    elapsedPercentage: Math.min(100, (elapsedDays / totalDays) * 100),
    daysRemainingInPhase: Math.max(0, daysRemainingInPhase),
    daysRemainingTotal: Math.max(0, daysRemainingTotal),
  };
}

/**
 * Calculate all three phases of a Sade Sati cycle
 */
function calculateAllThreePhases(
  moonSign: number,
  currentPhase: SadeSatiPhase,
  currentPhaseStartDate: Date
): SadeSatiPeriod[] {
  const phases: SadeSatiPeriod[] = [];
  
  // Calculate the sign numbers for each phase
  const risingSign = moonSign === 1 ? 12 : moonSign - 1;   // 12th from Moon
  const peakSign = moonSign;                                 // Same as Moon
  const settingSign = moonSign === 12 ? 1 : moonSign + 1;   // 2nd from Moon
  
  // Determine dates based on current phase
  let risingStart: Date;
  
  if (currentPhase === 'Rising') {
    risingStart = currentPhaseStartDate;
  } else if (currentPhase === 'Peak') {
    risingStart = new Date(currentPhaseStartDate);
    risingStart.setDate(
      risingStart.getDate() - Math.floor(SATURN_PERIOD_PER_SIGN_DAYS)
    );
  } else { // Setting
    risingStart = new Date(currentPhaseStartDate);
    risingStart.setDate(
      risingStart.getDate() - Math.floor(SATURN_PERIOD_PER_SIGN_DAYS * 2)
    );
  }
  
  // Rising phase
  const risingEnd = new Date(risingStart);
  risingEnd.setDate(risingEnd.getDate() + Math.floor(SATURN_PERIOD_PER_SIGN_DAYS));
  
  phases.push({
    phase: 'Rising',
    description: PHASE_DESCRIPTIONS.Rising,
    startDate: risingStart,
    endDate: risingEnd,
    durationDays: Math.floor(SATURN_PERIOD_PER_SIGN_DAYS),
    saturnSign: getSignName(risingSign),
    saturnSignNumber: risingSign,
    moonSign: getSignName(moonSign),
    moonSignNumber: moonSign,
    houseFromMoon: 12,
  });
  
  // Peak phase
  const peakStart = risingEnd;
  const peakEnd = new Date(peakStart);
  peakEnd.setDate(peakEnd.getDate() + Math.floor(SATURN_PERIOD_PER_SIGN_DAYS));
  
  phases.push({
    phase: 'Peak',
    description: PHASE_DESCRIPTIONS.Peak,
    startDate: peakStart,
    endDate: peakEnd,
    durationDays: Math.floor(SATURN_PERIOD_PER_SIGN_DAYS),
    saturnSign: getSignName(peakSign),
    saturnSignNumber: peakSign,
    moonSign: getSignName(moonSign),
    moonSignNumber: moonSign,
    houseFromMoon: 1,
  });
  
  // Setting phase
  const settingStart = peakEnd;
  const settingEnd = new Date(settingStart);
  settingEnd.setDate(settingEnd.getDate() + Math.floor(SATURN_PERIOD_PER_SIGN_DAYS));
  
  phases.push({
    phase: 'Setting',
    description: PHASE_DESCRIPTIONS.Setting,
    startDate: settingStart,
    endDate: settingEnd,
    durationDays: Math.floor(SATURN_PERIOD_PER_SIGN_DAYS),
    saturnSign: getSignName(settingSign),
    saturnSignNumber: settingSign,
    moonSign: getSignName(moonSign),
    moonSignNumber: moonSign,
    houseFromMoon: 2,
  });
  
  return phases;
}

/**
 * Calculate historical Sade Sati periods
 */
function calculateSadeSatiHistory(
  moonSign: number,
  birthDate: Date,
  currentDate: Date,
  currentSadeSati: CurrentSadeSati
): SadeSatiHistory {
  const past: SadeSatiPeriod[][] = [];
  
  // Saturn completes one cycle in ~29.5 years
  // Sade Sati occurs approximately every 29.5 years
  
  const ageInYears = 
    (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  // Approximate number of complete Saturn cycles since birth
  const approximateCycles = Math.floor(ageInYears / 29.5);
  
  // Generate past Sade Sati periods (going backwards from current)
  // Each cycle is ~29.5 years apart
  for (let i = 1; i <= approximateCycles && i <= 3; i++) {
    // Go back i cycles (each ~29.5 years)
    const cycleYearsBack = i * 29.5;
    const cycleStartDate = new Date(currentDate);
    cycleStartDate.setFullYear(
      cycleStartDate.getFullYear() - Math.floor(cycleYearsBack)
    );
    
    // Only include if after birth date
    if (cycleStartDate >= birthDate) {
      const phases = calculateAllThreePhases(moonSign, 'Rising', cycleStartDate);
      
      // Only add if it's complete (ended before current date)
      if (phases[2].endDate < currentDate) {
        past.unshift(phases); // Add to beginning (chronological order)
      }
    }
  }
  
  // Calculate next Sade Sati
  let nextStartDate: Date;
  
  if (currentSadeSati.isActive && currentSadeSati.endDate) {
    // If currently in Sade Sati, next one starts ~29.5 years from now
    nextStartDate = new Date(currentDate);
    nextStartDate.setFullYear(nextStartDate.getFullYear() + 29);
    nextStartDate.setMonth(nextStartDate.getMonth() + 6); // ~29.5 years
  } else {
    // Not currently in Sade Sati, calculate when next one starts
    // This would require knowing Saturn's current position and speed
    // For simplicity, estimate based on Saturn's cycle
    nextStartDate = new Date(currentDate);
    nextStartDate.setFullYear(nextStartDate.getFullYear() + 15); // Approximate
  }
  
  const nextPhases = calculateAllThreePhases(moonSign, 'Rising', nextStartDate);
  const yearsFromNow = 
    (nextStartDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  return {
    past,
    current: currentSadeSati.isActive ? currentSadeSati.allPhases : undefined,
    next: {
      startDate: nextStartDate,
      phases: nextPhases,
      yearsFromNow: Math.floor(yearsFromNow * 10) / 10, // Round to 1 decimal
    },
  };
}

/**
 * Generate insights for a specific phase
 */
function generatePhaseInsights(phase: SadeSatiPhase): PhaseInsights {
  return {
    effects: PHASE_EFFECTS[phase],
    remedies: PHASE_REMEDIES[phase],
    affectedAreas: PHASE_AFFECTED_AREAS[phase],
    positiveAspects: PHASE_POSITIVE_ASPECTS[phase],
  };
}

/**
 * Helper function to format duration
 */
export function formatDuration(days: number): string {
  if (days < 30) {
    return `${days} days`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else {
    const years = Math.floor(days / 365.25);
    const remainingDays = days - (years * 365.25);
    const months = Math.floor(remainingDays / 30);
    
    if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${years}y ${months}m`;
  }
}
