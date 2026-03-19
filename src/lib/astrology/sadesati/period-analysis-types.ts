/**
 * Period Analysis Types
 *
 * Type definitions for the Sade Sati period-specific deep analysis feature.
 * These types cover the SelectedPeriod (what the UI sends on row click)
 * and PeriodAnalysisResult (what the engine returns).
 *
 * @file period-analysis-types.ts
 */

import type { StrengthAssessment } from './strengthAnalyzer';

// ═══════════════════════════════════════════════════════════════════
// INPUT — what the UI sends when a timeline row is clicked
// ═══════════════════════════════════════════════════════════════════

/**
 * Extracted from a SaturnCycleEvent when a timeline row is clicked.
 * Contains everything the engine needs without an extra DB call.
 */
export interface SelectedPeriod {
  /** Internal event type — drives house-from-Moon and life area derivation */
  type: 'ss_rising' | 'ss_peak' | 'ss_setting' | 'dhaiya_4th' | 'dhaiya_8th';
  /** Display label — e.g. "Sade Sati — Peak Phase" */
  label: string;
  /** Which Saturn cycle in the person's lifetime (1 = childhood, 2 = midlife, 3 = old age) */
  cycleNumber: 1 | 2 | 3;
  /** Saturn's transit sign number (1–12) */
  saturnSign: number;
  /** Saturn's transit sign name — e.g. "Sagittarius" */
  saturnSignName: string;
  /** Overall period start (= first sub-entry date) */
  startDate: Date;
  /** Overall period end (= last sub-exit date) */
  endDate: Date;
  /**
   * Individual pass date ranges — 1 to 3 entries.
   * passes[0] = first direct transit
   * passes[1] = retrograde re-entry (if any)
   * passes[2] = final direct re-entry (if any)
   */
  passes: Array<{ start: Date; end: Date }>;
  /** Timeline row status relative to today */
  status: 'past' | 'current' | 'upcoming';
  /** House relationship from natal Moon */
  houseFromMoon: 12 | 1 | 2 | 4 | 8;
}

// ═══════════════════════════════════════════════════════════════════
// FACTOR TYPES — intermediate calculation results
// ═══════════════════════════════════════════════════════════════════

/**
 * Factor 3: One window of the dasha hierarchy within the selected period.
 * The engine walks Maha → Antar → Pratyantar → Sookshma (for activated ones).
 */
export interface DashaHierarchyWindow {
  mahadasha: { lord: string; start: Date; end: Date };
  antardasha: { lord: string; start: Date; end: Date };
  pratyantar: { lord: string; start: Date; end: Date };
  /**
   * Only populated for Pratyantars where the lord is in ACTIVATING_LORDS.
   * Sookshma windows are days–weeks long; only the activated ones are meaningful.
   */
  sookshma?: { lord: string; start: Date; end: Date };
  activationLevel: 'very_high' | 'high' | 'moderate' | 'low';
  /** True when Saturn, Moon, or Rahu appears at any level (Maha/Antar/Pratyantar) */
  isActivated: boolean;
  /** Human-readable reason — e.g. "Saturn at three levels simultaneously" */
  reason: string;
}

/**
 * Factor 4: One degree-based activation window within the selected period.
 * Computed by interpolating Saturn's position within each pass date range.
 */
export interface ActivationWindow {
  type: 'buildup' | 'exact' | 'retrograde_review' | 'final_consolidation';
  startDate: Date;
  endDate: Date;
  /** Plain-language description shown in the UI */
  description: string;
  /** Index into SelectedPeriod.passes — which pass this window belongs to */
  passIndex: number;
  /**
   * True when the period starts more than 2 years from today.
   * Linear interpolation is less reliable at long range; flag it so the UI
   * shows "Approx ±10 days" next to the date.
   */
  isApproximate: boolean;
}

/**
 * Factor 5: One nakshatra/pada crossing within the selected period.
 * A crossing is significant only when Saturn transits through the sign
 * that contains the natal Moon's nakshatra.
 */
export interface NakshatraTriggerWindow {
  nakshatra: string;
  /** 1–4 */
  pada: number;
  entryDate: Date;
  exitDate: Date;
  /** True when this is the exact nakshatra natal Moon occupies */
  isMoonNakshatra: boolean;
  /** True when this is also the exact pada natal Moon occupies */
  isMoonPada: boolean;
  /** Dasha lord of this nakshatra */
  nakshatraLord: string;
  /**
   * critical — same nakshatra AND same pada as natal Moon
   * high     — same nakshatra, different pada
   * medium   — different nakshatra but same lord
   */
  significance: 'critical' | 'high' | 'medium';
}

/**
 * Factors 7 + 9: One Jupiter sign window overlapping the selected period.
 * Jupiter changes sign roughly once per year, so a 3-year Sade Sati Peak
 * will contain ~3 Jupiter windows with different protection levels.
 */
