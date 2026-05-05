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
  ordinalSuffix,
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

// ─── Narrative builders ───────────────────────────────────────────────────────

const VIPREET_HOUSE_SOURCE: Record<number, { theme: string; reversal: string }> = {
  6: {
    theme: 'the 6th house of obstacles, enemies, illness, and daily struggle',
    reversal: 'When the 6th lord is contained within the dusthana sector, the sources of opposition and difficulty in life tend to undermine themselves rather than gaining strength. Obstacles may appear — but they often collapse before reaching their full force, or end up strengthening you through the very resistance they create.',
  },
  8: {
    theme: 'the 8th house of hidden matters, sudden events, transformation, and joint resources',
    reversal: 'When the 8th lord operates within a dusthana context, the energies of disruption and sudden change tend to circle back and neutralise each other rather than destabilising your outer life. What might unsettle others can instead bring insight, resilience, or a turning of circumstances in your favour.',
  },
  12: {
    theme: 'the 12th house of loss, expenditure, foreign lands, and spiritual release',
    reversal: 'When the 12th lord is placed in a dusthana house, the tendency toward dispersal and outward loss is redirected. Rather than draining your energy or resources, this configuration can turn situations of apparent disadvantage into a form of hidden advantage — losses that free you from burden, or retreat that leads to renewal.',
  },
}

const DUSTHANA_PLACED_MEANING: Record<number, string> = {
  6: 'the 6th house (obstacles and adversaries)',
  8: 'the 8th house (transformation and hidden matters)',
  12: 'the 12th house (retreat and release)',
}

function buildVipreetNarrative(
  ruledHouse: number,
  lord: string,
  lordHouse: number,
  sign: string,
): string {
  const source = VIPREET_HOUSE_SOURCE[ruledHouse]
  if (!source) return ''
  const placedDesc = DUSTHANA_PLACED_MEANING[lordHouse] ?? `the ${ordinalSuffix(lordHouse)} house`
  const parts: string[] = []
  parts.push(
    `The lord of ${source.theme} is ${lord}, which is placed in ${placedDesc} of your chart — currently in ${sign}. This is the condition for ${ruledHouse === 6 ? 'Harsha' : ruledHouse === 8 ? 'Sarala' : 'Vimala'} Vipreet Raj Yoga: a dusthana lord contained within another dusthana.`
  )
  parts.push(source.reversal)
  parts.push(
    `The practical expression of this yoga depends on which period you are in. During ${lord} Mahadasha or Antardasha, the reversal quality tends to be most noticeable — situations that seem adverse can turn in unexpected ways, and your capacity to navigate difficulty without losing your footing is generally above average.`
  )
  return parts.join('\n\n')
}

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
  // Must be in a DIFFERENT dusthana — lord in its own house is not Vipreet Raj
  if (lordHouse === spec.ruledHouse) return empty(spec.id)

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
    chartNarrative: buildVipreetNarrative(spec.ruledHouse, lord, lordHouse, lordData.sign),
    planetsInvolved: [lord as PlanetKey],
    housesInvolved: [spec.ruledHouse, lordHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectVipreetRaj(ctx: YogaEngineInput): YogaResult[] {
  return SPECS.map((s) => detectOne(s, ctx))
}
