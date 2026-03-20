/**
 * Condition Grade Engine — Layer 3 v3
 *
 * Nodes: conditionFromNodeInheritance() is the SINGLE source of node condition.
 * assessCondition() returns a neutral placeholder for Rahu/Ketu — the assembler
 * overwrites it with conditionFromNodeInheritance after inheritance is computed.
 *
 * Correction 4: conditionFromNodeInheritance uses a nuanced score mapping instead
 * of the flat `inheritedSupportScore - 50`.
 *
 * Rules:
 * - Ceiling for node conditionScore is capped at +12 (nodes cannot be as clean as
 *   a regular exalted planet — inherent instability is structural to their nature)
 * - distortionTendency scales a proportional drag (not a separate full penalty)
 * - amplificationTendency adds minor uncertainty even when positive
 * - spiritualizationTendency softens Ketu's condition slightly (Ketu's energy is
 *   not dirty — it is dissociative, which is different from afflicted)
 * - Anti-double-counting: distortionTendency is already a PRODUCT of the inherited
 *   support score (distorted = inherited < 45). We apply it as a shaping modifier
 *   only — it does not double-penalize the same fact.
 */

import type { ConditionGrade, DistortionFlag } from './types';
import type { NodeInheritance } from './types';
import type { PlanetData } from '@/types/astrology';
import {
  getAspectInfo, getConjunctions, buildDistortionFlags,
  getWeightedConjunctionScore, getWeightedAspectScore,
} from './aspectEngine';

export interface ConditionAssessment {
  conditionScore: number;
  conditionGrade: ConditionGrade;
  afflictions: string[];
  protections: string[];
  distortionFlags: DistortionFlag[];
}

// ─── Standard planet condition ────────────────────────────────────────────────

export function assessCondition(
  planet: string,
  signNumber: number,
  degreeInSign: number,
  dignityLevel: import('./types').DignityLevel,
  isCombust: boolean,
  combustOrb: number | undefined,
  isVargottama: boolean,
  housePosition: number,
  allPlanets: Record<string, PlanetData>,
  moonLongitude?: number,
  sunLongitude?: number
): ConditionAssessment {
  // Nodes: return neutral placeholder. Assembler will call conditionFromNodeInheritance.
  if (planet === 'Rahu' || planet === 'Ketu') {
    return { conditionScore:0, conditionGrade:'clean', afflictions:[], protections:[], distortionFlags:[] };
  }

  const afflictions: string[] = [], protections: string[] = [];
  let score = 0;

  // ── Combustion — degree-sensitive ─────────────────────────────────────────
  if (isCombust && planet !== 'Sun') {
    const orb = combustOrb ?? 10;
    if (orb <= 3) {
      score -= 28; afflictions.push(`Very close combust (${orb.toFixed(1)}°) — eclipsed by Sun`);
    } else if (orb <= 6) {
      score -= 20; afflictions.push(`Strong combust (${orb.toFixed(1)}°) — overshadowed`);
    } else if (orb <= 9) {
      score -= 12; afflictions.push(`Mild combust (${orb.toFixed(1)}°) — stressed but functional`);
    } else {
      score -= 5;  afflictions.push(`Weak combust (${orb.toFixed(1)}°) — minimal shadow`);
    }
  }

  // ── Conjunctions — degree-weighted ───────────────────────────────────────
  const targetLon = (allPlanets[planet] as PlanetData | undefined)?.longitude
    ?? ((signNumber - 1) * 30 + degreeInSign);
  const conjResult = getWeightedConjunctionScore(planet, targetLon, allPlanets);
  score += conjResult.score;
  afflictions.push(...conjResult.afflictions);
  protections.push(...conjResult.protections);

  // ── Aspects — degree-sensitive ────────────────────────────────────────────
  const aspectResult = getWeightedAspectScore(planet, signNumber, targetLon, allPlanets);
  score += aspectResult.score;
  afflictions.push(...aspectResult.afflictions);
  protections.push(...aspectResult.protections);

  // ── Vargottama ────────────────────────────────────────────────────────────
  if (isVargottama) {
    score += 15;
    protections.push('Vargottama — same sign D1 and D9, stabilized expression');
  }

  // ── Moon Paksha Bala ──────────────────────────────────────────────────────
  if (planet === 'Moon' && moonLongitude !== undefined && sunLongitude !== undefined) {
    const diff = (moonLongitude - sunLongitude + 360) % 360;
    const isWaxing = diff > 0 && diff < 180;
    if (isWaxing) { score += 10; protections.push('Waxing Moon — Paksha Bala active'); }
    else          { score -= 5;  afflictions.push('Waning Moon — reduced Paksha Bala'); }
  }

  const conj    = getConjunctions(planet, signNumber, allPlanets);
  const aspects = getAspectInfo(planet, signNumber, allPlanets);
  const distortionFlags = buildDistortionFlags(planet, isCombust, conj, aspects, housePosition);

  return { conditionScore:score, conditionGrade:scoreToGrade(score), afflictions, protections, distortionFlags };
}

