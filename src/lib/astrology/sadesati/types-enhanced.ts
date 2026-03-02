/**
 * Enhanced Type Definitions for Professional Sade Sati/Dhaiya System
 * 
 * Extends base types with 15+ Sade Sati factors and 11 Dhaiya factors
 * 
 * @file types-enhanced.ts
 * @version 2.0.0
 */

import type { SadeSatiPeriod, DhaiyaPeriod } from '@/types/sadesati';
import type { StrengthAssessment } from './strengthAnalyzer';
import type { SaturnIngress, SaturnPosition, RetrogradeStation } from './saturnEphemeris';

/**
 * Activation level - how strongly the period is felt
 */
export type ActivationLevel = 'very_high' | 'high' | 'moderate' | 'low' | 'minimal';

/**
 * Dasha activation status
 */
export interface DashaActivation {
  isActivating: boolean;
  currentDasha: string;
  currentAntardasha?: string;
  activationLevel: ActivationLevel;
  reason: string;
}

/**
 * Degree-based peak window
 */
export interface PeakWindow {
  startDate: Date;
  endDate: Date;
  moonDegree: number;
  saturnDegreeRange: { min: number; max: number };
  description: string;
}

/**
 * Nakshatra crossing event
 */
export interface NakshatraCrossing {
  nakshatra: string;
  pada: number;
  entryDate: Date;
  exitDate: Date;
  isMoonNakshatra: boolean; // Is this the birth Moon's nakshatra?
  significance: 'high' | 'medium' | 'low';
}

/**
 * Enhanced Sade Sati Period with all 15 factors
 */
export interface EnhancedSadeSatiPeriod extends SadeSatiPeriod {
  // Factor 1-3: Moon and Saturn strength
  moonStrength: StrengthAssessment;
  saturnStrength: StrengthAssessment;
  
  // Factor 4: Yogakaraka status
  isSaturnYogakaraka: boolean;
  
  // Factor 5: Dasha activation
  dashaActivation: DashaActivation;
  
  // Factor 6: Degree-based peaks
  peakWindows: PeakWindow[];
  
  // Factor 7: Nakshatra crossings
  nakshatraCrossings: NakshatraCrossing[];
  
  // Factor 8: Retrograde cycles
  retrogradeStations: RetrogradeStation[];
  retrogradePassCount: number; // How many times Saturn crosses same degrees
  
  // Factor 9: Saturn house from Lagna
  saturnHouseFromLagna: number;
  saturnHouseEffect: 'positive' | 'neutral' | 'challenging';
  
  // Factor 10: Saturn aspects
  aspectedHouses: number[]; // 3rd, 7th, 10th from Saturn
  aspectedAreas: string[]; // Life areas affected
  
  // Factor 11: Age factor
  cycleNumber: 1 | 2 | 3; // Which Sade Sati in life
  ageGroup: 'early_life' | 'mid_life' | 'later_life';
  
  // Factor 12: Jupiter protection
  jupiterProtection: {
    isProtecting: boolean;
    protectionType?: 'aspecting_moon' | 'aspecting_saturn' | 'strong_transit';
    protectionStrength: 'strong' | 'moderate' | 'weak' | 'none';
  };
  
  // Factor 13: Special point crossings
  specialCrossings: {
    crossesAtmakaraka: boolean;
    crossesLagnaDegree: boolean;
    crosses10thLord: boolean;
    crossesYogakaraka: boolean;
  };
  
  // Overall impact assessment
  overallImpact: {
    intensity: 'very_intense' | 'intense' | 'moderate' | 'mild' | 'very_mild';
    likelyOutcome: 'transformative_growth' | 'challenging_lessons' | 'mixed' | 'relatively_smooth';
    recommendation: string;
  };
  
  // Internal phases (Entry/Peak/Exit)
  internalPhases: {
    entry: { start: Date; end: Date; description: string };
    peak: { start: Date; end: Date; description: string };
    exit: { start: Date; end: Date; description: string };
  };
}

/**
 * Enhanced Dhaiya Period with all 11 factors
 */
export interface EnhancedDhaiyaPeriod extends DhaiyaPeriod {
  // Factor 4: Internal phases
  internalPhases: {
    entry: { start: Date; end: Date; description: string };
    peak: { start: Date; end: Date; description: string };
    exit: { start: Date; end: Date; description: string };
  };
  
  // Factor 5: Degree-level peaks
  peakWindows: PeakWindow[];
  
  // Factor 6: Retrograde pattern
  retrogradePattern: {
    hasRetrograde: boolean;
    touchCount: 1 | 2 | 3; // How many times issue appears
    pattern: 'single_pass' | 'double_pass' | 'triple_pass';
  };
  
  // Factor 7: Nakshatra triggers
  nakshatraTriggers: NakshatraCrossing[];
  
  // Factor 8-9: Strength factors
  moonStrength: StrengthAssessment;
  saturnStrength: StrengthAssessment;
  
  // Factor 10: Dasha activation
  dashaActivation: DashaActivation;
  
  // Factor 11: Saturn house from Lagna
  saturnHouseFromLagna: number;
  
  // Overall assessment
  overallImpact: {
    intensity: 'high' | 'moderate' | 'low';
    primaryEffect: '4th_house_effects' | '8th_house_effects';
    recommendation: string;
  };
}

/**
 * Complete enhanced transit analysis
 */
export interface EnhancedSaturnTransitAnalysis {
  sadeSati: {
    current: EnhancedSadeSatiPeriod | { isActive: false };
    past: EnhancedSadeSatiPeriod[];
    upcoming: EnhancedSadeSatiPeriod | undefined;
    future: EnhancedSadeSatiPeriod[];
    next?: {
      startDate: Date;
      yearsFromNow: number;
      expectedIntensity: 'very_intense' | 'intense' | 'moderate' | 'mild';
    };
  };
  
  dhaiya: {
    current: EnhancedDhaiyaPeriod | undefined;
    upcoming4th: EnhancedDhaiyaPeriod[];
    upcoming8th: EnhancedDhaiyaPeriod[];
  };
  
  // Current Saturn position
  currentSaturn: SaturnPosition;
  
  // Lifetime Saturn ingresses
  lifetimeIngresses: SaturnIngress[];
  
  // Summary
  summary: {
    currentStatus: 'in_sadesati' | 'in_dhaiya' | 'in_both' | 'clear';
    activationLevel: ActivationLevel;
    topRecommendations: string[];
    needsRemedies: boolean;
  };
}

/**
 * Calculation options
 */
export interface CalculationOptions {
  includeDashaAnalysis: boolean;
  calculatePeakWindows: boolean;
  detectRetrogradeCycles: boolean;
  findNakshatraCrossings: boolean;
  analyzeJupiterProtection: boolean;
  includeDetailedPhases: boolean;
}
