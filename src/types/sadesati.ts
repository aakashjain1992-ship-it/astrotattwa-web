/**
 * Sade Sati Type Definitions
 * 
 * Sade Sati (साढ़े साती) - Saturn's 7.5-year challenging transit period
 * when Saturn transits through 12th, 1st, and 2nd houses from natal Moon
 * 
 * @file src/types/sadesati.ts
 * @version 1.0.0
 * @created February 28, 2026
 */

export type SadeSatiPhase = 'Rising' | 'Peak' | 'Setting';
export type DhaiyaType = '4th' | '8th';


/**
 * Single phase period of Sade Sati
 */
export interface SadeSatiPeriod {
 
  phase: SadeSatiPhase;  // Phase name 
  description: string; // Phase description 
  startDate: Date;   // Start date 
  endDate: Date;  // End date 
  durationDays: number;  // Duration in days 
  saturnSign: string;  // Saturn's transit sign 
  saturnSignNumber: number;   // Saturn's transit sign number (1-12) 
  moonSign: string;    // Moon's natal sign 
  moonSignNumber: number; // Moon's natal sign number (1-12)
  houseFromMoon: 12 | 1 | 2;    // House relationship (12th, 1st, or 2nd from Moon)
}
/**
 * Dhaiya period (2.5 years)
 */
export interface DhaiyaPeriod {
 
  type: DhaiyaType;  // Type of Dhaiya
  description: string;    // Description
  startDate: Date; //Start date
  endDate: Date;   // End date
  durationDays: number; // Duration in days
  saturnSign: string; // Saturn's transit sign
  saturnSignNumber: number; // Saturn's transit sign number (1-12)
  moonSign: string; // Moon's natal sign
  moonSignNumber: number; // Moon's natal sign number (1-12)
  houseFromMoon: 4 | 8; // House relationship (4th or 8th from Moon)
}

/**
 * Current Sade Sati status
 */
export interface CurrentSadeSati {
  /** Is Sade Sati currently active? */
  isActive: boolean;
  
  /** Current phase (if active) */
  currentPhase?: SadeSatiPeriod;
  
  /** All three phases of current Sade Sati cycle */
  allPhases?: SadeSatiPeriod[];
  
  /** Sade Sati start date */
  startDate?: Date;
  
  /** Sade Sati end date */
  endDate?: Date;
  
  /** Total duration in years */
  totalYears?: number;
  
  /** Elapsed percentage (0-100) */
  elapsedPercentage?: number;
  
  /** Days remaining in current phase */
  daysRemainingInPhase?: number;
  
  /** Days remaining in entire Sade Sati */
  daysRemainingTotal?: number;
}

/**
 * Historical and future Sade Sati periods
 */
export interface SadeSatiHistory {
  /** All Sade Sati periods from birth to 100 years */
  all: SadeSatiPeriod[][];
  
  /** Past Sade Sati cycles */
  past: SadeSatiPeriod[][];
  
  /** Current Sade Sati (if active) */
  current?: SadeSatiPeriod[];
  
  /** Next immediate Sade Sati period (upcoming) */
  upcoming?: SadeSatiPeriod[];
  
  /** Next Sade Sati period */
  next: {
    startDate: Date;
    phases: SadeSatiPeriod[];
    yearsFromNow: number;
  };
  
  /** Future Sade Sati periods (beyond upcoming) */
  future: SadeSatiPeriod[][];

}

/**
 * Effects and insights for a phase
 */
export interface PhaseInsights {
  /** General effects */
  effects: string[];
  
  /** Recommended remedies */
  remedies: string[];
  
  /** Life areas affected */
  affectedAreas: string[];
  
  /** Positive aspects (silver lining) */
  positiveAspects: string[];
}

/**
 * Complete Sade Sati analysis
 */
export interface SadeSatiAnalysis {
  /** Current status */
  current: CurrentSadeSati;
  
  /** Historical and future periods */
  history: SadeSatiHistory;
  
  /** Insights for current phase (if active) */
  insights?: PhaseInsights;
  
  /** Calculation metadata */
  metadata: {
    calculatedAt: string;
    moonSign: string;
    moonSignNumber: number;
    moonNakshatra: string;
    currentSaturnSign: string;
    currentSaturnSignNumber: number;
  };
}
/**
 * Complete Saturn transit analysis including Sade Sati and Dhaiya
 */
export interface SaturnTransitAnalysis {
  /** Sade Sati analysis */
  sadeSati: SadeSatiAnalysis;
  
  /** Dhaiya periods */
  dhaiya: {
    /** All 4th house Dhaiya periods */
    fourthHouse: DhaiyaPeriod[];
    
    /** All 8th house Dhaiya periods */
    eighthHouse: DhaiyaPeriod[];
    
    /** Currently active Dhaiya (if any) */
    current?: DhaiyaPeriod;
  };
}
