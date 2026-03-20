/**
 * Nakshatra Influence Layer — Layer 8 (spec §9)
 * Star lord: 25–35% influence on delivery
 * Sub lord: 15–20% influence on delivery
 * Must NOT replace rashi logic, but materially refine it.
 */

import type { NakshatraInfluence } from './types';
import type { PlanetData } from '@/types/astrology';
import { getSimpleDignity, getPositionalScore } from './dignityEngine';

/** Get simplified structural score for a planet (for nakshatra lord assessment) */
function getPlanetStructuralScore(
  planetName: string,
  allPlanets: Record<string, PlanetData>
): number {
  const pd = allPlanets[planetName] as PlanetData | undefined;
  if (!pd) return 45; // neutral default
  const dignity = getSimpleDignity(planetName, pd.signNumber);
  let score = getPositionalScore(dignity);
  // Adjust for combust and retrograde
  if (pd.combust && planetName !== 'Sun') score -= 15;
  if (pd.retrograde && planetName !== 'Rahu' && planetName !== 'Ketu') score -= 5;
  return Math.max(0, Math.min(100, score));
}

export function computeNakshatraInfluence(
  planet: string,
  allPlanets: Record<string, PlanetData>
): NakshatraInfluence {
  const pd = allPlanets[planet] as PlanetData | undefined;
  if (!pd?.kp) {
    return {
      starLordName: 'Unknown', starLordStructuralScore: 45, starLordSupportEffect: 0,
      subLordName: 'Unknown', subLordStructuralScore: 45, subLordRefinementEffect: 0,
      nakshatraDeliveryModifier: 0, nakshatraNotes: 'KP data unavailable',
    };
  }

  const starLordName = pd.kp.nakshatraLord;
  const subLordName  = pd.kp.subLord;

  // Star lord: 25–35% influence
  const starScore = getPlanetStructuralScore(starLordName, allPlanets);
  // Map 0–100 structural → -15 to +15 delivery modifier
  const starEffect = Math.round((starScore - 50) * 0.30); // 30% weight

  // Sub lord: 15–20% influence
  const subScore = getPlanetStructuralScore(subLordName, allPlanets);
  const subEffect = Math.round((subScore - 50) * 0.17); // 17% weight

  const combined = starEffect + subEffect;

  // Build notes
  const notes: string[] = [];
  if (starScore >= 75)   notes.push(`Star lord ${starLordName} is strong — coherent direction`);
  else if (starScore >= 55) notes.push(`Star lord ${starLordName} is moderate`);
  else if (starScore <= 25) notes.push(`Star lord ${starLordName} is weak — scattered focus`);
  else notes.push(`Star lord ${starLordName} is below average`);

  if (subScore >= 70)    notes.push(`Sub lord ${subLordName} refines positively`);
  else if (subScore <= 30) notes.push(`Sub lord ${subLordName} adds instability`);

  return {
    starLordName, starLordStructuralScore: starScore, starLordSupportEffect: starEffect,
    subLordName, subLordStructuralScore: subScore, subLordRefinementEffect: subEffect,
    nakshatraDeliveryModifier: combined,
    nakshatraNotes: notes.join('; '),
  };
}
