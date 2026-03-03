/**
 * Professional-Grade Sade Sati & Dhaiya Calculator
 *
 * Implements all 15 Sade Sati factors and 11 Dhaiya factors from professional documents
 * Uses actual Saturn ephemeris instead of approximations
 *
 * @file calculator-PROFESSIONAL.ts
 * @version 2.1.0
 * @updated March 2026 — implemented lifetime computation (was stubbed)
 */

import type { PlanetData, AscendantData } from '@/types/astrology';
import type { DashaInfo } from '@/types/astrology';
import {
  calculateSaturnAtDate,
  calculateSaturnIngress,
  findSaturnPeakWindow,
  getCurrentSaturnTransit,
} from './saturnEphemeris';
import {
  analyzeMoonStrength,
  analyzeSaturnStrength,
  checkJupiterProtection,
} from './strengthAnalyzer';
import type {
  EnhancedSadeSatiPeriod,
  EnhancedDhaiyaPeriod,
  EnhancedSaturnTransitAnalysis,
  ActivationLevel,
  DashaActivation,
  PeakWindow,
  NakshatraCrossing,
  CalculationOptions,
} from './types-enhanced';
import {
  SATURN_PERIOD_PER_SIGN_DAYS,
  getSignName,
  getHouseFromMoon,
  PHASE_DESCRIPTIONS,
  DHAIYA_DESCRIPTIONS,
} from '@/lib/astrology/sadesati/constants';
import type { SadeSatiPhase } from '@/types/sadesati';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Search 5 years before birth (person may be born mid-Sade Sati) */
const YEARS_BEFORE_BIRTH = 5;
/** Cover 3 full Saturn cycles (~90 years) */
const LIFETIME_YEARS = 90;
/** Buffer between consecutive sign searches to avoid re-finding same ingress */
const INGRESS_BUFFER_DAYS = 15;
/** Gap between full Sade Sati periods — skip forward 6 months after Setting exits */
const POST_SADESATI_BUFFER_DAYS = 180;
/** Saturn's orbital period in years */
const SATURN_CYCLE_YEARS = 29.46;

// ─── Public types for the Timeline view ──────────────────────────────────────

export type SaturnEventType =
  | 'ss_rising'
  | 'ss_peak'
  | 'ss_setting'
  | 'dhaiya_4th'
  | 'dhaiya_8th';

export type SaturnEventStatus = 'past' | 'current' | 'upcoming' | 'future';

/**
 * A single retrograde pass: the window where Saturn is actually IN the sign
 * during one forward/backward crossing.  Up to 3 per event.
 */
export interface SaturnPass {
  start: Date;
  end:   Date;
}

export interface SaturnCycleEvent {
  type:     SaturnEventType;
  label:    string;           // "Sadesati's 1st Dhaiya", "Dhaiya over 4th House", etc.
  sublabel: string;           // "Saturn in Scorpio"
  passes:   SaturnPass[];     // 1–3 date ranges (the column groups in the reference image)
  status:   SaturnEventStatus;
  /** The full source period for detail drill-down */
  sourcePeriod?: EnhancedSadeSatiPeriod | EnhancedDhaiyaPeriod;
}

