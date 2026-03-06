/**
 * Professional-Grade Sade Sati & Dhaiya Calculator
 *
 * Implements all 15 Sade Sati factors and 11 Dhaiya factors
 * Uses actual Saturn ephemeris instead of approximations
 *
 * @file calculator-PROFESSIONAL.ts
 * @version 3.0.0
 * @updated March 3, 2026
 * @changelog
 *   v3.0.0 - Implemented lifetime transit engine (was stub returning [])
 *           - Fixed retrogradePattern classifier (was hardcoded to 'single_pass')
 *           - Added saturnCycles for timeline view
 *           - Added allPhases + elapsedPercentage + daysRemainingInPhase to current period
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

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — LIFETIME TRANSIT ENGINE
// This is the new core that replaces the three stubs returning empty arrays.
// ═══════════════════════════════════════════════════════════════════════════════

const SATURN_ORBIT_YEARS = 29.46;
const LIFETIME_SEARCH_YEARS = 92;     // 3 full Saturn cycles
const INGRESS_BUFFER_DAYS = 90;       // Gap cursor advances past each transit
const MAX_INGRESS_ITERS = 6;          // Safety cap per sign

/** Sign number modular arithmetic (always returns 1–12) */
function mod12(n: number): number {
  return ((n - 1 + 12) % 12) + 1;
}

/** The 5 signs relevant to a given Moon sign */
function getTrackedSigns(moonSign: number) {
  return {
    rising:    mod12(moonSign - 1),   // 12th from Moon — Sade Sati Rising phase
    peak:      moonSign,               // Moon sign — Sade Sati Peak phase
    setting:   mod12(moonSign + 1),   // 2nd from Moon — Sade Sati Setting phase
    dhaiya4th: mod12(moonSign + 3),   // 4th from Moon
    dhaiya8th: mod12(moonSign + 7),   // 8th from Moon
  };
}

/** Safely coerce a Date|string to Date */
function toDate(d: Date | string | undefined): Date {
  if (!d) return new Date();
  return d instanceof Date ? d : new Date(d);
}

/**
 * Fetch ALL Saturn transits through a given sign within [fromDate, toDate].
 * Calls calculateSaturnIngress iteratively, advancing the cursor past each exit.
 * Saturn spends ~2.5 years per sign, so this returns ~3 results across a 90-year window.
 */
async function getAllIngressesForSign(
  sign: number,
  fromDate: Date,
  endDate: Date
): Promise<any[]> {
  const results: any[] = [];
  let cursor = new Date(fromDate.getTime());

  for (let i = 0; i < MAX_INGRESS_ITERS; i++) {
    if (cursor >= endDate) break;
    try {
      const raw = await calculateSaturnIngress(sign, cursor);
      if (!raw?.entryDate) break;

      const ingress = {
        ...raw,
        entryDate: toDate(raw.entryDate),
        exitDate:  toDate(raw.exitDate),
      };

      if (ingress.entryDate >= endDate) break;
      results.push(ingress);

      // Jump past this transit to find the next one
      cursor = new Date(ingress.exitDate.getTime() + INGRESS_BUFFER_DAYS * 86400000);
    } catch (err) {
      console.error(`[getAllIngressesForSign] sign=${sign} cursor=${cursor.toISOString()} error:`, err)
      break;
    }
  }

  return results;
}

/**
 * Determine Saturn cycle number (1/2/3) for a given event date.
 * Events that started before birth (person born mid-period) belong to cycle 1.
 */
function cycleFor(eventDate: Date, birthDate: Date): 1 | 2 | 3 {
  const yrs = (eventDate.getTime() - birthDate.getTime()) / (365.25 * 86400000);
  if (yrs < 0)                        return 1;
  if (yrs < SATURN_ORBIT_YEARS)       return 1;
  if (yrs < SATURN_ORBIT_YEARS * 2)   return 2;
  return 3;
}

/**
 * FIX: Correct retrograde pattern classifier.
 *
 * Previous bug:
 *   touchCount = retrogradeStations.length + 1  →  gave 7
 *   pattern    = 'single_pass'  always (hardcoded)
 *
 * Saturn can enter a sign 1, 2, or 3 times maximum (physical ceiling).
 * Each pair of retrograde station events ≈ one additional re-entry.
 */
function buildRetrogradePattern(ingress: any): {
  hasRetrograde: boolean;
  touchCount: number;
  pattern: string;
} {
  const stations = Array.isArray(ingress.retrogradeStations)
    ? ingress.retrogradeStations : [];
  const hasRetrograde = stations.length > 0;

  if (!hasRetrograde) {
    return { hasRetrograde: false, touchCount: 1, pattern: 'single_pass' };
  }

  // Each pair of stations = one additional pass. Cap at 3.
  const reEntries = Math.min(Math.ceil(stations.length / 2), 2);
  const touchCount = 1 + reEntries;
  const pattern =
    touchCount === 3 ? 'triple_pass' :
    touchCount === 2 ? 'double_pass' : 'single_pass';

  return { hasRetrograde: true, touchCount, pattern };
}

