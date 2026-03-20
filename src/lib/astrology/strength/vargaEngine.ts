/**
 * Varga Engine — Layer 4: Domain-Specific Varga Weighting
 * Spec domain weightings:
 * Marriage: D1=35%, D9=45%, 7th-frame=20%
 * Career:   D1=40%, D10=40%, D9=20%
 * Children: D1=40%, D7=40%, D9=20%
 * etc.
 */

import type { VargaAssessment, VargaStatus, DignityLevel, ConfidenceGrade } from './types';
import type { PlanetData } from '@/types/astrology';
import {
  NAVAMSA_CONFIG, DASAMSA_CONFIG, SAPTAMSA_CONFIG,
  CHATURTHAMSA_CONFIG, SHODASAMSA_CONFIG, VIMSHAMSA_CONFIG,
  SIDDHAMSA_CONFIG, TRIMSAMSA_CONFIG,
} from '@/lib/astrology/divisionalChartBuilder';
import { getSimpleDignity, getDignityLabel, getPositionalScore } from './dignityEngine';

type DomainKey = 'marriage' | 'career' | 'children' | 'home' | 'spirituality' | 'wealth' | 'learning';

// Domain-specific varga configs
const DOMAIN_VARGAS: Record<DomainKey, { primary: typeof NAVAMSA_CONFIG; d1Weight: number; primaryWeight: number; d9Weight: number }> = {
  marriage:    { primary: NAVAMSA_CONFIG,    d1Weight: 0.35, primaryWeight: 0.45, d9Weight: 0.20 },
  career:      { primary: DASAMSA_CONFIG,    d1Weight: 0.40, primaryWeight: 0.40, d9Weight: 0.20 },
  children:    { primary: SAPTAMSA_CONFIG,   d1Weight: 0.40, primaryWeight: 0.40, d9Weight: 0.20 },
  home:        { primary: CHATURTHAMSA_CONFIG,d1Weight: 0.50, primaryWeight: 0.35, d9Weight: 0.15 },
  spirituality:{ primary: VIMSHAMSA_CONFIG,  d1Weight: 0.35, primaryWeight: 0.30, d9Weight: 0.35 },
  wealth:      { primary: NAVAMSA_CONFIG,    d1Weight: 0.50, primaryWeight: 0.20, d9Weight: 0.30 }, // D9 proxy for wealth depth
  learning:    { primary: SIDDHAMSA_CONFIG,  d1Weight: 0.40, primaryWeight: 0.40, d9Weight: 0.20 },
};

function dignityToScore(level: DignityLevel): number {
  return getPositionalScore(level);
}

function computeVargaScore(planet: string, longitude: number, config: typeof NAVAMSA_CONFIG): number {
  const sign = config.calculateSign(longitude);
  const dignity = getSimpleDignity(planet, sign);
  return dignityToScore(dignity);
}

/** Whether a planet is D9-sensitive (Venus, Jupiter, 7L, lagna lord) */
function isD9Sensitive(planet: string, housesRuled: number[]): boolean {
  return planet === 'Venus' || planet === 'Jupiter' ||
    housesRuled.includes(7) || housesRuled.includes(1);
}

export function computeVargaAssessment(
  planet: string, d1SignNumber: number, d1DignityLevel: DignityLevel,
  longitude: number, lagnaSign: number, housesRuled: number[]
): VargaAssessment {
  const d9Sign    = NAVAMSA_CONFIG.calculateSign(longitude);
  const d9Dignity = getSimpleDignity(planet, d9Sign);
  const isVargottama = d1SignNumber === d9Sign;
  const sensitive = isD9Sensitive(planet, housesRuled);

  const d1Strong = ['exalted','moolatrikona','own_sign','great_friend','friend'].includes(d1DignityLevel);
  const d1Weak   = ['enemy','great_enemy','debilitated'].includes(d1DignityLevel);
  const d9Strong = ['exalted','moolatrikona','own_sign'].includes(d9Dignity);
  const d9Weak   = d9Dignity === 'debilitated';

  let vargaStatus: VargaStatus;
  let vargaSupportScore: number;
  let vargaConfidence: ConfidenceGrade;
  let note: string;

  if (isVargottama) {
    vargaStatus = 'confirmed'; vargaSupportScore = 20; vargaConfidence = 'high';
    note = `Vargottama — same sign in D1 and D9, maximum confidence`;
  } else if (d1Strong && d9Strong) {
    vargaStatus = 'confirmed'; vargaSupportScore = 18; vargaConfidence = 'high';
    note = `D9 ${getDignityLabel(d9Dignity)} confirms D1 — high reliability`;
  } else if (d1Strong && d9Weak) {
    const score = sensitive ? 4 : 6;
    vargaStatus = 'contradicted'; vargaSupportScore = score; vargaConfidence = 'low';
    note = sensitive
      ? `D9 debilitated — this planet is marriage/dharma-sensitive. Strong externally, internally unstable.`
      : `D9 debilitated contradicts D1 strength — external power, internal fragility`;
  } else if (d1Weak && d9Strong) {
    vargaStatus = 'mixed'; vargaSupportScore = 12; vargaConfidence = 'moderate';
    note = `D9 ${getDignityLabel(d9Dignity)} redeems D1 weakness — improves with maturity`;
  } else if (d1Weak && d9Weak) {
    vargaStatus = 'contradicted'; vargaSupportScore = 2; vargaConfidence = 'low';
    note = `Both D1 and D9 weak — consistent pattern of weakness`;
  } else {
    vargaStatus = 'mixed'; vargaSupportScore = 10; vargaConfidence = 'moderate';
    note = `D9 ${getDignityLabel(d9Dignity)} — moderate support`;
  }

  // Compute domain-specific varga scores
  const domainVargaScores: Partial<Record<string, number>> = {};
  const domainVargaNotes: Partial<Record<string, string>>  = {};

  for (const [domain, cfg] of Object.entries(DOMAIN_VARGAS)) {
    const d1Score = dignityToScore(d1DignityLevel);
    const primarySign = cfg.primary.calculateSign(longitude);
    const primaryDignity = getSimpleDignity(planet, primarySign);
    const primaryScore = dignityToScore(primaryDignity);
    const d9Score = dignityToScore(d9Dignity);

    const domainScore = d1Score * cfg.d1Weight + primaryScore * cfg.primaryWeight + d9Score * cfg.d9Weight;
    domainVargaScores[domain] = Math.round(domainScore);

    const primaryLabel = getDignityLabel(primaryDignity);
    if (primaryDignity !== d1DignityLevel) {
      domainVargaNotes[domain] = `${domain}: D1 ${getDignityLabel(d1DignityLevel)}, domain chart ${primaryLabel}`;
    }
  }

  return {
    d9SignNumber: d9Sign, d9DignityLevel: d9Dignity,
    d9Confirms: vargaStatus === 'confirmed',
    d9Contradicts: vargaStatus === 'contradicted',
    vargaStatus, vargaSupportScore, vargaConfidence, note,
    domainVargaScores, domainVargaNotes,
    hasD9SecondPass: sensitive,
  };
}