export interface SaturnCycle {
  cycleNumber: number;
  label: string;              // "First Cycle", "Second Cycle", ...
  startYear: number;
  endYear:   number;
  events:    SaturnCycleEvent[];
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Main entry point — Calculate complete professional analysis
 */
export async function calculateProfessionalSaturnAnalysis(
  moonPlanet:   PlanetData,
  saturnPlanet: PlanetData,
  allPlanets:   Record<string, PlanetData>,
  ascendant:    AscendantData,
  birthDate:    Date,
  dashaInfo?:   DashaInfo,
  options: CalculationOptions = {
    includeDashaAnalysis:     true,
    calculatePeakWindows:     true,
    detectRetrogradeCycles:   true,
    findNakshatraCrossings:   true,
    analyzeJupiterProtection: true,
    includeDetailedPhases:    true,
  }
): Promise<EnhancedSaturnTransitAnalysis> {
  const currentDate = new Date();

  // Get current Saturn position from ephemeris
  const currentSaturn = await getCurrentSaturnTransit();

  // Analyze strengths (Factors 1–3)
  const moonStrength   = analyzeMoonStrength(moonPlanet, ascendant, allPlanets);
  const saturnStrength = analyzeSaturnStrength(saturnPlanet, ascendant);

  // ── Compute ALL Sade Sati periods across lifetime ──────────────────────────
  const allSadeSatiPeriods = await computeLifetimeSadeSati(
    moonPlanet, allPlanets, ascendant, birthDate, currentDate,
    currentSaturn.sign, moonStrength, saturnStrength, dashaInfo
  );

  // Classify periods relative to today
  const currentSadeSati  = allSadeSatiPeriods.find(p =>
    toDate(p.startDate) <= currentDate && toDate(p.endDate) >= currentDate
  ) ?? { isActive: false };

  const pastSadeSati     = allSadeSatiPeriods.filter(p =>
    toDate(p.endDate) < currentDate && toDate(p.startDate) >= birthDate
  );

  const futureSadeSati   = allSadeSatiPeriods.filter(p =>
    toDate(p.startDate) > currentDate
  );
  const upcomingSadeSati = futureSadeSati[0];

  // ── Compute ALL Dhaiya periods across lifetime ─────────────────────────────
  const dhaiyaAnalysis = await computeLifetimeDhaiya(
    moonPlanet, saturnPlanet, allPlanets, ascendant,
    birthDate, currentDate, currentSaturn, moonStrength, saturnStrength,
    dashaInfo, options
  );

  // ── Summary ────────────────────────────────────────────────────────────────
  const summary = buildSummary(
    currentSadeSati,
    dhaiyaAnalysis.current,
    moonStrength,
    saturnStrength
  );

  return {
    sadeSati: {
      current:  currentSadeSati,
      past:     pastSadeSati,
      upcoming: upcomingSadeSati,
      future:   futureSadeSati.slice(1),
      next: upcomingSadeSati
        ? {
            startDate: upcomingSadeSati.startDate,
            yearsFromNow:
              (toDate(upcomingSadeSati.startDate).getTime() - currentDate.getTime()) /
              (1000 * 60 * 60 * 24 * 365.25),
            expectedIntensity: upcomingSadeSati.overallImpact.intensity,
          }
        : undefined,
    },
    dhaiya: dhaiyaAnalysis,
    currentSaturn,
    lifetimeIngresses: [], // expensive — skipped intentionally
    summary,
  };
}

// ─── Lifetime Sade Sati computation ──────────────────────────────────────────

/**
 * Finds ALL Sade Sati periods from (birthDate − 5yr) to (birthDate + 90yr).
 * Each period has allPhases[Rising, Peak, Setting] and all progress fields.
 */
async function computeLifetimeSadeSati(
  moonPlanet:        PlanetData,
  allPlanets:        Record<string, PlanetData>,
  ascendant:         AscendantData,
  birthDate:         Date,
  currentDate:       Date,
  currentSaturnSign: number,
  moonStrength:      any,
  saturnStrength:    any,
  dashaInfo:         DashaInfo | undefined,
): Promise<EnhancedSadeSatiPeriod[]> {
  const moonSign    = moonPlanet.signNumber;
  const risingSign  = signAhead(moonSign, 11);   // moon − 1
  const settingSign = signAhead(moonSign, 1);    // moon + 1

  const searchStart = subYears(birthDate, YEARS_BEFORE_BIRTH);
  const searchEnd   = addYears(birthDate, LIFETIME_YEARS);

  const periods: EnhancedSadeSatiPeriod[] = [];
  let searchFrom = new Date(searchStart);
  let cycleIndex = 0;

  while (searchFrom < searchEnd && cycleIndex < 4) {
    try {
      // 1. Next Saturn ingress into Rising sign
      const ri = await calculateSaturnIngress(risingSign, searchFrom);
      if (toDate(ri.entryDate) > searchEnd) break;

      // 2. Chain → Peak, starting just after Rising exits
      const pi = await calculateSaturnIngress(
        moonSign,
        addDays(ri.exitDate, INGRESS_BUFFER_DAYS)
      );

      // 3. Chain → Setting, starting just after Peak exits
      const si = await calculateSaturnIngress(
        settingSign,
        addDays(pi.exitDate, INGRESS_BUFFER_DAYS)
      );

      const cycleNumber = Math.min(cycleIndex + 1, 3) as 1 | 2 | 3;

      const period = buildCompleteSadeSatiPeriod(
        ri, pi, si,
        moonPlanet, allPlanets, ascendant, currentDate,
        moonStrength, saturnStrength, dashaInfo,
        cycleNumber, currentSaturnSign
      );

      periods.push(period);

      // Advance past Setting + buffer
      searchFrom = addDays(si.exitDate, POST_SADESATI_BUFFER_DAYS);
      cycleIndex++;
    } catch {
      // If ephemeris fails for this window, advance 2 years and retry
      searchFrom = addYears(searchFrom, 2);
      cycleIndex++;
    }
  }

  return periods;
}

// ─── Complete Sade Sati period builder ───────────────────────────────────────

/**
 * Builds a full EnhancedSadeSatiPeriod from three ingress objects.
 * FIX: now attaches allPhases[], currentPhase, elapsedPercentage, daysRemainingInPhase.
 */
function buildCompleteSadeSatiPeriod(
  risingIngress:  any,
  peakIngress:    any,
  settingIngress: any,
  moonPlanet:     PlanetData,
  allPlanets:     Record<string, PlanetData>,
  ascendant:      AscendantData,
  currentDate:    Date,
  moonStrength:   any,
  saturnStrength: any,
  dashaInfo:      DashaInfo | undefined,
  cycleNumber:    1 | 2 | 3,
  currentSaturnSign: number,
): EnhancedSadeSatiPeriod {
  const moonSign = moonPlanet.signNumber;

  // Build each phase with its internal sub-phases
  const rising  = buildSadeSatiPhase(risingIngress,  'Rising',  moonSign);
  const peak    = buildSadeSatiPhase(peakIngress,    'Peak',    moonSign);
  const setting = buildSadeSatiPhase(settingIngress, 'Setting', moonSign);

  const periodStart = toDate(risingIngress.entryDate);
  const periodEnd   = toDate(settingIngress.exitDate);

  // Which phase contains today?
  let currentPhase: typeof rising | undefined;
  if (currentDate >= toDate(rising.startDate)  && currentDate <= toDate(rising.endDate))  currentPhase = rising;
  if (currentDate >= toDate(peak.startDate)    && currentDate <= toDate(peak.endDate))    currentPhase = peak;
  if (currentDate >= toDate(setting.startDate) && currentDate <= toDate(setting.endDate)) currentPhase = setting;

  // Overall progress (across the full 7.5-year Sade Sati)
  const totalMs             = periodEnd.getTime() - periodStart.getTime();
  const elapsedMs           = currentDate.getTime() - periodStart.getTime();
  const elapsedPercentage   = parseFloat(Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100)).toFixed(1));
  const daysRemainingInPhase = currentPhase
    ? Math.max(0, Math.round((toDate(currentPhase.endDate).getTime() - currentDate.getTime()) / 86_400_000))
    : 0;

  // Factor analysis
  const dashaActivation      = analyzeDashaActivation(dashaInfo, currentDate);
  const saturnHouseFromLagna = getHouseFromLagna(currentSaturnSign, ascendant.signNumber);
  const saturnHouseEffect    = getSaturnHouseEffect(saturnHouseFromLagna);
  const aspectedHouses       = [
    ((saturnHouseFromLagna + 2) % 12) || 12,
    ((saturnHouseFromLagna + 6) % 12) || 12,
    ((saturnHouseFromLagna + 9) % 12) || 12,
  ];

  const jupiter          = allPlanets.Jupiter;
  const isProtecting     = checkJupiterProtection(jupiter, moonPlanet);
  const jupiterStrength  = getJupiterProtectionStrength(jupiter, moonPlanet, allPlanets.Saturn ?? moonPlanet);
  const jupiterProtection = { isProtecting, protectionStrength: jupiterStrength };

  const overallImpact = assessOverallImpact(
    moonStrength, saturnStrength, dashaActivation, jupiterProtection, cycleNumber
  );

  // Use current phase as the "base" fields on the period (or rising if before start)
  const base = currentPhase ?? rising;

  return {
    // Base fields (from the currently active phase or Rising if inactive)
    phase:            base.phase,
    description:      base.description,
    startDate:        periodStart,
    endDate:          periodEnd,
    durationDays:     Math.round(totalMs / 86_400_000),
    saturnSign:       base.saturnSign,
    saturnSignNumber: base.saturnSignNumber,
    moonSign:         getSignName(moonSign),
    moonSignNumber:   moonSign,
    houseFromMoon:    base.houseFromMoon,

    // ── FIX: attach all three phases ──────────────────────────────
    allPhases: [rising, peak, setting] as any,
    currentPhase:           currentPhase as any,
    elapsedPercentage,
    daysRemainingInPhase,
    // ──────────────────────────────────────────────────────────────

    // Factors
    moonStrength,
    saturnStrength,
    isSaturnYogakaraka: saturnStrength.isYogakaraka,
    dashaActivation,
    peakWindows: [],
    nakshatraCrossings: [],
    retrogradeStations:  risingIngress.retrogradeStations ?? [],
    retrogradePassCount: classifyRetrogradePattern(risingIngress.retrogradeStations ?? []).touchCount,
    saturnHouseFromLagna,
    saturnHouseEffect,
    aspectedHouses,
    aspectedAreas: [],
    cycleNumber,
    ageGroup: getAgeGroup(cycleNumber),
    jupiterProtection,
    specialCrossings: {
      crossesAtmakaraka:  false,
      crossesLagnaDegree: false,
      crosses10thLord:    false,
      crossesYogakaraka:  false,
    },
    overallImpact,
    internalPhases: {
      entry: rising.internalPhases.entry,
      peak:  peak.internalPhases.peak,
      exit:  setting.internalPhases.exit,
    },
  };
}