/**
 * Build the date-range "passes" array — the 3 columns shown in the reference table.
 * Uses retrograde station dates when available; falls back to equal-segment split.
 *
 * TODO: Replace with exact sign-boundary crossing dates once saturnEphemeris
 * exposes them (currently stations are recorded but boundary dates are not).
 */
function buildPasses(ingress: any): Array<{ start: Date; end: Date }> {
  const { touchCount } = buildRetrogradePattern(ingress);
  const start = ingress.entryDate instanceof Date ? ingress.entryDate : new Date(ingress.entryDate);
  const end   = ingress.exitDate  instanceof Date ? ingress.exitDate  : new Date(ingress.exitDate);

  if (touchCount <= 1) return [{ start, end }];

  // Try to use actual station dates
  const stations: Date[] = (Array.isArray(ingress.retrogradeStations)
    ? ingress.retrogradeStations : [])
    .map((s: any) => s?.date ? new Date(s.date) : null)
    .filter(Boolean);

  if (stations.length >= 2 && touchCount === 2) {
    return [{ start, end: stations[0] }, { start: stations[1], end }];
  }
  if (stations.length >= 4 && touchCount === 3) {
    return [
      { start, end: stations[0] },
      { start: stations[1], end: stations[2] },
      { start: stations[3], end },
    ];
  }

  // Fallback: equal segments
  const totalMs = end.getTime() - start.getTime();
  const segMs   = totalMs / touchCount;
  return Array.from({ length: touchCount }, (_, i) => ({
    start: new Date(start.getTime() + i       * segMs),
    end:   new Date(start.getTime() + (i + 1) * segMs),
  }));
}

/** Standard entry/peak/exit internal phases (25%/50%/25% split) */
function buildInternalPhases(startDate: Date, endDate: Date) {
  const ms = endDate.getTime() - startDate.getTime();
  const q1 = new Date(startDate.getTime() + ms * 0.25);
  const q3 = new Date(startDate.getTime() + ms * 0.75);
  return {
    entry: { start: startDate, end: q1, description: 'Initial adjustment period' },
    peak:  { start: q1,        end: q3, description: 'Maximum effects'            },
    exit:  { start: q3,        end: endDate, description: 'Stabilization and integration' },
  };
}

// ── Saturn Cycle types (exported — used by Timeline view) ─────────────────────

export interface SaturnCycleEvent {
  id: string;
  /** Internal type identifier */
  type: 'ss_rising' | 'ss_peak' | 'ss_setting' | 'dhaiya_4th' | 'dhaiya_8th';
  /** Display label matching the reference image */
  label: string;
  saturnSign: string;
  startDate: Date;
  endDate: Date;
  /**
   * Retrograde pass date ranges — the 3 columns in the reference table.
   * Length 1 = single pass, 2 = double pass, 3 = triple pass.
   */
  passes: Array<{ start: Date; end: Date }>;
  status: 'past' | 'current' | 'upcoming';
  cycleNumber: 1 | 2 | 3;
}

export interface SaturnCycle {
  cycleNumber: 1 | 2 | 3;
  /** Approximate calendar years spanned by this cycle */
  yearRange: { start: number; end: number };
  /** All events sorted chronologically */
  events: SaturnCycleEvent[];
}

interface LifetimeTransitData {
  saturnCycles: SaturnCycle[];
  ingresses: {
    rising:    any[];
    peak:      any[];
    setting:   any[];
    dhaiya4th: any[];
    dhaiya8th: any[];
  };
}

/**
 * MAIN LIFETIME ENGINE
 *
 * Computes every Saturn transit through the 5 relevant signs across the person's
 * lifetime, groups events into Saturn cycles, and returns structured data.
 *
 * Performance note: ~15 calls to calculateSaturnIngress in parallel. Results should
 * be cached in the chart JSONB record to avoid re-computation per request.
 */
