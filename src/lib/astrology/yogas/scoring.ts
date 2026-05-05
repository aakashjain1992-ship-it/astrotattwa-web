/**
 * Yoga & Dosha scoring engines (per spec §7).
 *
 * Pure functions — no side effects. Input is summarised "factor" object,
 * output is a clamped 0–100 score + breakdown.
 *
 * Scoring weights (yogas):
 *   Base 30, Planet 15, House 15, Dignity 15, Aspect 10, Relationship 10,
 *   Dasha 5, Affliction penalty −20 max, Cancellation penalty −20 max.
 *
 * Scoring weights (doshas):
 *   Base 30, Placement 20, Orb 15, Intensity 10, Affliction +15, LifeArea 10,
 *   Cancellation relief −30 max.
 */

import type {
  YogaScoreBreakdown,
  DoshaScoreBreakdown,
  StrengthLabel,
  SeverityLabel,
  YogaCategory,
} from './types'
import type { DignityKind } from './helpers'
import {
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  DUSTHANA_HOUSES,
  UPACHAYA_HOUSES,
} from './helpers'

const clamp = (n: number, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Math.round(n)))

// ---------- Component scorers ----------

export function scoreDignity(d: DignityKind): number {
  switch (d) {
    case 'exalted':
      return 15
    case 'mooltrikona':
      return 14
    case 'own':
      return 13
    case 'friendly':
      return 10
    case 'neutral':
      return 7
    case 'enemy':
      return 4
    case 'debilitated':
      return 1
  }
}

export function scorePlanetCondition(opts: {
  dignity: DignityKind
  combust?: boolean
  retrograde?: boolean
}): number {
  let s = scoreDignity(opts.dignity)
  if (opts.combust) s -= 4
  return Math.max(0, s)
}

export function scoreAveragePlanetStrength(
  conditions: Array<{
    dignity: DignityKind
    combust?: boolean
    retrograde?: boolean
  }>,
): number {
  if (conditions.length === 0) return 0
  const total = conditions.reduce((acc, c) => acc + scorePlanetCondition(c), 0)
  return Math.round(total / conditions.length)
}

/**
 * House-placement strength. For Vipreet Raj yogas the caller should bypass
 * this and use scoreVipreetHousePlacement instead.
 */
export function scoreHousePlacement(houses: number[]): number {
  if (houses.length === 0) return 0
  let best = 0
  for (const h of houses) {
    let s = 6 // neutral default
    if (KENDRA_HOUSES.includes(h as 1 | 4 | 7 | 10)) s = 15
    else if (TRIKONA_HOUSES.includes(h as 1 | 5 | 9)) s = 15
    else if (h === 2 || h === 11) s = 12
    else if (UPACHAYA_HOUSES.includes(h as 3 | 6 | 10 | 11)) s = 10
    else if (DUSTHANA_HOUSES.includes(h as 6 | 8 | 12)) s = 3
    if (s > best) best = s
  }
  return best
}

/** For Vipreet Raj yogas — dusthana placement is the *condition*, not a penalty. */
export function scoreVipreetHousePlacement(houses: number[]): number {
  if (houses.length === 0) return 0
  // Treat any dusthana placement as full credit — that's the rule
  return houses.some((h) => DUSTHANA_HOUSES.includes(h as 6 | 8 | 12)) ? 12 : 6
}

export interface AspectSupportFactors {
  hasJupiterSupport?: boolean
  hasVenusSupport?: boolean
  hasStrongLagnaLord?: boolean
  hasMercurySupport?: boolean
  hasWaxingMoonSupport?: boolean
}

export function scoreAspectSupport(f: AspectSupportFactors): number {
  let s = 0
  if (f.hasJupiterSupport) s += 4
  if (f.hasVenusSupport) s += 3
  if (f.hasStrongLagnaLord) s += 3
  if (f.hasMercurySupport) s += 2
  if (f.hasWaxingMoonSupport) s += 2
  return Math.min(10, s)
}

export type RelationshipKind =
  | 'sameHouse'
  | 'mutualAspect'
  | 'oneAspectsOther'
  | 'exchange'
  | 'placedInOtherHouse'
  | 'conjunction'

/** Relationship quality — house-relationship variant. */
export function scoreLordRelationship(kinds: ReadonlyArray<RelationshipKind>): number {
  if (kinds.length === 0) return 0
  let best = 0
  for (const k of kinds) {
    let s = 0
    if (k === 'sameHouse' || k === 'conjunction') s = 10
    else if (k === 'exchange') s = 10
    else if (k === 'mutualAspect') s = 8
    else if (k === 'placedInOtherHouse') s = 7
    else if (k === 'oneAspectsOther') s = 6
    if (s > best) best = s
  }
  return best
}

/** Conjunction-orb based relationship. */
export function scoreConjunctionOrb(orbDeg: number): number {
  if (orbDeg <= 3) return 10
  if (orbDeg <= 6) return 8
  if (orbDeg <= 10) return 6
  if (orbDeg <= 15) return 4
  return 2
}

export interface DashaActivationFactors {
  mahadashaIsYogaPlanet?: boolean
  antardashaIsYogaPlanet?: boolean
  pratyantarIsYogaPlanet?: boolean
  /** When current dasha context unavailable, dasha factor is 0 */
  dashaUnavailable?: boolean
}

