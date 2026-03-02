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
  const houseFromMoon = getHouseFromMoon(saturnSign, moonSign);
  const isActive = houseFromMoon === 12 || houseFromMoon === 1 || houseFromMoon === 2;
  
  if (!isActive) {
    return { isActive: false };
  }
  
  // Determine current phase
  let phase: SadeSatiPhase;
  if (houseFromMoon === 12) phase = 'Rising';
  else if (houseFromMoon === 1) phase = 'Peak';
  else phase = 'Setting';
  
  // ✅ Calculate when Saturn ENTERED this sign (based on degree)
  const degreeInSign = saturnLongitude % 30;
  const daysIntoSign = (degreeInSign / 30) * SATURN_PERIOD_PER_SIGN_DAYS;
  
  const signEntryDate = new Date(currentDate);
  signEntryDate.setDate(signEntryDate.getDate() - Math.floor(daysIntoSign));
  
  const signExitDate = new Date(signEntryDate);
  signExitDate.setDate(signExitDate.getDate() + Math.floor(SATURN_PERIOD_PER_SIGN_DAYS));
  
  // ✅ Calculate Sade Sati START by going backwards from current phase
  let sadeSatiStart: Date;
  
  if (phase === 'Rising') {
    sadeSatiStart = signEntryDate; // Already at Rising start
  } else if (phase === 'Peak') {
    // Go back 1 phase (2.5 years)
    sadeSatiStart = new Date(signEntryDate);
    sadeSatiStart.setDate(
      sadeSatiStart.getDate() - Math.floor(SATURN_PERIOD_PER_SIGN_DAYS)
    );
  } else { // Setting
    // Go back 2 phases (5 years)
    sadeSatiStart = new Date(signEntryDate);
    sadeSatiStart.setDate(
      sadeSatiStart.getDate() - Math.floor(SATURN_PERIOD_PER_SIGN_DAYS * 2)
    );
  }
  
  // Now calculate all three phases from the Sade Sati start
  const allPhases = calculateAllThreePhases(moonSign, 'Rising', sadeSatiStart);
  
  // Rest of the calculation stays the same...
  const startDate = allPhases[0].startDate;
  const endDate = allPhases[2].endDate;
  
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    isActive: true,
    currentPhase: allPhases.find(p => p.phase === phase)!,
    allPhases,
    startDate,
    endDate,
    totalYears: totalDays / 365.25,
    elapsedPercentage: Math.min(100, (elapsedDays / totalDays) * 100),
    daysRemainingInPhase: Math.max(0, Math.floor(
      (signExitDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    )),
    daysRemainingTotal: Math.max(0, Math.floor(
      (endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    )),
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
  const SATURN_CYCLE_YEARS = 29.5;
  
  // ✅ ANCHOR POINT: Use current Sade Sati if active
  let anchorPeriod: SadeSatiPeriod[] | null = null;
  let anchorCycleIndex = 0;
  
  if (currentSadeSati.isActive && currentSadeSati.allPhases) {
    // Use the current active period as anchor
    anchorPeriod = currentSadeSati.allPhases;
    
    // Calculate which cycle this is (0, 1, 2, 3...)
    const ageAtStart = (anchorPeriod[0].startDate.getTime() - birthDate.getTime()) 
      / (1000 * 60 * 60 * 24 * 365.25);
    anchorCycleIndex = Math.round(ageAtStart / SATURN_CYCLE_YEARS);
  }
  
  // Generate periods for all cycles (0-3 = 4 cycles covering 100+ years)
  for (let cycle = 0; cycle < 4; cycle++) {
    let phases: SadeSatiPeriod[];
    
    // ✅ If this is the anchor cycle, use the exact dates
    if (anchorPeriod && cycle === anchorCycleIndex) {
      phases = anchorPeriod;
    } else {
      // Calculate offset from anchor (if exists) or from birth
      let cycleStartDate: Date;
      
      if (anchorPeriod) {
        // Calculate relative to anchor period
        const cycleOffset = cycle - anchorCycleIndex;
        const offsetYears = cycleOffset * SATURN_CYCLE_YEARS;
        
        cycleStartDate = new Date(anchorPeriod[0].startDate);
        cycleStartDate.setFullYear(
          cycleStartDate.getFullYear() + Math.floor(offsetYears)
        );
      } else {
        // No anchor - use age-based estimation
        const cycleYearsFromBirth = cycle * SATURN_CYCLE_YEARS;
        cycleStartDate = new Date(birthDate);
        cycleStartDate.setFullYear(
          cycleStartDate.getFullYear() + Math.floor(cycleYearsFromBirth)
        );
      }
      
      // Generate the three phases
      phases = calculateAllThreePhases(moonSign, 'Rising', cycleStartDate);
    }
    
    // Only include if within 100 years from birth
    const ageAtEnd = 
      (phases[2].endDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageAtEnd <= 100 && ageAtEnd >= 0) {
      all.push(phases);
    }
  }
  
  // Sort chronologically (in case anchor shifted the order)
  all.sort((a, b) => a[0].startDate.getTime() - b[0].startDate.getTime());
  
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
