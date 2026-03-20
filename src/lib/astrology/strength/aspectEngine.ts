/**
 * Vedic Aspect Engine — Degree-sensitive
 * Spec: conj 0-3°=severe, 3-7°=strong, 7-12°=mild, 12+=weak
 * Spec: aspect <=3°=strong, 3-6°=moderate, 6-9°=mild, 9+=weak
 */

import type { PlanetData } from '@/types/astrology';
import type { DistortionFlag } from './types';

export interface AspectInfo {
  aspectedBy: string[];
  beneficAspects: string[];
  maleficAspects: string[];
  hasJupiterAspect: boolean;
  hasSaturnAspect: boolean;
  hasMarsAspect: boolean;
  hasRahuKetuAspect: boolean;
}

export interface ConjunctionInfo {
  benefic: string[];
  malefic: string[];
  nodes: string[];
}

export interface WeightedInfluence {
  planet: string;
  orb: number;
  severity: number;    // 0–1 multiplier
  label: 'very_tight' | 'tight' | 'mild' | 'weak';
  isBenefic: boolean;
}

const NATURAL_BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury']);
const NATURAL_MALEFICS  = new Set(['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu']);

/** Shortest angular distance between two longitudes */
export function degreeDiff(lon1: number, lon2: number): number {
  const d = Math.abs(lon1 - lon2) % 360;
  return d > 180 ? 360 - d : d;
}

/** Conjunction severity multiplier: spec §16 */
export function conjSeverity(orb: number): { mult: number; label: 'very_tight'|'tight'|'mild'|'weak' } {
  if (orb <= 3)  return { mult: 1.0,  label: 'very_tight' };
  if (orb <= 7)  return { mult: 0.75, label: 'tight' };
  if (orb <= 12) return { mult: 0.45, label: 'mild' };
  return { mult: 0.15, label: 'weak' };
}

/** Aspect severity: spec §16 */
export function aspectSeverityMult(orb: number): number {
  if (orb <= 3)  return 1.0;
  if (orb <= 6)  return 0.7;
  if (orb <= 9)  return 0.4;
  return 0.15;
}

export function getAspectedSigns(planet: string, fromSign: number): number[] {
  const mod = (n: number) => ((n - 1 + 120) % 12) + 1;
  const a = [mod(fromSign + 6)];
  if (planet === 'Mars')    a.push(mod(fromSign + 3), mod(fromSign + 7));
  if (planet === 'Jupiter') a.push(mod(fromSign + 4), mod(fromSign + 8));
  if (planet === 'Saturn')  a.push(mod(fromSign + 2), mod(fromSign + 9));
  if (planet === 'Rahu' || planet === 'Ketu') a.push(mod(fromSign + 4), mod(fromSign + 8));
  return a;
}

export function planetAspects(planet: string, fromSign: number, toSign: number): boolean {
  return getAspectedSigns(planet, fromSign).includes(toSign);
}

export function getAspectInfo(
  targetPlanet: string, targetSign: number, allPlanets: Record<string, PlanetData>
): AspectInfo {
  const aspectedBy: string[] = [], beneficAspects: string[] = [], maleficAspects: string[] = [];
  for (const [name, data] of Object.entries(allPlanets)) {
    if (name === targetPlanet || name === 'Ascendant') continue;
    if (planetAspects(name, (data as PlanetData).signNumber, targetSign)) {
      aspectedBy.push(name);
      if (NATURAL_BENEFICS.has(name)) beneficAspects.push(name); else maleficAspects.push(name);
    }
  }
  return { aspectedBy, beneficAspects, maleficAspects,
    hasJupiterAspect: aspectedBy.includes('Jupiter'), hasSaturnAspect: aspectedBy.includes('Saturn'),
    hasMarsAspect: aspectedBy.includes('Mars'), hasRahuKetuAspect: aspectedBy.includes('Rahu')||aspectedBy.includes('Ketu') };
}

export function getConjunctions(
  targetPlanet: string, targetSign: number, allPlanets: Record<string, PlanetData>
): ConjunctionInfo {
  const benefic: string[] = [], malefic: string[] = [], nodes: string[] = [];
  for (const [name, data] of Object.entries(allPlanets)) {
    if (name === targetPlanet || name === 'Ascendant') continue;
    if ((data as PlanetData).signNumber === targetSign) {
      if (name === 'Rahu' || name === 'Ketu') nodes.push(name);
      else if (NATURAL_BENEFICS.has(name)) benefic.push(name);
      else malefic.push(name);
    }
  }
  return { benefic, malefic, nodes };
}

