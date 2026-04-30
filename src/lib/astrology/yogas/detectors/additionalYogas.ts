/**
 * Additional classical yogas:
 *   - Adhi Yoga:       Mercury, Jupiter, Venus in 6th/7th/8th from Moon
 *   - Chandra-Mangal:  Moon + Mars conjunction or mutual 7th aspect
 *   - Saraswati Yoga:  Jupiter + Venus + Mercury all in Kendra/Trikona/2nd, Jupiter strong
 */

import type { PlanetKey } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  getPlanetHouseFromLagna,
  getPlanetHouseFromMoon,
  getHouseFromReference,
  getDignity,
  isDebilitated,
  isExalted,
  ordinalSuffix,
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
      base: 0, planetStrength: 0, houseStrength: 0, dignity: 0,
      aspect: 0, relationship: 0, dasha: 0, afflictionPenalty: 0, cancellationPenalty: 0, final: 0,
    },
    technicalReason: '',
    planetsInvolved: [],
    housesInvolved: [],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: false,
  }
}

// ─── Adhi Yoga ────────────────────────────────────────────────────────────────

const ADHI_BENEFICS = ['Mercury', 'Jupiter', 'Venus'] as const
const ADHI_HOUSES_FROM_MOON = [6, 7, 8] as const

function buildAdhiNarrative(
  qualified: PlanetKey[],
  moonSign: string,
  moonHouse: number,
): string {
  const count = qualified.length
  const planetStr = count === 1
    ? qualified[0]
    : count === 2
      ? `${qualified[0]} and ${qualified[1]}`
      : 'Mercury, Jupiter, and Venus'
  const grade = count === 3 ? 'the fullest form' : count === 2 ? 'a strong form' : 'a present form'
  const parts: string[] = []
  parts.push(
    `Your Moon is in ${moonSign} in the ${ordinalSuffix(moonHouse)} house. ${planetStr} — ${count === 1 ? 'a natural benefic' : 'natural benefics'} — ${count === 1 ? 'is' : 'are'} placed in the 6th, 7th, or 8th house from the Moon. This is Adhi Yoga in ${grade}: beneficial planets supporting the Moon from the arc of opposition, partnership, and transformation.`
  )
  if (count === 3) {
    parts.push(
      `With all three — Mercury (intellect), Jupiter (wisdom), and Venus (refinement) — in this arc from the Moon, the yoga is at its classical maximum. The Moon's emotional intelligence and public projection are backed by the full range of benefic qualities. Classical texts associate this with leadership positions, positions of authority, and the capacity to rise above opposition and competition through genuine personal quality.`
    )
  } else if (count === 2) {
    parts.push(
      `With two of the three classical benefics in this arc from the Moon, the yoga operates at a strong level. The Moon's capacity to navigate challenges, engage with partnerships, and process transformation is supported from this arc of the chart — giving you an advantage in situations where others might struggle with opposition or complex dynamics.`
    )
  } else {
    parts.push(
      `With one benefic in this arc from the Moon, the yoga is present in its weaker form. The support it provides is more specific — shaped by the particular planet involved — rather than comprehensive. It still indicates a meaningful advantage in navigating the domains associated with the 6th/7th/8th from your Moon.`
    )
  }
  return parts.join('\n\n')
}

