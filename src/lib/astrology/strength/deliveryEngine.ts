/**
 * Delivery Engine — Layer 6: Weighted Delivery Score (spec §6)
 *
 * Score = structural(35%) + condition(25%) + varga(20%) + functional(10%) + placement(10%)
 * Plus modifiers: combustion, retrograde, D9, NB, nakshatra, dominant override
 * Grade: 78+=reliable, 60-77=delayed, 42-59=inconsistent, 25-41=distorted, <25=obstructed
 *
 * v2 changes:
 * - NB recovery: removes 40-60% of ACTUAL debility delivery penalty (not structuralScore * 0.5)
 *   Actual penalty = difference between moderate baseline (18) and current strComp
 *   Plus: contextual grade upgrade if condition is clean and D9 supports
 * - D9 sensitivity: for lagna lord, Venus, Jupiter, 7th lord:
 *   D9 contradiction caps delivery grade at 'inconsistent' (cannot be reliable/delayed)
 *   D9 confirmation gives stronger boost
 */

import type {
  StructuralGrade, ConditionGrade, FunctionalNature, FunctionalLean,
  DeliveryGrade, VargaAssessment,
} from './types';

// ── Component score mappings (spec §6) ────────────────────────────────────────

const STRUCTURAL_MAP: Record<StructuralGrade, number> = {
  very_strong:35, strong:28, moderate:18, weak:8, very_weak:0,
};

// Baseline a debilitated planet "would have" at neutral dignity in same house
// This is used for NB penalty calculation
const MODERATE_BASELINE = 18; // strComp for 'moderate' structural grade

const CONDITION_MAP: Record<ConditionGrade, number> = {
  supported:25, clean:20, afflicted:10, heavily_afflicted:3, distorted:0,
};

function vargaComponentScore(v: VargaAssessment): number {
  if (v.vargaStatus === 'confirmed'    && v.vargaConfidence === 'high')     return 20;
  if (v.vargaStatus === 'confirmed'    && v.vargaConfidence === 'moderate') return 16;
  if (v.vargaStatus === 'mixed'        && v.vargaConfidence === 'high')     return 12;
  if (v.vargaStatus === 'mixed'        && v.vargaConfidence === 'moderate') return 10;
  if (v.vargaStatus === 'contradicted' && v.vargaConfidence === 'moderate') return 5;
  if (v.vargaStatus === 'contradicted' && v.vargaConfidence === 'low')      return 0;
  return 8;
}

function functionalComponentScore(fn: FunctionalNature, lean: FunctionalLean): number {
  if (fn === 'yogakaraka')     return 10;
  if (fn === 'strong_benefic') return 8;
  if (fn === 'benefic')        return 7;
  if (fn === 'mixed') {
    if (lean === 'benefic_lean' || lean === 'protective_with_complication') return 5;
    if (lean === 'neutral_lean')   return 4;
    if (lean === 'maraka_driven')  return 3;
    if (lean === 'malefic_lean')   return 2;
    return 4;
  }
  if (fn === 'neutral') return 4;
  if (fn === 'malefic') return 2;
  return 4;
}

function placementComponentScore(housePosition: number, isMaraka: boolean): number {
  const base: Record<number,number> = {
    1:10, 4:9, 7:8, 10:10, 5:9, 9:8, 3:3, 11:2, 2:4, 6:2, 8:-4, 12:-4,
  };
  let s = base[housePosition] ?? 5;
  if (isMaraka && (housePosition === 2 || housePosition === 7)) s -= 2;
  if ([8,12].includes(housePosition)) s -= 2;
  return Math.max(-6, s);
}

function gradeFromScore(score: number): DeliveryGrade {
  if (score >= 78) return 'reliable';
  if (score >= 60) return 'delayed';
  if (score >= 42) return 'inconsistent';
  if (score >= 25) return 'distorted_delivery';
  return 'obstructed';
}