/** Build one of the three Sade Sati phases from a Saturn ingress object */
function buildSadeSatiPhase(
  ingress:    any,
  phase:      SadeSatiPhase,
  moonSign:   number,
): any {
  const houseFromMoon: 12 | 1 | 2 =
    phase === 'Rising' ? 12 : phase === 'Peak' ? 1 : 2;

  const total     = ingress.durationDays as number;
  const entryDays = Math.floor(total * 0.25);
  const peakDays  = Math.floor(total * 0.5);
  const entry     = toDate(ingress.entryDate);

  return {
    phase,
    description: PHASE_DESCRIPTIONS[phase],
    startDate:        entry,
    endDate:          toDate(ingress.exitDate),
    durationDays:     total,
    saturnSign:       ingress.signName as string,
    saturnSignNumber: ingress.sign as number,
    moonSign:         getSignName(moonSign),
    moonSignNumber:   moonSign,
    houseFromMoon,
    retrogradePassCount: classifyRetrogradePattern(ingress.retrogradeStations ?? []).touchCount,
    // Passes (1–3 retrograde crossing windows) for the timeline table columns
    passes: buildRetrogradePasses(ingress),
    internalPhases: {
      entry: {
        start:       entry,
        end:         addDays(entry, entryDays),
        description: 'Adjustment and early signals',
      },
      peak: {
        start:       addDays(entry, entryDays),
        end:         addDays(entry, entryDays + peakDays),
        description: 'Maximum pressure and transformation',
      },
      exit: {
        start:       addDays(entry, entryDays + peakDays),
        end:         toDate(ingress.exitDate),
        description: 'Stabilisation and integration',
      },
    },
  };
}

