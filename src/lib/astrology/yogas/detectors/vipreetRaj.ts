/**
 * Vipreet Raj yogas — Harsha (6L), Sarala (8L), Vimala (12L) in dusthana.
 * Dusthana placement is the *condition*, not a penalty.
 */

import type { PlanetKey } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  DUSTHANA_HOUSES,
  getHouseLord,
  getPlanetHouseFromLagna,
  getDignity,
  isDebilitated,
  planetAspectsPlanet,
} from '../helpers'
import {
  computeYogaScore,
  scoreDignity,
  scorePlanetCondition,
  scoreVipreetHousePlacement,
  scoreAspectSupport,
  scoreLordRelationship,
  scoreDashaActivation,
  scoreAfflictionPenalty,
  getStrengthLabel,
} from '../scoring'
import { YOGA_MEANINGS } from '../meanings'

interface VipreetSpec {
  id: 'harsha' | 'sarala' | 'vimala'
  ruledHouse: 6 | 8 | 12
}

const SPECS: VipreetSpec[] = [
  { id: 'harsha', ruledHouse: 6 },
  { id: 'sarala', ruledHouse: 8 },
  { id: 'vimala', ruledHouse: 12 },
]

function empty(id: string): YogaResult {
  const m = YOGA_MEANINGS[id]
  return {
    id,
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
    planetsInvolved: [],
    housesInvolved: [],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: false,
  }
}

function detectOne(spec: VipreetSpec, ctx: YogaEngineInput): YogaResult {
  const lord = getHouseLord(spec.ruledHouse, ctx.ascendant)
  const lordData = ctx.planets[lord]
  if (!lordData) return empty(spec.id)

  const lordHouse = getPlanetHouseFromLagna(lordData, ctx.ascendant)
  if (!(DUSTHANA_HOUSES as readonly number[]).includes(lordHouse)) return empty(spec.id)

  const dignity = getDignity(lord, lordData)
  const planetStrength = scorePlanetCondition({ dignity, combust: lordData.combust })
  const houseStrength = scoreVipreetHousePlacement([lordHouse])
  const dignityScore = scoreDignity(dignity)
  // Aspect support
  const jup = ctx.planets.Jupiter
  const aspect = scoreAspectSupport({
    hasJupiterSupport:
      !!jup && lord !== 'Jupiter' && planetAspectsPlanet('Jupiter', jup, lordData),
  })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: ctx.currentDasha?.mahadasha === lord,
    antardashaIsYogaPlanet: ctx.currentDasha?.antardasha === lord,
    pratyantarIsYogaPlanet: ctx.currentDasha?.pratyantar === lord,
    dashaUnavailable: !ctx.currentDasha,
  })
  // Don't penalise dusthana placement — that's the rule.
  // But debilitation/combustion of the lord still matters.
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: isDebilitated(lord, lordData),
    involvedCombust: lordData.combust,
  })
  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity: dignityScore,
    aspect,
    relationship,
    dasha,
    afflictionPenalty,
    cancellationPenalty: 0,
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
    technicalReason: `${spec.ruledHouse}th-house lord ${lord} is placed in house ${lordHouse} (dusthana).`,
    planetsInvolved: [lord as PlanetKey],
    housesInvolved: [spec.ruledHouse, lordHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectVipreetRaj(ctx: YogaEngineInput): YogaResult[] {
  return SPECS.map((s) => detectOne(s, ctx))
}
