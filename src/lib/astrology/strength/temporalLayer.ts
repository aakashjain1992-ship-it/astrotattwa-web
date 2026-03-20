/**
 * Temporal Activation Layer — Layer 11 (Spec §11)
 *
 * Separates natal assessment from current relevance.
 * A weak planet in its mahadasha becomes highly relevant.
 * A strong planet not in any dasha is important natally but not "current."
 *
 * This layer must NOT alter natal structural strength.
 * It alters: importance, current delivery relevance, current domain activation.
 */

import type { TemporalActivation } from './types';
import type { DashaContext } from './types';

const MAHA_BOOST    = 20;
const ANTAR_BOOST   = 12;
const PRATYANTAR_BOOST = 5;

export function computeTemporalActivation(
  planet: string,
  dashaContext: DashaContext | undefined
): TemporalActivation {
  if (!dashaContext) {
    return {
      isMahadasha: false, isAntardasha: false, isPratyantar: false,
      currentActivationScore: 0,
      currentActivationReason: 'No dasha context provided — natal assessment only',
      dashaBoostApplied: false,
    };
  }

  const isMaha    = dashaContext.currentMahadasha  === planet;
  const isAntar   = dashaContext.currentAntardasha === planet;
  const isPratyant= dashaContext.currentPratyantar === planet;

  let score = 0;
  const reasons: string[] = [];

  if (isMaha) {
    score += MAHA_BOOST;
    reasons.push(`${planet} is the current Mahadasha lord — major temporal prominence (+${MAHA_BOOST})`);
  }
  if (isAntar) {
    score += ANTAR_BOOST;
    reasons.push(`${planet} is the current Antardasha lord — active sub-period (+${ANTAR_BOOST})`);
  }
  if (isPratyant) {
    score += PRATYANTAR_BOOST;
    reasons.push(`${planet} is the current Pratyantar lord — minor activation (+${PRATYANTAR_BOOST})`);
  }

  const boostApplied = isMaha || isAntar || isPratyant;
  if (!boostApplied) {
    reasons.push(`${planet} not activated in current dasha — natal assessment applies`);
  }

  return {
    isMahadasha: isMaha, isAntardasha: isAntar, isPratyantar: isPratyant,
    currentActivationScore: Math.min(40, score),
    currentActivationReason: reasons.join('; '),
    dashaBoostApplied: boostApplied,
  };
}