/** Weighted conjunction score using degree proximity */
export function getWeightedConjunctionScore(
  targetPlanet: string, targetLon: number, allPlanets: Record<string, PlanetData>
): { score: number; afflictions: string[]; protections: string[]; influences: WeightedInfluence[] } {
  const afflictions: string[] = [], protections: string[] = [], influences: WeightedInfluence[] = [];
  let score = 0;
  const targetSign = Math.floor(targetLon / 30) + 1;

  for (const [name, data] of Object.entries(allPlanets)) {
    if (name === targetPlanet || name === 'Ascendant') continue;
    const pd = data as PlanetData;
    if (pd.signNumber !== targetSign) continue;

    const orb = degreeDiff(targetLon, pd.longitude);
    const { mult, label } = conjSeverity(orb);
    const orbStr = orb > 0.1 ? ` (${orb.toFixed(1)}°)` : '';

    const isBenefic = NATURAL_BENEFICS.has(name);
    const isNode = name === 'Rahu' || name === 'Ketu';

    if (isNode) {
      const penalty = Math.round(-20 * mult);
      score += penalty;
      afflictions.push(`Conjunct ${name}${orbStr} — nodal distortion${label === 'very_tight' ? ' (dominant)' : ''}`);
      influences.push({ planet:name, orb, severity:mult, label, isBenefic:false });
    } else if (isBenefic) {
      const base = name === 'Jupiter' ? 26 : 18;
      const bonus = Math.round(base * Math.min(mult * 1.1, 1.0)); // benefic bonus capped
      score += bonus;
      protections.push(`Conjunct ${name}${orbStr}${name === 'Jupiter' ? ' — powerful grace' : ' — supportive'}`);
      influences.push({ planet:name, orb, severity:mult, label, isBenefic:true });
    } else {
      const base = name === 'Saturn' ? 22 : 20;
      const penalty = Math.round(-base * mult);
      score += penalty;
      afflictions.push(`Conjunct ${name}${orbStr} — malefic influence${label === 'very_tight' ? ' (dominant)' : ''}`);
      influences.push({ planet:name, orb, severity:mult, label, isBenefic:false });
    }
  }
  return { score, afflictions, protections, influences };
}

/** Weighted aspect score using degree proximity to exact aspect angle */
export function getWeightedAspectScore(
  targetPlanet: string, targetSign: number, targetLon: number,
  allPlanets: Record<string, PlanetData>
): { score: number; afflictions: string[]; protections: string[] } {
  const afflictions: string[] = [], protections: string[] = [];
  let score = 0;

  for (const [name, data] of Object.entries(allPlanets)) {
    if (name === targetPlanet || name === 'Ascendant') continue;
    const pd = data as PlanetData;
    if (!planetAspects(name, pd.signNumber, targetSign)) continue;

    // Compute orb to exact aspect degree
    // For 7th aspect: exact = fromSign + 6 signs = fromLon + 180°
    // For others: compute closest aspect degree
    const aspectOffsets: Record<string, number[]> = {
      Mars: [3, 6, 7], Jupiter: [4, 6, 8], Saturn: [2, 6, 9],
      Rahu: [4, 6, 8], Ketu: [4, 6, 8],
    };
    const offsets = aspectOffsets[name] ?? [6]; // all planets have 7th (offset 6)
    let minOrb = 999;
    for (const offset of offsets) {
      const exactLon = (pd.longitude + offset * 30) % 360;
      const orb = degreeDiff(exactLon, targetLon);
      if (orb < minOrb) minOrb = orb;
    }

    const mult = aspectSeverityMult(minOrb);
    const orbStr = minOrb < 9 ? ` (${minOrb.toFixed(1)}°)` : '';

    if (NATURAL_MALEFICS.has(name)) {
      const penalty = Math.round(-12 * mult);
      score += penalty;
      afflictions.push(`Aspected by ${name}${orbStr}`);
    } else if (NATURAL_BENEFICS.has(name)) {
      const base = name === 'Jupiter' ? 18 : 10;
      const bonus = Math.round(base * mult);
      score += bonus;
      protections.push(`Aspected by ${name}${orbStr}${name === 'Jupiter' ? ' — protection' : ''}`);
    }
  }
  return { score, afflictions, protections };
}

export function buildDistortionFlags(
  planet: string, isCombust: boolean, conj: ConjunctionInfo,
  aspects: AspectInfo, housePosition: number
): DistortionFlag[] {
  const flags: DistortionFlag[] = [];
  if (isCombust) { flags.push('combustion_distortion'); flags.push('dependent_on_sun'); }
  if (conj.nodes.length > 0) flags.push('nodal_distortion');
  if (conj.malefic.includes('Mars') || aspects.hasMarsAspect) flags.push('martian_pressure');
  if (conj.malefic.includes('Saturn') || aspects.hasSaturnAspect) flags.push('saturnine_delay');
  if (planet === 'Moon' && (conj.nodes.length > 0 || conj.malefic.length > 0)) flags.push('emotional_volatility');
  if ([8,12].includes(housePosition) && (isCombust || conj.malefic.length > 0)) flags.push('hidden_expression');
  if (isCombust && conj.benefic.includes('Jupiter')) flags.push('overshadowed');
  return flags;
}