export function computeDelivery(params: {
  planet: string;
  structuralGrade: StructuralGrade;
  conditionGrade: ConditionGrade;
  vargaAssessment: VargaAssessment;
  functionalNature: FunctionalNature;
  functionalLean: FunctionalLean;
  housePosition: number;
  isMaraka: boolean;
  isRetrograde: boolean;
  isCombust: boolean;
  combustOrb?: number;
  isNB: boolean;
  nakshatraDeliveryModifier: number;
  dominantDeliveryModifier: number;
}): { deliveryScore: number; deliveryGrade: DeliveryGrade; deliveryReasons: string[] } {
  const {
    planet, structuralGrade, conditionGrade, vargaAssessment,
    functionalNature, functionalLean, housePosition, isMaraka,
    isRetrograde, isCombust, combustOrb, isNB,
    nakshatraDeliveryModifier, dominantDeliveryModifier,
  } = params;

  const reasons: string[] = [];

  // ── Base components ────────────────────────────────────────────────────────
  const strComp   = STRUCTURAL_MAP[structuralGrade];
  const condComp  = CONDITION_MAP[conditionGrade];
  const vargaComp = vargaComponentScore(vargaAssessment);
  const fnComp    = functionalComponentScore(functionalNature, functionalLean);
  const placeComp = placementComponentScore(housePosition, isMaraka);

  let score = strComp + condComp + vargaComp + fnComp + placeComp;
  reasons.push(`Base: str(${strComp}) + cond(${condComp}) + varga(${vargaComp}) + fn(${fnComp}) + place(${placeComp}) = ${score}`);

  // ── Combustion modifier ───────────────────────────────────────────────────
  if (isCombust && planet !== 'Sun') {
    const orb = combustOrb ?? 10;
    const penalty = orb <= 3 ? -18 : orb <= 6 ? -12 : orb <= 9 ? -6 : -2;
    score += penalty;
    reasons.push(`Combust (${orb.toFixed(1)}°): ${penalty}`);
  }

  // ── Retrograde modifier ───────────────────────────────────────────────────
  if (isRetrograde && planet !== 'Rahu' && planet !== 'Ketu') {
    const retMod = structuralGrade === 'very_strong' || structuralGrade === 'strong' ? -2
                 : structuralGrade === 'moderate' ? -5
                 : structuralGrade === 'weak'     ? -8 : -10;
    score += retMod;
    const retLabel = structuralGrade === 'very_strong' || structuralGrade === 'strong'
      ? 'unconventional/internalized delivery' : 'delayed and irregular';
    reasons.push(`Retrograde (${structuralGrade}): ${retMod} — ${retLabel}`);
  }

  // ── D9 modifier — sensitivity-aware ──────────────────────────────────────
  // Sensitive planets (Venus, Jupiter, 7L, 1L) get stronger D9 effects.
  // D9 contradiction for sensitive planet: not only score penalty but grade cap.
  const isSensitive = vargaAssessment.hasD9SecondPass;
  if (vargaAssessment.d9Confirms) {
    // Confirmation: scaled to vargaSupportScore (0–20), sensitive planets get more
    const confirmBonus = Math.round(vargaAssessment.vargaSupportScore * 0.6);
    const sensitiveExtra = isSensitive ? 4 : 0;
    const total = confirmBonus + sensitiveExtra;
    score += total;
    reasons.push(`D9 confirms: +${total}${isSensitive ? ' (D9-sensitive planet)' : ''}`);
  } else if (vargaAssessment.d9Contradicts) {
    // Contradiction: base + sensitivity + severity of weakness
    const basePenalty = -12;
    const sensitivityPenalty = isSensitive ? -6 : 0;
    // Extra penalty if D9 is very weak (vargaSupportScore ≤ 4)
    const severityPenalty = vargaAssessment.vargaSupportScore <= 4 ? -4 : -2;
    const total = basePenalty + sensitivityPenalty + severityPenalty;
    score += total;
    reasons.push(`D9 contradicts: ${total}${isSensitive ? ' (D9-sensitive: marriage/dharma quality reduced)' : ''}`);
  }

  // ── Neecha Bhanga recovery ─────────────────────────────────────────────────
  // Recovery = 40-60% of ACTUAL debility delivery penalty.
  // Debility penalty in delivery = max(0, MODERATE_BASELINE - strComp)
  // (debilitated planet gets strComp=0 or 8; moderate baseline=18)
  // We use 50% as midpoint.
  if (isNB) {
    const debilityPenalty = Math.max(0, MODERATE_BASELINE - strComp);
    const recovery = Math.round(debilityPenalty * 0.50);
    score += recovery;
    reasons.push(`Neecha Bhanga: +${recovery} (50% of ${debilityPenalty}pt debility delivery penalty)`);
  }

  // ── Nakshatra modifier ────────────────────────────────────────────────────
  if (nakshatraDeliveryModifier !== 0) {
    score += nakshatraDeliveryModifier;
    reasons.push(`Nakshatra: ${nakshatraDeliveryModifier > 0 ? '+' : ''}${nakshatraDeliveryModifier}`);
  }

  // ── Dominant factor override ──────────────────────────────────────────────
  if (dominantDeliveryModifier !== 0) {
    score += dominantDeliveryModifier;
    reasons.push(`Dominant override: ${dominantDeliveryModifier > 0 ? '+' : ''}${dominantDeliveryModifier}`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // ── D9-sensitivity grade cap ──────────────────────────────────────────────
  // For lagna lord / Venus / Jupiter / 7th lord:
  // D9 contradiction means inner instability — cannot deliver as reliably.
  // Hard cap: if D9 contradicts for sensitive planet, delivery cannot be 'reliable'.
  // If D9 is very weak (score ≤ 4), cap at 'inconsistent'.
  let grade = gradeFromScore(score);
  if (isSensitive && vargaAssessment.d9Contradicts) {
    if (vargaAssessment.vargaSupportScore <= 4 && ['reliable','delayed'].includes(grade)) {
      grade = 'inconsistent';
      score = Math.min(score, 58);
      reasons.push('D9-sensitive: severe D9 contradiction caps grade at inconsistent');
    } else if (grade === 'reliable') {
      grade = 'delayed';
      score = Math.min(score, 76);
      reasons.push('D9-sensitive: D9 contradiction caps grade at delayed (inner reliability reduced)');
    }
  }

  // ── NB contextual grade upgrade ────────────────────────────────────────────
  // After NB recovery: if condition is clean/supported AND D9 not contradicted
  // AND current grade is obstructed/distorted, upgrade one level (NB creates real
  // recovery path — delayed, not denied).
  if (isNB && vargaAssessment.vargaStatus !== 'contradicted') {
    const isConditionOk = conditionGrade === 'clean' || conditionGrade === 'supported';
    if (grade === 'obstructed' && isConditionOk) {
      grade = 'distorted_delivery';
      reasons.push('NB + clean condition: upgraded obstructed → distorted_delivery');
    } else if (grade === 'distorted_delivery' && isConditionOk) {
      grade = 'inconsistent';
      reasons.push('NB + clean condition + D9 support: upgraded distorted → inconsistent');
    }
  }

  reasons.push(`Final: ${score} → ${grade}`);
  return { deliveryScore: score, deliveryGrade: grade, deliveryReasons: reasons };
}
