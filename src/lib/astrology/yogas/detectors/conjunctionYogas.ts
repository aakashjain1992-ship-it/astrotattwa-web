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
  ordinalSuffix,
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

// ─── Narrative builders ───────────────────────────────────────────────────────

const HOUSE_THEME: Record<number, string> = {
  1:  'self, identity, and the overall direction of life',
  2:  'speech, resources, and accumulated knowledge',
  3:  'communication, initiative, writing, and short-distance travel',
  4:  'home, emotional security, and private life',
  5:  'intelligence, creativity, learning, and children',
  6:  'service, health, problem-solving, and overcoming obstacles',
  7:  'partnerships, relationships, and public dealings',
  8:  'depth, transformation, research, and hidden knowledge',
  9:  'higher wisdom, fortune, teaching, and long-distance connections',
  10: 'career, reputation, and public contribution',
  11: 'income, social networks, and the fulfilment of ambitions',
  12: 'spiritual insight, private reflection, and release',
}

function buildBudhadityaNarrative(sign: string, house: number, orb: number, combust: boolean): string {
  const parts: string[] = []
  parts.push(
    `Sun and Mercury are both placed in ${sign} in the ${ordinalSuffix(house)} house — the house of ${HOUSE_THEME[house] ?? 'life experience'}. This is the condition for Budhaditya Yoga: Mercury, the planet of intellect and communication, is conjunct the Sun, lending a sharpness and directness to how you think and express yourself.`
  )
  if (combust) {
    parts.push(
      `Mercury is in close proximity to the Sun (orb ${orb.toFixed(1)}°) — a condition known as combustion. While Mercury's qualities of analysis and expression are still present, combustion can internalise them: the thinking becomes intense and self-directed rather than easily shared with others. Insight may run ahead of the ability to communicate it.`
    )
  } else {
    parts.push(
      `The ${ordinalSuffix(house)} house placement channels these combined Sun-Mercury qualities into ${HOUSE_THEME[house] ?? 'this area of life'} — there is a natural tendency to pursue clarity, articulate your understanding with conviction, and apply your mind with purpose in this domain.`
    )
  }
  return parts.join('\n\n')
}

function buildGuruChandalNarrative(jupSign: string, jupHouse: number, node: string, orb: number): string {
  const parts: string[] = []
  const nodeDesc = node === 'Rahu'
    ? 'Rahu, the north node — associated with ambition, unconventional desire, and the pull toward unfamiliar experience'
    : 'Ketu, the south node — associated with detachment, past-life wisdom, and a tendency toward non-attachment or disillusionment'
  parts.push(
    `Jupiter is placed in ${jupSign} in the ${ordinalSuffix(jupHouse)} house, conjunct ${nodeDesc} (orb ${orb.toFixed(1)}°). This is the condition for Guru Chandal Yoga — a configuration where the planet of wisdom and principles comes into contact with a node of the Moon.`
  )
  if (node === 'Rahu') {
    parts.push(
      `This conjunction can manifest as an unusually ambitious or unconventional orientation to knowledge, teaching, philosophy, or belief. The desire to learn and grow may be intensified but also coloured by restlessness — a tendency to question established frameworks and explore beyond traditional boundaries. At its best, this produces original thinking; at its most challenging, it can make it harder to settle on a stable worldview.`
    )
  } else {
    parts.push(
      `Ketu's conjunction with Jupiter can produce a dispassionate or spiritually inclined relationship with knowledge and wisdom. There may be an instinctive understanding of deeper truths that bypasses conventional learning — but also a tendency to dismiss or undervalue formal education, conventional guidance, or the accumulated wisdom of tradition.`
    )
  }
  return parts.join('\n\n')
}

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
    chartNarrative: buildBudhadityaNarrative(sun.sign, sunHouse, orb, mer.combust),
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
  // Reduce severity if Jupiter is exalted — its wisdom overpowers Rahu's confusion,
  // making this challenging yoga less impactful than when Jupiter is weak.
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
    chartNarrative: buildGuruChandalNarrative(jup.sign, jupHouse, node, orb),
    planetsInvolved: ['Jupiter', node],
    housesInvolved: [jupHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectConjunctionYogas(ctx: YogaEngineInput): YogaResult[] {
  return [detectBudhaditya(ctx), detectGuruChandal(ctx)]
}
