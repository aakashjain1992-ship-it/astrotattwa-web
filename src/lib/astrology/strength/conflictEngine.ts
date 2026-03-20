/**
 * Conflict Resolution Engine — Layer 14 (Spec §14)
 *
 * Detects and tags contradictory patterns.
 * Flags feed: delivery, confidence, and analyst notes.
 */

import type {
  ConflictFlag, StructuralGrade, ConditionGrade, FunctionalNature,
  FunctionalLean, DeliveryGrade, VargaAssessment, DominantFactor,
} from './types';

export function detectConflicts(
  planet: string,
  structuralGrade: StructuralGrade,
  conditionGrade: ConditionGrade,
  functionalNature: FunctionalNature,
  functionalLean: FunctionalLean,
  deliveryGrade: DeliveryGrade,
  vargaAssessment: VargaAssessment,
  isMarakaCapable: boolean,
  dominantFactors: DominantFactor[],
  isCombust: boolean,
  isRetrograde: boolean,
  hasJupiterProtection: boolean,
  hasNodeConjunction: boolean,
  hasSaturnConjunction: boolean,
  hasMarsConjunction: boolean
): ConflictFlag[] {
  const flags: ConflictFlag[] = [];

  const isStrong = ['very_strong', 'strong'].includes(structuralGrade);
  const isWeak   = ['very_weak', 'weak'].includes(structuralGrade);
  const isAfflicted = ['afflicted', 'heavily_afflicted', 'distorted'].includes(conditionGrade);
  const isProtected = conditionGrade === 'supported';
  const isBenefic = ['yogakaraka', 'strong_benefic', 'benefic'].includes(functionalNature);
  const isMaleficNature = functionalNature === 'malefic';
  const d1StrongD9Weak = isStrong && vargaAssessment.d9Contradicts;
  const d1WeakD9Strong = isWeak && vargaAssessment.d9Confirms;

  // strong but afflicted
  if (isStrong && isAfflicted) flags.push('strong_afflicted');

  // weak but protected (Jupiter aspect on weak planet)
  if (isWeak && isProtected) flags.push('weak_protected');

  // strong but functional malefic
  if (isStrong && isMaleficNature) flags.push('strong_but_malefic');

  // benefic by nature but structurally weak
  if (isBenefic && isWeak) flags.push('benefic_but_weak');

  // strong D1, contradicted D9
  if (d1StrongD9Weak) flags.push('strong_d1_weak_d9');

  // weak D1, redeemed D9
  if (d1WeakD9Strong) flags.push('weak_d1_strong_d9');

  // strong general but domain-weak
  // checked by domain engine — we flag here based on known delivery issues
  if (isStrong && (deliveryGrade === 'obstructed' || deliveryGrade === 'distorted_delivery')) {
    flags.push('strong_general_weak_domain');
  }

  // weak general but domain-specific strength
  if (isWeak && vargaAssessment.vargaStatus === 'domain_confirmed') {
    flags.push('weak_general_strong_domain');
  }

  // powerful maraka
  if (isMarakaCapable && isStrong) flags.push('powerful_maraka');

  // node dominated
  if (hasNodeConjunction || dominantFactors.includes('tight_rahu_conjunction') || dominantFactors.includes('tight_ketu_conjunction')) {
    flags.push('node_dominated');
  }

  // saturn dominated
  if (hasSaturnConjunction || dominantFactors.includes('tight_saturn_conjunction') || dominantFactors.includes('tight_saturn_aspect')) {
    flags.push('saturn_dominated');
  }

  // mars dominated
  if (hasMarsConjunction || dominantFactors.includes('tight_mars_conjunction') || dominantFactors.includes('tight_mars_aspect')) {
    flags.push('mars_dominated');
  }

  // combust but supported by Jupiter
  if (isCombust && hasJupiterProtection) flags.push('combust_but_supported');

  // retrograde internalized
  if (isRetrograde && planet !== 'Rahu' && planet !== 'Ketu') flags.push('retrograde_internalized');

  // weak and afflicted double-burden
  if (isWeak && isAfflicted && !flags.includes('strong_afflicted')) flags.push('weak_afflicted' as ConflictFlag);

  return [...new Set(flags)]; // deduplicate
}