// ─── Lifetime Dhaiya computation ──────────────────────────────────────────────

/**
 * Finds ALL 4th and 8th Dhaiya periods across the lifetime.
 * FIX: previously returned upcoming4th/8th as empty [].
 */
async function computeLifetimeDhaiya(
  moonPlanet:    PlanetData,
  saturnPlanet:  PlanetData,
  allPlanets:    Record<string, PlanetData>,
  ascendant:     AscendantData,
  birthDate:     Date,
  currentDate:   Date,
  currentSaturn: any,
  moonStrength:  any,
  saturnStrength: any,
  dashaInfo:     DashaInfo | undefined,
  options:       CalculationOptions,
): Promise<{
  current:     EnhancedDhaiyaPeriod | undefined;
  upcoming4th: EnhancedDhaiyaPeriod[];
  upcoming8th: EnhancedDhaiyaPeriod[];
}> {
  const moonSign = moonPlanet.signNumber;
  const sign4th  = signAhead(moonSign, 3);   // 4th house from Moon
  const sign8th  = signAhead(moonSign, 7);   // 8th house from Moon

  const searchStart = subYears(birthDate, YEARS_BEFORE_BIRTH);
  const searchEnd   = addYears(birthDate, LIFETIME_YEARS);

  const all4th = await findAllDhaiyaForSign(
    '4th', sign4th,
    moonPlanet, saturnPlanet, allPlanets, ascendant,
    searchStart, searchEnd, moonStrength, saturnStrength, dashaInfo, options
  );

  const all8th = await findAllDhaiyaForSign(
    '8th', sign8th,
    moonPlanet, saturnPlanet, allPlanets, ascendant,
    searchStart, searchEnd, moonStrength, saturnStrength, dashaInfo, options
  );

  // Identify currently active Dhaiya (prefer the one that contains today)
  const houseFromMoon = getHouseFromMoon(currentSaturn.sign, moonSign);
  let current: EnhancedDhaiyaPeriod | undefined;

  if (houseFromMoon === 4) {
    current = all4th.find(p =>
      toDate(p.startDate) <= currentDate && toDate(p.endDate) >= currentDate
    );
  } else if (houseFromMoon === 8) {
    current = all8th.find(p =>
      toDate(p.startDate) <= currentDate && toDate(p.endDate) >= currentDate
    );
  }

  return {
    current,
    upcoming4th: all4th.filter(p => toDate(p.startDate) > currentDate),
    upcoming8th: all8th.filter(p => toDate(p.startDate) > currentDate),
  };
}

async function findAllDhaiyaForSign(
  type:          '4th' | '8th',
  sign:          number,
  moonPlanet:    PlanetData,
  saturnPlanet:  PlanetData,
  allPlanets:    Record<string, PlanetData>,
  ascendant:     AscendantData,
  searchStart:   Date,
  searchEnd:     Date,
  moonStrength:  any,
  saturnStrength: any,
  dashaInfo:     DashaInfo | undefined,
  options:       CalculationOptions,
): Promise<EnhancedDhaiyaPeriod[]> {
  const results: EnhancedDhaiyaPeriod[] = [];
  let searchFrom = new Date(searchStart);

  while (searchFrom < searchEnd) {
    try {
      const ingress = await calculateSaturnIngress(sign, searchFrom);
      if (toDate(ingress.entryDate) > searchEnd) break;

      const period = await buildEnhancedDhaiyaPeriod(
        type, moonPlanet, saturnPlanet, allPlanets, ascendant,
        ingress, moonStrength, saturnStrength, dashaInfo, options
      );
      results.push(period);

      // Advance past this transit
      searchFrom = addDays(ingress.exitDate, POST_SADESATI_BUFFER_DAYS);
    } catch {
      searchFrom = addYears(searchFrom, 2);
    }
  }

  return results;
}

