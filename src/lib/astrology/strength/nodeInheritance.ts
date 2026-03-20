/**
 * Node Inheritance Engine — Rahu/Ketu (spec §8) v3
 *
 * Correction 1: Dispositor contribution uses real functionalNature, functionalLean,
 *   conditionGrade, and deliveryGrade as direct causal inputs — not structural+delivery averages.
 *
 * Correction 2: inheritedToDelivery() allows 'delayed' for strongly supported nodes.
 *   'reliable' remains unavailable (nodes are always unconventional).
 *   Unconventionality is expressed in notes/tags, not as a hard delivery cap at 'inconsistent'.
 *
 * Correction 3: houseContrib uses real Rahu/Ketu house-context scores (Parashari conventions).
 *   Rahu favors 3, 6, 10, 11. Ketu favors 12, 9, 6, 3. Both weak in 8th.
 *   housePosition is now a required parameter.
 */

import type {
  NodeInheritance, ConditionGrade, DeliveryGrade,
  FunctionalNature, FunctionalLean,
} from './types';
import type { PlanetData } from '@/types/astrology';
import { getSimpleDignity, getPositionalScore } from './dignityEngine';
import { getLordOfSignPublic } from './functionalNature';
import { degreeDiff, conjSeverity } from './aspectEngine';

// ─── Minimal pre-computed shape needed from Phase A ──────────────────────────

interface PrecomputedShape {
  structuralScore: number;
  conditionScore: number;
  conditionGrade: ConditionGrade;
  deliveryGrade: DeliveryGrade;
  deliveryScore: number;
  functionalNature: FunctionalNature;
  functionalLean: FunctionalLean;
}

// ─── Conversion utilities ─────────────────────────────────────────────────────

/**
 * Correction 1: Functional nature → orientation score (0–100).
 * This represents how aligned the dispositor is with constructive expression.
 * yogakaraka dispositor → node gets directed toward dharmic, constructive output.
 * malefic dispositor → node channels harsh, difficult energy.
 */
function fnToOrientation(fn: FunctionalNature, lean: FunctionalLean): number {
  switch (fn) {
    case 'yogakaraka':     return 92;
    case 'strong_benefic': return 80;
    case 'benefic':        return 70;
    case 'mixed':
      if (lean === 'benefic_lean' || lean === 'protective_with_complication') return 60;
      if (lean === 'neutral_lean')   return 50;
      if (lean === 'maraka_driven')  return 40;
      if (lean === 'malefic_lean')   return 35;
      return 50;
    case 'neutral': return 50;
    case 'malefic': return 20;
    default: return 50;
  }
}

function condToComponent(grade: ConditionGrade): number {
  return { supported:90, clean:75, afflicted:45, heavily_afflicted:20, distorted:5 }[grade];
}

function delivToReliability(grade: DeliveryGrade): number {
  return { reliable:90, delayed:70, inconsistent:50, distorted_delivery:30, obstructed:10 }[grade];
}

function conditionToScore(grade: ConditionGrade): number {
  return { supported:20, clean:10, afflicted:-10, heavily_afflicted:-30, distorted:-50 }[grade];
}

// ─── Correction 2: inheritedToDelivery ───────────────────────────────────────
/**
 * Nodes are inherently unconventional. However, a strongly supported node
 * is NOT forced into 'inconsistent' — it can reach 'delayed'.
 * 'reliable' is never available for nodes (unconventional delivery is intrinsic).
 * Unconventionality is expressed via agendaThemes and psychologicalTone, not grade cap.
 */
function inheritedToDelivery(score: number, condition: ConditionGrade): DeliveryGrade {
  if (condition === 'distorted')         return 'obstructed';
  if (condition === 'heavily_afflicted') return 'distorted_delivery';

  // Strongly supported node: 'delayed' is the ceiling (not 'reliable')
  if (score >= 72 && (condition === 'supported'))  return 'delayed';
  if (score >= 65 && (condition === 'clean'))       return 'delayed';

  // Moderate support
  if (score >= 50) return 'inconsistent';
  if (score >= 32) return 'distorted_delivery';
  return 'obstructed';
}

// ─── Correction 3: Node house-context scores ─────────────────────────────────
/**
 * Parashari-based house quality for Rahu and Ketu.
 * Rahu: malefic by nature → thrives in upachaya (3, 6, 10, 11) and kendra (10, 1).
 *        Difficult in 4, 5, 8, 9, 12 (inner/spiritual/home/children houses).
 * Ketu: detachment karaka → thrives in spiritual (12, 9), service (6), initiative (3).
 *        Difficult in 1, 2, 5, 8, 10, 11 (material/worldly achievement houses).
 */
