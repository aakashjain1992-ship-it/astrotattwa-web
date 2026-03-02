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
  DhaiyaPeriod,
  DhaiyaType,
  SaturnTransitAnalysis
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
  DHAIYA_DESCRIPTIONS
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

export function calculateAllDhaiyaPeriods(
  moonSign: number,
  birthDate: Date
): { fourthHouse: DhaiyaPeriod[]; eighthHouse: DhaiyaPeriod[] } {
  const fourthHouse: DhaiyaPeriod[] = [];
  const eighthHouse: DhaiyaPeriod[] = [];
  
  const numberOfCycles = Math.ceil(100 / 29.5);
  
  for (let i = 0; i < numberOfCycles; i++) {
    const cycleStartDate = new Date(birthDate);
    cycleStartDate.setFullYear(
      cycleStartDate.getFullYear() + Math.floor(i * 29.5)
    );
    
    // 4th house Dhaiya
    const fourthHouseSign = moonSign === 1 ? 4 : moonSign === 2 ? 5 : moonSign === 3 ? 6 : (moonSign + 3);
    const fourthDhaiya = createDhaiyaPeriod(
      '4th',
      fourthHouseSign <= 12 ? fourthHouseSign : fourthHouseSign - 12,
      moonSign,
      cycleStartDate
    );
    
    const ageAt4th = (fourthDhaiya.startDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageAt4th >= 0 && ageAt4th <= 100) {
      fourthHouse.push(fourthDhaiya);
    }
    
    // 8th house Dhaiya
    const eighthHouseSign = moonSign <= 5 ? moonSign + 7 : moonSign + 7 - 12;
    const eighthStartDate = new Date(cycleStartDate);
    eighthStartDate.setFullYear(
      eighthStartDate.getFullYear() + Math.floor(12.5)
    );
    
    const eighthDhaiya = createDhaiyaPeriod(
      '8th',
      eighthHouseSign <= 12 ? eighthHouseSign : eighthHouseSign - 12,
      moonSign,
      eighthStartDate
    );
    
    const ageAt8th = (eighthDhaiya.startDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageAt8th >= 0 && ageAt8th <= 100) {
      eighthHouse.push(eighthDhaiya);
    }
  }
  
  return { fourthHouse, eighthHouse };
}

/**
 * Create a Dhaiya period
 */
function createDhaiyaPeriod(
  type: DhaiyaType,
  saturnSign: number,
  moonSign: number,
  startDate: Date
): DhaiyaPeriod {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.floor(SATURN_PERIOD_PER_SIGN_DAYS));
  
  return {
    type,
    description: DHAIYA_DESCRIPTIONS[type],
    startDate,
    endDate,
    durationDays: Math.floor(SATURN_PERIOD_PER_SIGN_DAYS),
    saturnSign: getSignName(saturnSign),
    saturnSignNumber: saturnSign,
    moonSign: getSignName(moonSign),
    moonSignNumber: moonSign,
    houseFromMoon: type === '4th' ? 4 : 8,
  };
}

/**
 * Check if Dhaiya is currently active
 */
export function checkCurrentDhaiya(
  moonSign: number,
  saturnSign: number,
  currentDate: Date
): DhaiyaPeriod | undefined {
  const houseFromMoon = getHouseFromMoon(saturnSign, moonSign);
  
  if (houseFromMoon === 4 || houseFromMoon === 8) {
    const type: DhaiyaType = houseFromMoon === 4 ? '4th' : '8th';
    
    const startDate = new Date(currentDate);
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    return createDhaiyaPeriod(type, saturnSign, moonSign, startDate);
  }
  
  return undefined;
}


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
/**
 * Calculate ALL Sade Sati periods from birth to 100 years
 */
