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

    // Clamp entry/exit to the period window
    const entryDate = row.entryDate < periodStart ? periodStart : row.entryDate;
    const exitDate  = row.exitDate  > periodEnd   ? periodEnd   : row.exitDate;

    windows.push({
      jupiterSign:          row.sign,
      jupiterSignName:      row.signName,
      startDate:            entryDate,
      exitDate,
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

function deriveLifeAreas(
  type: SelectedPeriod['type'],
  saturnAspects: SaturnAspectInfo,
): LifeAreaItem[] {
  const items: LifeAreaItem[] = [...TYPE_LIFE_AREA_LABELS[type]];

  // Add aspect-derived areas for aspected houses (limit to 2 extras max)
  let extras = 0;
  for (const house of saturnAspects.aspectsHouses) {
    if (extras >= 2) break;
    const domains = HOUSE_LIFE_DOMAINS[house];
    if (!domains) continue;
    items.push({
      label:       domains[0],
      description: `Saturn's 3rd/7th/10th aspect activates your ${house}th house — ${domains.slice(1).join(' and ').toLowerCase()} may also be in play`,
    });
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
    const from = fmtMonYear(bestJupiter.startDate);
    const to   = fmtMonYear(bestJupiter.exitDate);
    sentences.push(`Jupiter provides strong protection from ${from} to ${to}, creating a notably more supported window within this period.`);
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
    const start = protectedJupiter.startDate;
    const end   = protectedJupiter.exitDate;
    const age1  = ageAt(start, birthDate);
    const age2  = ageAt(end,   birthDate);
    const ageLabel = age1 === age2 ? `Age ${age1}` : `Age ${age1}–${age2}`;
    const label = `${fmtMonYear(start)} – ${fmtMonYear(end)} · ${ageLabel}`;
    const intensity: TimingWindow['intensity'] = vhDasha
      ? 'pressured' // still some pressure even with Jupiter
      : 'easing';

    // Only add if this doesn't overlap the "hardest" window already shown
    const overlapsHardest = vhDasha
      ? datesOverlap(start, end, vhDasha.pratyantar.start, vhDasha.pratyantar.end)
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

  // Ensure we have at least one window
  if (windows.length === 0) {
    const midMs = periodStart.getTime() + (periodEnd.getTime() - periodStart.getTime()) / 2;
    const midDate = new Date(midMs);
    windows.push({
      label:     `${fmtMonYear(periodStart)} – ${fmtMonYear(periodEnd)} · Age ${ageAt(periodStart, birthDate)}–${ageAt(periodEnd, birthDate)}`,
      intensity: 'pressured',
      description: `The full duration of this period carries Saturn's influence. Stay consistent with remedies and discipline throughout.`,
    });
  }

  return windows;
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
  // Avoid items — always include retrograde caution if applicable
  const avoid: string[] = [];
  const avoidPeak = mostActivated[0];

  if (avoidPeak) {
    avoid.push(`Health neglect or ignoring physical symptoms during ${fmtMonYear(avoidPeak.pratyantar.start)}–${fmtMonYear(avoidPeak.pratyantar.end)}`);
  }
  if (retrogradeInfo.hasRetrograde) {
    avoid.push('Major irreversible decisions during Saturn\'s retrograde re-entry — themes resurface for review, not resolution');
  }
  avoid.push('Forcing outcomes in important relationships — Saturn\'s pressure here needs patience, not force');

  // Build / opportunities
  const build: string[] = [];
  if (saturnStrength.isYogakaraka) {
    build.push('Discipline and hard work — Saturn as Yogakaraka converts effort into lasting results for your chart');
  }
  if (bestJupiter) {
    build.push(`Use the ${fmtMonYear(bestJupiter.startDate)}–${fmtMonYear(bestJupiter.exitDate)} window for key career or life decisions — Jupiter provides strong backing`);
  }
  build.push('Structures that last — what you build under Saturn\'s pressure tends to be durable');
  build.push('Service and spiritual practice — these amplify Saturn\'s constructive side');

  // Type-specific remedies from constants
  let practices: string[] = [];
  if (type === 'ss_rising') {
    practices = PHASE_REMEDIES.Rising.slice(0, 4);
  } else if (type === 'ss_peak') {
    practices = PHASE_REMEDIES.Peak.slice(0, 4);
  } else if (type === 'ss_setting') {
    practices = PHASE_REMEDIES.Setting.slice(0, 4);
  } else if (type === 'dhaiya_4th') {
    practices = DHAIYA_REMEDIES['4th'].slice(0, 4);
  } else {
    practices = DHAIYA_REMEDIES['8th'].slice(0, 4);
  }

  // Window labels
  const avoidWindow = avoidPeak
    ? `${fmtMonYear(avoidPeak.pratyantar.start)}–${fmtMonYear(avoidPeak.pratyantar.end)}`
    : 'peak activation window';

  const buildWindow = bestJupiter
    ? `${fmtMonYear(bestJupiter.startDate)}–${fmtMonYear(bestJupiter.exitDate)}`
    : 'throughout the period';

  return { avoid, avoidWindow, build, buildWindow, practices };
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
    summary,
    timingWindows,
    guidance,
  };
}