export function scoreDashaActivation(f: DashaActivationFactors): number {
  if (f.dashaUnavailable) return 0
  let s = 0
  if (f.mahadashaIsYogaPlanet) s += 3
  if (f.antardashaIsYogaPlanet) s += 2
  if (f.pratyantarIsYogaPlanet) s += 1
  return Math.min(5, s)
}

export interface AfflictionFactors {
  involvedDebilitated?: boolean
  involvedCombust?: boolean
  involvedConjunctNode?: boolean
  involvedAfflictedBySaturnOrMars?: boolean
  hemmedByMalefics?: boolean
  inUnwantedDusthana?: boolean
}

export function scoreAfflictionPenalty(f: AfflictionFactors): number {
  let p = 0
  if (f.involvedDebilitated) p += 8
  if (f.involvedCombust) p += 5
  if (f.involvedConjunctNode) p += 6
  if (f.involvedAfflictedBySaturnOrMars) p += 4
  if (f.hemmedByMalefics) p += 5
  if (f.inUnwantedDusthana) p += 5
  return Math.min(20, p)
}

export interface CancellationFactors {
  weakInD9?: boolean
  extremelyAfflicted?: boolean
  lowOrbRelevance?: boolean
  kemadrumaCancellationFactor?: number
  mangalCancellationFactor?: number
}

export function scoreCancellationPenalty(f: CancellationFactors): number {
  let p = 0
  if (f.weakInD9) p += 5
  if (f.extremelyAfflicted) p += 5
  if (f.lowOrbRelevance) p += 5
  if (f.kemadrumaCancellationFactor)
    p += Math.min(20, f.kemadrumaCancellationFactor)
  if (f.mangalCancellationFactor)
    p += Math.min(20, f.mangalCancellationFactor)
  return Math.min(20, p)
}

// ---------- Top-level Yoga score ----------

export interface YogaScoreInput {
  base?: number // default 30
  planetStrength: number // 0-15
  houseStrength: number // 0-15
  dignity: number // 0-15
  aspect: number // 0-10
  relationship: number // 0-10
  dasha: number // 0-5
  afflictionPenalty: number // 0-20
  cancellationPenalty: number // 0-20
}

export function computeYogaScore(input: YogaScoreInput): YogaScoreBreakdown {
  const base = input.base ?? 30
  const additive =
    base +
    input.planetStrength +
    input.houseStrength +
    input.dignity +
    input.aspect +
    input.relationship +
    input.dasha
  const final = clamp(additive - input.afflictionPenalty - input.cancellationPenalty)
  return {
    base,
    planetStrength: input.planetStrength,
    houseStrength: input.houseStrength,
    dignity: input.dignity,
    aspect: input.aspect,
    relationship: input.relationship,
    dasha: input.dasha,
    afflictionPenalty: input.afflictionPenalty,
    cancellationPenalty: input.cancellationPenalty,
    final,
  }
}

// ---------- Top-level Dosha score ----------

export interface DoshaScoreInput {
  base?: number // default 30
  placementSeverity: number // 0-20
  orbCloseness: number // 0-15
  planetIntensity: number // 0-10
  afflictionBoost: number // 0-15
  lifeAreaImpact: number // 0-10
  cancellationRelief: number // 0-30
}

export function computeDoshaScore(input: DoshaScoreInput): DoshaScoreBreakdown {
  const base = input.base ?? 30
  const additive =
    base +
    input.placementSeverity +
    input.orbCloseness +
    input.planetIntensity +
    input.afflictionBoost +
    input.lifeAreaImpact
  const final = clamp(additive - input.cancellationRelief)
  return {
    base,
    placementSeverity: input.placementSeverity,
    orbCloseness: input.orbCloseness,
    planetIntensity: input.planetIntensity,
    afflictionBoost: input.afflictionBoost,
    lifeAreaImpact: input.lifeAreaImpact,
    cancellationRelief: input.cancellationRelief,
    final,
  }
}

// ---------- Labels ----------

export function getStrengthLabel(score: number): StrengthLabel | null {
  if (score <= 0) return null
  if (score <= 30) return 'weak'
  if (score <= 55) return 'moderate'
  if (score <= 75) return 'strong'
  if (score <= 90) return 'very_strong'
  return 'exceptional'
}

export function getSeverityLabel(score: number): SeverityLabel | null {
  if (score <= 0) return null
  if (score <= 30) return 'mild'
  if (score <= 55) return 'moderate'
  if (score <= 75) return 'strong'
  return 'very_strong'
}

export function strengthLabelText(l: StrengthLabel | null): string {
  switch (l) {
    case 'weak':
      return 'Weak'
    case 'moderate':
      return 'Moderate'
    case 'strong':
      return 'Strong'
    case 'very_strong':
      return 'Very Strong'
    case 'exceptional':
      return 'Exceptional'
    default:
      return 'Not Present'
  }
}

export function severityLabelText(l: SeverityLabel | null): string {
  switch (l) {
    case 'mild':
      return 'Mild'
    case 'moderate':
      return 'Moderate'
    case 'strong':
      return 'Strong'
    case 'very_strong':
      return 'Very Strong'
    default:
      return 'Not Present'
  }
}

// ---------- Category weight (used by displayPriority) ----------

export function categoryWeight(c: YogaCategory): number {
  switch (c) {
    case 'mahapurusha':
      return 20
    case 'raja':
      return 18
    case 'dhana':
      return 16
    case 'vipreet_raja':
      return 15
    case 'dosha':
      return 14
    case 'moon':
      return 12
    case 'marriage':
      return 10
    case 'career':
      return 10
    case 'general':
      return 5
  }
}
