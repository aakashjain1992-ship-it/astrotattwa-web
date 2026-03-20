/**
 * Functional Nature Engine — Layer 2
 * Weighted ownership model replacing hard lookup table.
 * Each house has an ownership weight; planet's total determines nature.
 *
 * Spec house weights:
 *   9L=+5, 5L=+4.5, 1L=+4, 10L=+3, 4L=+2.5,
 *   7L=+1(maraka), 2L=+0.5(maraka), 11L=-2, 6L=-3, 8L=-4, 12L=-2, 3L=-1.5
 */

import type { FunctionalNature, FunctionalLean } from './types';

export const HOUSE_WEIGHTS: Record<number, number> = {
  1: 4.0,   // lagna lord — critical
  2: 0.5,   // maraka + neutral
  3: -1.5,
  4: 2.5,   // kendra
  5: 4.5,   // trikona
  6: -3.0,  // dusthana
  7: 1.0,   // maraka + kendra
  8: -4.0,  // worst dusthana
  9: 5.0,   // best trikona (dharma/fortune)
  10: 3.0,  // kendra (karma)
  11: -2.0, // upachaya but gains with taint
  12: -2.0, // dusthana (dissolution)
};

// Signs 1-12 → lords
function getLordOfSign(sign: number): string {
  const lords: Record<number,string> = {
    1:'Mars',2:'Venus',3:'Mercury',4:'Moon',5:'Sun',
    6:'Mercury',7:'Venus',8:'Mars',9:'Jupiter',10:'Saturn',11:'Saturn',12:'Jupiter',
  };
  return lords[sign] ?? 'Unknown';
}

export function getLordOfSignPublic(sign: number): string { return getLordOfSign(sign); }

/** Compute which houses a planet rules for a given lagna */
export function getHousesRuled(planet: string, lagnaSign: number): number[] {
  const houses: number[] = [];
  for (let h = 1; h <= 12; h++) {
    const sign = ((lagnaSign - 1 + h - 1) % 12) + 1;
    if (getLordOfSign(sign) === planet) houses.push(h);
  }
  return houses;
}

/** Compute ownership weights map: house → weight */
export function getOwnershipWeights(housesRuled: number[]): Record<number, number> {
  const weights: Record<number, number> = {};
  for (const h of housesRuled) weights[h] = HOUSE_WEIGHTS[h] ?? 0;
  return weights;
}

/** Check yogakaraka: rules both a kendra AND a trikona */
function isYogakaraka(housesRuled: number[]): boolean {
  const kendras  = new Set([1, 4, 7, 10]);
  const trikonas = new Set([1, 5, 9]);
  // 1st is both kendra and trikona — a single house can satisfy both
  const hasKendra  = housesRuled.some(h => kendras.has(h));
  const hasTrikona = housesRuled.some(h => trikonas.has(h));
  return hasKendra && hasTrikona;
}

/** Compute functional nature from weighted ownership */
export function computeFunctionalNature(
  planet: string,
  lagnaSign: number,
  housesRuled: number[]
): { nature: FunctionalNature; lean: FunctionalLean; score: number } {
  const weights = getOwnershipWeights(housesRuled);
  let score = Object.values(weights).reduce((a, b) => a + b, 0);

  // Yogakaraka check first (rules kendra + trikona)
  if (isYogakaraka(housesRuled) && score >= 4.0) {
    return { nature:'yogakaraka', lean:'benefic_lean', score };
  }

  // Lagna lord special rule: always at least strong_benefic
  if (housesRuled.includes(1)) {
    // Lagna lord + mostly bad houses = protective_with_complication
    if (score < 2.0) {
      return { nature:'strong_benefic', lean:'protective_with_complication', score };
    }
    if (score >= 4.0) return { nature:'strong_benefic', lean:'benefic_lean', score };
    return { nature:'strong_benefic', lean: score >= 2.5 ? 'benefic_lean' : 'neutral_lean', score };
  }

  // Primary trikona lords (5L, 9L) without bad co-lordship
  const trikonaScore = (weights[5] ?? 0) + (weights[9] ?? 0);
  const dusthanaScore = (weights[6] ?? 0) + (weights[8] ?? 0) + (weights[12] ?? 0);
  if (trikonaScore >= 4.5 && dusthanaScore === 0) {
    return { nature:'strong_benefic', lean:'benefic_lean', score };
  }

  // Classification by total weighted score
  if (score >= 3.5) return { nature:'benefic', lean:'benefic_lean', score };

  if (score >= 1.5) {
    // Positive but mixed — determine lean
    const lean = computeLean(housesRuled, weights, score);
    return { nature: 'mixed', lean, score };
  }

  if (score >= -0.5) {
    // Neutral zone
    const lean = computeLean(housesRuled, weights, score);
    if (lean === 'maraka_driven') return { nature:'mixed', lean, score };
    return { nature:'neutral', lean:'neutral_lean', score };
  }

  if (score >= -2.5) {
    // Mixed leaning malefic
    const lean = computeLean(housesRuled, weights, score);
    return { nature:'mixed', lean, score };
  }

  // Malefic: primarily dusthanas
  return { nature:'malefic', lean:'malefic_lean', score };
}

function computeLean(
  housesRuled: number[],
  weights: Record<number, number>,
  totalScore: number
): FunctionalLean {
  // Maraka-driven: primarily owns 2nd and/or 7th with little else
  const marakaScore = (weights[2] ?? 0) + (weights[7] ?? 0);
  const nonMarakaAbsolute = Math.abs(totalScore - marakaScore);
  if (Math.abs(marakaScore) > 0.5 && nonMarakaAbsolute < 1.5) return 'maraka_driven';

  // Protective with complication: lagna lord + dusthana
  if (housesRuled.includes(1) && ((weights[6] ?? 0) + (weights[8] ?? 0) + (weights[12] ?? 0)) < -2) {
    return 'protective_with_complication';
  }

  // Trikona dominant: 5L or 9L significant
  const trikonaPart = (weights[5] ?? 0) + (weights[9] ?? 0);
  const dusthanaPart = (weights[6] ?? 0) + (weights[8] ?? 0) + (weights[12] ?? 0);

  if (trikonaPart >= 4.0) return 'benefic_lean';
  if (trikonaPart >= 2.0 && dusthanaPart > -2) return 'benefic_lean';
  if (dusthanaPart <= -4.0) return 'malefic_lean';
  if (totalScore >= 1.0) return 'benefic_lean';
  if (totalScore <= -1.0) return 'malefic_lean';
  return 'neutral_lean';
}

export function isMarakaCapable(planet: string, lagnaSign: number): boolean {
  return getHousesRuled(planet, lagnaSign).some(h => h === 2 || h === 7);
}

export function functionalNatureToScore(nature: FunctionalNature, lean: FunctionalLean): number {
  const base: Record<FunctionalNature,number> = {
    yogakaraka:50, strong_benefic:35, benefic:20, mixed:0, neutral:0, malefic:-25
  };
  let s = base[nature] ?? 0;
  if (nature === 'mixed') {
    if (lean === 'benefic_lean') s += 8;
    if (lean === 'malefic_lean') s -= 8;
    if (lean === 'maraka_driven') s -= 3;
    if (lean === 'protective_with_complication') s += 5;
  }
  return s;
}
