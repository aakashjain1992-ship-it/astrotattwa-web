/**
 * Dignity Engine — Layer 1: Structural Assessment
 * 9-tier dignity + moolatrikona zones + sandhi + house structural modifier
 * Digbala and Shadbala hooks included for future integration.
 */

import type { DignityLevel, PlacementFlag } from './types';
import { getPlanetSignRelationship, SIGN_LORDS } from './relationships';

interface DignityData {
  exaltSign: number; exaltDegree: number;
  debilSign: number; debilDegree: number;
  ownSigns: number[];
  moolatrikonSign: number; mtStart: number; mtEnd: number;
}

const DIGNITY_DATA: Record<string, DignityData> = {
  Sun:     { exaltSign:1,  exaltDegree:10, debilSign:7,  debilDegree:10, ownSigns:[5],     moolatrikonSign:5,  mtStart:0,  mtEnd:20 },
  Moon:    { exaltSign:2,  exaltDegree:3,  debilSign:8,  debilDegree:3,  ownSigns:[4],     moolatrikonSign:2,  mtStart:4,  mtEnd:20 },
  Mars:    { exaltSign:10, exaltDegree:28, debilSign:4,  debilDegree:28, ownSigns:[1,8],   moolatrikonSign:1,  mtStart:0,  mtEnd:12 },
  Mercury: { exaltSign:6,  exaltDegree:15, debilSign:12, debilDegree:15, ownSigns:[3,6],   moolatrikonSign:6,  mtStart:16, mtEnd:20 },
  Jupiter: { exaltSign:4,  exaltDegree:5,  debilSign:10, debilDegree:5,  ownSigns:[9,12],  moolatrikonSign:9,  mtStart:0,  mtEnd:10 },
  Venus:   { exaltSign:12, exaltDegree:27, debilSign:6,  debilDegree:27, ownSigns:[2,7],   moolatrikonSign:7,  mtStart:0,  mtEnd:15 },
  Saturn:  { exaltSign:7,  exaltDegree:20, debilSign:1,  debilDegree:20, ownSigns:[10,11], moolatrikonSign:11, mtStart:0,  mtEnd:20 },
};

const POSITIONAL_SCORES: Record<DignityLevel, number> = {
  exalted:100, moolatrikona:88, own_sign:75, great_friend:65, friend:55,
  neutral:45, enemy:32, great_enemy:20, debilitated:8,
};

// House structural modifier — house placement adds/subtracts from structural score
const HOUSE_STRUCTURAL_MOD: Record<number, number> = {
  1:10, 4:8, 7:8, 10:10,   // kendra +
  5:8, 9:8,                  // trikona +
  3:2, 11:2,                 // upachaya mild +
  6:0, 2:2, 8:-5, 12:-5,    // dusthana -
};

export interface DignityAssessment {
  dignityLevel: DignityLevel;
  positionalScore: number;
  structuralScore: number;  // positional + house + sandhi
  isSandhi: boolean;
  placementFlags: PlacementFlag[];
  description: string;
  // Hooks for future integration
  digbalaScore?: number;    // to be added when Digbala implemented
  shadbalScore?: number;    // to be added when Shadbala integrated
}

