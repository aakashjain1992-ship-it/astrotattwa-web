/**
 * Period Analyzer — 11-Factor Sade Sati Period Analysis Engine
 *
 * Accepts a SelectedPeriod (clicked timeline row) and the user's chart data,
 * returns a PeriodAnalysisResult ready for direct rendering in PeriodDetailView.
 *
 * Architecture note: this is the correct entry point for ALL period analysis.
 * "Current period analysis" is a special case where selectedPeriod = the
 * currently active period. There is no separate "current" code path.
 *
 * All 11 factors:
 *   1.  Period identity (from SelectedPeriod — no computation)
 *   2.  Saturn behavior — pass count and pattern
 *   3.  Dasha hierarchy — Maha → Antar → Pratyantar → Sookshma
 *   4.  Degree activation windows — interpolated from pass date ranges
 *   5.  Nakshatra / pada triggers — from NAK_SPAN_SEC boundaries
 *   6.  Retrograde loops — derived from passes[]
 *   7.  Jupiter transit windows — from DB (1940–2100)
 *   8.  Saturn aspects from transit sign — pure mod-12 math
 *   9.  Jupiter protection (merged into factor 7 above)
 *  10.  Age / cycle meaning — lookup by cycleNumber + computed age
 *  11.  Life areas — deterministic from type + house math
 *
 * @file periodAnalyzer.ts
 */

import type { PlanetData, AscendantData } from '@/types/astrology';
import {
  vimshottariDasha,
  calculateAntardashas,
  calculatePratyantars,
  calculateSookshmas,
} from '@/lib/astrology/kp/dasa';
import { DASHA_ORDER, NAKSHATRA_NAMES } from '@/lib/astrology/kp/constants';
import { RASHI_NAMES, PHASE_REMEDIES, DHAIYA_REMEDIES } from './constants';
import { analyzeMoonStrength, analyzeSaturnStrength } from './strengthAnalyzer';
import { getJupiterTransitsFromDB } from './saturnTransitDB';
import type {
  SelectedPeriod,
  PeriodAnalysisResult,
  DashaHierarchyWindow,
  ActivationWindow,
  NakshatraTriggerWindow,
  JupiterTransitWindow,
  SaturnAspectInfo,
  CycleMeaning,
  TimingWindow,
  GuidanceContent,
  LifeAreaItem,
  DimensionalIntensity,
  PhaseProgression,
  WindowSummary,
} from './period-analysis-types';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

/** Lords whose presence at any dasha level activates the period */
const ACTIVATING_LORDS = new Set(['Saturn', 'Moon', 'Rahu']);

/** Lords providing moderate activation */
const MODERATE_LORDS = new Set(['Mars', 'Sun']);

/** Nakshatra span in degrees: 360 / 27 = 13.333... */
const NAK_SPAN_DEG = 360 / 27;

/** Pada span in degrees: 13.333 / 4 = 3.333... */
const PADA_SPAN_DEG = NAK_SPAN_DEG / 4;

/** Orb in degrees for degree activation windows */
const ACTIVATION_ORB_DEG = 5;

/** Exact conjunction orb in degrees */
const EXACT_ORB_DEG = 1;

/** Two years in ms — beyond this, activation dates are flagged approximate */
const TWO_YEARS_MS = 2 * 365.25 * 24 * 60 * 60 * 1000;

/** ms per day */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Nakshatra lord lookup: nakshatraIndex (0–26) → dasha lord
// Repeating pattern of 9 lords across 27 nakshatras
const NAK_LORD_BY_INDEX = DASHA_ORDER; // index % 9 gives the lord

// ═══════════════════════════════════════════════════════════════════
// HELPER UTILITIES
// ═══════════════════════════════════════════════════════════════════