function detectAdhiYoga(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.adhiYoga
  const moon = ctx.planets.Moon
  if (!moon) return empty('adhiYoga')

  const qualified: PlanetKey[] = []
  const qualifiedHouses: number[] = []
  for (const k of ADHI_BENEFICS) {
    const p = ctx.planets[k]
    if (!p) continue
    const hFromMoon = getPlanetHouseFromMoon(p, moon)
    if ((ADHI_HOUSES_FROM_MOON as readonly number[]).includes(hFromMoon)) {
      qualified.push(k)
      qualifiedHouses.push(hFromMoon)
    }
  }
  if (qualified.length === 0) return empty('adhiYoga')

  // Scale base by count: 3 benefics = full yoga, 2 = strong, 1 = weak
  const base = qualified.length === 3 ? 30 : qualified.length === 2 ? 22 : 15

  const conditions = qualified.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    conditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / conditions.length,
  )
  const dignity = Math.round(
    conditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) / conditions.length,
  )
  const moonHouse = getPlanetHouseFromLagna(moon, ctx.ascendant)
  const houseStrength = scoreHousePlacement([moonHouse])
  const aspect = scoreAspectSupport({
    hasJupiterSupport: qualified.includes('Jupiter'),
    hasVenusSupport: qualified.includes('Venus'),
  })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const allPlanets = new Set<PlanetKey>(['Moon', ...qualified])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: allPlanets.has(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: allPlanets.has(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: allPlanets.has(ctx.currentDasha?.pratyantar as PlanetKey),
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: qualified.some((k) => isDebilitated(k, ctx.planets[k])),
    involvedCombust: qualified.some((k) => ctx.planets[k].combust),
  })
  const breakdown = computeYogaScore({
    base, planetStrength, houseStrength, dignity, aspect, relationship, dasha,
    afflictionPenalty, cancellationPenalty: 0,
  })
  return {
    id: 'adhiYoga',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `${qualified.length} benefic(s) in 6th/7th/8th from Moon: ${qualified.join(', ')} (houses ${qualifiedHouses.join(', ')} from Moon).`,
    chartNarrative: buildAdhiNarrative(qualified, moon.sign, moonHouse),
    planetsInvolved: Array.from(allPlanets),
    housesInvolved: [...new Set([moonHouse, ...qualifiedHouses])],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

// ─── Chandra-Mangal Yoga ──────────────────────────────────────────────────────

function buildChandraMangalNarrative(
  moonSign: string,
  moonHouse: number,
  marsSign: string,
  marsHouse: number,
  conjunction: boolean,
): string {
  const parts: string[] = []
  if (conjunction) {
    parts.push(
      `Your Moon and Mars are both in ${moonSign} in the ${ordinalSuffix(moonHouse)} house — a conjunction. This is the condition for Chandra-Mangal Yoga in its strongest form: the emotional intelligence of the Moon and the drive and initiative of Mars are fused in the same sign.`
    )
  } else {
    parts.push(
      `Your Moon is in ${moonSign} in the ${ordinalSuffix(moonHouse)} house, and Mars is in ${marsSign} in the ${ordinalSuffix(marsHouse)} house — directly opposite, forming a mutual 7th aspect. This is Chandra-Mangal Yoga in its aspect form: the Moon and Mars are in active dialogue across the opposition axis of your chart.`
    )
  }
  parts.push(
    `This yoga is classically associated with a strong desire to earn, accumulate, and build material security through personal effort. The Moon's receptivity and Mars's assertiveness, when combined, create a personality that is emotionally motivated to act and financially motivated to persist. There is often a quality of courageous initiative — a willingness to compete, to take calculated risks, and to pursue goals with emotional conviction rather than hesitation.`
  )
  return parts.join('\n\n')
}

function detectChandraMangal(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.chandraMangal
  const moon = ctx.planets.Moon
  const mars = ctx.planets.Mars
  if (!moon || !mars) return empty('chandraMangal')

  const conjunction = moon.signNumber === mars.signNumber
  const hMarsFromMoon = getPlanetHouseFromMoon(mars, moon)
  const aspect = !conjunction && hMarsFromMoon === 7
  if (!conjunction && !aspect) return empty('chandraMangal')

  const moonDignity = getDignity('Moon', moon)
  const marsDignity = getDignity('Mars', mars)
  const planetStrength = Math.round(
    (scorePlanetCondition({ dignity: moonDignity, combust: moon.combust }) +
      scorePlanetCondition({ dignity: marsDignity, combust: mars.combust })) / 2,
  )
  const moonHouse = getPlanetHouseFromLagna(moon, ctx.ascendant)
  const marsHouse = getPlanetHouseFromLagna(mars, ctx.ascendant)
  const houseStrength = scoreHousePlacement([moonHouse, marsHouse])
  const dignity = Math.round((scoreDignity(moonDignity) + scoreDignity(marsDignity)) / 2)
  // Jupiter aspect provides moderating wisdom to this combination
  const jup = ctx.planets.Jupiter
  const hasJupiterMod =
    !!jup &&
    (planetAspectsPlanet('Jupiter', jup, moon) || planetAspectsPlanet('Jupiter', jup, mars))
  const aspectScore = scoreAspectSupport({ hasJupiterSupport: hasJupiterMod })
  // Conjunction stronger than mutual aspect
  const relationship = conjunction
    ? scoreLordRelationship(['sameHouse'])
    : scoreLordRelationship(['mutualAspect'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      ctx.currentDasha?.mahadasha === 'Moon' || ctx.currentDasha?.mahadasha === 'Mars',
    antardashaIsYogaPlanet:
      ctx.currentDasha?.antardasha === 'Moon' || ctx.currentDasha?.antardasha === 'Mars',
    pratyantarIsYogaPlanet:
      ctx.currentDasha?.pratyantar === 'Moon' || ctx.currentDasha?.pratyantar === 'Mars',
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: isDebilitated('Moon', moon) || isDebilitated('Mars', mars),
    involvedCombust: moon.combust || mars.combust,
  })
  // Aspect form is weaker than conjunction
  const cancellationPenalty = aspect ? 5 : 0
  const breakdown = computeYogaScore({
    planetStrength, houseStrength, dignity, aspect: aspectScore, relationship, dasha,
    afflictionPenalty, cancellationPenalty,
  })
  return {
    id: 'chandraMangal',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: conjunction
      ? `Moon and Mars are conjunct in ${moon.sign} (house ${moonHouse}).`
      : `Moon (house ${moonHouse}) and Mars (house ${marsHouse}) are in mutual 7th aspect.`,
    chartNarrative: buildChandraMangalNarrative(moon.sign, moonHouse, mars.sign, marsHouse, conjunction),
    planetsInvolved: ['Moon', 'Mars'],
    housesInvolved: conjunction ? [moonHouse] : [moonHouse, marsHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

// ─── Saraswati Yoga ──────────────────────────────────────────────────────────

// All qualifying houses: Kendra (1,4,7,10) + Trikona (5,9) + 2nd
const SARASWATI_QUALIFYING_HOUSES = new Set([1, 2, 4, 5, 7, 9, 10])

function buildSaraswatiNarrative(
  jupSign: string, jupHouse: number, jupDignity: string,
  venSign: string, venHouse: number,
  merSign: string, merHouse: number,
): string {
  const parts: string[] = []
  parts.push(
    `Jupiter (${jupDignity} in ${jupSign}, ${ordinalSuffix(jupHouse)} house), Venus (${venSign}, ${ordinalSuffix(venHouse)} house), and Mercury (${merSign}, ${ordinalSuffix(merHouse)} house) are all placed in Kendra, Trikona, or 2nd house positions from the Lagna — with Jupiter in a strong dignity. This is the classical condition for Saraswati Yoga.`
  )
  parts.push(
    `Saraswati Yoga brings together the three planets most associated with knowledge, creativity, and refined expression: Jupiter (philosophical wisdom and higher understanding), Venus (aesthetic sensitivity and creative refinement), and Mercury (analytical intelligence and articulate communication). Their simultaneous presence in powerful chart positions creates a chart environment where intellectual and creative gifts are strongly supported.\n\nThis yoga is traditionally associated with eloquence, mastery of knowledge, artistic talent, and the ability to communicate with depth and beauty. It does not specify a single field — it operates across whatever domain the chart's overall significations point toward. The activation of this yoga in education, career, or creative work tends to be most clearly felt during Jupiter, Venus, or Mercury Mahadasha.`
  )
  return parts.join('\n\n')
}

function detectSaraswati(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.saraswati
  const jup = ctx.planets.Jupiter
  const ven = ctx.planets.Venus
  const mer = ctx.planets.Mercury
  if (!jup || !ven || !mer) return empty('saraswati')

  const jupHouse = getPlanetHouseFromLagna(jup, ctx.ascendant)
  const venHouse = getPlanetHouseFromLagna(ven, ctx.ascendant)
  const merHouse = getPlanetHouseFromLagna(mer, ctx.ascendant)

  // All three must be in qualifying houses
  if (
    !SARASWATI_QUALIFYING_HOUSES.has(jupHouse) ||
    !SARASWATI_QUALIFYING_HOUSES.has(venHouse) ||
    !SARASWATI_QUALIFYING_HOUSES.has(merHouse)
  ) return empty('saraswati')

  // Jupiter must be in own/exalted/MT/friendly — the cornerstone of the yoga
  const jupDignity = getDignity('Jupiter', jup)
  const jupStrong: ReadonlyArray<typeof jupDignity> = ['exalted', 'mooltrikona', 'own', 'friendly']
  if (!jupStrong.includes(jupDignity)) return empty('saraswati')

  const venDignity = getDignity('Venus', ven)
  const merDignity = getDignity('Mercury', mer)
  const planetStrength = Math.round(
    (scorePlanetCondition({ dignity: jupDignity, combust: jup.combust }) +
      scorePlanetCondition({ dignity: venDignity, combust: ven.combust }) +
      scorePlanetCondition({ dignity: merDignity, combust: mer.combust })) / 3,
  )
  const dignity = Math.round(
    (scoreDignity(jupDignity) + scoreDignity(venDignity) + scoreDignity(merDignity)) / 3,
  )
  const houseStrength = scoreHousePlacement([jupHouse, venHouse, merHouse])
  const aspect = scoreAspectSupport({ hasJupiterSupport: true, hasVenusSupport: true })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      ctx.currentDasha?.mahadasha === 'Jupiter' ||
      ctx.currentDasha?.mahadasha === 'Venus' ||
      ctx.currentDasha?.mahadasha === 'Mercury',
    antardashaIsYogaPlanet:
      ctx.currentDasha?.antardasha === 'Jupiter' ||
      ctx.currentDasha?.antardasha === 'Venus' ||
      ctx.currentDasha?.antardasha === 'Mercury',
    pratyantarIsYogaPlanet:
      ctx.currentDasha?.pratyantar === 'Jupiter' ||
      ctx.currentDasha?.pratyantar === 'Venus' ||
      ctx.currentDasha?.pratyantar === 'Mercury',
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated:
      isDebilitated('Jupiter', jup) ||
      isDebilitated('Venus', ven) ||
      isDebilitated('Mercury', mer),
    involvedCombust: jup.combust || ven.combust || mer.combust,
  })
  const breakdown = computeYogaScore({
    planetStrength, houseStrength, dignity, aspect, relationship, dasha,
    afflictionPenalty, cancellationPenalty: 0,
  })
  return {
    id: 'saraswati',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Jupiter (${jupDignity}, H${jupHouse}), Venus (H${venHouse}), Mercury (H${merHouse}) all in Kendra/Trikona/2nd.`,
    chartNarrative: buildSaraswatiNarrative(
      jup.sign, jupHouse, jupDignity,
      ven.sign, venHouse,
      mer.sign, merHouse,
    ),
    planetsInvolved: ['Jupiter', 'Venus', 'Mercury'],
    housesInvolved: [...new Set([jupHouse, venHouse, merHouse])],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectAdditionalYogas(ctx: YogaEngineInput): YogaResult[] {
  return [
    detectAdhiYoga(ctx),
    detectChandraMangal(ctx),
    detectSaraswati(ctx),
  ]
}