export interface JupiterTransitWindow {
  jupiterSign: number;
  jupiterSignName: string;
  /**
   * Clamped entry date — Jupiter's entry into this sign, clamped to the
   * selected period's start/end window for display purposes.
   */
  startDate: Date;
  /**
   * Clamped exit date — Jupiter's exit from this sign, clamped to the
   * selected period's start/end window for display purposes.
   */
  exitDate: Date;
  /**
   * Unclamped entry date — Jupiter's actual sign entry regardless of the
   * selected period's boundaries. Used in summary sentences so the date
   * range shown reflects Jupiter's real tenure in the sign.
   */
  rawEntryDate: Date;
  /**
   * Unclamped exit date — Jupiter's actual sign exit regardless of the
   * selected period's boundaries. Used in summary sentences so the date
   * range shown reflects Jupiter's real tenure in the sign.
   */
  rawExitDate: Date;
  /** Jupiter's 5th/7th/9th aspect reaches natal Moon sign */
  aspectsMoon: boolean;
  /** Jupiter's 5th/7th/9th aspect reaches Saturn's current transit sign */
  aspectsSaturnTransit: boolean;
  /** Jupiter's 5th/7th/9th aspect reaches natal Saturn sign */
  aspectsNatalSaturn: boolean;
  /**
   * strong   — aspects both Moon and Saturn's transit sign
   * moderate — aspects one of Moon or Saturn
   * weak     — Jupiter exalted or own sign but no aspect
   * none     — no relevant aspect
   */
  protectionStrength: 'strong' | 'moderate' | 'weak' | 'none';
  /** One-line plain-language description for the UI */
  description: string;
}

/**
 * Factor 8: Saturn's aspects from its transit sign during this period.
 * Saturn aspects the 3rd, 7th, and 10th houses from its position (Vedic).
 */
export interface SaturnAspectInfo {
  /** Saturn's house from natal Lagna during this transit */
  houseFromLagna: number;
  /** Positive for houses 3/6/10/11, challenging for 8/12, neutral otherwise */
  saturnHouseEffect: 'positive' | 'neutral' | 'challenging';
  /** The three houses Saturn aspects: [3rd aspect house, 7th, 10th] */
  aspectsHouses: number[];
  /** Life domains activated by the aspected houses — plain English */
  lifeDomainsAffected: string[];
}

/**
 * Factor 10: What this cycle position means in the context of a lifetime.
 * The first Sade Sati is about education and foundations;
 * the second about career and identity; the third about health and legacy.
 */
export interface CycleMeaning {
  cycleNumber: 1 | 2 | 3;
  /** Person's age when this period starts */
  ageAtStart: number;
  ageGroup: 'early_life' | 'mid_life' | 'later_life';
  /** One-sentence contextual meaning for this cycle in this person's life */
  cycleMeaning: string;
  /** What life areas are typically most affected in this cycle */
  focusAreas: string[];
}

// ═══════════════════════════════════════════════════════════════════
// OUTPUT — what the engine returns
// ═══════════════════════════════════════════════════════════════════

/**
 * One timing window in the UI's "When is it hardest?" section.
 * This is a merged, user-facing view that combines dasha activation,
 * degree activation, and Jupiter protection into a single calendar window.
 */
export interface TimingWindow {
  /** Display label — e.g. "Jan–Jun 2047 · Age 54–55" */
  label: string;
  intensity: 'hardest' | 'pressured' | 'easing' | 'neutral';
  /** 2–3 sentence plain-language description */
  description: string;
}

/**
 * The three left-border guidance cards in the "What to do" section.
 */
export interface GuidanceContent {
  /** Bullet points for the "Avoid" (danger) card */
  avoid: string[];
  /** Time window label for the avoid card — e.g. "early 2047" */
  avoidWindow: string;
  /** Bullet points for the "Use this window" (success) card */
  build: string[];
  /** Time window label for the build card — e.g. "Dec 2047–Dec 2048" */
  buildWindow: string;
  /** Bullet points for the "Throughout" (info) card */
  practices: string[];
}

/**
 * Three-dimensional intensity breakdown — replaces the single "Intense" label.
 * Each dimension rates on a 0–4 scale mapped to a display string.
 */
export interface DimensionalIntensity {
  emotional:   'very_high' | 'high' | 'moderate' | 'low';
  structural:  'very_high' | 'high' | 'moderate' | 'low';
  external:    'very_high' | 'high' | 'moderate' | 'low';
  /** One-line reason for each dimension — shown as tooltip / subtitle */
  emotionalReason:   string;
  structuralReason:  string;
  externalReason:    string;
}

/**
 * Early / mid / late phase narrative — answers "how does this period unfold?"
 */
export interface PhaseProgression {
  early:  string;   // First ~30% of the period
  mid:    string;   // Middle ~40%
  late:   string;   // Final ~30%
  /** Approximate calendar window labels for each phase */
  earlyWindow: string;
  midWindow:   string;
  lateWindow:  string;
}

