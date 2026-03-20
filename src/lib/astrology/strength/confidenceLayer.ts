/**
 * Confidence Layer — Layer 13 (Spec §13)
 *
 * Measures how trustworthy the final verdict is.
 * Confidence increases when layers align.
 * Confidence decreases when layers contradict.
 */

import type {
  ConfidenceGrade, StructuralGrade, ConditionGrade,
  VargaAssessment, DeliveryGrade, ConflictFlag, DominantFactor,
} from './types';

export function computeConfidence(
  structuralGrade: StructuralGrade,
  conditionGrade: ConditionGrade,
  vargaAssessment: VargaAssessment,
  deliveryGrade: DeliveryGrade,
  conflictFlags: ConflictFlag[],
  dominantFactors: DominantFactor[],
  overrideApplied: boolean,
  dominantConfidenceMod: number
): ConfidenceGrade {
  let score = 3; // start neutral (1=low, 2=moderate, 3=neutral, 4=high, 5=very high → clamp to 3)

  const isStrong  = ['very_strong', 'strong'].includes(structuralGrade);
  const isWeak    = ['very_weak', 'weak'].includes(structuralGrade);
  const isClean   = conditionGrade === 'clean' || conditionGrade === 'supported';
  const isAfflict = ['afflicted', 'heavily_afflicted', 'distorted'].includes(conditionGrade);

  // Alignment increases confidence
  if (isStrong && isClean && vargaAssessment.d9Confirms) score += 2;
  else if (isStrong && isClean) score += 1;
  else if (isWeak && isAfflict && vargaAssessment.d9Contradicts) score += 1; // at least consistent

  // D9 confirmation at high confidence
  if (vargaAssessment.vargaConfidence === 'high') score += 1;
  if (vargaAssessment.vargaConfidence === 'low')  score -= 1;

  // Vargottama gives clarity
  if (vargaAssessment.vargaStatus === 'confirmed' && vargaAssessment.vargaSupportScore >= 20) score += 1;

  // D9 contradiction reduces confidence
  if (vargaAssessment.d9Contradicts && isStrong) score -= 2;
  if (vargaAssessment.d9Contradicts && !isStrong) score -= 1;

  // Conflict flags reduce confidence
  const majorConflicts: ConflictFlag[] = [
    'strong_afflicted', 'strong_d1_weak_d9', 'node_dominated',
    'strong_general_weak_domain', 'combust_but_supported',
  ];
  for (const flag of conflictFlags) {
    if (majorConflicts.includes(flag)) score -= 1;
  }

  // Multiple major conflicts: further reduce
  if (conflictFlags.filter(f => majorConflicts.includes(f)).length >= 2) score -= 1;

  // Dominant overrides generally reduce confidence (chart is unusual)
  if (overrideApplied && dominantFactors.length >= 2) score -= 1;

  // Apply external confidence modifier from dominant override engine
  score += dominantConfidenceMod;

  // Clamp and map
  score = Math.max(1, Math.min(5, score));
  if (score >= 4) return 'high';
  if (score >= 2) return 'moderate';
  return 'low';
}