function calculateSadeSatiHistory(
  moonSign: number,
  birthDate: Date,
  currentDate: Date,
  currentSadeSati: CurrentSadeSati
): SadeSatiHistory {
  const all: SadeSatiPeriod[][] = [];
  
  // Saturn takes ~29.5 years per zodiac cycle
  // In 100 years, Saturn completes ~3.4 cycles
  // This means 3-4 Sade Sati periods per person's lifetime
  
  // Generate Sade Sati periods for each Saturn cycle
  const numberOfCycles = 4; // Cover 100+ years
  
  for (let cycle = 0; cycle < numberOfCycles; cycle++) {
    // Calculate when this Saturn cycle begins (from birth)
    const cycleYearsFromBirth = cycle * 29.5;
    
    // Calculate Saturn's starting sign for this cycle
    // Saturn moves backwards through signs relative to Moon's perspective
    // For simplicity, we'll calculate the phase start for each cycle
    
    const cycleStartDate = new Date(birthDate);
    cycleStartDate.setFullYear(
      cycleStartDate.getFullYear() + Math.floor(cycleYearsFromBirth)
    );
    
    // Check if this cycle is within 100 years from birth
    const ageAtCycle = 
      (cycleStartDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageAtCycle > 100) break;
    
    // For each cycle, Saturn will transit all 12 signs
    // We need to find when it enters the 12th house from Moon (Rising phase start)
    
    // Calculate which sign Saturn enters first in this cycle
    // This is a simplification - in reality, we'd need ephemeris data
    // But for historical/future projections, we use the cyclic pattern
    
    // Saturn's position at birth determines the offset
    // For each cycle, it advances by 1 full zodiac rotation
    
    // Find when Saturn enters the 12th house from Moon
    const risingPhaseStart = new Date(cycleStartDate);
    
    // ✅ Only generate if this period is valid (within lifespan)
    const phases = calculateAllThreePhases(moonSign, 'Rising', risingPhaseStart);
    
    // Check if the end of this Sade Sati is within 100 years
    const ageAtEnd = 
      (phases[2].endDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageAtEnd <= 100) {
      all.push(phases);
    }
  }
  
  // Categorize into past, current, upcoming, future
  const past: SadeSatiPeriod[][] = [];
  let current: SadeSatiPeriod[] | undefined = undefined;
  let upcoming: SadeSatiPeriod[] | undefined = undefined;
  const future: SadeSatiPeriod[][] = [];
  
  for (const phases of all) {
    const endDate = phases[2].endDate;
    const startDate = phases[0].startDate;
    
    if (endDate < currentDate) {
      // Past period (completely finished)
      past.push(phases);
    } else if (startDate <= currentDate && endDate >= currentDate) {
      // Current period (active now)
      current = phases;
    } else {
      // Future periods
      if (!upcoming) {
        upcoming = phases; // First future period is "upcoming"
      } else {
        future.push(phases);
      }
    }
  }
  
  // Calculate "next" for the status card
  let next: { startDate: Date; yearsFromNow: number } | undefined;
  if (upcoming) {
    const yearsFromNow = 
      (upcoming[0].startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    next = {
      startDate: upcoming[0].startDate,
      yearsFromNow,
    };
  }
  
  return {
    past,
    current,
    upcoming,
    future,
    all,
    next,
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


/**
 * Calculate complete Saturn transit analysis (Sade Sati + Dhaiya)
 */
export function calculateSaturnTransits(
  moonPlanet: PlanetData,
  saturnPlanet: PlanetData,
  birthDate: Date,
  currentDate: Date = new Date()
): SaturnTransitAnalysis {
  const sadeSati = calculateSadeSati(moonPlanet, saturnPlanet, birthDate, currentDate);
  
  const allDhaiya = calculateAllDhaiyaPeriods(moonPlanet.signNumber, birthDate);
  
  const currentDhaiya = checkCurrentDhaiya(
    moonPlanet.signNumber,
    saturnPlanet.signNumber,
    currentDate
  );
  
  return {
    sadeSati,
    dhaiya: {
      fourthHouse: allDhaiya.fourthHouse,
      eighthHouse: allDhaiya.eighthHouse,
      current: currentDhaiya,
    },
  };
}
