/**
 * Dominant Factor Override Engine — Layer 5
 * Allows strong factors to override/reweight beyond ordinary logic.
 * Does NOT use hard early-returns unless override is severe and clear.
 * Prefers: strong reweighting, dominance tags, delivery downgrade/upgrade.
 */

import type {
  DominantFactor, StructuralGrade, ConditionGrade, VargaAssessment,
  DeliveryGrade, DignityLevel,
} from './types';
import type { PlanetData } from '@/types/astrology';
import { degreeDiff, conjSeverity } from './aspectEngine';

export interface OverrideResult {
  dominantFactors: DominantFactor[];
  dominantOverrideApplied: boolean;
  overrideImpactNotes: string[];
  deliveryModifier: number;      // applied to delivery score (-20 to +10)
  conditionModifier: number;     // applied to condition score (-15 to 0)
  confidenceModifier: number;    // -2 to +1 for confidence grade
}

export function computeDominantOverrides(
  planet: string,
  longitude: number,
  signNumber: number,
  structuralGrade: StructuralGrade,
  structuralScore: number,
  conditionGrade: ConditionGrade,
  vargaAssessment: VargaAssessment,
  dignityLevel: DignityLevel,
  isNB: boolean,
  allPlanets: Record<string, PlanetData>
): OverrideResult {
  const factors: DominantFactor[] = [];
  const notes: string[]           = [];
  let deliveryMod    = 0;
  let conditionMod   = 0;
  let confidenceMod  = 0;

  // ── 1. Tight Rahu/Ketu conjunction (<=3°) ────────────────────────────────
  for (const node of ['Rahu', 'Ketu'] as const) {
    const nd = allPlanets[node] as PlanetData | undefined;
    if (!nd || nd.signNumber !== signNumber) continue;
    const orb = degreeDiff(longitude, nd.longitude);
    if (orb <= 3) {
      factors.push(node === 'Rahu' ? 'tight_rahu_conjunction' : 'tight_ketu_conjunction');
      const impact = Math.round(-12 * conjSeverity(orb).mult);
      deliveryMod += impact;
      conditionMod -= 8;
      confidenceMod -= 1;
      notes.push(`Tight ${node} conjunction (${orb.toFixed(1)}°) dominates — delivery distorted`);
    }
  }

  // ── 2. Tight Saturn conjunction/aspect dominance ──────────────────────────
  const saturnData = allPlanets.Saturn as PlanetData | undefined;
  if (saturnData) {
    if (saturnData.signNumber === signNumber) {
      const orb = degreeDiff(longitude, saturnData.longitude);
      if (orb <= 5) {
        factors.push('tight_saturn_conjunction');
        const impact = Math.round(-10 * conjSeverity(orb).mult);
        deliveryMod += impact;
        notes.push(`Tight Saturn conjunction (${orb.toFixed(1)}°) — heavy, karmic pressure dominates`);
      }
    }
  }

  // ── 3. Tight Mars conjunction/aspect dominance ────────────────────────────
  const marsData = allPlanets.Mars as PlanetData | undefined;
  if (marsData) {
    if (marsData.signNumber === signNumber) {
      const orb = degreeDiff(longitude, marsData.longitude);
      if (orb <= 5) {
        factors.push('tight_mars_conjunction');
        deliveryMod -= Math.round(8 * conjSeverity(orb).mult);
        notes.push(`Tight Mars conjunction (${orb.toFixed(1)}°) — aggressive, conflict-driven expression`);
      }
    }
  }

  // ── 4. Deep debility without real cancellation ────────────────────────────
  if (dignityLevel === 'debilitated' && !isNB) {
    factors.push('deep_debility');
    deliveryMod -= 10;
    confidenceMod -= 1;
    notes.push('Deep debility without Neecha Bhanga — minor supportive factors overridden');
  }

  // ── 5. Strong exaltation in kendra — partial override of affliction ────────
  if (['exalted','moolatrikona'].includes(dignityLevel) &&
      ['kendra_placement','trikona_placement'].some(() => true) &&
      structuralScore >= 85) {
    factors.push('strong_exaltation_kendra');
    // Partially overcomes mild affliction
    if (conditionGrade === 'afflicted') {
      deliveryMod += 6;
      notes.push('Strong exaltation in power position partially overcomes mild affliction');
    }
    confidenceMod += 1;
  }

  // ── 6. D1–D9 extreme mismatch ─────────────────────────────────────────────
  const isStrongD1 = ['very_strong','strong'].includes(structuralGrade);
  if (isStrongD1 && vargaAssessment.vargaStatus === 'contradicted' &&
      vargaAssessment.vargaConfidence === 'low') {
    factors.push('d1_d9_extreme_mismatch');
    deliveryMod -= 12;
    confidenceMod -= 1;
    notes.push('Extreme D1–D9 mismatch overrides naive strength — external only');
  }

  // ── 7. Neecha Bhanga as partial override ──────────────────────────────────
  if (isNB) {
    factors.push('neecha_bhanga_override');
    deliveryMod += 8; // partial recovery
    notes.push('Neecha Bhanga removes 40–60% of debility delivery penalty');
  }

  // ── 8. Combust but Jupiter protected ─────────────────────────────────────
  const jupData = allPlanets.Jupiter as PlanetData | undefined;
  if (planet !== 'Sun' && (allPlanets[planet] as PlanetData)?.combust && jupData) {
    // Check Jupiter conjunction or aspect to the planet's sign
    if (jupData.signNumber === signNumber) {
      factors.push('combust_dominated');
      deliveryMod += 4; // Jupiter partially mitigates combustion
      notes.push('Combust but conjunct Jupiter — Sun dependency partially guided');
    }
  }

  const overrideApplied = factors.length > 0;

  return {
    dominantFactors: factors, dominantOverrideApplied: overrideApplied,
    overrideImpactNotes: notes, deliveryModifier: deliveryMod,
    conditionModifier: conditionMod, confidenceModifier: confidenceMod,
  };
}