function mod12(n: number): number {
  return ((n - 1 + 12) % 12) + 1;
}

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function datesOverlap(
  aStart: Date, aEnd: Date,
  bStart: Date, bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function clampToWindow(date: Date, start: Date, end: Date): Date {
  if (date < start) return start;
  if (date > end) return end;
  return date;
}

/** Format a Date as "Mon YYYY" for timing window labels */
function fmtMonYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Age in integer years at a given date relative to birth date */
function ageAt(date: Date, birthDate: Date): number {
  return Math.floor((date.getTime() - birthDate.getTime()) / (365.25 * MS_PER_DAY));
}

/** Jupiter's Vedic aspects: 5th, 7th, 9th from its sign */
function jupiterAspectsSign(jupiterSign: number, targetSign: number): boolean {
  const diff = ((targetSign - jupiterSign + 12) % 12);
  // diff=4 → 5th house, diff=6 → 7th, diff=8 → 9th
  return diff === 4 || diff === 6 || diff === 8;
}

/**
 * Saturn's Vedic special aspects: 3rd, 7th, 10th from its sign.
 * Returns the three aspected sign numbers.
 */
function saturnAspectedSigns(saturnSign: number): [number, number, number] {
  return [
    mod12(saturnSign + 2),  // 3rd house aspect
    mod12(saturnSign + 6),  // 7th house aspect (opposition)
    mod12(saturnSign + 9),  // 10th house aspect
  ];
}

/** House from Lagna: always returns 1–12 */
function houseFromLagna(planetSign: number, lagnaSign: number): number {
  let h = planetSign - lagnaSign + 1;
  if (h <= 0) h += 12;
  if (h > 12) h -= 12;
  return h;
}

// ═══════════════════════════════════════════════════════════════════
// FACTOR 3: DASHA HIERARCHY
// ═══════════════════════════════════════════════════════════════════

/**
 * Compute the full 120-year Mahadasha timeline from birth.
 * This fixes the bug in the current system where dashaInfo.allMahadashas
 * is always empty (the calculate API never populates it).
 */
function computeAllMahadashas(
  moonLongitude: number,
  birthDate: Date,
  elapsedFraction: number,
  nakshatraLord: string,
): Array<{ lord: string; startUtc: string; endUtc: string }> {
  const result = vimshottariDasha(
    moonLongitude,
    birthDate,
    elapsedFraction,
    nakshatraLord as any,
    360,
  );
  return result.allMahadashas;
}

/**
 * Walk the dasha chain for the selected period window.
 * Returns one DashaHierarchyWindow per Pratyantar that overlaps the window.
 * For activated Pratyantars, also drills into Sookshma level.
 */
function getDashaHierarchyForPeriod(
  allMahadashas: Array<{ lord: string; startUtc: string; endUtc: string }>,
  periodStart: Date,
  periodEnd: Date,
): DashaHierarchyWindow[] {
  const windows: DashaHierarchyWindow[] = [];

  for (const maha of allMahadashas) {
    const mahaStart = toDate(maha.startUtc);
    const mahaEnd   = toDate(maha.endUtc);

    if (!datesOverlap(mahaStart, mahaEnd, periodStart, periodEnd)) continue;

    const antardashas = calculateAntardashas(
      maha.lord as any,
      maha.startUtc,
      maha.endUtc,
    );

    for (const antar of antardashas) {
      const antarStart = toDate(antar.startUtc);
      const antarEnd   = toDate(antar.endUtc);

      if (!datesOverlap(antarStart, antarEnd, periodStart, periodEnd)) continue;

      const pratyantars = calculatePratyantars(
        maha.lord  as any,
        antar.lord as any,
        antar.startUtc,
        antar.endUtc,
      );

      for (const prat of pratyantars) {
        const pratStart = toDate(prat.startUtc);
        const pratEnd   = toDate(prat.endUtc);

        if (!datesOverlap(pratStart, pratEnd, periodStart, periodEnd)) continue;

        // Determine activation level
        const mahaActivated = ACTIVATING_LORDS.has(maha.lord);
        const antarActivated = ACTIVATING_LORDS.has(antar.lord);
        const pratActivated  = ACTIVATING_LORDS.has(prat.lord);
        const isActivated = mahaActivated || antarActivated || pratActivated;

        let activationLevel: DashaHierarchyWindow['activationLevel'];
        const activatedCount = [mahaActivated, antarActivated, pratActivated].filter(Boolean).length;
        if (activatedCount >= 3)      activationLevel = 'very_high';
        else if (activatedCount === 2) activationLevel = 'high';
        else if (activatedCount === 1) activationLevel = 'moderate';
        else if (MODERATE_LORDS.has(maha.lord) || MODERATE_LORDS.has(antar.lord)) {
          activationLevel = 'moderate';
        } else {
          activationLevel = 'low';
        }

        // Build reason string
        const activatingOnes = [maha.lord, antar.lord, prat.lord]
          .filter(l => ACTIVATING_LORDS.has(l));
        const reason = activatingOnes.length > 0
          ? `${activatingOnes.join(', ')} ${activatingOnes.length === 1 ? 'lord' : 'lords'} activate Saturn transits`
          : `${maha.lord} Mahadasha — transit effects may be milder`;

        // Drill into Sookshma for activated Pratyantars
        let sookshma: DashaHierarchyWindow['sookshma'] | undefined;
        if (isActivated && activationLevel !== 'low') {
          const sookshmas = calculateSookshmas(
            maha.lord  as any,
            antar.lord as any,
            prat.lord  as any,
            prat.startUtc,
            prat.endUtc,
          );
          // Find the most activated Sookshma that overlaps the period
          const activatedSookshma = sookshmas.find(sk => {
            const skStart = toDate(sk.startUtc);
            const skEnd   = toDate(sk.endUtc);
            return datesOverlap(skStart, skEnd, periodStart, periodEnd)
              && ACTIVATING_LORDS.has(sk.lord);
          });
          if (activatedSookshma) {
            sookshma = {
              lord:  activatedSookshma.lord,
              start: toDate(activatedSookshma.startUtc),
              end:   toDate(activatedSookshma.endUtc),
            };
          }
        }

        windows.push({
          mahadasha:  { lord: maha.lord,  start: mahaStart,  end: mahaEnd  },
          antardasha: { lord: antar.lord, start: antarStart, end: antarEnd },
          pratyantar: { lord: prat.lord,  start: pratStart,  end: pratEnd  },
          sookshma,
          activationLevel,
          isActivated,
          reason,
        });
      }
    }
  }

  return windows;
}

// ═══════════════════════════════════════════════════════════════════
// FACTOR 4: DEGREE ACTIVATION WINDOWS
// ═══════════════════════════════════════════════════════════════════

/**
 * Compute when Saturn crosses near the natal Moon's degree within each pass.
 *
 * Approach: Saturn traverses 0°→30° within a sign over the pass duration.
 * We linearly interpolate to find when it reaches specific degrees.
 * Accuracy: ±5–10 days. Flagged as approximate when period start > 2yr away.
 *
 * Four window types per pass:
 *   buildup           — Saturn enters 5° orb before Moon's degree (1st pass)
 *   exact             — Saturn within 1° of Moon's degree
 *   retrograde_review — same as buildup/exact but for re-entry passes
 *   final_consolidation — last 5° of transit sign on final pass
 */
function getActivationWindows(
  moonLongitude: number,
  saturnTransitSign: number,
  passes: SelectedPeriod['passes'],
): ActivationWindow[] {
  const windows: ActivationWindow[] = [];
  const now = new Date();

  // Moon's degree within the transit sign (0–30)
  const moonSignNumber = Math.floor(moonLongitude / 30) + 1;
  if (moonSignNumber !== saturnTransitSign) {
    // Moon is not in this sign — activation windows still apply
    // because the period type (Rising/Peak/Setting) is defined by the
    // relationship. For non-Peak phases we still track the closest approach.
  }
  const moonDegInSign = moonLongitude % 30;

  for (let i = 0; i < passes.length; i++) {
    const pass = passes[i];
    const passDurationMs = pass.end.getTime() - pass.start.getTime();
    const isApproximate = (pass.start.getTime() - now.getTime()) > TWO_YEARS_MS;
    const isReEntry = i > 0;

    // Saturn travels 30° across the pass. Map degree to date via interpolation.
    const degToDate = (deg: number): Date => {
      const fraction = deg / 30;
      return new Date(pass.start.getTime() + fraction * passDurationMs);
    };

    // --- Build-up window ---
    const buildupStartDeg = Math.max(0, moonDegInSign - ACTIVATION_ORB_DEG);
    const buildupEndDeg   = Math.max(0, moonDegInSign - EXACT_ORB_DEG);

    if (buildupEndDeg > buildupStartDeg) {
      windows.push({
        type:        isReEntry ? 'retrograde_review' : 'buildup',
        startDate:   degToDate(buildupStartDeg),
        endDate:     degToDate(buildupEndDeg),
        description: isReEntry
          ? 'Saturn re-approaches natal Moon\'s degree — themes resurface for review'
          : 'Saturn enters orb of natal Moon\'s degree — initial pressure builds',
        passIndex:   i,
        isApproximate,
      });
    }

    // --- Exact window ---
    const exactStartDeg = Math.max(0, moonDegInSign - EXACT_ORB_DEG);
    const exactEndDeg   = Math.min(30, moonDegInSign + EXACT_ORB_DEG);

    if (exactEndDeg > exactStartDeg && exactStartDeg < 30) {
      windows.push({
        type:        isReEntry ? 'retrograde_review' : 'exact',
        startDate:   degToDate(exactStartDeg),
        endDate:     degToDate(Math.min(30, exactEndDeg)),
        description: isReEntry
          ? 'Saturn re-crosses natal Moon\'s exact degree — retrograde revisit of core themes'
          : 'Saturn exactly conjunct natal Moon\'s degree — peak psychological intensity',
        passIndex:   i,
        isApproximate,
      });
    }

    // --- Final consolidation (last pass only) ---
    if (i === passes.length - 1) {
      const consolidationStartDeg = Math.max(0, 30 - ACTIVATION_ORB_DEG);
      windows.push({
        type:        'final_consolidation',
        startDate:   degToDate(consolidationStartDeg),
        endDate:     pass.end,
        description: 'Saturn exits the sign — integration and closure of this phase',
        passIndex:   i,
        isApproximate,
      });
    }
  }

  return windows;
}

// ═══════════════════════════════════════════════════════════════════
// FACTOR 5: NAKSHATRA / PADA TRIGGERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Find nakshatra crossings within the transit sign that are significant
 * relative to the natal Moon's nakshatra and pada.
 *
 * A transit sign spans exactly 2.25 nakshatras (30 / 13.333°).
 * We check which nakshatra indices fall within the sign,
 * then flag Moon nakshatra / pada matches.
 */
function getNakshatraTriggersForPeriod(
  moonNakshatraIndex: number,
  moonNakshatraPada: number,
  moonNakshatraLord: string,
  saturnTransitSign: number,
  passes: SelectedPeriod['passes'],
): NakshatraTriggerWindow[] {
  const triggers: NakshatraTriggerWindow[] = [];

  // Degree range of the transit sign (0-based)
  const signStartDeg = (saturnTransitSign - 1) * 30;
  const signEndDeg   = signStartDeg + 30;

  // Which nakshatra indices overlap this sign?
  const firstNakIdx = Math.floor(signStartDeg / NAK_SPAN_DEG);
  const lastNakIdx  = Math.floor((signEndDeg - 0.001) / NAK_SPAN_DEG);

  for (let nakIdx = firstNakIdx; nakIdx <= lastNakIdx; nakIdx++) {
    const nakStartDeg = nakIdx * NAK_SPAN_DEG;
    const nakEndDeg   = nakStartDeg + NAK_SPAN_DEG;

    // Intersection of nakshatra span with the sign
    const intersectStart = Math.max(nakStartDeg, signStartDeg);
    const intersectEnd   = Math.min(nakEndDeg, signEndDeg);
    if (intersectEnd <= intersectStart) continue;

    // Fractional position within the sign
    const startFrac = (intersectStart - signStartDeg) / 30;
    const endFrac   = (intersectEnd   - signStartDeg) / 30;

    const nakName   = NAKSHATRA_NAMES[nakIdx % 27];
    const nakLord   = NAK_LORD_BY_INDEX[nakIdx % 9];
    const isMoonNak = nakIdx === moonNakshatraIndex;

    // Determine significance
    let significance: NakshatraTriggerWindow['significance'];
    if (isMoonNak) {
      significance = 'high'; // will be upgraded to 'critical' if pada matches
    } else if (nakLord === moonNakshatraLord) {
      significance = 'medium';
    } else {
      continue; // not significant — skip
    }

    // For each pass, interpolate entry/exit dates for this nakshatra
    for (let pi = 0; pi < passes.length; pi++) {
      const pass = passes[pi];
      const passDurationMs = pass.end.getTime() - pass.start.getTime();
      const entryDate = new Date(pass.start.getTime() + startFrac * passDurationMs);
      const exitDate  = new Date(pass.start.getTime() + endFrac  * passDurationMs);

      // Check pada match (only meaningful when same nakshatra)
      let isMoonPada = false;
      if (isMoonNak) {
        // Which pada does this intersection start in?
        const relativeStart = intersectStart - nakStartDeg;
        const padaIdx = Math.floor(relativeStart / PADA_SPAN_DEG) + 1;
        isMoonPada = padaIdx === moonNakshatraPada;
        if (isMoonPada) significance = 'critical';
      }

      triggers.push({
        nakshatra:      nakName,
        pada:           moonNakshatraPada,
        entryDate,
        exitDate,
        isMoonNakshatra: isMoonNak,
        isMoonPada,
        nakshatraLord:  nakLord,
        significance,
      });
    }
  }

  return triggers;
}

// ═══════════════════════════════════════════════════════════════════
// FACTORS 7 + 9: JUPITER TRANSIT WINDOWS
// ═══════════════════════════════════════════════════════════════════

/**
 * Fetch Jupiter sign windows overlapping the period and evaluate protection.
 * Jupiter's Vedic aspects: 5th, 7th, 9th house from its sign.
 */
async function getJupiterWindowsForPeriod(
  periodStart: Date,
  periodEnd: Date,
  moonSignNumber: number,
  saturnTransitSign: number,
  natalSaturnSign: number,
): Promise<JupiterTransitWindow[]> {
  const rows = await getJupiterTransitsFromDB(periodStart, periodEnd);
  const windows: JupiterTransitWindow[] = [];

  for (const row of rows) {
    const aspectsMoon          = jupiterAspectsSign(row.sign, moonSignNumber);
    const aspectsSaturnTransit = jupiterAspectsSign(row.sign, saturnTransitSign);
    const aspectsNatalSaturn   = jupiterAspectsSign(row.sign, natalSaturnSign);

    let protectionStrength: JupiterTransitWindow['protectionStrength'];
    if (aspectsMoon && aspectsSaturnTransit) {
      protectionStrength = 'strong';
    } else if (aspectsMoon || aspectsSaturnTransit || aspectsNatalSaturn) {
      protectionStrength = 'moderate';
    } else {
      protectionStrength = 'none';
    }

    // Build description
    let description: string;
    if (protectionStrength === 'strong') {
      description = `Jupiter aspects both your Moon and Saturn's transit sign — strongest protection window in this period`;
    } else if (protectionStrength === 'moderate') {
      const target = aspectsMoon ? 'your natal Moon' : aspectsNatalSaturn ? 'your natal Saturn' : 'Saturn\'s transit';
      description = `Jupiter aspects ${target} — some relief and support available`;
    } else {
      description = 'Jupiter does not aspect Moon or Saturn — this window has less planetary protection';
    }

    // Clamp entry/exit to the period window for display purposes
    const entryDate = row.entryDate < periodStart ? periodStart : row.entryDate;
    const exitDate  = row.exitDate  > periodEnd   ? periodEnd   : row.exitDate;

    windows.push({
      jupiterSign:          row.sign,
      jupiterSignName:      row.signName,
      startDate:            entryDate,
      exitDate,
      // Store unclamped dates for use in summary sentences
      // so "Jupiter in X from [actual entry] to [actual exit]" is always meaningful
      rawEntryDate:         row.entryDate,
      rawExitDate:          row.exitDate,
      aspectsMoon,
      aspectsSaturnTransit,
      aspectsNatalSaturn,
      protectionStrength,
      description,
    });
  }

  return windows;
}

// ═══════════════════════════════════════════════════════════════════
// FACTOR 8: SATURN ASPECTS
// ═══════════════════════════════════════════════════════════════════

const HOUSE_LIFE_DOMAINS: Record<number, string[]> = {
  1:  ['Identity', 'Health', 'Physical appearance'],
  2:  ['Finances', 'Family', 'Speech'],
  3:  ['Courage', 'Siblings', 'Short journeys'],
  4:  ['Home', 'Mother', 'Property'],
  5:  ['Children', 'Creativity', 'Intelligence'],
  6:  ['Health issues', 'Enemies', 'Debt'],
  7:  ['Partnerships', 'Marriage', 'Business'],
  8:  ['Sudden changes', 'Inheritance', 'Transformation'],
  9:  ['Dharma', 'Father', 'Spiritual practice'],
  10: ['Career', 'Status', 'Authority'],
  11: ['Gains', 'Social network', 'Ambitions'],
  12: ['Expenses', 'Foreign matters', 'Spiritual liberation'],
};

function getSaturnAspects(
  saturnTransitSign: number,
  lagnaSign: number,
): SaturnAspectInfo {
  const hfl = houseFromLagna(saturnTransitSign, lagnaSign);
  const aspected = saturnAspectedSigns(saturnTransitSign);
  const aspectedHouses = aspected.map(sign => houseFromLagna(sign, lagnaSign));

  let saturnHouseEffect: SaturnAspectInfo['saturnHouseEffect'];
  if ([3, 6, 10, 11].includes(hfl))  saturnHouseEffect = 'positive';
  else if ([8, 12].includes(hfl))    saturnHouseEffect = 'challenging';
  else                               saturnHouseEffect = 'neutral';

  const lifeDomainsAffected = aspectedHouses.flatMap(h => HOUSE_LIFE_DOMAINS[h] ?? []);

  return {
    houseFromLagna:      hfl,
    saturnHouseEffect,
    aspectsHouses:       aspectedHouses,
    lifeDomainsAffected,
  };
}

// ═══════════════════════════════════════════════════════════════════
// FACTOR 10: AGE / CYCLE MEANING
// ═══════════════════════════════════════════════════════════════════

const CYCLE_MEANINGS: Record<1 | 2 | 3, {
  meaning: string;
  focusAreas: string[];
  ageGroup: CycleMeaning['ageGroup'];
}> = {
  1: {
    ageGroup:   'early_life',
    meaning:    'The first Sade Sati shapes foundational beliefs, educational direction, and the relationship with parents. Lessons tend to be about identity formation and learning how the world works.',
    focusAreas: ['Education', 'Parental relationships', 'Identity formation', 'Early career direction'],
  },
  2: {
    ageGroup:   'mid_life',
    meaning:    'The second Sade Sati arrives when career, family, and identity are most fully formed — making its lessons more structurally impactful. What gets tested here tends to be what matters most.',
    focusAreas: ['Career and professional standing', 'Family and marriage', 'Financial stability', 'Identity and purpose'],
  },
  3: {
    ageGroup:   'later_life',
    meaning:    'The third Sade Sati focuses on health, legacy, and spiritual depth. It often brings a meaningful confrontation with what has truly mattered in life.',
    focusAreas: ['Health and longevity', 'Legacy and what endures', 'Spiritual practice', 'Relationship with old age'],
  },
};

function getCycleMeaning(
  cycleNumber: 1 | 2 | 3,
  birthDate: Date,
  periodStartDate: Date,
): CycleMeaning {
  const info = CYCLE_MEANINGS[cycleNumber];
  return {
    cycleNumber,
    ageAtStart: ageAt(periodStartDate, birthDate),
    ageGroup:   info.ageGroup,
    cycleMeaning: info.meaning,
    focusAreas:   info.focusAreas,
  };
}

// ═══════════════════════════════════════════════════════════════════
// FACTOR 11: LIFE AREAS
// ═══════════════════════════════════════════════════════════════════

const TYPE_LIFE_AREA_LABELS: Record<SelectedPeriod['type'], { label: string; description: string }[]> = {
  ss_rising: [
    { label: 'Expenses & outflow',   description: 'Hidden costs, unexpected spending, and financial drain are common themes' },
    { label: 'Sleep & rest',          description: 'Sleep quality often suffers; rest and recovery become important' },
    { label: 'Isolation & withdrawal', description: 'A natural pull toward solitude, introspection, and letting go' },
    { label: 'Spirituality',          description: 'Interest in deeper meaning and spiritual practice tends to arise' },
  ],
  ss_peak: [
    { label: 'Identity & self-image', description: 'Who you are and how you present yourself is Saturn\'s primary focus' },
    { label: 'Health & vitality',     description: 'Physical health requires consistent attention and discipline' },
    { label: 'Mental resilience',     description: 'Emotional stability is tested; building inner strength is the work' },
    { label: 'Career direction',      description: 'Professional life is restructured — testing what is truly solid' },
  ],
  ss_setting: [
    { label: 'Finances & wealth',     description: 'Financial foundations are tested; discipline around money is important' },
    { label: 'Family relationships',  description: 'Close family dynamics face pressure and require conscious effort' },
    { label: 'Speech & communication', description: 'How you communicate matters; words carry more consequence than usual' },
    { label: 'Gradual recovery',      description: 'The later part of this phase brings stabilisation and slow improvement' },
  ],
  dhaiya_4th: [
    { label: 'Home & domestic life',  description: 'The home environment and sense of domestic stability are affected' },
    { label: 'Mother & care figures', description: 'Relationship with mother or parent-figure often comes into focus' },
    { label: 'Property & real estate', description: 'Property decisions carry extra weight and require careful consideration' },
    { label: 'Career direction',      description: 'Professional path and workplace environment face restructuring pressure' },
  ],
  dhaiya_8th: [
    { label: 'Sudden changes',        description: 'Unexpected shifts and disruptions — Saturn tests adaptability' },
    { label: 'Wealth & hidden assets', description: 'Financial matters requiring careful management, especially around debt' },
    { label: 'Transformation',        description: 'Deep personal change is both the challenge and the opportunity' },
    { label: 'Health attention',      description: 'Preventive health care and attention to chronic issues is advisable' },
  ],
};

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function deriveLifeAreas(
  type: SelectedPeriod['type'],
  saturnAspects: SaturnAspectInfo,
): LifeAreaItem[] {
  const items: LifeAreaItem[] = [...TYPE_LIFE_AREA_LABELS[type]];

  // Keywords already covered by the primary items — used to skip duplicates
  const coveredKeywords = items
    .map(i => i.label.toLowerCase().split(/[\s&,–]/)[0].trim());

  // Add aspect-derived areas, skipping any that duplicate an existing primary area
  let extras = 0;
  for (const house of saturnAspects.aspectsHouses) {
    if (extras >= 2) break;
    const domains = HOUSE_LIFE_DOMAINS[house];
    if (!domains) continue;

    // Skip if the primary keyword of this domain already appears in the list
    const keyword = domains[0].toLowerCase().split(/[\s&,–]/)[0].trim();
    if (coveredKeywords.some(k => k === keyword || keyword.includes(k) || k.includes(keyword))) continue;

    items.push({
      label:       domains[0],
      description: `Saturn's ${ordinal(saturnAspects.aspectsHouses.indexOf(house) === 0 ? 3 : saturnAspects.aspectsHouses.indexOf(house) === 1 ? 7 : 10)} aspect activates your ${ordinal(house)} house — ${domains.slice(1).join(' and ').toLowerCase()} may also be in play`,
    });
    coveredKeywords.push(keyword);
    extras++;
  }

  return items;
}

// ═══════════════════════════════════════════════════════════════════
// OVERALL INTENSITY SCORING
// ═══════════════════════════════════════════════════════════════════

function assessOverallIntensity(
  type: SelectedPeriod['type'],
  moonStrength: ReturnType<typeof analyzeMoonStrength>,
  saturnStrength: ReturnType<typeof analyzeSaturnStrength>,
  mostActivatedDashaWindows: DashaHierarchyWindow[],
  jupiterWindows: JupiterTransitWindow[],
  cycleNumber: 1 | 2 | 3,
): PeriodAnalysisResult['overallIntensity'] {
  let score = 0;

  // Type base score
  if (type === 'ss_peak')    score += 4;
  else if (type === 'ss_rising' || type === 'ss_setting') score += 2;
  else if (type === 'dhaiya_8th') score += 3;
  else if (type === 'dhaiya_4th') score += 1;

  // Moon strength
  if (moonStrength.overallStrength === 'weak')     score += 2;
  else if (moonStrength.overallStrength === 'strong') score -= 1;

  // Saturn Yogakaraka
  if (saturnStrength.isYogakaraka) score -= 2;
  else if (saturnStrength.overallStrength === 'weak') score += 1;

  // Dasha activation
  const veryHighDasha = mostActivatedDashaWindows.some(w => w.activationLevel === 'very_high');
  const highDasha     = mostActivatedDashaWindows.some(w => w.activationLevel === 'high');
  if (veryHighDasha) score += 3;
  else if (highDasha) score += 1;

  // Jupiter protection (best window)
  const bestJupiter = jupiterWindows.find(w => w.protectionStrength === 'strong');
  const modJupiter  = jupiterWindows.find(w => w.protectionStrength === 'moderate');
  if (bestJupiter) score -= 2;
  else if (modJupiter) score -= 1;

  // Cycle modifier
  if (cycleNumber === 3) score += 1;

  if (score >= 8)      return 'very_intense';
  if (score >= 5)      return 'intense';
  if (score >= 3)      return 'moderate';
  if (score >= 1)      return 'mild';
  return 'very_mild';
}

// ═══════════════════════════════════════════════════════════════════
// PLAIN TITLE GENERATOR
// ═══════════════════════════════════════════════════════════════════

const INTENSITY_TITLES: Record<PeriodAnalysisResult['overallIntensity'], Record<SelectedPeriod['type'], string>> = {
  very_intense: {
    ss_peak:    'The most intense phase of Sade Sati',
    ss_rising:  'A very intense period of preparation and change',
    ss_setting: 'A very intense period of restructuring and pressure',
    dhaiya_4th: 'A very intense domestic and career pressure period',
    dhaiya_8th: 'A very intense obstacles and transformation period',
  },
  intense: {
    ss_peak:    'The most direct and demanding phase of Sade Sati',
    ss_rising:  'An intense period of preparation and hidden pressures',
    ss_setting: 'An intense period of financial and family restructuring',
    dhaiya_4th: 'An intense period of domestic and career pressure',
    dhaiya_8th: 'An intense period of sudden changes and obstacles',
  },
  moderate: {
    ss_peak:    'A significant period of identity and health pressure',
    ss_rising:  'A moderate period of expenses and introspection',
    ss_setting: 'A moderate period of financial and family adjustment',
    dhaiya_4th: 'A career and domestic pressure period',
    dhaiya_8th: 'A period of unexpected changes and wealth scrutiny',
  },
  mild: {
    ss_peak:    'A manageable Sade Sati peak with important lessons',
    ss_rising:  'A mild period of introspection and preparation',
    ss_setting: 'A mild period of financial and family discipline',
    dhaiya_4th: 'A relatively mild career and domestic adjustment',
    dhaiya_8th: 'A relatively mild period of change and adaptation',
  },
  very_mild: {
    ss_peak:    'A well-protected Sade Sati peak — growth through discipline',
    ss_rising:  'A well-protected period of spiritual preparation',
    ss_setting: 'A well-protected period of stabilisation',
    dhaiya_4th: 'A well-supported domestic and career adjustment',
    dhaiya_8th: 'A well-protected transformation period',
  },
};

function generatePlainTitle(
  type: SelectedPeriod['type'],
  intensity: PeriodAnalysisResult['overallIntensity'],
): string {
  return INTENSITY_TITLES[intensity][type];
}

// ═══════════════════════════════════════════════════════════════════
// SUMMARY PARAGRAPH GENERATOR
// ═══════════════════════════════════════════════════════════════════

function generateSummary(
  type: SelectedPeriod['type'],
  cycleNumber: 1 | 2 | 3,
  intensity: PeriodAnalysisResult['overallIntensity'],
  moonStrength: ReturnType<typeof analyzeMoonStrength>,
  saturnStrength: ReturnType<typeof analyzeSaturnStrength>,
  mostActivated: DashaHierarchyWindow[],
  bestJupiter: JupiterTransitWindow | undefined,
  cycleMeaning: CycleMeaning,
): string {
  const sentences: string[] = [];

  // Sentence 1: What this period is
  const houseDesc: Record<SelectedPeriod['type'], string> = {
    ss_rising:  '12th house from your Moon — the preparatory phase of Sade Sati',
    ss_peak:    '1st house (your Moon sign) — the most direct phase of Sade Sati',
    ss_setting: '2nd house from your Moon — the closing phase of Sade Sati',
    dhaiya_4th: '4th house from your Moon — a Dhaiya period affecting home and career',
    dhaiya_8th: '8th house from your Moon — a Dhaiya period of sudden changes',
  };
  sentences.push(`This is Saturn transiting your ${houseDesc[type]}.`);

  // Sentence 2: Cycle context
  const cycleDesc: Record<1 | 2 | 3, string> = {
    1: `As your first encounter, it arrives in early life when foundations are being laid — age ${cycleMeaning.ageAtStart}.`,
    2: `As your second encounter in midlife — age ${cycleMeaning.ageAtStart} — it arrives when career, family, and identity are most fully formed.`,
    3: `As your third encounter in later life — age ${cycleMeaning.ageAtStart} — it tends to focus on health, legacy, and what truly matters.`,
  };
  sentences.push(cycleDesc[cycleNumber]);

  // Sentence 3: Saturn + Moon condition
  if (saturnStrength.isYogakaraka && moonStrength.overallStrength !== 'weak') {
    sentences.push(`Saturn is constructive for your birth chart (Yogakaraka), which means this pressure tends to build something permanent rather than cause lasting damage.`);
  } else if (saturnStrength.isYogakaraka && moonStrength.overallStrength === 'weak') {
    sentences.push(`Saturn is constructive for your chart (Yogakaraka), but Moon's weaker condition means the emotional and psychological pressure is genuinely felt.`);
  } else if (moonStrength.overallStrength === 'strong') {
    sentences.push(`Moon is well-placed in your chart, providing emotional resilience through this period.`);
  } else if (moonStrength.overallStrength === 'weak') {
    sentences.push(`Moon's condition in your chart means emotional sensitivity is higher during this period — self-care and mental health deserve extra attention.`);
  } else {
    sentences.push(`The period will be felt, though your chart's balance offers moderate resilience.`);
  }

  // Sentence 4: Dasha or Jupiter highlight
  const peakDasha = mostActivated[0];
  if (peakDasha && peakDasha.activationLevel === 'very_high') {
    sentences.push(
      `Not equally intense throughout: the sharpest window is when ${peakDasha.pratyantar.lord} Pratyantar coincides with the transit — specifically ${fmtMonYear(peakDasha.pratyantar.start)}–${fmtMonYear(peakDasha.pratyantar.end)}.`
    );
  } else if (bestJupiter && bestJupiter.protectionStrength === 'strong') {
    // Use raw (unclamped) dates so we show the full Jupiter sign tenure,
    // not just the slice that overlaps the period start/end
    const from = fmtMonYear(bestJupiter.rawEntryDate ?? bestJupiter.startDate);
    const to   = fmtMonYear(bestJupiter.rawExitDate  ?? bestJupiter.exitDate);
    // Only show the sentence if the dates are meaningfully different
    if (from !== to) {
      sentences.push(`Jupiter provides strong protection from ${from} to ${to}, creating a notably more supported window within this period.`);
    } else {
      sentences.push(`Jupiter provides strong protection during ${from}, easing some of the pressure in this window.`);
    }
  }

  return sentences.join(' ');
}

// ═══════════════════════════════════════════════════════════════════
// TIMING WINDOWS (merges factors for "When is it hardest?" section)
// ═══════════════════════════════════════════════════════════════════

function buildTimingWindows(
  periodStart: Date,
  periodEnd: Date,
  birthDate: Date,
  dashaWindows: DashaHierarchyWindow[],
  activationWindows: ActivationWindow[],
  jupiterWindows: JupiterTransitWindow[],
): TimingWindow[] {
  const windows: TimingWindow[] = [];

  // Find the hardest window: very_high dasha + exact degree activation
  const vhDasha = dashaWindows.find(w => w.activationLevel === 'very_high');
  const exactAW = activationWindows.find(w => w.type === 'exact');

  if (vhDasha) {
    const start = vhDasha.pratyantar.start;
    const end   = vhDasha.pratyantar.end;
    const age1  = ageAt(start, birthDate);
    const age2  = ageAt(end, birthDate);
    const ageLabel = age1 === age2 ? `Age ${age1}` : `Age ${age1}–${age2}`;
    windows.push({
      label:     `${fmtMonYear(start)} – ${fmtMonYear(end)} · ${ageLabel}`,
      intensity: 'hardest',
      description: `${vhDasha.reason}. ${exactAW ? 'Saturn also reaches exact conjunction with your natal Moon during this window.' : 'This is when multiple factors align — the sharpest pressure in the entire period.'}`,
    });
  } else if (exactAW) {
    const age = ageAt(exactAW.startDate, birthDate);
    windows.push({
      label:     `${fmtMonYear(exactAW.startDate)} · Age ${age}`,
      intensity: 'hardest',
      description: `Saturn reaches the exact degree of your natal Moon. Psychological and physical pressure peaks here. Duration: approximately 2–4 weeks.`,
    });
  }

  // Find the relief window: strong Jupiter protection
  const protectedJupiter = jupiterWindows.find(w => w.protectionStrength === 'strong' || w.protectionStrength === 'moderate');
  if (protectedJupiter) {
    const start = protectedJupiter.rawEntryDate ?? protectedJupiter.startDate;
    const end   = protectedJupiter.rawExitDate  ?? protectedJupiter.exitDate;
    const age1  = ageAt(protectedJupiter.startDate, birthDate);
    const age2  = ageAt(protectedJupiter.exitDate,  birthDate);
    const ageLabel = age1 === age2 ? `Age ${age1}` : `Age ${age1}–${age2}`;
    const fromStr = fmtMonYear(start);
    const toStr   = fmtMonYear(end);
    const label = fromStr !== toStr
      ? `${fromStr} – ${toStr} · ${ageLabel}`
      : `${fromStr} · ${ageLabel}`;
    const intensity: TimingWindow['intensity'] = vhDasha ? 'pressured' : 'easing';

    const overlapsHardest = vhDasha
      ? datesOverlap(protectedJupiter.startDate, protectedJupiter.exitDate, vhDasha.pratyantar.start, vhDasha.pratyantar.end)
      : false;

    if (!overlapsHardest) {
      windows.push({
        label,
        intensity,
        description: `${protectedJupiter.description} ${intensity === 'easing' ? 'Best window in this phase for important decisions or new initiatives.' : ''}`.trim(),
      });
    }
  }

  // Find the final / easing phase — retrograde review window or final consolidation
  const retroAW = activationWindows.find(w => w.type === 'retrograde_review');
  const finalAW = activationWindows.find(w => w.type === 'final_consolidation');

  if (retroAW) {
    const age = ageAt(retroAW.startDate, birthDate);
    windows.push({
      label:     `${fmtMonYear(retroAW.startDate)} – ${fmtMonYear(retroAW.endDate)} · Age ${age}`,
      intensity: 'pressured',
      description: `Saturn retraces its path and re-activates the same degrees. ${retroAW.description}`,
    });
  } else if (finalAW && windows.length > 0) {
    const age = ageAt(finalAW.startDate, birthDate);
    windows.push({
      label:     `${fmtMonYear(finalAW.startDate)} – ${fmtMonYear(finalAW.endDate)} · Age ${age}`,
      intensity: 'easing',
      description: finalAW.description,
    });
  }

  // ── Gap filler ─────────────────────────────────────────────────
  // Sort windows by their start date so we can find uncovered stretches
  windows.sort((a, b) => {
    const aStart = parseLabelDate(a.label);
    const bStart = parseLabelDate(b.label);
    return aStart - bStart;
  });

  // Find the latest end date covered by existing windows
  // We do this by tracking which months are "spoken for"
  const coveredRanges: Array<{ start: Date; end: Date }> = [];

  if (vhDasha) {
    coveredRanges.push({ start: vhDasha.pratyantar.start, end: vhDasha.pratyantar.end });
  }
  if (exactAW && !vhDasha) {
    coveredRanges.push({ start: exactAW.startDate, end: exactAW.endDate });
  }
  if (protectedJupiter) {
    coveredRanges.push({ start: protectedJupiter.startDate, end: protectedJupiter.exitDate });
  }
  if (retroAW) {
    coveredRanges.push({ start: retroAW.startDate, end: retroAW.endDate });
  }

  // Find gaps > 6 months that aren't covered
  const gapWindows: TimingWindow[] = [];

  // Check gap before first covered range
  if (coveredRanges.length > 0) {
    coveredRanges.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Gap between period start and first window
    const firstCoveredStart = coveredRanges[0].start;
    const gapBeforeMs = firstCoveredStart.getTime() - periodStart.getTime();
    if (gapBeforeMs > 6 * 30 * MS_PER_DAY) {
      const a1 = ageAt(periodStart, birthDate);
      const a2 = ageAt(firstCoveredStart, birthDate);
      gapWindows.push({
        label: `${fmtMonYear(periodStart)} – ${fmtMonYear(firstCoveredStart)} · Age ${a1 === a2 ? a1 : `${a1}–${a2}`}`,
        intensity: 'pressured',
        description: 'Saturn is active but without a specific peak — consistent pressure without a single sharp moment. Maintain discipline and remedies throughout.',
      });
    }

    // Gaps between consecutive covered ranges
    for (let i = 0; i < coveredRanges.length - 1; i++) {
      const gapStart = coveredRanges[i].end;
      const gapEnd   = coveredRanges[i + 1].start;
      const gapMs    = gapEnd.getTime() - gapStart.getTime();
      if (gapMs > 6 * 30 * MS_PER_DAY) {
        const a1 = ageAt(gapStart, birthDate);
        const a2 = ageAt(gapEnd, birthDate);
        gapWindows.push({
          label: `${fmtMonYear(gapStart)} – ${fmtMonYear(gapEnd)} · Age ${a1 === a2 ? a1 : `${a1}–${a2}`}`,
          intensity: 'pressured',
          description: 'Sustained Saturn pressure without a specific peak — no single hardest moment but the overall weight of the transit is present. Patience and routine practice are most useful here.',
        });
      }
    }

    // Gap between last covered range and period end
    const lastCoveredEnd = coveredRanges[coveredRanges.length - 1].end;
    const gapAfterMs = periodEnd.getTime() - lastCoveredEnd.getTime();
    if (gapAfterMs > 6 * 30 * MS_PER_DAY) {
      const a1 = ageAt(lastCoveredEnd, birthDate);
      const a2 = ageAt(periodEnd, birthDate);
      gapWindows.push({
        label: `${fmtMonYear(lastCoveredEnd)} – ${fmtMonYear(periodEnd)} · Age ${a1 === a2 ? a1 : `${a1}–${a2}`}`,
        intensity: 'easing',
        description: 'The closing stretch of this period. Saturn\'s pressure gradually lifts as it approaches the sign exit — integration and preparation for what follows.',
      });
    }
  }

  // Merge gap windows into the main list and re-sort chronologically
  windows.push(...gapWindows);
  windows.sort((a, b) => parseLabelDate(a.label) - parseLabelDate(b.label));

  // Ensure at least one window
  if (windows.length === 0) {
    windows.push({
      label:     `${fmtMonYear(periodStart)} – ${fmtMonYear(periodEnd)} · Age ${ageAt(periodStart, birthDate)}–${ageAt(periodEnd, birthDate)}`,
      intensity: 'pressured',
      description: `The full duration of this period carries Saturn's influence. Stay consistent with remedies and discipline throughout.`,
    });
  }

  return windows;
}

/** Extract a comparable timestamp from a timing window label (uses the first date mentioned) */
function parseLabelDate(label: string): number {
  const match = label.match(/([A-Z][a-z]{2} \d{4})/);
  if (!match) return 0;
  return new Date(match[1]).getTime();
}

// ═══════════════════════════════════════════════════════════════════
// GUIDANCE GENERATOR
// ═══════════════════════════════════════════════════════════════════

function buildGuidance(
  type: SelectedPeriod['type'],
  mostActivated: DashaHierarchyWindow[],
  bestJupiter: JupiterTransitWindow | undefined,
  saturnStrength: ReturnType<typeof analyzeSaturnStrength>,
  retrogradeInfo: PeriodAnalysisResult['retrogradeInfo'],
): GuidanceContent {
  const avoidPeak = mostActivated[0];

  // Avoid items — type-specific, date removed from bullet (already shown in card label)
  const avoid: string[] = [];
  const AVOID_BY_TYPE: Record<SelectedPeriod['type'], string[]> = {
    ss_rising:  ['Unnecessary expenses and impulsive financial decisions', 'Isolation — stay connected with trusted people'],
    ss_peak:    ['Health neglect or ignoring physical symptoms', 'Impulsive decisions about identity, career, or relationships'],
    ss_setting: ['Taking on new debt or making large financial commitments', 'Conflicts over money or speech with family members'],
    dhaiya_4th: ['Domestic disputes and property decisions made under stress', 'Neglecting the home environment or parent relationships'],
    dhaiya_8th: ['Risky investments or sudden large financial moves', 'Ignoring health symptoms — get check-ups proactively'],
  };
  avoid.push(...AVOID_BY_TYPE[type]);
  if (retrogradeInfo.hasRetrograde) {
    avoid.push("Major irreversible decisions during Saturn's retrograde re-entry — themes resurface for review, not resolution");
  }

  // Build / opportunities — type-specific
  const build: string[] = [];
  const BUILD_BY_TYPE: Record<SelectedPeriod['type'], string[]> = {
    ss_rising:  ['Spiritual practice and inner work — Saturn rewards this in the 12th house', 'Clearing old debts, obligations, and patterns before the peak arrives'],
    ss_peak:    ['Discipline in health routines — habits built now create a strong foundation', 'Career structures built under pressure here tend to be durable and lasting'],
    ss_setting: ['Financial discipline and careful budgeting — Saturn in the 2nd rewards this', 'Communicating clearly and patiently with close family'],
    dhaiya_4th: ['Investing in the home environment — this period rewards domestic stability', 'Career discipline — what you build at work now carries Saturn\'s durability'],
    dhaiya_8th: ['Research, investigation, and depth work — Saturn in the 8th supports this', 'Transformative change you choose is easier than change imposed on you'],
  };
  build.push(...BUILD_BY_TYPE[type]);
  if (saturnStrength.isYogakaraka) {
    build.push('Saturn is Yogakaraka for your chart — consistent effort converts to lasting results more reliably than for others');
  }
  if (bestJupiter) {
    const from = fmtMonYear(bestJupiter.rawEntryDate ?? bestJupiter.startDate);
    const to   = fmtMonYear(bestJupiter.rawExitDate  ?? bestJupiter.exitDate);
    const rangeStr = from !== to ? `${from}–${to}` : from;
    build.push(`The ${rangeStr} window has Jupiter's protection — use it for decisions with long-term consequences`);
  }

  // Practices — type-specific remedies
  let practices: string[] = [];
  if (type === 'ss_rising')  practices = PHASE_REMEDIES.Rising.slice(0, 4);
  else if (type === 'ss_peak')    practices = PHASE_REMEDIES.Peak.slice(0, 4);
  else if (type === 'ss_setting') practices = PHASE_REMEDIES.Setting.slice(0, 4);
  else if (type === 'dhaiya_4th') practices = DHAIYA_REMEDIES['4th'].slice(0, 4);
  else                            practices = DHAIYA_REMEDIES['8th'].slice(0, 4);

  const avoidWindow = avoidPeak
    ? `${fmtMonYear(avoidPeak.pratyantar.start)}–${fmtMonYear(avoidPeak.pratyantar.end)}`
    : 'peak activation window';

  const buildWindow = bestJupiter
    ? (() => {
        const from = fmtMonYear(bestJupiter.rawEntryDate ?? bestJupiter.startDate);
        const to   = fmtMonYear(bestJupiter.rawExitDate  ?? bestJupiter.exitDate);
        return from !== to ? `${from}–${to}` : from;
      })()
    : 'throughout the period';

  return { avoid, avoidWindow, build, buildWindow, practices };
}

// ═══════════════════════════════════════════════════════════════════
// DIMENSIONAL INTENSITY
// ═══════════════════════════════════════════════════════════════════

type DimLevel = 'very_high' | 'high' | 'moderate' | 'low';

function scoreToDimLevel(score: number): DimLevel {
  if (score >= 3) return 'very_high';
  if (score >= 2) return 'high';
  if (score >= 1) return 'moderate';
  return 'low';
}

function buildDimensionalIntensity(
  type: SelectedPeriod['type'],
  moonStrength: ReturnType<typeof analyzeMoonStrength>,
  saturnStrength: ReturnType<typeof analyzeSaturnStrength>,
  mostActivated: DashaHierarchyWindow[],
  bestJupiter: JupiterTransitWindow | undefined,
): DimensionalIntensity {
  // Emotional: driven by Moon strength + type (Peak/Rising hit emotions hardest)
  let emotScore = 0;
  if (type === 'ss_peak')    emotScore += 2;
  else if (type === 'ss_rising') emotScore += 1;
  else if (type === 'dhaiya_8th') emotScore += 1;
  if (moonStrength.overallStrength === 'weak')   emotScore += 2;
  else if (moonStrength.overallStrength === 'strong') emotScore -= 1;
  const emotionalReason = moonStrength.overallStrength === 'weak'
    ? 'Moon is weak in your chart — emotional sensitivity is higher'
    : moonStrength.overallStrength === 'strong'
    ? 'Moon is strong — emotional resilience is available'
    : 'Moon is moderately placed — some emotional pressure';

  // Structural: career/home/finances — driven by type + Saturn aspects
  let structScore = 0;
  if (type === 'dhaiya_4th')  structScore += 2;
  else if (type === 'ss_setting') structScore += 2;
  else if (type === 'ss_peak')    structScore += 1;
  else if (type === 'dhaiya_8th') structScore += 2;
  if (saturnStrength.isYogakaraka) structScore -= 1;
  const structuralReason = type === 'dhaiya_4th'
    ? 'Home, career, and property under Saturn\'s direct focus'
    : type === 'dhaiya_8th'
    ? 'Finances and life structures face sudden disruption'
    : type === 'ss_setting'
    ? 'Finances and family relationships face restructuring pressure'
    : saturnStrength.isYogakaraka
    ? 'Saturn is Yogakaraka — structural pressure converts to lasting results'
    : 'Career and life structures are affected but not the primary focus';

  // External: world events / outcomes visible to others — dasha activation + Jupiter
  let extScore = 0;
  if (mostActivated.some(w => w.activationLevel === 'very_high')) extScore += 3;
  else if (mostActivated.some(w => w.activationLevel === 'high')) extScore += 2;
  else if (mostActivated.some(w => w.activationLevel === 'moderate')) extScore += 1;
  if (bestJupiter?.protectionStrength === 'strong')   extScore -= 2;
  else if (bestJupiter?.protectionStrength === 'moderate') extScore -= 1;
  const jupFrom = bestJupiter?.rawEntryDate ? fmtMonYear(bestJupiter.rawEntryDate) : bestJupiter ? fmtMonYear(bestJupiter.startDate) : null;
  const jupTo   = bestJupiter?.rawExitDate  ? fmtMonYear(bestJupiter.rawExitDate)  : bestJupiter ? fmtMonYear(bestJupiter.exitDate)  : null;
  const externalReason = bestJupiter?.protectionStrength === 'strong' && jupFrom && jupTo && jupFrom !== jupTo
    ? `Jupiter protection present ${jupFrom}–${jupTo} — reduces external impact`
    : mostActivated.some(w => w.activationLevel === 'very_high')
    ? 'Dasha activation peaks align with transit — visible external effects likely'
    : 'Moderate external impact — effects felt more internally than externally';

  return {
    emotional:  scoreToDimLevel(Math.max(0, emotScore)),
    structural: scoreToDimLevel(Math.max(0, structScore)),
    external:   scoreToDimLevel(Math.max(0, extScore)),
    emotionalReason,
    structuralReason,
    externalReason,
  };
}

// ═══════════════════════════════════════════════════════════════════
// PHASE PROGRESSION
// ═══════════════════════════════════════════════════════════════════

function buildPhaseProgression(
  periodStart: Date,
  periodEnd: Date,
  birthDate: Date,
  type: SelectedPeriod['type'],
  mostActivated: DashaHierarchyWindow[],
  retrogradeInfo: PeriodAnalysisResult['retrogradeInfo'],
): PhaseProgression {
  const totalMs = periodEnd.getTime() - periodStart.getTime();
  const earlyEnd   = new Date(periodStart.getTime() + totalMs * 0.3);
  const midEnd     = new Date(periodStart.getTime() + totalMs * 0.7);

  const earlyWindow = `${fmtMonYear(periodStart)}–${fmtMonYear(earlyEnd)}`;
  const midWindow   = `${fmtMonYear(earlyEnd)}–${fmtMonYear(midEnd)}`;
  const lateWindow  = `${fmtMonYear(midEnd)}–${fmtMonYear(periodEnd)}`;

  // Check if the peak dasha activation falls in early, mid, or late
  const peakDasha = mostActivated.find(w => w.activationLevel === 'very_high' || w.activationLevel === 'high');
  const peakInEarly = peakDasha && peakDasha.pratyantar.start < earlyEnd;
  const peakInLate  = peakDasha && peakDasha.pratyantar.start >= midEnd;

  const EARLY_BY_TYPE: Record<SelectedPeriod['type'], string> = {
    ss_rising:  'Adjustment begins — unexpected expenses and disrupted routines surface. The main pressure has not yet peaked.',
    ss_peak:    'Saturn enters your Moon sign. Initial disorientation, health attention needed, established patterns are questioned.',
    ss_setting: 'Financial and family pressure begins building. Speech and communication require careful handling.',
    dhaiya_4th: 'Home and workplace tensions emerge. Property and vehicle matters may require attention.',
    dhaiya_8th: 'Unexpected disruptions begin — financial or circumstantial. Adaptability is the key skill.',
  };
  const MID_BY_TYPE: Record<SelectedPeriod['type'], string> = {
    ss_rising:  peakInEarly ? 'The adjustment period eases somewhat — practical decisions made now carry weight.' : 'Peak pressure window. Multiple life areas feel the strain simultaneously.',
    ss_peak:    peakDasha ? `Peak activation — ${peakDasha.pratyantar.lord} sub-period intensifies the transit's psychological and physical effects.` : 'Maximum Saturn pressure on Moon sign. Health, identity, and career face direct scrutiny.',
    ss_setting: 'Financial restructuring is most active. Discipline around money and family communication is essential.',
    dhaiya_4th: 'Career restructuring and domestic instability reach their peak. Saturn is testing the durability of your home and professional foundations.',
    dhaiya_8th: 'Transformation is underway. Hidden matters surface. Health vigilance is most important in this phase.',
  };
  const LATE_BY_TYPE: Record<SelectedPeriod['type'], string> = {
    ss_rising:  'Saturn approaches your Moon sign — the rising phase closes and preparation for peak matters more.',
    ss_peak:    retrogradeInfo.hasRetrograde ? 'Saturn retraces key degrees — themes resurface for final integration. Review and closure, not new decisions.' : 'Saturn exits your Moon sign. Clarity and integration. The sharpest lessons are behind you.',
    ss_setting: 'Gradual stabilisation. Financial discipline formed earlier begins to pay off. Family relationships can be repaired.',
    dhaiya_4th: 'Pressure lifts as Saturn approaches sign exit. Foundations tested are now clearer — build on what survived.',
    dhaiya_8th: peakInLate ? 'Final activation peak — last surge of pressure before Saturn exits. Stay steady and avoid reactive decisions.' : 'Integration and recovery. Transformations initiated earlier settle into their new form.',
  };

  return {
    early: EARLY_BY_TYPE[type],
    mid:   MID_BY_TYPE[type],
    late:  LATE_BY_TYPE[type],
    earlyWindow,
    midWindow,
    lateWindow,
  };
}

// ═══════════════════════════════════════════════════════════════════
// WINDOW SUMMARY
// ═══════════════════════════════════════════════════════════════════

function buildWindowSummary(
  timingWindows: TimingWindow[],
  retrogradeInfo: PeriodAnalysisResult['retrogradeInfo'],
  bestJupiter: JupiterTransitWindow | undefined,
): WindowSummary {
  const hardest   = timingWindows.find(w => w.intensity === 'hardest');
  const easing    = timingWindows.find(w => w.intensity === 'easing');
  const pressured = timingWindows.filter(w => w.intensity === 'pressured');

  // Best window — prefer easing, then Jupiter window, then least-pressured
  let bestLabel  = easing?.label ?? (bestJupiter ? fmtMonYear(bestJupiter.rawEntryDate ?? bestJupiter.startDate) : null) ?? pressured[pressured.length - 1]?.label ?? 'Later in the period';
  let bestReason = easing
    ? 'Saturn pressure eases — suitable for important decisions and new initiatives'
    : bestJupiter?.protectionStrength === 'strong'
    ? 'Jupiter provides strong protection — most supported window of this period'
    : 'Relatively lighter phase — lower risk for key decisions';

  // Highest risk
  const riskLabel  = hardest?.label ?? pressured[0]?.label ?? 'Mid-period';
  const riskReason = hardest
    ? hardest.description.split('.')[0]
    : 'Multiple pressure factors align — highest caution window';

  // Review phase — retrograde re-entry
  let reviewWindow: WindowSummary['reviewPhase'] | undefined;
  if (retrogradeInfo.hasRetrograde && retrogradeInfo.reviewPeriods.length > 0) {
    const rp = retrogradeInfo.reviewPeriods[0];
    reviewWindow = {
      label:  `${fmtMonYear(rp.start)}–${fmtMonYear(rp.end)}`,
      reason: 'Saturn re-enters the sign — themes resurface for review and closure',
    };
  }

  return {
    bestWindow:   { label: bestLabel, reason: bestReason },
    highestRisk:  { label: riskLabel, reason: riskReason },
    reviewPhase:  reviewWindow,
  };
}

// ═══════════════════════════════════════════════════════════════════
// CONFIDENCE BASIS
// ═══════════════════════════════════════════════════════════════════

function buildConfidenceBasis(
  moonStrength: ReturnType<typeof analyzeMoonStrength>,
  saturnStrength: ReturnType<typeof analyzeSaturnStrength>,
  mostActivated: DashaHierarchyWindow[],
  bestJupiter: JupiterTransitWindow | undefined,
  nakshatraTriggers: NakshatraTriggerWindow[],
): string {
  const parts: string[] = ['Moon strength', 'Saturn placement'];
  if (mostActivated.length > 0) parts.push('Dasha overlap');
  parts.push('transit activation');
  if (bestJupiter) parts.push('Jupiter transit');
  if (nakshatraTriggers.length > 0) parts.push('nakshatra trigger');
  return `Based on ${parts.join(', ')}`;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════

/**
 * Analyze a specific Sade Sati or Dhaiya period in full depth.
 *
 * This is the correct architecture: the "current period" analysis
 * the existing system uses is a special case where selectedPeriod
 * = the currently active period. There is no separate code path.
 *
 * @param selectedPeriod  The clicked timeline row, extracted to SelectedPeriod
 * @param moonPlanet      Natal Moon planet data
 * @param saturnPlanet    Natal Saturn planet data
 * @param allPlanets      All natal planets (for Moon strength calc)
 * @param ascendant       Natal ascendant
 * @param birthDate       Birth date (UTC)
 * @param moonLongitude   Moon's absolute longitude (0–360°) — used for dasha calc
 * @param elapsedFractionOfNakshatra  For vimshottariDasha balance calc
 * @param nakshatraLord   Moon's nakshatra lord — for vimshottariDasha
 */
export async function analyzeSadeSatiPeriod(
  selectedPeriod: SelectedPeriod,
  moonPlanet: PlanetData,
  saturnPlanet: PlanetData,
  allPlanets: Record<string, PlanetData>,
  ascendant: AscendantData,
  birthDate: Date,
  moonLongitude: number,
  elapsedFractionOfNakshatra: number,
  nakshatraLord: string,
): Promise<PeriodAnalysisResult> {

  // ── Factors 1 + 2: Identity + Saturn behavior ──────────────────
  const passes = selectedPeriod.passes;
  const pattern =
    passes.length >= 3 ? 'triple_pass' :
    passes.length === 2 ? 'double_pass' : 'single_pass';

  const saturnBehavior: PeriodAnalysisResult['saturnBehavior'] = {
    totalPasses: passes.length,
    pattern,
  };

  // ── Planetary strength (natal — same for all periods) ──────────
  const moonStrength   = analyzeMoonStrength(moonPlanet, ascendant, allPlanets);
  const saturnStrength = analyzeSaturnStrength(saturnPlanet, ascendant);

  // ── Factor 3: Dasha hierarchy ──────────────────────────────────
  const allMahadashas = computeAllMahadashas(
    moonLongitude,
    birthDate,
    elapsedFractionOfNakshatra,
    nakshatraLord,
  );

  const dashaWindows = getDashaHierarchyForPeriod(
    allMahadashas,
    selectedPeriod.startDate,
    selectedPeriod.endDate,
  );

  const mostActivatedWindows = dashaWindows.filter(w => w.isActivated);

  // ── Factor 4: Degree activation windows ────────────────────────
  const activationWindows = getActivationWindows(
    moonLongitude,
    selectedPeriod.saturnSign,
    passes,
  );

  // ── Factor 5: Nakshatra triggers ───────────────────────────────
  const nakshatraTriggers = getNakshatraTriggersForPeriod(
    moonPlanet.kp.nakshatraIndex,
    moonPlanet.kp.nakshatraPada,
    moonPlanet.kp.nakshatraLord,
    selectedPeriod.saturnSign,
    passes,
  );

  // ── Factor 6: Retrograde info ──────────────────────────────────
  const hasRetrograde = passes.length > 1;
  const reviewPeriods = passes.slice(1).map((pass, i) => ({
    start:       pass.start,
    end:         pass.end,
    description: i === 0
      ? 'Saturn re-enters the sign — themes from the first pass resurface'
      : 'Saturn\'s final direct entry — closing and integration of lessons',
  }));

  const retrogradeInfo: PeriodAnalysisResult['retrogradeInfo'] = {
    hasRetrograde,
    touchCount: passes.length,
    pattern,
    reviewPeriods,
  };

  // ── Factors 7 + 9: Jupiter windows ────────────────────────────
  const jupiterWindows = await getJupiterWindowsForPeriod(
    selectedPeriod.startDate,
    selectedPeriod.endDate,
    moonPlanet.signNumber,
    selectedPeriod.saturnSign,
    saturnPlanet.signNumber,
  );

  const bestProtectedPeriod   = jupiterWindows.find(w => w.protectionStrength === 'strong')
    ?? jupiterWindows.find(w => w.protectionStrength === 'moderate');
  const leastProtectedPeriod  = jupiterWindows.find(w => w.protectionStrength === 'none');

  const jupiterSummary = { bestProtectedPeriod, leastProtectedPeriod };

  // ── Factor 8: Saturn aspects ───────────────────────────────────
  const saturnAspects = getSaturnAspects(
    selectedPeriod.saturnSign,
    ascendant.signNumber,
  );

  // ── Factor 10: Cycle meaning ───────────────────────────────────
  const cycleMeaning = getCycleMeaning(
    selectedPeriod.cycleNumber,
    birthDate,
    selectedPeriod.startDate,
  );

  // ── Factor 11: Life areas ──────────────────────────────────────
  const lifeAreaItems = deriveLifeAreas(selectedPeriod.type, saturnAspects);

  // ── Overall intensity ──────────────────────────────────────────
  const overallIntensity = assessOverallIntensity(
    selectedPeriod.type,
    moonStrength,
    saturnStrength,
    mostActivatedWindows,
    jupiterWindows,
    selectedPeriod.cycleNumber,
  );

  // ── Plain title ────────────────────────────────────────────────
  const plainTitle = generatePlainTitle(selectedPeriod.type, overallIntensity);

  // ── Summary paragraph ──────────────────────────────────────────
  const summary = generateSummary(
    selectedPeriod.type,
    selectedPeriod.cycleNumber,
    overallIntensity,
    moonStrength,
    saturnStrength,
    mostActivatedWindows,
    bestProtectedPeriod,
    cycleMeaning,
  );

  // ── Timing windows (for "When is it hardest?" section) ─────────
  const timingWindows = buildTimingWindows(
    selectedPeriod.startDate,
    selectedPeriod.endDate,
    birthDate,
    dashaWindows,
    activationWindows,
    jupiterWindows,
  );

  // ── Guidance ("What to do" section) ───────────────────────────
  const guidance = buildGuidance(
    selectedPeriod.type,
    mostActivatedWindows,
    bestProtectedPeriod,
    saturnStrength,
    retrogradeInfo,
  );

  // ── Dimensional intensity ──────────────────────────────────────
  const dimensionalIntensity = buildDimensionalIntensity(
    selectedPeriod.type,
    moonStrength,
    saturnStrength,
    mostActivatedWindows,
    bestProtectedPeriod,
  );

  // ── Phase progression ──────────────────────────────────────────
  const phaseProgression = buildPhaseProgression(
    selectedPeriod.startDate,
    selectedPeriod.endDate,
    birthDate,
    selectedPeriod.type,
    mostActivatedWindows,
    retrogradeInfo,
  );

  // ── Window summary ─────────────────────────────────────────────
  const windowSummary = buildWindowSummary(
    timingWindows,
    retrogradeInfo,
    bestProtectedPeriod,
  );

  // ── Confidence basis ───────────────────────────────────────────
  const confidenceBasis = buildConfidenceBasis(
    moonStrength,
    saturnStrength,
    mostActivatedWindows,
    bestProtectedPeriod,
    nakshatraTriggers,
  );

  return {
    period:               selectedPeriod,
    houseFromMoon:        selectedPeriod.houseFromMoon,
    plainTitle,
    saturnBehavior,
    dashaWindows,
    mostActivatedWindows,
    activationWindows,
    nakshatraTriggers,
    retrogradeInfo,
    jupiterWindows,
    jupiterSummary,
    saturnAspects,
    cycleMeaning,
    lifeAreaItems,
    moonStrength,
    saturnStrength,
    overallIntensity,
    dimensionalIntensity,
    summary,
    timingWindows,
    guidance,
    phaseProgression,
    windowSummary,
    confidenceBasis,
  };
}
