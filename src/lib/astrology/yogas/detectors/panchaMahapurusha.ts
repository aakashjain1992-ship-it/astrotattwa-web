/**
 * Pancha Mahapurusha Yogas — 5 detectors.
 *
 * Rule: A non-luminary, non-node planet (Mars, Mercury, Jupiter, Venus, Saturn)
 *   is in a Kendra house from Lagna AND in its own / Mooltrikona / exalted sign.
 */

import type { PlanetKey, PlanetData } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  KENDRA_HOUSES,
  OWN_OR_EXALT_OR_MT,
  getPlanetHouseFromLagna,
  getDignity,
  isContextualBenefic,
  planetAspectsPlanet,
} from '../helpers'
import {
  computeYogaScore,
  scoreDignity,
  scorePlanetCondition,
  scoreHousePlacement,
  scoreAspectSupport,
  scoreLordRelationship,
  scoreDashaActivation,
  scoreAfflictionPenalty,
  scoreCancellationPenalty,
  getStrengthLabel,
} from '../scoring'
import { YOGA_MEANINGS } from '../meanings'

interface MahapurushaSpec {
  id: keyof typeof YOGA_MEANINGS
  planet: PlanetKey
}

const SPECS: MahapurushaSpec[] = [
  { id: 'ruchaka', planet: 'Mars' },
  { id: 'bhadra', planet: 'Mercury' },
  { id: 'hamsa', planet: 'Jupiter' },
  { id: 'malavya', planet: 'Venus' },
  { id: 'shasha', planet: 'Saturn' },
]

function isAfflictedByMaleficAspect(
  target: PlanetKey,
  targetData: PlanetData,
  planets: Record<string, PlanetData>,
): boolean {
  for (const k of ['Saturn', 'Mars', 'Rahu', 'Ketu'] as PlanetKey[]) {
    if (k === target) continue
    const p = planets[k]
    if (!p) continue
    if (planetAspectsPlanet(k, p, targetData)) return true
  }
  return false
}

function buildEmpty(spec: MahapurushaSpec): YogaResult {
  const m = YOGA_MEANINGS[spec.id]
  return {
    id: spec.id,
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: false,
    score: 0,
    strength: null,
    scoreBreakdown: {
      base: 0,
      planetStrength: 0,
      houseStrength: 0,
      dignity: 0,
      aspect: 0,
      relationship: 0,
      dasha: 0,
      afflictionPenalty: 0,
      cancellationPenalty: 0,
      final: 0,
    },
    technicalReason: '',
    planetsInvolved: [spec.planet],
    housesInvolved: [],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: false,
  }
}

function detectOne(spec: MahapurushaSpec, ctx: YogaEngineInput): YogaResult {
  const planet = ctx.planets[spec.planet]
  if (!planet) return buildEmpty(spec)

  const house = getPlanetHouseFromLagna(planet, ctx.ascendant)
  const inKendra = (KENDRA_HOUSES as readonly number[]).includes(house)
  const inSign = OWN_OR_EXALT_OR_MT[spec.planet].includes(planet.sign)
  const present = inKendra && inSign
  if (!present) return buildEmpty(spec)

  const dignity = getDignity(spec.planet, planet)
  const dignityScore = scoreDignity(dignity)
  const planetStrength = scorePlanetCondition({ dignity, combust: planet.combust })
  const houseStrength = scoreHousePlacement([house])

  // Aspect support
  const jupiter = ctx.planets.Jupiter
  const venus = ctx.planets.Venus
  const moon = ctx.planets.Moon
  const aspect = scoreAspectSupport({
    hasJupiterSupport:
      !!jupiter && spec.planet !== 'Jupiter' && planetAspectsPlanet('Jupiter', jupiter, planet),
    hasVenusSupport:
      !!venus && spec.planet !== 'Venus' && planetAspectsPlanet('Venus', venus, planet),
    hasMercurySupport: false,
    hasWaxingMoonSupport:
      !!moon && spec.planet !== 'Moon' && isContextualBenefic('Moon', moon, ctx.planets),
  })
  const relationship = scoreLordRelationship(['conjunction']) // self placement

  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: ctx.currentDasha?.mahadasha === spec.planet,
    antardashaIsYogaPlanet: ctx.currentDasha?.antardasha === spec.planet,
    pratyantarIsYogaPlanet: ctx.currentDasha?.pratyantar === spec.planet,
    dashaUnavailable: !ctx.currentDasha,
  })

  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: false, // own/exalted is the condition
    involvedCombust: planet.combust,
    involvedConjunctNode: ['Rahu', 'Ketu'].some(
      (n) => ctx.planets[n]?.signNumber === planet.signNumber,
    ),
    involvedAfflictedBySaturnOrMars:
      spec.planet !== 'Saturn' &&
      spec.planet !== 'Mars' &&
      isAfflictedByMaleficAspect(spec.planet, planet, ctx.planets),
  })
  const cancellationPenalty = scoreCancellationPenalty({})

  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity: dignityScore,
    aspect,
    relationship,
    dasha,
    afflictionPenalty,
    cancellationPenalty,
  })
  const m = YOGA_MEANINGS[spec.id]
  return {
    id: spec.id,
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `${spec.planet} is in ${planet.sign} (${dignity}) in house ${house} (Kendra).`,
    planetsInvolved: [spec.planet],
    housesInvolved: [house],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectPanchaMahapurusha(ctx: YogaEngineInput): YogaResult[] {
  return SPECS.map((s) => detectOne(s, ctx))
}
