/**
 * Conjunction-based yogas:
 *   - Budhaditya: Sun + Mercury same sign
 *   - Guru Chandal: Jupiter + Rahu/Ketu same sign
 */

import type { PlanetKey } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  getPlanetHouseFromLagna,
  getDignity,
  isDebilitated,
  isExalted,
  degreeDiff,
} from '../helpers'
import {
  computeYogaScore,
  scoreDignity,
  scorePlanetCondition,
  scoreHousePlacement,
  scoreConjunctionOrb,
  scoreAspectSupport,
  scoreDashaActivation,
  scoreAfflictionPenalty,
  scoreCancellationPenalty,
  getStrengthLabel,
} from '../scoring'
import { YOGA_MEANINGS } from '../meanings'

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

function detectBudhaditya(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.budhaditya
  const sun = ctx.planets.Sun
  const mer = ctx.planets.Mercury
  if (!sun || !mer || sun.signNumber !== mer.signNumber) return empty('budhaditya')

  const orb = degreeDiff(sun.longitude, mer.longitude)
  const sunDignity = getDignity('Sun', sun)
  const merDignity = getDignity('Mercury', mer)
  const planetStrength = Math.round(
    (scorePlanetCondition({ dignity: sunDignity, combust: false }) +
      scorePlanetCondition({ dignity: merDignity, combust: mer.combust })) /
      2,
  )
  const sunHouse = getPlanetHouseFromLagna(sun, ctx.ascendant)
  const merHouse = getPlanetHouseFromLagna(mer, ctx.ascendant)
  const houseStrength = scoreHousePlacement([sunHouse, merHouse])
  const dignity = Math.round((scoreDignity(sunDignity) + scoreDignity(merDignity)) / 2)
  const relationship = scoreConjunctionOrb(orb)
  const aspect = scoreAspectSupport({})
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      ctx.currentDasha?.mahadasha === 'Sun' || ctx.currentDasha?.mahadasha === 'Mercury',
    antardashaIsYogaPlanet:
      ctx.currentDasha?.antardasha === 'Sun' || ctx.currentDasha?.antardasha === 'Mercury',
    pratyantarIsYogaPlanet:
      ctx.currentDasha?.pratyantar === 'Sun' || ctx.currentDasha?.pratyantar === 'Mercury',
    dashaUnavailable: !ctx.currentDasha,
  })
  // Combustion penalty: Mercury combust if very close
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedCombust: mer.combust && orb < 5,
    involvedDebilitated: isDebilitated('Mercury', mer),
  })
  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity,
    aspect,
    relationship,
    dasha,
    afflictionPenalty,
    cancellationPenalty: orb > 15 ? 6 : 0,
  })
  return {
    id: 'budhaditya',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Sun and Mercury both in ${sun.sign} (orb ${orb.toFixed(1)}°) in house ${sunHouse}.`,
    planetsInvolved: ['Sun', 'Mercury'],
    housesInvolved: [sunHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function detectGuruChandal(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.guruChandal
  const jup = ctx.planets.Jupiter
  if (!jup) return empty('guruChandal')

  const rahu = ctx.planets.Rahu
  const ketu = ctx.planets.Ketu
  let node: PlanetKey | null = null
  let orb = 999
  if (rahu && rahu.signNumber === jup.signNumber) {
    const o = degreeDiff(rahu.longitude, jup.longitude)
    if (o < orb) {
      orb = o
      node = 'Rahu'
    }
  }
  if (ketu && ketu.signNumber === jup.signNumber) {
    const o = degreeDiff(ketu.longitude, jup.longitude)
    if (o < orb) {
      orb = o
      node = 'Ketu'
    }
  }
  if (!node) return empty('guruChandal')

  const jupDignity = getDignity('Jupiter', jup)
  const planetStrength = scorePlanetCondition({
    dignity: jupDignity,
    combust: jup.combust,
  })
  const jupHouse = getPlanetHouseFromLagna(jup, ctx.ascendant)
  // For "challenging" yoga, use generic house impact (Kendra/Trikona = more impactful)
  const houseStrength =
    (KENDRA_HOUSES as readonly number[]).includes(jupHouse) ||
    (TRIKONA_HOUSES as readonly number[]).includes(jupHouse)
      ? 12
      : 7
  const dignity = scoreDignity(jupDignity)
  const aspect = scoreAspectSupport({})
  const relationship = scoreConjunctionOrb(orb)
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      ctx.currentDasha?.mahadasha === 'Jupiter' || ctx.currentDasha?.mahadasha === node,
    antardashaIsYogaPlanet:
      ctx.currentDasha?.antardasha === 'Jupiter' || ctx.currentDasha?.antardasha === node,
    pratyantarIsYogaPlanet:
      ctx.currentDasha?.pratyantar === 'Jupiter' || ctx.currentDasha?.pratyantar === node,
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: isDebilitated('Jupiter', jup),
  })
  const cancellationPenalty = scoreCancellationPenalty({
    lowOrbRelevance: orb > 12,
  })
  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity,
    aspect,
    relationship,
    dasha,
    afflictionPenalty,
    cancellationPenalty,
  })
  // Boost if Jupiter exalted — wisdom transformed rather than confused
  if (isExalted('Jupiter', jup)) breakdown.final = Math.max(0, breakdown.final - 8)

  return {
    id: 'guruChandal',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Jupiter is conjunct ${node} in ${jup.sign} (orb ${orb.toFixed(1)}°).`,
    planetsInvolved: ['Jupiter', node],
    housesInvolved: [jupHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectConjunctionYogas(ctx: YogaEngineInput): YogaResult[] {
  return [detectBudhaditya(ctx), detectGuruChandal(ctx)]
}