const RAHU_HOUSE_SCORES: Record<number, number> = {
  1: 58,   // Self: Rahu amplifies self-expression, creates restlessness
  2: 42,   // Wealth: desire for wealth but instability in family/speech
  3: 78,   // Courage/enterprise: Rahu excels here — initiative, travel
  4: 35,   // Home/mother: disturbs domestic peace
  5: 38,   // Children/creativity: obsessive creativity, children complications
  6: 72,   // Enemies/service: Rahu conquers through unconventional means
  7: 50,   // Partnership: foreign/unusual partnerships, some difficulty
  8: 35,   // Transformation: intensifies but often in crisis mode
  9: 45,   // Fortune/dharma: disrupts traditions, foreign philosophy
  10: 70,  // Career: strong for unconventional/foreign career paths
  11: 78,  // Gains: excellent — Rahu channels ambition into gains
  12: 40,  // Liberation: foreign connection but not peaceful
};

const KETU_HOUSE_SCORES: Record<number, number> = {
  1:  40,  // Self: dissociation, identity crisis
  2:  40,  // Wealth: detachment from wealth/family
  3:  62,  // Courage: renunciation of effort; research, investigation
  4:  55,  // Home: inner detachment; some ascetic quality at home
  5:  42,  // Children: complications; past-life karma with children
  6:  68,  // Service: excellent for healing, spiritual service
  7:  48,  // Partnership: detachment or unusual partners
  8:  38,  // Transformation: intense past-life karma, health concerns
  9:  72,  // Fortune/dharma: spirituality, higher wisdom — Ketu excels
  10: 42,  // Career: detachment from status; spiritual career possible
  11: 42,  // Gains: detachment from worldly gains
  12: 78,  // Liberation: moksha karaka — Ketu's highest natural placement
};

function getNodeHouseScore(planet: string, housePosition: number): number {
  if (planet === 'Rahu') return RAHU_HOUSE_SCORES[housePosition] ?? 50;
  if (planet === 'Ketu') return KETU_HOUSE_SCORES[housePosition] ?? 50;
  return 50;
}

// ─── Main function ────────────────────────────────────────────────────────────