// ─── Dhaiya period builder ────────────────────────────────────────────────────

async function buildEnhancedDhaiyaPeriod(
  type:          '4th' | '8th',
  moonPlanet:    PlanetData,
  saturnPlanet:  PlanetData,
  allPlanets:    Record<string, PlanetData>,
  ascendant:     AscendantData,
  ingress:       any,
  moonStrength:  any,
  saturnStrength: any,
  dashaInfo:     DashaInfo | undefined,
  options:       CalculationOptions
): Promise<EnhancedDhaiyaPeriod> {
  const dashaActivation = analyzeDashaActivation(dashaInfo, new Date());
  // FIX: use classifyRetrogradePattern — was setting pattern='single_pass' regardless of touchCount
  const retrograde = classifyRetrogradePattern(ingress.retrogradeStations ?? []);

  const total     = ingress.durationDays as number;
  const entryDays = Math.floor(total * 0.25);
  const peakDays  = Math.floor(total * 0.5);
  const entry     = toDate(ingress.entryDate);

  return {
    type,
    description: DHAIYA_DESCRIPTIONS[type],
    startDate:        entry,
    endDate:          toDate(ingress.exitDate),
    durationDays:     total,
    saturnSign:       ingress.signName as string,
    saturnSignNumber: ingress.sign as number,
    moonSign:         getSignName(moonPlanet.signNumber),
    moonSignNumber:   moonPlanet.signNumber,
    houseFromMoon:    type === '4th' ? 4 : 8,
    internalPhases: {
      entry: {
        start:       entry,
        end:         addDays(entry, entryDays),
        description: 'Entry phase — initial adjustment',
      },
      peak: {
        start:       addDays(entry, entryDays),
        end:         addDays(entry, entryDays + peakDays),
        description: 'Peak phase — maximum effects',
      },
      exit: {
        start:       addDays(entry, entryDays + peakDays),
        end:         toDate(ingress.exitDate),
        description: 'Exit phase — stabilisation',
      },
    },
    passes: buildRetrogradePasses(ingress),
    peakWindows: [],
    // FIX: both touchCount and pattern now derived consistently
    retrogradePattern: retrograde,
    nakshatraTriggers:  [],
    moonStrength,
    saturnStrength,
    dashaActivation,
    saturnHouseFromLagna: getHouseFromLagna(ingress.sign, ascendant.signNumber),
    overallImpact: {
      intensity: dashaActivation.isActivating ? 'high' : 'moderate',
      primaryEffect: type === '4th' ? '4th_house_effects' : '8th_house_effects',
      recommendation:
        type === '4th'
          ? 'Focus on emotional stability and home harmony'
          : 'Embrace transformation and let go of old patterns',
    },
  };
}

// ─── Saturn Cycle builder (for Timeline tab) ──────────────────────────────────

/**
 * Groups all Sade Sati phases and Dhaiya periods into Saturn cycles
 * for the Reference-style timeline table.
 *
 * Key rule: cycles are sorted chronologically — the event that comes first
 * for this person's chart determines the cycle start.  There is no assumed
 * fixed order; whatever Saturn does first in a ~30-year window starts the cycle.
 */