// ─── Node condition from inheritance — Correction 4 ──────────────────────────

/**
 * Maps `inheritedSupportScore` (0–100) to a conditionScore using a non-linear
 * curve that reflects node-specific nature:
 *
 * - Nodes with high support score: capped at +12 (not +25 like benefic-conjunct planets)
 *   because even well-supported nodes carry inherent instability
 * - distortionTendency applies as a proportional drag on the score.
 *   Anti-double-counting: it is NOT added as a separate penalty on top of
 *   the inherited score — it shapes how we interpret the same score.
 * - spiritualizationTendency (Ketu) softens slightly — Ketu is dissociative,
 *   not afflicted. It should not read as dirty condition at moderate support.
 * - amplificationTendency (Rahu) adds a small noise term — even clean Rahu
 *   creates some unpredictability in condition.
 *
 * Grade remains driven by inheritedCondition (from node inheritance), not
 * by this score alone — the grade is the authoritative output, score is for
 * comparative purposes and delivery input.
 */
export function conditionFromNodeInheritance(
  planet: string,
  signNumber: number,
  longitude: number,
  housePosition: number,
  nodeInheritance: NodeInheritance,
  allPlanets: Record<string, PlanetData>
): ConditionAssessment {
  const afflictions: string[] = [];
  const protections: string[] = [];

  const {
    dispositorName, dispositorStructuralScore, dispositorConditionGrade,
    dispositorFunctionalNature, dispositorFunctionalLean,
    dispositorDeliveryGrade, nakshatraLordName, nakshatraLordScore,
    inheritedSupportScore, inheritedCondition,
    distortionTendency, amplificationTendency, spiritualizationTendency,
    conjunctionPartner, conjunctionPartnerScore,
  } = nodeInheritance;

  // ── Build condition narrative ─────────────────────────────────────────────

  // Dispositor quality
  if (dispositorStructuralScore >= 75) {
    const fnNote = dispositorFunctionalNature === 'yogakaraka' ? ' (yogakaraka — directed toward dharmic output)'
                 : dispositorFunctionalNature === 'malefic' ? ' (malefic — channels harsh energy despite strength)'
                 : '';
    protections.push(`Dispositor ${dispositorName} strong (${dispositorStructuralScore}/100)${fnNote}`);
  } else if (dispositorStructuralScore <= 25) {
    afflictions.push(`Dispositor ${dispositorName} weak (${dispositorStructuralScore}/100) — unstable, distorted expression`);
  } else if (dispositorStructuralScore <= 40) {
    afflictions.push(`Dispositor ${dispositorName} below average (${dispositorStructuralScore}/100)`);
  }

  // Dispositor condition quality
  if (dispositorConditionGrade === 'supported' || dispositorConditionGrade === 'clean') {
    protections.push(`Dispositor ${dispositorName} condition: ${dispositorConditionGrade} — node channels cleanly`);
  } else if (dispositorConditionGrade === 'heavily_afflicted' || dispositorConditionGrade === 'distorted') {
    afflictions.push(`Dispositor ${dispositorName} is ${dispositorConditionGrade.replace('_',' ')} — node inherits that instability directly`);
  } else if (dispositorConditionGrade === 'afflicted') {
    afflictions.push(`Dispositor ${dispositorName} is afflicted — node expression complicated`);
  }

  // Dispositor delivery quality
  if (dispositorDeliveryGrade === 'obstructed' || dispositorDeliveryGrade === 'distorted_delivery') {
    afflictions.push(`Dispositor ${dispositorName} delivery: ${delivLabel(dispositorDeliveryGrade)} — node inherits delivery problems`);
  } else if (dispositorDeliveryGrade === 'reliable') {
    protections.push(`Dispositor ${dispositorName} delivers reliably — node gets directed expression`);
  }

  // Nakshatra lord
  if (nakshatraLordScore >= 70) {
    protections.push(`Star lord ${nakshatraLordName} strong (${nakshatraLordScore}/100) — coherent sub-direction`);
  } else if (nakshatraLordScore <= 30) {
    afflictions.push(`Star lord ${nakshatraLordName} weak (${nakshatraLordScore}/100) — scattered, instability in themes`);
  }

  // Conjunction partner
  if (conjunctionPartner && conjunctionPartnerScore !== undefined) {
    if (conjunctionPartnerScore >= 70) {
      protections.push(`Conjunct ${conjunctionPartner} (strong, ${conjunctionPartnerScore}/100) — amplifies positive themes`);
    } else if (conjunctionPartnerScore <= 25) {
      afflictions.push(`Conjunct ${conjunctionPartner} (weak, ${conjunctionPartnerScore}/100) — harsh or distorted amplification`);
    }
  }

  // Jupiter aspect protection
  const aspects = getAspectInfo(planet, signNumber, allPlanets);
  if (aspects.hasJupiterAspect) {
    protections.push(`Jupiter aspects ${planet} — contains and guides nodal energy`);
  }

  const conj = getConjunctions(planet, signNumber, allPlanets);
  const distortionFlags = buildDistortionFlags(planet, false, conj, aspects, housePosition);

  // ── Correction 4: nuanced conditionScore ─────────────────────────────────
  //
  // Step 1: map inheritedSupportScore (0–100) to a base using a softer curve.
  //   Midpoint 50 → score 0; 100 → score +12 (cap); 0 → score -40.
  //   This is not linear: nodes in the upper range are capped earlier than regular planets.
  let baseScore: number;
  if (inheritedSupportScore >= 50) {
    // Above neutral: +0 to +12 (capped — nodes cannot be as clean as a pure strong planet)
    baseScore = Math.round((inheritedSupportScore - 50) / 50 * 12);
  } else {
    // Below neutral: 0 to -40 (steeper curve below midpoint)
    baseScore = Math.round((inheritedSupportScore - 50) / 50 * 40);
  }

  // Step 2: apply distortionTendency as a SHAPING modifier only.
  // Anti-double-counting: distortionTendency is already a function of inheritedSupportScore.
  // We use it only to shift the score WITHIN the range already implied by the base,
  // not as an additive standalone penalty.
  // Effect: at distortionTendency = 0.7, reduce positive by 30% and amplify negative by 15%.
  const distortDrag = distortionTendency;
  if (baseScore > 0) {
    baseScore = Math.round(baseScore * (1 - distortDrag * 0.30));
  } else {
    baseScore = Math.round(baseScore * (1 + distortDrag * 0.15));
  }

  // Step 3: spiritualizationTendency (Ketu) softens condition.
  // Ketu's energy is dissociative, not dirty. At high spiritualization, slightly lift score.
  if (spiritualizationTendency > 0.5 && baseScore < 0) {
    const softening = Math.round(spiritualizationTendency * 4);
    baseScore = Math.min(0, baseScore + softening); // can soften to 0, not above
  }

  // Step 4: amplificationTendency (Rahu) adds small noise/uncertainty.
  // Even a clean Rahu creates some condition unpredictability.
  if (amplificationTendency > 0.5 && baseScore > 0) {
    const noise = Math.round(amplificationTendency * 3);
    baseScore = Math.max(0, baseScore - noise);
  }

  const conditionScore = Math.max(-50, Math.min(12, baseScore));

  return {
    conditionScore,
    conditionGrade: inheritedCondition, // grade is authoritative from node inheritance
    afflictions,
    protections,
    distortionFlags,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreToGrade(score: number): import('./types').ConditionGrade {
  if (score >= 20)  return 'supported';
  if (score >= 0)   return 'clean';
  if (score >= -25) return 'afflicted';
  if (score >= -50) return 'heavily_afflicted';
  return 'distorted';
}

function delivLabel(grade: import('./types').DeliveryGrade): string {
  return { reliable:'reliable', delayed:'delayed', inconsistent:'inconsistent',
           distorted_delivery:'distorted', obstructed:'obstructed' }[grade] ?? grade;
}