export function computeNodeInheritance(
  planet: string,
  signNumber: number,
  longitude: number,
  housePosition: number,                              // Correction 3 — required
  allPlanets: Record<string, PlanetData>,
  precomputedPlanets?: Record<string, PrecomputedShape>
): NodeInheritance {
  // ── Pillar 1: Dispositor (45%) ────────────────────────────────────────────
  const dispositorName = getLordOfSignPublic(signNumber);
  const precomp        = precomputedPlanets?.[dispositorName];
  const dispData       = allPlanets[dispositorName] as PlanetData | undefined;

  let dispositorStructural:    number;
  let dispositorConditionScore: number;
  let dispositorConditionGrade: ConditionGrade;
  let dispositorFunctional:    FunctionalNature;
  let dispositorFunctionalLean: FunctionalLean;
  let dispositorDelivery:      DeliveryGrade;

  if (precomp) {
    // Correction 1: use REAL values from Phase A
    dispositorStructural     = precomp.structuralScore;
    dispositorConditionScore = precomp.conditionScore;
    dispositorConditionGrade = precomp.conditionGrade;
    dispositorFunctional     = precomp.functionalNature;
    dispositorFunctionalLean = precomp.functionalLean;
    dispositorDelivery       = precomp.deliveryGrade;
  } else if (dispData) {
    const dig                = getSimpleDignity(dispositorName, dispData.signNumber);
    dispositorStructural     = getPositionalScore(dig);
    dispositorConditionScore = dispData.combust ? -20 : dispData.debilitated ? -15 : 0;
    dispositorConditionGrade = conditionScoreToGrade(dispositorConditionScore);
    dispositorFunctional     = dispositorStructural >= 75 ? 'benefic' : dispositorStructural <= 25 ? 'malefic' : 'mixed';
    dispositorFunctionalLean = 'neutral_lean';
    dispositorDelivery       = 'inconsistent';
  } else {
    dispositorStructural     = 45;
    dispositorConditionScore = 0;
    dispositorConditionGrade = 'clean';
    dispositorFunctional     = 'neutral';
    dispositorFunctionalLean = 'neutral_lean';
    dispositorDelivery       = 'inconsistent';
  }

  /**
   * Correction 1: Dispositor contribution uses 4 equal components:
   * structural force + functional orientation + condition purity + delivery reliability
   * Each is mapped to 0-100, then averaged, then weighted at 45%.
   */
  const fnOrientation  = fnToOrientation(dispositorFunctional, dispositorFunctionalLean);
  const condPurity     = condToComponent(dispositorConditionGrade);
  const delivReliab    = delivToReliability(dispositorDelivery);

  const dispositorAvg  = (dispositorStructural + fnOrientation + condPurity + delivReliab) / 4;
  const dispositorContrib = dispositorAvg * 0.45;

  // ── Pillar 2: Nakshatra lord (25%) ────────────────────────────────────────
  const planetData     = allPlanets[planet] as PlanetData | undefined;
  const nakshatraLord  = planetData?.kp?.nakshatraLord ?? 'Unknown';
  const nlPrecomp      = precomputedPlanets?.[nakshatraLord];
  const nlData         = allPlanets[nakshatraLord] as PlanetData | undefined;

  let nakshatraStructural:    number;
  let nakshatraDeliveryScore: number;

  if (nlPrecomp) {
    nakshatraStructural     = nlPrecomp.structuralScore;
    nakshatraDeliveryScore  = nlPrecomp.deliveryScore;
  } else if (nlData) {
    const nlDig             = getSimpleDignity(nakshatraLord, nlData.signNumber);
    nakshatraStructural     = Math.max(0, Math.min(100,
      getPositionalScore(nlDig) + (nlData.combust ? -15 : 0) + (nlData.debilitated ? -10 : 0)));
    nakshatraDeliveryScore  = delivToReliability('inconsistent');
  } else {
    nakshatraStructural     = 45;
    nakshatraDeliveryScore  = 50;
  }

  const nakshatraAvg   = (nakshatraStructural + nakshatraDeliveryScore) / 2;
  const nakshatraContrib = nakshatraAvg * 0.25;

  // ── Pillar 3: Conjunction partner (20%) ───────────────────────────────────
  let conjPartner:       string | undefined;
  let conjPartnerScore:  number | undefined;
  let conjContrib      = 50 * 0.20;
  let minOrb           = 999;

  for (const [name, data] of Object.entries(allPlanets)) {
    if (name === planet || name === 'Ascendant') continue;
    const pd = data as PlanetData;
    if (pd.signNumber !== signNumber) continue;
    const orb = degreeDiff(longitude, pd.longitude);
    if (orb < minOrb) {
      minOrb = orb;
      conjPartner = name;
      const partnerPrecomp = precomputedPlanets?.[name];
      conjPartnerScore = partnerPrecomp?.deliveryScore
        ?? getPositionalScore(getSimpleDignity(name, pd.signNumber));
    }
  }

  if (conjPartner && conjPartnerScore !== undefined && minOrb <= 12) {
    const { mult } = conjSeverity(minOrb);
    conjContrib = (conjPartnerScore * mult + 50 * (1 - mult)) * 0.20;
  }

  // ── Pillar 4: House/sign context (10%) — Correction 3 ────────────────────
  const houseScore   = getNodeHouseScore(planet, housePosition);
  const houseContrib = houseScore * 0.10;

  // ── Aggregate ─────────────────────────────────────────────────────────────
  const inherited  = Math.max(0, Math.min(100, Math.round(dispositorContrib + nakshatraContrib + conjContrib + houseContrib)));

  // Inherited condition: weighted blend of dispositor + nakshatra condition
  const avgCondScore = dispositorConditionScore * 0.60 + conditionToScore(
    nlPrecomp ? nlPrecomp.conditionGrade : 'clean'
  ) * 0.40;
  const inheritedCondition    = conditionScoreToGrade(avgCondScore);
  // Correction 2: allow 'delayed' for well-supported nodes
  const inheritedReliability  = inheritedToDelivery(inherited, inheritedCondition);

  const isRahu   = planet === 'Rahu';
  const distorted = inherited < 45;

  return {
    dispositorName,
    dispositorStructuralScore:   dispositorStructural,
    dispositorConditionScore,
    dispositorConditionGrade,
    dispositorFunctionalNature:  dispositorFunctional,
    dispositorFunctionalLean,
    dispositorDeliveryGrade:     dispositorDelivery,
    nakshatraLordName: nakshatraLord,
    nakshatraLordScore: nakshatraStructural,
    conjunctionPartner: conjPartner,
    conjunctionPartnerScore: conjPartnerScore,
    inheritedSupportScore: inherited,
    inheritedCondition,
    inheritedReliability,
    houseContextScore: houseScore,
    amplificationTendency:         isRahu ? 0.8 : 0.3,
    distortionTendency:            distorted ? 0.7 : 0.3,
    obsessionTendency:             isRahu ? 0.7 : 0.2,
    spiritualizationTendency:      isRahu ? 0.2 : 0.8,
    foreignUnconventionalTendency: isRahu ? 0.8 : 0.3,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function conditionScoreToGrade(score: number): ConditionGrade {
  if (score >= 15)  return 'supported';
  if (score >= 0)   return 'clean';
  if (score >= -20) return 'afflicted';
  if (score >= -40) return 'heavily_afflicted';
  return 'distorted';
}