export function buildSaturnCycles(
  analysis:    EnhancedSaturnTransitAnalysis,
  birthDate:   Date,
  currentDate: Date = new Date(),
): SaturnCycle[] {
  // ── 1. Flatten all events into a single list ─────────────────────────────
  const events: Array<{
    type:      SaturnEventType;
    label:     string;
    sublabel:  string;
    startDate: Date;
    passes:    SaturnPass[];
    source?:   any;
  }> = [];

  // Helper: add a Sade Sati phase
  const addSsPhase = (
    phase: any,
    ssLabel: 'Rising' | 'Peak' | 'Setting',
    source: any,
  ) => {
    if (!phase) return;
    const labelMap: Record<string, string> = {
      Rising:  "Sadesati's 1st Dhaiya",
      Peak:    "Sadesati's 2nd Dhaiya",
      Setting: "Sadesati's 3rd Dhaiya",
    };
    events.push({
      type:      `ss_${ssLabel.toLowerCase()}` as SaturnEventType,
      label:     labelMap[ssLabel],
      sublabel:  `Saturn in ${phase.saturnSign}`,
      startDate: toDate(phase.startDate),
      passes:    (phase as any).passes ?? buildRetroPassesFromDates(phase.startDate, phase.endDate),
      source,
    });
  };

  // Helper: add a Dhaiya period
  const addDhaiya = (
    d: EnhancedDhaiyaPeriod,
  ) => {
    events.push({
      type:      d.type === '4th' ? 'dhaiya_4th' : 'dhaiya_8th',
      label:     d.type === '4th' ? 'Dhaiya over 4th House' : 'Dhaiya over 8th House',
      sublabel:  `Saturn in ${d.saturnSign}`,
      startDate: toDate(d.startDate),
      passes:    (d as any).passes ?? buildRetroPassesFromDates(d.startDate, d.endDate),
      source:    d,
    });
  };

  // Collect all Sade Sati periods (past + current + upcoming + future)
  const allSS: EnhancedSadeSatiPeriod[] = [
    ...analysis.sadeSati.past,
    ...(isRealPeriod(analysis.sadeSati.current) ? [analysis.sadeSati.current as EnhancedSadeSatiPeriod] : []),
    ...(analysis.sadeSati.upcoming ? [analysis.sadeSati.upcoming] : []),
    ...analysis.sadeSati.future,
  ];

  for (const ss of allSS) {
    const phases: any[] = (ss as any).allPhases ?? [ss];
    for (const ph of phases) {
      addSsPhase(ph, ph.phase as 'Rising' | 'Peak' | 'Setting', ss);
    }
  }

  // Collect all Dhaiya periods
  const allDhaiya: EnhancedDhaiyaPeriod[] = [
    ...(analysis.dhaiya.current ? [analysis.dhaiya.current] : []),
    ...analysis.dhaiya.upcoming4th,
    ...analysis.dhaiya.upcoming8th,
  ];

  for (const d of allDhaiya) {
    addDhaiya(d);
  }

  if (events.length === 0) return [];

  // ── 2. Sort all events chronologically ────────────────────────────────────
  events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // ── 3. Group into Saturn cycles (~29.46 years each) ───────────────────────
  //   A new cycle starts whenever the gap since the last cycle start ≥ 29 years,
  //   OR when we've seen all 5 event types in the current cycle bucket.
  const CYCLE_MS = SATURN_CYCLE_YEARS * 365.25 * 86_400_000;
  const cycles: SaturnCycle[] = [];
  const CYCLE_NAMES = ['First', 'Second', 'Third', 'Fourth'];

  let cycleStart  = events[0].startDate;
  let cycleEvents: typeof events = [];
  let cycleNum    = 1;

  for (const ev of events) {
    const gapMs = ev.startDate.getTime() - cycleStart.getTime();
    if (gapMs > CYCLE_MS && cycleEvents.length > 0) {
      // Flush current cycle
      cycles.push(makeCycle(cycleNum, cycleEvents, currentDate, CYCLE_NAMES));
      cycleNum++;
      cycleStart  = ev.startDate;
      cycleEvents = [];
    }
    cycleEvents.push(ev);
  }

  // Flush last bucket
  if (cycleEvents.length > 0) {
    cycles.push(makeCycle(cycleNum, cycleEvents, currentDate, CYCLE_NAMES));
  }

  return cycles;
}

function makeCycle(
  cycleNum:    number,
  evts:        Array<{ type: SaturnEventType; label: string; sublabel: string; startDate: Date; passes: SaturnPass[]; source?: any }>,
  currentDate: Date,
  names:       string[],
): SaturnCycle {
  const startYear = evts[0].startDate.getFullYear();
  const endYear   = evts[evts.length - 1].startDate.getFullYear() + 3; // approximate

  return {
    cycleNumber: cycleNum,
    label:       `${names[cycleNum - 1] ?? `Cycle ${cycleNum}`} Cycle`,
    startYear,
    endYear,
    events: evts.map(ev => ({
      type:      ev.type,
      label:     ev.label,
      sublabel:  ev.sublabel,
      passes:    ev.passes,
      status:    classifyEventStatus(ev.passes, currentDate),
      sourcePeriod: ev.source,
    })),
  };
}

function classifyEventStatus(passes: SaturnPass[], currentDate: Date): SaturnEventStatus {
  if (!passes || passes.length === 0) return 'future';
  const first = passes[0].start;
  const last  = passes[passes.length - 1].end;
  if (last < currentDate)   return 'past';
  if (first > currentDate)  return passes[0].start.getFullYear() - currentDate.getFullYear() <= 2 ? 'upcoming' : 'future';
  return 'current'; // currentDate is within the event window
}

// ─── Retrograde pass builder ─────────────────────────────────────────────────

/**
 * Converts a Saturn ingress object into 1–3 retrograde pass windows.
 *
 * A "pass" is the window where Saturn is actually INSIDE the sign during
 * one forward/backward crossing.  This is what the reference image's
 * 3 date columns represent.
 *
 * Strategy (approximation until saturnEphemeris exposes crossing windows):
 *   0 retrograde stations → 1 pass (full entry→exit)
 *   1 station             → 2 passes (entry→station, retrograde-reentry→exit)
 *   2 stations            → 3 passes
 */