export function assessDignity(
  planet: string, signNumber: number, degreeInSign: number,
  planetSigns: Record<string, number>, housePosition: number
): DignityAssessment {
  const placementFlags: PlacementFlag[] = [];

  // Sandhi: 0–1° or 29–30° = weak transition zone
  const isSandhi = degreeInSign <= 1 || degreeInSign >= 29;
  if (isSandhi) placementFlags.push('sandhi');

  // House flags
  if ([1,4,7,10].includes(housePosition))  placementFlags.push('kendra_placement');
  if ([1,5,9].includes(housePosition))     placementFlags.push('trikona_placement');
  if ([6,8,12].includes(housePosition))    placementFlags.push('dusthana_placement');
  if ([3,6,10,11].includes(housePosition)) placementFlags.push('upachaya_placement');

  // Hooks for future
  placementFlags.push('digbala_hook');
  placementFlags.push('shadbala_hook');

  const houseMod = HOUSE_STRUCTURAL_MOD[housePosition] ?? 0;
  const sandhiPenalty = isSandhi ? -10 : 0;

  // Rahu/Ketu: simplified (full model in nodeInheritance.ts)
  if (planet === 'Rahu' || planet === 'Ketu') {
    const pos = 45; // neutral base — overridden by node inheritance
    const structural = Math.max(0, Math.min(100, pos + houseMod + sandhiPenalty));
    return { dignityLevel:'neutral', positionalScore:pos, structuralScore:structural, isSandhi, placementFlags, description:`${planet} — assessed via node inheritance model` };
  }

  const data = DIGNITY_DATA[planet];
  if (!data) {
    const pos = 45;
    return { dignityLevel:'neutral', positionalScore:pos, structuralScore:Math.max(0,pos+houseMod+sandhiPenalty), isSandhi, placementFlags, description:`${planet} neutral` };
  }

  // Exaltation
  if (signNumber === data.exaltSign) {
    const proximity = Math.abs(degreeInSign - data.exaltDegree);
    const bonus = proximity <= 3 ? 14 : proximity <= 6 ? 10 : proximity <= 9 ? 6 : 2;
    const pos = Math.min(100, POSITIONAL_SCORES.exalted + bonus);
    placementFlags.push('exalted');
    const structural = Math.max(0, Math.min(100, pos + houseMod + sandhiPenalty));
    return { dignityLevel:'exalted', positionalScore:pos, structuralScore:structural, isSandhi, placementFlags,
      description: proximity <= 3 ? `${planet} at deep exaltation degree — maximum force` : `${planet} exalted in ${signName(signNumber)}` };
  }

  // Debilitation
  if (signNumber === data.debilSign) {
    const proximity = Math.abs(degreeInSign - data.debilDegree);
    const penalty = proximity <= 3 ? 10 : proximity <= 6 ? 7 : proximity <= 9 ? 4 : 0;
    const pos = Math.max(0, POSITIONAL_SCORES.debilitated - penalty);
    placementFlags.push('debilitated');
    const structural = Math.max(0, pos + houseMod + sandhiPenalty);
    return { dignityLevel:'debilitated', positionalScore:pos, structuralScore:structural, isSandhi, placementFlags,
      description: proximity <= 3 ? `${planet} at exact debilitation — maximum weakness` : `${planet} debilitated in ${signName(signNumber)}` };
  }

  // Moolatrikona
  if (signNumber === data.moolatrikonSign && degreeInSign >= data.mtStart && degreeInSign <= data.mtEnd) {
    placementFlags.push('moolatrikona');
    const pos = POSITIONAL_SCORES.moolatrikona;
    const structural = Math.max(0, Math.min(100, pos + houseMod + sandhiPenalty));
    return { dignityLevel:'moolatrikona', positionalScore:pos, structuralScore:structural, isSandhi, placementFlags, description:`${planet} in Moolatrikona — peak own-sign force` };
  }

  // Own sign
  if (data.ownSigns.includes(signNumber)) {
    const pos = POSITIONAL_SCORES.own_sign;
    const structural = Math.max(0, Math.min(100, pos + houseMod + sandhiPenalty));
    return { dignityLevel:'own_sign', positionalScore:pos, structuralScore:structural, isSandhi, placementFlags, description:`${planet} in own sign` };
  }

  // Compound friendship
  const signLord = SIGN_LORDS[signNumber];
  const rel = getPlanetSignRelationship(planet, signNumber, signLord, planetSigns);
  const level = relToDignity(rel);
  const pos = POSITIONAL_SCORES[level];
  const structural = Math.max(0, Math.min(100, pos + houseMod + sandhiPenalty));
  return { dignityLevel:level, positionalScore:pos, structuralScore:structural, isSandhi, placementFlags, description:buildRelDesc(planet, level, signLord) };
}

export function getPositionalScore(level: DignityLevel): number { return POSITIONAL_SCORES[level]; }

export function getDignityLabel(level: DignityLevel): string {
  return { exalted:'Exalted', moolatrikona:'Moolatrikona', own_sign:'Own sign',
    great_friend:'Great friend', friend:'Friendly', neutral:'Neutral',
    enemy:'Enemy sign', great_enemy:'Great enemy', debilitated:'Debilitated' }[level];
}

export function getSimpleDignity(planet: string, signNumber: number): DignityLevel {
  const ex:  Record<string,number> = {Sun:1,Moon:2,Mars:10,Mercury:6,Jupiter:4,Venus:12,Saturn:7,Rahu:2,Ketu:8};
  const deb: Record<string,number> = {Sun:7,Moon:8,Mars:4,Mercury:12,Jupiter:10,Venus:6,Saturn:1,Rahu:8,Ketu:2};
  const mt:  Record<string,number> = {Sun:5,Moon:2,Mars:1,Mercury:6,Jupiter:9,Venus:7,Saturn:11};
  const own: Record<string,number[]> = {Sun:[5],Moon:[4],Mars:[1,8],Mercury:[3,6],Jupiter:[9,12],Venus:[2,7],Saturn:[10,11]};
  if (ex[planet] === signNumber)             return 'exalted';
  if (deb[planet] === signNumber)            return 'debilitated';
  if (mt[planet] === signNumber)             return 'moolatrikona';
  if ((own[planet]??[]).includes(signNumber)) return 'own_sign';
  return 'neutral';
}

function relToDignity(rel: 'great_friend'|'friend'|'neutral'|'enemy'|'great_enemy'): DignityLevel {
  return { great_friend:'great_friend', friend:'friend', neutral:'neutral', enemy:'enemy', great_enemy:'great_enemy' }[rel] as DignityLevel;
}

function buildRelDesc(planet: string, level: DignityLevel, lord: string): string {
  const m: Partial<Record<DignityLevel,string>> = {
    great_friend:`${planet} in great friend's sign (${lord})`, friend:`${planet} in friendly sign (${lord})`,
    neutral:`${planet} in neutral sign (${lord})`, enemy:`${planet} in enemy sign (${lord})`,
    great_enemy:`${planet} in great enemy's sign (${lord})`,
  };
  return m[level] ?? `${planet} placement`;
}

function signName(n: number): string {
  return ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][n-1]??`Sign ${n}`;
}