/**
 * At-a-glance window summary — three key dates the user needs to know.
 */
export interface WindowSummary {
  bestWindow:    { label: string; reason: string };
  highestRisk:   { label: string; reason: string };
  reviewPhase?:  { label: string; reason: string };
}


export interface LifeAreaItem {
  /** Short label — e.g. "Identity & health" — shown in uppercase */
  label: string;
  /** 1–2 sentence description specific to this chart + period */
  description: string;
}

/**
 * The complete result of analyzeSadeSatiPeriod().
 * Maps directly to the six sections in PeriodDetailView:
 *   - Header:          period, overallIntensity, plainTitle
 *   - Summary:         summary
 *   - What to do:      guidance
 *   - When hardest:    timingWindows
 *   - Which areas:     lifeAreaItems
 *   - Astro details:   all remaining fields (moonStrength, saturnStrength,
 *                      dashaWindows, jupiterWindows, saturnAspects, etc.)
 */
export interface PeriodAnalysisResult {
  // ── Identity ─────────────────────────────────────────────────────
  period: SelectedPeriod;
  houseFromMoon: number;

  /** Plain-language title — e.g. "The most intense phase of Sade Sati" */
  plainTitle: string;

  // ── Factor 1 + 2: Saturn behavior ────────────────────────────────
  saturnBehavior: {
    totalPasses: number;
    pattern: 'single_pass' | 'double_pass' | 'triple_pass';
  };

  // ── Factor 3: Dasha hierarchy ─────────────────────────────────────
  /** All dasha windows overlapping this period, Maha → Sookshma */
  dashaWindows: DashaHierarchyWindow[];
  /** Subset of dashaWindows where isActivated = true */
  mostActivatedWindows: DashaHierarchyWindow[];

  // ── Factor 4: Degree activations ─────────────────────────────────
  activationWindows: ActivationWindow[];

  // ── Factor 5: Nakshatra triggers ─────────────────────────────────
  nakshatraTriggers: NakshatraTriggerWindow[];

  // ── Factor 6: Retrograde ─────────────────────────────────────────
  retrogradeInfo: {
    hasRetrograde: boolean;
    touchCount: number;
    pattern: string;
    /** Date ranges when Saturn re-crosses the same degrees */
    reviewPeriods: Array<{ start: Date; end: Date; description: string }>;
  };

  // ── Factors 7 + 9: Jupiter ───────────────────────────────────────
  /** One entry per Jupiter sign change within the period */
  jupiterWindows: JupiterTransitWindow[];
  jupiterSummary: {
    /** The Jupiter window with the strongest protection */
    bestProtectedPeriod?: JupiterTransitWindow;
    /** The Jupiter window with no protection */
    leastProtectedPeriod?: JupiterTransitWindow;
  };

  // ── Factor 8: Saturn aspects ─────────────────────────────────────
  saturnAspects: SaturnAspectInfo;

  // ── Factor 10: Cycle meaning ─────────────────────────────────────
  cycleMeaning: CycleMeaning;

  // ── Factor 11: Life areas ─────────────────────────────────────────
  lifeAreaItems: LifeAreaItem[];

  // ── Planetary strength (from strengthAnalyzer.ts) ─────────────────
  moonStrength: StrengthAssessment;
  saturnStrength: StrengthAssessment;

  // ── Overall assessment ────────────────────────────────────────────
  overallIntensity: 'very_intense' | 'intense' | 'moderate' | 'mild' | 'very_mild';
  /** Three-dimensional intensity breakdown replacing the single "Intense" label */
  dimensionalIntensity: DimensionalIntensity;

  // ── UI-ready narrative (template-generated, no AI) ────────────────
  /** 2–3 sentence plain-language summary paragraph */
  summary: string;
  /** 3–4 merged calendar windows for "When is it hardest?" section */
  timingWindows: TimingWindow[];
  /** Three left-border guidance cards */
  guidance: GuidanceContent;
  /** Early / mid / late phase narrative */
  phaseProgression: PhaseProgression;
  /** At-a-glance window summary */
  windowSummary: WindowSummary;
  /** Confidence basis shown below the header */
  confidenceBasis: string;
}

// ═══════════════════════════════════════════════════════════════════
// API SHAPES
// ═══════════════════════════════════════════════════════════════════

/** Request body for POST /api/transits/saturn/period-analysis */
export interface PeriodAnalysisRequestBody {
  selectedPeriod: SelectedPeriod;
  planets: Record<string, import('@/types/astrology').PlanetData>;
  ascendant: import('@/types/astrology').AscendantData;
  birthDateUtc: string;
  moonLongitude: number;
  elapsedFractionOfNakshatra: number;
  nakshatraLord: string;
}

/** Narrow DB row shape returned by getJupiterTransitsFromDB */
export interface JupiterDBRow {
  sign: number;
  signName: string;
  entryDate: Date;
  exitDate: Date;
}