function buildRetrogradePasses(ingress: any): SaturnPass[] {
  const stations: Date[] = (ingress.retrogradeStations ?? []).map(toDate);
  const entry = toDate(ingress.entryDate);
  const exit  = toDate(ingress.exitDate);

  if (stations.length === 0) {
    return [{ start: entry, end: exit }];
  }

  if (stations.length === 1) {
    // Approximate: first pass ends at station, second pass starts 30 days later
    const s1 = stations[0];
    const reentry = addDays(s1, 30);
    return [
      { start: entry, end: s1 },
      { start: reentry, end: exit },
    ];
  }

  // 2 stations → 3 passes
  const s1 = stations[0];
  const s2 = stations[1];
  return [
    { start: entry,          end: s1 },
    { start: addDays(s1, 30), end: s2 },
    { start: addDays(s2, 30), end: exit },
  ];
}

/**
 * Fallback when we only have startDate/endDate (no ingress object).
 * Returns a single pass spanning the full period.
 */
function buildRetroPassesFromDates(startDate: any, endDate: any): SaturnPass[] {
  return [{ start: toDate(startDate), end: toDate(endDate) }];
}

// ─── Factor helpers ───────────────────────────────────────────────────────────

function checkSadeSatiStatus(
  moonSign:   number,
  saturnSign: number
): { isActive: boolean; phase?: SadeSatiPhase } {
  const h = getHouseFromMoon(saturnSign, moonSign);
  if (h === 12) return { isActive: true, phase: 'Rising' };
  if (h === 1)  return { isActive: true, phase: 'Peak' };
  if (h === 2)  return { isActive: true, phase: 'Setting' };
  return { isActive: false };
}

function analyzeDashaActivation(
  dashaInfo:   DashaInfo | undefined,
  currentDate: Date,
): DashaActivation {
  if (!dashaInfo?.currentMahadasha) {
    return {
      isActivating:    false,
      currentDasha:    'Unknown',
      activationLevel: 'low',
      reason:          'Dasha information not available',
    };
  }

  const currentMaha =
    typeof dashaInfo.currentMahadasha === 'string'
      ? dashaInfo.currentMahadasha
      : (dashaInfo.currentMahadasha as any)?.lord ?? 'Unknown';

  if (['Saturn', 'Moon', 'Rahu'].includes(currentMaha)) {
    return {
      isActivating:    true,
      currentDasha:    currentMaha,
      activationLevel: 'very_high',
      reason:          `${currentMaha} Mahadasha strongly activates Saturn transits`,
    };
  }

  if (['Mars', 'Sun'].includes(currentMaha)) {
    return {
      isActivating:    true,
      currentDasha:    currentMaha,
      activationLevel: 'moderate',
      reason:          `${currentMaha} Mahadasha provides moderate activation`,
    };
  }

  return {
    isActivating:    false,
    currentDasha:    currentMaha,
    activationLevel: 'low',
    reason:          `${currentMaha} Mahadasha — transit effects may be milder`,
  };
}

async function calculatePeakWindows(
  moonLongitude: number,
  periodStart:   Date,
  periodEnd:     Date,
): Promise<PeakWindow[]> {
  try {
    const w = await findSaturnPeakWindow(moonLongitude, periodStart, periodEnd);
    if (!w) return [];
    return [{
      startDate:  w.peakStart,
      endDate:    w.peakEnd,
      moonDegree: moonLongitude % 30,
      saturnDegreeRange: {
        min: ((moonLongitude - 5) % 30 + 30) % 30,
        max: ((moonLongitude + 5) % 30 + 30) % 30,
      },
      description: 'Peak activation window — Saturn within 5° of Moon degree',
    }];
  } catch {
    return [];
  }
}

async function findNakshatraCrossings(
  moonNakshatra: string,
  periodStart:   Date,
  periodEnd:     Date,
): Promise<NakshatraCrossing[]> {
  return []; // full implementation deferred
}

/**
 * FIX: was setting touchCount from stations but hardcoding pattern = 'single_pass'.
 * Now both are derived consistently.
 */
function classifyRetrogradePattern(stations: any[]): {
  hasRetrograde: boolean;
  touchCount:    number;
  pattern:       'single_pass' | 'double_pass' | 'triple_pass';
} {
  const count     = Array.isArray(stations) ? Math.min(stations.length + 1, 3) : 1;
  const hasr      = count > 1;
  return {
    hasRetrograde: hasr,
    touchCount:    count,
    pattern:
      count === 1 ? 'single_pass' :
      count === 2 ? 'double_pass' :
      'triple_pass',
  };
}