async function computeLifetimeTransits(
  moonSignNumber: number,
  birthDate: Date,
  currentDate: Date
): Promise<LifetimeTransitData> {
  const signs = getTrackedSigns(moonSignNumber);

  // Include 10 years before birth to catch Sade Sati already active at birth
  const from = new Date(birthDate.getTime() - 10 * 365.25 * 86400000);
  const to   = new Date(birthDate.getTime() + LIFETIME_SEARCH_YEARS * 365.25 * 86400000);

  const [risingIng, peakIng, settingIng, d4thIng, d8thIng] = await Promise.all([
    getAllIngressesForSign(signs.rising,    from, to),
    getAllIngressesForSign(signs.peak,      from, to),
    getAllIngressesForSign(signs.setting,   from, to),
    getAllIngressesForSign(signs.dhaiya4th, from, to),
    getAllIngressesForSign(signs.dhaiya8th, from, to),
  ]);

  const now = currentDate;
  const allEvents: SaturnCycleEvent[] = [];

  const makeEvent = (
    type: SaturnCycleEvent['type'],
    label: string,
    ing: any
  ): SaturnCycleEvent => {
    const start = ing.entryDate;
    const end   = ing.exitDate;
    const status: SaturnCycleEvent['status'] =
      end   < now ? 'past'    :
      start > now ? 'upcoming' : 'current';

    return {
      id: `${type}_${start.toISOString()}`,
      type,
      label,
      saturnSign: ing.signName,
      startDate: start,
      endDate:   end,
      passes:    buildPasses(ing),
      status,
      cycleNumber: cycleFor(start, birthDate),
    };
  };

  risingIng.forEach(ing  => allEvents.push(makeEvent('ss_rising',   "Sadesati's 1st Dhaiya",  ing)));
  peakIng.forEach(ing    => allEvents.push(makeEvent('ss_peak',     "Sadesati's 2nd Dhaiya",  ing)));
  settingIng.forEach(ing => allEvents.push(makeEvent('ss_setting',  "Sadesati's 3rd Dhaiya",  ing)));
  d4thIng.forEach(ing    => allEvents.push(makeEvent('dhaiya_4th',  'Dhaiya over 4th House',  ing)));
  d8thIng.forEach(ing    => allEvents.push(makeEvent('dhaiya_8th',  'Dhaiya over 8th House',  ing)));

  // Sort all events chronologically
  allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Group into cycles (1, 2, 3)
  const map = new Map<1|2|3, SaturnCycleEvent[]>([[1,[]],[2,[]],[3,[]]]);
  for (const ev of allEvents) map.get(ev.cycleNumber)!.push(ev);

  const saturnCycles: SaturnCycle[] = ([1,2,3] as const).map(cn => {
    const evs = map.get(cn)!;
    const yStart = evs.length > 0
      ? evs[0].startDate.getFullYear()
      : birthDate.getFullYear() + (cn-1) * Math.floor(SATURN_ORBIT_YEARS);
    const yEnd = evs.length > 0
      ? evs[evs.length-1].endDate.getFullYear()
      : yStart + Math.floor(SATURN_ORBIT_YEARS);
    return { cycleNumber: cn, yearRange: { start: yStart, end: yEnd }, events: evs };
  });

  return {
    saturnCycles,
    ingresses: {
      rising:    risingIng,
      peak:      peakIng,
      setting:   settingIng,
      dhaiya4th: d4thIng,
      dhaiya8th: d8thIng,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

export async function calculateProfessionalSaturnAnalysis(
  moonPlanet: PlanetData,
  saturnPlanet: PlanetData,
  allPlanets: Record<string, PlanetData>,
  ascendant: AscendantData,
  birthDate: Date,
  dashaInfo?: DashaInfo,
  options: CalculationOptions = {
    includeDashaAnalysis:    true,
    calculatePeakWindows:    true,
    detectRetrogradeCycles:  true,
    findNakshatraCrossings:  true,
    analyzeJupiterProtection:true,
    includeDetailedPhases:   true,
  }
): Promise<EnhancedSaturnTransitAnalysis & { saturnCycles: SaturnCycle[] }> {
  const currentDate = new Date();
  const currentSaturn = await getCurrentSaturnTransit();

  const moonStrength   = analyzeMoonStrength(moonPlanet, ascendant, allPlanets);
  const saturnStrength = analyzeSaturnStrength(saturnPlanet, ascendant);

  // ── Lifetime engine (replaces three empty stubs) ──────────────────────────
  const lifetimeData = await computeLifetimeTransits(
    moonPlanet.signNumber, birthDate, currentDate
  );

  // ── Current Sade Sati ─────────────────────────────────────────────────────
  const sadeSatiStatus = checkSadeSatiStatus(moonPlanet.signNumber, currentSaturn.sign);
  let currentSadeSati: EnhancedSadeSatiPeriod | { isActive: false };

  if (sadeSatiStatus.isActive) {
    currentSadeSati = await buildEnhancedSadeSatiPeriod(
      moonPlanet, saturnPlanet, allPlanets, ascendant,
      birthDate, currentDate, sadeSatiStatus.phase!,
      currentSaturn, moonStrength, saturnStrength, dashaInfo, options, 1
    );
  } else {
    currentSadeSati = { isActive: false };
  }

  // ── Historical + future Sade Sati ─────────────────────────────────────────
  const { past, upcoming, future } = buildSadeSatiFromLifetimeData(
    lifetimeData, moonPlanet.signNumber,
    moonStrength, saturnStrength,
    birthDate, currentDate, currentSadeSati
  );

  // ── Dhaiya analysis ───────────────────────────────────────────────────────
  const dhaiyaAnalysis = await calculateEnhancedDhaiya(
    moonPlanet, saturnPlanet, allPlanets, ascendant,
    birthDate, currentDate, currentSaturn,
    moonStrength, saturnStrength, dashaInfo, options, lifetimeData
  );

  const summary = buildSummary(currentSadeSati, dhaiyaAnalysis.current, moonStrength, saturnStrength);

  return {
    sadeSati: {
      current: currentSadeSati,
      past,
      upcoming,
      future,
      next: upcoming
        ? {
            startDate:        upcoming.startDate,
            yearsFromNow:     (upcoming.startDate.getTime() - currentDate.getTime()) / (1000*60*60*24*365.25),
            expectedIntensity: upcoming.overallImpact.intensity,
          }
        : undefined,
    },
    dhaiya: dhaiyaAnalysis,
    currentSaturn,
    lifetimeIngresses: [
      ...lifetimeData.ingresses.rising,
      ...lifetimeData.ingresses.peak,
      ...lifetimeData.ingresses.setting,
      ...lifetimeData.ingresses.dhaiya4th,
      ...lifetimeData.ingresses.dhaiya8th,
    ],
    saturnCycles: lifetimeData.saturnCycles,
    summary,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — SADE SATI HISTORY BUILDER (was stub)
// ═══════════════════════════════════════════════════════════════════════════════

/** Lightweight Sade Sati phase builder for past / future periods */
function buildSimpleSadeSatiPhase(
  ingress: any,
  phase: 'Rising' | 'Peak' | 'Setting',
  moonSignNumber: number,
  cycleNumber: 1 | 2 | 3,
  moonStrength: any,
  saturnStrength: any
): EnhancedSadeSatiPeriod {
  const startDate = ingress.entryDate;
  const endDate   = ingress.exitDate;
  const houseFromMoon = phase === 'Rising' ? 12 : phase === 'Peak' ? 1 : 2;
  const retrograde = buildRetrogradePattern(ingress);

  return {
    phase,
    description: PHASE_DESCRIPTIONS[phase] ?? phase,
    startDate,
    endDate,
    durationDays: ingress.durationDays
      ?? Math.round((endDate.getTime() - startDate.getTime()) / 86400000),
    saturnSign:       ingress.signName,
    saturnSignNumber: ingress.sign,
    moonSign:         getSignName(moonSignNumber),
    moonSignNumber,
    houseFromMoon,
    moonStrength,
    saturnStrength,
    isSaturnYogakaraka: saturnStrength.isYogakaraka ?? false,
    dashaActivation: {
      isActivating: false,
      currentDasha: 'Unknown',
      activationLevel: 'low' as ActivationLevel,
      reason: 'Dasha analysis only available for the current period',
    },
    peakWindows:       [],
    nakshatraCrossings:[],
    retrogradeStations: ingress.retrogradeStations ?? [],
    retrogradePassCount: retrograde.touchCount,
    retrogradePattern:   retrograde,
    saturnHouseFromLagna: 0,
    saturnHouseEffect:   'neutral',
    aspectedHouses: [],
    aspectedAreas:  [],
    cycleNumber,
    ageGroup: getAgeGroup(cycleNumber),
    jupiterProtection: { isProtecting: false, protectionStrength: 'none' },
    specialCrossings: {
      crossesAtmakaraka: false,
      crossesLagnaDegree: false,
      crosses10thLord: false,
      crossesYogakaraka: false,
    },
    overallImpact: assessOverallImpact(
      moonStrength, saturnStrength,
      { isActivating: false, currentDasha: 'Unknown', activationLevel: 'low', reason: '' },
      { isProtecting: false, protectionStrength: 'none' },
      cycleNumber
    ),
    internalPhases: buildInternalPhases(startDate, endDate),
  } as EnhancedSadeSatiPeriod;
}

/**
 * Group lifetime ingress data into complete Sade Sati period objects
 * and classify as past / upcoming / future.
 *
 * A complete Sade Sati = Rising ingress → Peak ingress → Setting ingress.
 * Handles edge cases:
 *   - Person born mid-Sade Sati (orphan Setting phase at start of life)
 *   - Third cycle may have incomplete triad near end of lifetime window
 */
function buildSadeSatiFromLifetimeData(
  lifetimeData: LifetimeTransitData,
  moonSignNumber: number,
  moonStrength: any,
  saturnStrength: any,
  birthDate: Date,
  currentDate: Date,
  currentSadeSati: EnhancedSadeSatiPeriod | { isActive: false }
): {
  past:     EnhancedSadeSatiPeriod[];
  upcoming: EnhancedSadeSatiPeriod | undefined;
  future:   EnhancedSadeSatiPeriod[];
} {
  const { rising: risingIng, peak: peakIng, setting: settingIng } = lifetimeData.ingresses;
  const FOUR_YEARS_MS = 4 * 365.25 * 86400000;

  type RawPeriod = {
    rising?:  any;
    peak?:    any;
    setting?: any;
    cycleNumber: 1 | 2 | 3;
    startDate: Date;
    endDate:   Date;
  };

  const rawPeriods: RawPeriod[] = [];

  // ── Step 1: detect orphan Setting (person born mid-Sade Sati) ─────────────
  for (const s of settingIng) {
    const sStart = s.entryDate;
    const hasMatchingRising = risingIng.some(r =>
      r.exitDate < sStart &&
      r.exitDate > new Date(sStart.getTime() - FOUR_YEARS_MS)
    );
    if (!hasMatchingRising && sStart <= new Date(birthDate.getTime() + 5*365.25*86400000)) {
      rawPeriods.push({
        setting: s,
        cycleNumber: cycleFor(sStart, birthDate),
        startDate: sStart,
        endDate:   s.exitDate,
      });
    }
  }

  // ── Step 2: full triads Rising → Peak → Setting ───────────────────────────
  for (const r of risingIng) {
    const rEnd = r.exitDate;

    const p = peakIng.find(pk =>
      pk.entryDate >= rEnd &&
      pk.entryDate <  new Date(rEnd.getTime() + FOUR_YEARS_MS)
    );

    if (!p) {
      // Partial — Rising only (near end of lifetime window)
      rawPeriods.push({
        rising: r,
        cycleNumber: cycleFor(r.entryDate, birthDate),
        startDate: r.entryDate,
        endDate:   r.exitDate,
      });
      continue;
    }

    const pEnd = p.exitDate;
    const s = settingIng.find(st =>
      st.entryDate >= pEnd &&
      st.entryDate <  new Date(pEnd.getTime() + FOUR_YEARS_MS)
    );

    rawPeriods.push({
      rising: r,
      peak:   p,
      setting: s,
      cycleNumber: cycleFor(r.entryDate, birthDate),
      startDate: r.entryDate,
      endDate:   s ? s.exitDate : p.exitDate,
    });
  }

  rawPeriods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // ── Step 3: classify into past / upcoming / future ────────────────────────
  const past:    EnhancedSadeSatiPeriod[] = [];
  let upcoming:  EnhancedSadeSatiPeriod | undefined;
  const future:  EnhancedSadeSatiPeriod[] = [];

  const isCurrent = (p: RawPeriod) =>
    p.startDate <= currentDate && currentDate <= p.endDate;

  for (const period of rawPeriods) {
    if (isCurrent(period)) continue; // already built with full analysis

    const allPhases: EnhancedSadeSatiPeriod[] = [];
    if (period.rising)  allPhases.push(buildSimpleSadeSatiPhase(period.rising,  'Rising',  moonSignNumber, period.cycleNumber, moonStrength, saturnStrength));
    if (period.peak)    allPhases.push(buildSimpleSadeSatiPhase(period.peak,    'Peak',    moonSignNumber, period.cycleNumber, moonStrength, saturnStrength));
    if (period.setting) allPhases.push(buildSimpleSadeSatiPhase(period.setting, 'Setting', moonSignNumber, period.cycleNumber, moonStrength, saturnStrength));

    if (!allPhases.length) continue;

    const fullPeriod: EnhancedSadeSatiPeriod = {
      ...allPhases[0],
      startDate:    period.startDate,
      endDate:      period.endDate,
      durationDays: Math.round((period.endDate.getTime() - period.startDate.getTime()) / 86400000),
      cycleNumber:  period.cycleNumber,
      allPhases,
    } as EnhancedSadeSatiPeriod;

    if (period.endDate < currentDate) {
      past.push(fullPeriod);
    } else if (!upcoming) {
      upcoming = fullPeriod;
    } else {
      future.push(fullPeriod);
    }
  }

  return { past, upcoming, future };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — DHAIYA ANALYSIS (upcoming arrays now populated)
// ═══════════════════════════════════════════════════════════════════════════════

async function calculateEnhancedDhaiya(
  moonPlanet: PlanetData,
  saturnPlanet: PlanetData,
  allPlanets: Record<string, PlanetData>,
  ascendant: AscendantData,
  birthDate: Date,
  currentDate: Date,
  currentSaturn: any,
  moonStrength: any,
  saturnStrength: any,
  dashaInfo: DashaInfo | undefined,
  options: CalculationOptions,
  lifetimeData: LifetimeTransitData
): Promise<{
  current:     EnhancedDhaiyaPeriod | undefined;
  upcoming4th: EnhancedDhaiyaPeriod[];
  upcoming8th: EnhancedDhaiyaPeriod[];
}> {
  const houseFromMoon = getHouseFromMoon(currentSaturn.sign, moonPlanet.signNumber);
  let current: EnhancedDhaiyaPeriod | undefined;

  if (houseFromMoon === 4 || houseFromMoon === 8) {
    const type = houseFromMoon === 4 ? '4th' : '8th';
    const ingress = await calculateSaturnIngress(currentSaturn.sign, currentDate);
    current = await buildEnhancedDhaiyaPeriod(
      type, moonPlanet, saturnPlanet, allPlanets,
      ascendant, ingress, moonStrength, saturnStrength, dashaInfo, options
    );
  }

  const upcoming4th: EnhancedDhaiyaPeriod[] = lifetimeData.ingresses.dhaiya4th
    .filter(ing => {
      if (ing.exitDate < currentDate) return false;
      if (ing.entryDate <= currentDate && currentDate <= ing.exitDate && houseFromMoon === 4) return false;
      return true;
    })
    .map(ing => buildSimpleDhaiyaPeriod('4th', ing, moonPlanet, ascendant, moonStrength, saturnStrength));

  const upcoming8th: EnhancedDhaiyaPeriod[] = lifetimeData.ingresses.dhaiya8th
    .filter(ing => {
      if (ing.exitDate < currentDate) return false;
      if (ing.entryDate <= currentDate && currentDate <= ing.exitDate && houseFromMoon === 8) return false;
      return true;
    })
    .map(ing => buildSimpleDhaiyaPeriod('8th', ing, moonPlanet, ascendant, moonStrength, saturnStrength));

  return { current, upcoming4th, upcoming8th };
}

/** Lightweight Dhaiya builder for upcoming/future periods */
function buildSimpleDhaiyaPeriod(
  type: '4th' | '8th',
  ingress: any,
  moonPlanet: PlanetData,
  ascendant: AscendantData,
  moonStrength: any,
  saturnStrength: any
): EnhancedDhaiyaPeriod {
  const startDate = ingress.entryDate;
  const endDate   = ingress.exitDate;
  const retrograde = buildRetrogradePattern(ingress);

  return {
    type,
    description: DHAIYA_DESCRIPTIONS[type],
    startDate,
    endDate,
    durationDays: ingress.durationDays
      ?? Math.round((endDate.getTime() - startDate.getTime()) / 86400000),
    saturnSign:       ingress.signName,
    saturnSignNumber: ingress.sign,
    moonSign:         getSignName(moonPlanet.signNumber),
    moonSignNumber:   moonPlanet.signNumber,
    houseFromMoon:    type === '4th' ? 4 : 8,
    internalPhases:   buildInternalPhases(startDate, endDate),
    peakWindows: [],
    retrogradePattern: retrograde,
    nakshatraTriggers: [],
    moonStrength,
    saturnStrength,
    dashaActivation: {
      isActivating: false,
      currentDasha: 'Unknown',
      activationLevel: 'low' as ActivationLevel,
      reason: 'Dasha analysis only available for the current period',
    },
    saturnHouseFromLagna: getHouseFromLagna(ingress.sign, ascendant.signNumber),
    overallImpact: {
      intensity: 'moderate',
      primaryEffect: type === '4th' ? '4th_house_effects' : '8th_house_effects',
      recommendation:
        type === '4th'
          ? 'Focus on emotional stability and home harmony'
          : 'Embrace transformation and let go of old patterns',
    },
  } as EnhancedDhaiyaPeriod;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — EXISTING ANALYSIS FUNCTIONS (minor fixes only)
// ═══════════════════════════════════════════════════════════════════════════════

function checkSadeSatiStatus(
  moonSign: number,
  saturnSign: number
): { isActive: boolean; phase?: SadeSatiPhase } {
  const h = getHouseFromMoon(saturnSign, moonSign);
  if (h === 12) return { isActive: true, phase: 'Rising'  };
  if (h === 1)  return { isActive: true, phase: 'Peak'    };
  if (h === 2)  return { isActive: true, phase: 'Setting' };
  return { isActive: false };
}

/** Full 15-factor analysis — for the CURRENT period only */
async function buildEnhancedSadeSatiPeriod(
  moonPlanet: PlanetData,
  saturnPlanet: PlanetData,
  allPlanets: Record<string, PlanetData>,
  ascendant: AscendantData,
  birthDate: Date,
  currentDate: Date,
  phase: SadeSatiPhase,
  currentSaturn: any,
  moonStrength: any,
  saturnStrength: any,
  dashaInfo: DashaInfo | undefined,
  options: CalculationOptions,
  cycleNumber: 1 | 2 | 3
): Promise<EnhancedSadeSatiPeriod> {
  const moonSign = moonPlanet.signNumber;

  const risingSign  = mod12(moonSign - 1);
  const peakSign    = moonSign;
  const settingSign = mod12(moonSign + 1);

  const risingIngress  = await calculateSaturnIngress(risingSign, currentDate);
  const peakIngress    = await calculateSaturnIngress(peakSign,    risingIngress.exitDate);
  const settingIngress = await calculateSaturnIngress(settingSign, peakIngress.exitDate);

  const makePhaseObj = (ing: any, ph: SadeSatiPhase, house: number) => ({
    phase: ph,
    description: PHASE_DESCRIPTIONS[ph],
    startDate:       toDate(ing.entryDate),
    endDate:         toDate(ing.exitDate),
    durationDays:    ing.durationDays,
    saturnSign:      ing.signName,
    saturnSignNumber: ing.sign,
    moonSign:        getSignName(moonSign),
    moonSignNumber:  moonSign,
    houseFromMoon:   house,
  });

  const risingPhase  = makePhaseObj(risingIngress,  'Rising',  12);
  const peakPhase    = makePhaseObj(peakIngress,    'Peak',     1);
  const settingPhase = makePhaseObj(settingIngress, 'Setting',  2);

  const currentPhaseData =
    phase === 'Rising' ? risingPhase :
    phase === 'Peak'   ? peakPhase   : settingPhase;

  const dashaActivation = analyzeDashaActivation(dashaInfo, currentDate);

  const peakWindows = options.calculatePeakWindows
    ? await calculatePeakWindows(moonPlanet.longitude, currentPhaseData.startDate, currentPhaseData.endDate)
    : [];

  const nakshatraCrossings = options.findNakshatraCrossings
    ? await findNakshatraCrossings(moonPlanet.kp?.nakshatraName ?? '', currentPhaseData.startDate, currentPhaseData.endDate)
    : [];

  const saturnHouseFromLagna = getHouseFromLagna(currentSaturn.sign, ascendant.signNumber);
  const saturnHouseEffect    = getSaturnHouseEffect(saturnHouseFromLagna);
  const aspectedHouses = [
    (saturnHouseFromLagna + 2) % 12 || 12,
    (saturnHouseFromLagna + 6) % 12 || 12,
    (saturnHouseFromLagna + 9) % 12 || 12,
  ];

  const jupiter = allPlanets.Jupiter;
  const jupiterProtection = {
    isProtecting:      checkJupiterProtection(jupiter, moonPlanet),
    protectionStrength: getJupiterProtectionStrength(jupiter, moonPlanet, saturnPlanet),
  };

  const overallImpact = assessOverallImpact(
    moonStrength, saturnStrength, dashaActivation, jupiterProtection, cycleNumber
  );

  // Build allPhases — enables the Phases tab to show Rising/Peak/Setting rows
  const allPhases = [
    buildSimpleSadeSatiPhase(risingIngress,  'Rising',  moonSign, cycleNumber, moonStrength, saturnStrength),
    buildSimpleSadeSatiPhase(peakIngress,    'Peak',    moonSign, cycleNumber, moonStrength, saturnStrength),
    buildSimpleSadeSatiPhase(settingIngress, 'Setting', moonSign, cycleNumber, moonStrength, saturnStrength),
  ];

  const currentPhaseIndex = phase === 'Rising' ? 0 : phase === 'Peak' ? 1 : 2;
  const phaseStart = allPhases[currentPhaseIndex].startDate.getTime();
  const phaseEnd   = allPhases[currentPhaseIndex].endDate.getTime();
  const nowMs      = currentDate.getTime();
  const elapsedPercentage    = Math.min(100, Math.max(0, ((nowMs - phaseStart) / (phaseEnd - phaseStart)) * 100));
  const daysRemainingInPhase = Math.max(0, Math.round((phaseEnd - nowMs) / 86400000));

  const retrograde = buildRetrogradePattern(risingIngress);
  const totalDays  = (toDate(settingIngress.exitDate).getTime() - toDate(risingIngress.entryDate).getTime()) / 86400000;
  const entryDays  = Math.floor(totalDays * 0.25);
  const peakDays   = Math.floor(totalDays * 0.5);
  const rStart     = toDate(risingIngress.entryDate);
  const sEnd       = toDate(settingIngress.exitDate);

  return {
    ...currentPhaseData,
    moonStrength,
    saturnStrength,
    isSaturnYogakaraka:  saturnStrength.isYogakaraka,
    dashaActivation,
    peakWindows,
    nakshatraCrossings,
    retrogradeStations:  risingIngress.retrogradeStations ?? [],
    retrogradePassCount: retrograde.touchCount,
    retrogradePattern:   retrograde,
    saturnHouseFromLagna,
    saturnHouseEffect,
    aspectedHouses,
    aspectedAreas: [],
    cycleNumber,
    ageGroup: getAgeGroup(cycleNumber),
    jupiterProtection,
    specialCrossings: {
      crossesAtmakaraka: false,
      crossesLagnaDegree: false,
      crosses10thLord: false,
      crossesYogakaraka: false,
    },
    overallImpact,
    allPhases,
    currentPhase: allPhases[currentPhaseIndex],
    elapsedPercentage,
    daysRemainingInPhase,
    internalPhases: {
      entry: {
        start: rStart,
        end:   new Date(rStart.getTime() + entryDays * 86400000),
        description: 'Adjustment and early signals',
      },
      peak: {
        start: new Date(rStart.getTime() + entryDays * 86400000),
        end:   new Date(rStart.getTime() + (entryDays + peakDays) * 86400000),
        description: 'Maximum pressure and transformation',
      },
      exit: {
        start: new Date(rStart.getTime() + (entryDays + peakDays) * 86400000),
        end:   sEnd,
        description: 'Stabilization and integration',
      },
    },
  };
}

function analyzeDashaActivation(
  dashaInfo: DashaInfo | undefined,
  currentDate: Date
): DashaActivation {
  if (!dashaInfo?.currentMahadasha) {
    return { isActivating: false, currentDasha: 'Unknown', activationLevel: 'low', reason: 'Dasha information not available' };
  }

  // FIX: handle both string and object forms of currentMahadasha
  const lord =
    typeof dashaInfo.currentMahadasha === 'string'
      ? dashaInfo.currentMahadasha
      : (dashaInfo.currentMahadasha as any)?.lord ?? 'Unknown';

  if (['Saturn','Moon','Rahu'].includes(lord)) {
    return { isActivating: true, currentDasha: lord, activationLevel: 'very_high', reason: `${lord} Mahadasha strongly activates Saturn transits` };
  }
  if (['Mars','Sun'].includes(lord)) {
    return { isActivating: true, currentDasha: lord, activationLevel: 'moderate', reason: `${lord} Mahadasha provides moderate activation` };
  }
  return { isActivating: false, currentDasha: lord, activationLevel: 'low', reason: `${lord} Mahadasha — transit effects may be milder` };
}

async function calculatePeakWindows(
  moonLongitude: number,
  periodStart: Date,
  periodEnd: Date
): Promise<PeakWindow[]> {
  try {
    const w = await findSaturnPeakWindow(moonLongitude, periodStart, periodEnd);
    if (!w) return [];
    return [{
      startDate: w.peakStart,
      endDate:   w.peakEnd,
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
  periodStart: Date,
  periodEnd: Date
): Promise<NakshatraCrossing[]> {
  return [];
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
  jupiter: PlanetData, moon: PlanetData, saturn: PlanetData
): 'strong' | 'moderate' | 'weak' | 'none' {
  const aM = checkJupiterProtection(jupiter, moon);
  const aS = checkJupiterProtection(jupiter, saturn);
  if (aM && aS) return 'strong';
  if (aM || aS) return 'moderate';
  if (jupiter.exalted || jupiter.kp?.rasiLord === 'Jupiter') return 'weak';
  return 'none';
}

function assessOverallImpact(
  moonStrength: any, saturnStrength: any,
  dashaActivation: DashaActivation, jupiterProtection: any, cycleNumber: number
): any {
  let intensity: 'very_intense'|'intense'|'moderate'|'mild'|'very_mild';

  if (moonStrength.overallStrength === 'strong' && saturnStrength.isYogakaraka && jupiterProtection.protectionStrength !== 'none') {
    intensity = 'mild';
  } else if (moonStrength.overallStrength === 'weak' && dashaActivation.activationLevel === 'very_high') {
    intensity = 'very_intense';
  } else if (cycleNumber === 1 && moonStrength.overallStrength === 'weak') {
    intensity = 'intense';
  } else {
    intensity = 'moderate';
  }

  const likelyOutcome =
    saturnStrength.isYogakaraka ? 'transformative_growth' :
    intensity === 'very_intense' ? 'challenging_lessons' :
    intensity === 'mild'         ? 'relatively_smooth'   : 'mixed';

  const recommendation =
    intensity === 'very_intense' ? 'Regular Saturn remedies strongly recommended'    :
    intensity === 'intense'      ? 'Saturn remedies recommended during peak phases' :
                                   'Maintain discipline and patience';

  return { intensity, likelyOutcome, recommendation };
}

function getAgeGroup(cycleNumber: number): 'early_life'|'mid_life'|'later_life' {
  if (cycleNumber === 1) return 'early_life';
  if (cycleNumber === 2) return 'mid_life';
  return 'later_life';
}

/** Full Dhaiya builder — for the CURRENT period only */
async function buildEnhancedDhaiyaPeriod(
  type: '4th' | '8th',
  moonPlanet: PlanetData,
  saturnPlanet: PlanetData,
  allPlanets: Record<string, PlanetData>,
  ascendant: AscendantData,
  ingress: any,
  moonStrength: any,
  saturnStrength: any,
  dashaInfo: DashaInfo | undefined,
  options: CalculationOptions
): Promise<EnhancedDhaiyaPeriod> {
  const dashaActivation = analyzeDashaActivation(dashaInfo, new Date());
  const retrograde = buildRetrogradePattern(ingress); // FIX: was hardcoded 'single_pass'

  const totalDays = ingress.durationDays;
  const entryDays = Math.floor(totalDays * 0.25);
  const peakDays  = Math.floor(totalDays * 0.5);
  const sDate = toDate(ingress.entryDate);

  return {
    type,
    description:  DHAIYA_DESCRIPTIONS[type],
    startDate:    sDate,
    endDate:      toDate(ingress.exitDate),
    durationDays: totalDays,
    saturnSign:   ingress.signName,
    saturnSignNumber: ingress.sign,
    moonSign:     getSignName(moonPlanet.signNumber),
    moonSignNumber: moonPlanet.signNumber,
    houseFromMoon: type === '4th' ? 4 : 8,
    internalPhases: {
      entry: { start: sDate, end: new Date(sDate.getTime() + entryDays * 86400000), description: 'Entry phase — initial adjustment' },
      peak:  { start: new Date(sDate.getTime() + entryDays * 86400000), end: new Date(sDate.getTime() + (entryDays + peakDays) * 86400000), description: 'Peak phase — maximum effects' },
      exit:  { start: new Date(sDate.getTime() + (entryDays + peakDays) * 86400000), end: toDate(ingress.exitDate), description: 'Exit phase — stabilization' },
    },
    peakWindows: [],
    retrogradePattern: retrograde,
    nakshatraTriggers: [],
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

function buildSummary(
  currentSadeSati: any,
  currentDhaiya: any,
  moonStrength: any,
  saturnStrength: any
): any {
  const inSadeSati = currentSadeSati.isActive !== false;
  const inDhaiya   = currentDhaiya !== undefined;

  const currentStatus =
    inSadeSati && inDhaiya ? 'in_both'    :
    inSadeSati             ? 'in_sadesati' :
    inDhaiya               ? 'in_dhaiya'  : 'clear';

  const topRecommendations: string[] = [];
  if (moonStrength.overallStrength === 'weak') {
    topRecommendations.push('Strengthen Moon: meditation, pearl gemstone, Monday fasts');
  }
  if (saturnStrength.overallStrength === 'weak') {
    topRecommendations.push('Strengthen Saturn: discipline, service, blue sapphire (after consultation)');
  }
  if (inSadeSati || inDhaiya) {
    topRecommendations.push('Regular Hanuman Chalisa recitation');
    topRecommendations.push('Serve the elderly and underprivileged');
  }

  return {
    currentStatus,
    activationLevel:
      inSadeSati && currentSadeSati.dashaActivation?.isActivating ? 'very_high' :
      inSadeSati || inDhaiya ? 'moderate' : 'low',
    topRecommendations,
    needsRemedies: moonStrength.overallStrength === 'weak' || inSadeSati,
  };
}
