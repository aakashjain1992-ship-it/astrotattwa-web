/**
 * Planet Importance Layer — Layer 12 (Spec §12)
 *
 * Base importance weights:
 *   Lagna lord +30, Moon +20, Sun +12, Yogakaraka +18
 *   9th lord +12, 10th lord +12, 5th lord +10, 7th lord +10
 *   Current Maha dasha lord +20, Antar +12
 *   Planet in lagna +8, Conjunct lagna lord +5
 *
 * Domain importance is assigned separately per domain.
 */

import type { Domain, FunctionalNature, TemporalActivation, PlanetImportance } from './types';
import type { DashaContext } from './types';

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

export function computeImportance(
  planet: string,
  housesRuled: number[],
  housePosition: number,
  functionalNature: FunctionalNature,
  lagnaSign: number,
  temporalActivation: TemporalActivation,
  allImportanceWeights: Record<string, number>, // pre-computed for all 9 planets
  dashaContext?: DashaContext
): Pick<PlanetImportance, 'importanceWeight' | 'domainImportanceWeights' | 'natalPriorityRank' | 'currentPriorityRank'> {
  let weight = 0;

  // Lagna lord
  if (housesRuled.includes(1)) weight += 30;
  // Moon fixed weight
  if (planet === 'Moon') weight += 20;
  // Sun fixed weight
  if (planet === 'Sun') weight += 12;
  // Yogakaraka
  if (functionalNature === 'yogakaraka') weight += 18;
  // Trikona lords
  if (housesRuled.includes(9)) weight += 12;
  if (housesRuled.includes(5)) weight += 10;
  // Kendra lords
  if (housesRuled.includes(10)) weight += 12;
  if (housesRuled.includes(7)) weight += 10;
  if (housesRuled.includes(4)) weight += 6;
  // Planet in lagna
  if (housePosition === 1) weight += 8;
  // Dasha activation
  if (temporalActivation.isMahadasha)  weight += 20;
  if (temporalActivation.isAntardasha) weight += 12;
  if (temporalActivation.isPratyantar) weight += 5;

  // Domain importance weights
  const domainWeights: Partial<Record<Domain, number>> = {};

  // Marriage importance: Venus, 7th lord, D9-related
  if (housesRuled.includes(7) || planet === 'Venus') {
    domainWeights['marriage'] = (housesRuled.includes(7) ? 20 : 0) + (planet === 'Venus' ? 25 : 0);
  }
  // Career: 10th lord, Sun, Saturn
  if (housesRuled.includes(10) || planet === 'Sun' || planet === 'Saturn') {
    domainWeights['career'] = (housesRuled.includes(10) ? 22 : 0) + (planet === 'Sun' ? 10 : 0) + (planet === 'Saturn' ? 8 : 0);
  }
  // Children: Jupiter, 5th lord
  if (housesRuled.includes(5) || planet === 'Jupiter') {
    domainWeights['children'] = (housesRuled.includes(5) ? 20 : 0) + (planet === 'Jupiter' ? 25 : 0);
  }
  // Wealth: 2nd lord, 11th lord, Jupiter
  if (housesRuled.includes(2) || housesRuled.includes(11) || planet === 'Jupiter') {
    domainWeights['wealth'] = (housesRuled.includes(2) ? 15 : 0) + (housesRuled.includes(11) ? 12 : 0) + (planet === 'Jupiter' ? 10 : 0);
  }
  // Spirituality: Ketu, Jupiter, 9th lord
  if (planet === 'Ketu' || planet === 'Jupiter' || housesRuled.includes(9)) {
    domainWeights['spirituality'] = (planet === 'Ketu' ? 25 : 0) + (planet === 'Jupiter' ? 15 : 0) + (housesRuled.includes(9) ? 15 : 0);
  }

  // Compute natal priority rank
  const allWeights = { ...allImportanceWeights, [planet]: weight };
  const sorted = Object.entries(allWeights).sort((a, b) => b[1] - a[1]);
  const natalRank = sorted.findIndex(([p]) => p === planet) + 1;

  // Current priority: apply temporal boost
  const currentWeight = weight + (temporalActivation.currentActivationScore * 0.5);
  const allCurrentWeights = { ...allImportanceWeights };
  for (const [p] of sorted) {
    if (p === planet) allCurrentWeights[p] = currentWeight;
  }
  const currentSorted = Object.entries(allCurrentWeights).sort((a, b) => b[1] - a[1]);
  const currentRank = currentSorted.findIndex(([p]) => p === planet) + 1;

  return {
    importanceWeight: Math.round(weight),
    domainImportanceWeights: domainWeights,
    natalPriorityRank: Math.max(1, Math.min(9, natalRank)),
    currentPriorityRank: Math.max(1, Math.min(9, currentRank)),
  };
}

/** Compute all importance weights in one pass for ranking */
export function computeAllBaseWeights(
  planets: Record<string, { housesRuled: number[]; housePosition: number; functionalNature: FunctionalNature; temporalActivation: TemporalActivation }>
): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const [planet, data] of Object.entries(planets)) {
    let w = 0;
    if (data.housesRuled.includes(1))      w += 30;
    if (planet === 'Moon')                 w += 20;
    if (planet === 'Sun')                  w += 12;
    if (data.functionalNature === 'yogakaraka') w += 18;
    if (data.housesRuled.includes(9))      w += 12;
    if (data.housesRuled.includes(5))      w += 10;
    if (data.housesRuled.includes(10))     w += 12;
    if (data.housesRuled.includes(7))      w += 10;
    if (data.housesRuled.includes(4))      w += 6;
    if (data.housePosition === 1)          w += 8;
    if (data.temporalActivation.isMahadasha)  w += 20;
    if (data.temporalActivation.isAntardasha) w += 12;
    weights[planet] = w;
  }
  return weights;
}