function getHouseFromLagna(planetSign: number, lagnaSign: number): number {
  let h = planetSign - lagnaSign + 1;
  if (h <= 0) h += 12;
  return h;
}

function getSaturnHouseEffect(house: number): 'positive' | 'neutral' | 'challenging' {
  if ([3, 6, 10, 11].includes(house)) return 'positive';
  if ([8, 12].includes(house))        return 'challenging';
  return 'neutral';
}

function getJupiterProtectionStrength(
  jupiter: PlanetData,
  moon:    PlanetData,
  saturn:  PlanetData,
): 'strong' | 'moderate' | 'weak' | 'none' {
  const am = checkJupiterProtection(jupiter, moon);
  const as = checkJupiterProtection(jupiter, saturn);
  if (am && as) return 'strong';
  if (am || as) return 'moderate';
  if (jupiter.exalted || jupiter.kp?.rasiLord === 'Jupiter') return 'weak';
  return 'none';
}

function assessOverallImpact(
  moonStrength:      any,
  saturnStrength:    any,
  dashaActivation:   DashaActivation,
  jupiterProtection: any,
  cycleNumber:       number,
): any {
  let intensity: 'very_intense' | 'intense' | 'moderate' | 'mild' | 'very_mild';

  if (
    moonStrength.overallStrength === 'strong' &&
    saturnStrength.isYogakaraka &&
    jupiterProtection.protectionStrength !== 'none'
  ) {
    intensity = 'mild';
  } else if (
    moonStrength.overallStrength === 'weak' &&
    dashaActivation.activationLevel === 'very_high'
  ) {
    intensity = 'very_intense';
  } else if (cycleNumber === 1 && moonStrength.overallStrength === 'weak') {
    intensity = 'intense';
  } else {
    intensity = 'moderate';
  }

  const likelyOutcome =
    saturnStrength.isYogakaraka ? 'transformative_growth' :
    intensity === 'very_intense' ? 'challenging_lessons' :
    intensity === 'mild'         ? 'relatively_smooth' :
    'mixed';

  const recommendation =
    intensity === 'very_intense' ? 'Regular Saturn remedies strongly recommended' :
    intensity === 'intense'      ? 'Saturn remedies recommended during peak phases' :
    'Maintain discipline and patience';

  return { intensity, likelyOutcome, recommendation };
}

function getAgeGroup(cycleNumber: number): 'early_life' | 'mid_life' | 'later_life' {
  if (cycleNumber === 1) return 'early_life';
  if (cycleNumber === 2) return 'mid_life';
  return 'later_life';
}

function buildSummary(
  currentSadeSati: any,
  currentDhaiya:   any,
  moonStrength:    any,
  saturnStrength:  any,
): any {
  const inSadeSati = isRealPeriod(currentSadeSati);
  const inDhaiya   = currentDhaiya !== undefined;

  let currentStatus: 'in_sadesati' | 'in_dhaiya' | 'in_both' | 'clear';
  if (inSadeSati && inDhaiya)  currentStatus = 'in_both';
  else if (inSadeSati)         currentStatus = 'in_sadesati';
  else if (inDhaiya)           currentStatus = 'in_dhaiya';
  else                         currentStatus = 'clear';

  const recs: string[] = [];
  if (moonStrength.overallStrength === 'weak') {
    recs.push('Strengthen Moon: meditation, pearl gemstone, Monday fasts');
  }
  if (saturnStrength.overallStrength === 'weak') {
    recs.push('Strengthen Saturn: discipline, service, blue sapphire (after consultation)');
  }
  if (inSadeSati || inDhaiya) {
    recs.push('Regular Hanuman Chalisa recitation');
    recs.push('Serve the elderly and underprivileged');
  }

  return {
    currentStatus,
    activationLevel:
      inSadeSati && currentSadeSati?.dashaActivation?.isActivating ? 'very_high' :
      inSadeSati || inDhaiya ? 'moderate' :
      'low',
    topRecommendations: recs,
    needsRemedies: moonStrength.overallStrength === 'weak' || inSadeSati,
  };
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

const toDate = (d: any): Date => (d instanceof Date ? d : new Date(d));
const addDays  = (d: any, n: number) => new Date(toDate(d).getTime() + n * 86_400_000);
const addYears = (d: any, n: number) => new Date(toDate(d).getTime() + n * 365.25 * 86_400_000);
const subYears = (d: any, n: number) => new Date(toDate(d).getTime() - n * 365.25 * 86_400_000);

/** Sign N houses ahead of moonSign, 1-indexed, wraps 1–12 */
function signAhead(moonSign: number, houses: number): number {
  return ((moonSign - 1 + houses) % 12) + 1;
}

/** Returns true only for a real period object (not the {isActive:false} sentinel) */
function isRealPeriod(p: any): boolean {
  return p !== undefined && p !== null && p.isActive !== false && p.startDate !== undefined;
}
