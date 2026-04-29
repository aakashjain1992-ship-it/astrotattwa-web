/**
 * Doshas (5):
 *   - Kaal Sarp
 *   - Mangal
 *   - Grahan
 *   - Angarak (Mars + Rahu)
 *   - Vish (Moon + Saturn)
 */

import type { PlanetKey, PlanetData } from '@/types/astrology'
import type { DoshaResult, YogaEngineInput } from '../types'
import {
  KENDRA_HOUSES,
  getPlanetHouseFromLagna,
  getHouseFromReference,
  getHouseLord,
  getDignity,
  isExalted,
  planetAspectsPlanet,
  degreeDiff,
  ordinalSuffix,
} from '../helpers'
import {
  computeDoshaScore,
  getSeverityLabel,
} from '../scoring'
import { DOSHA_MEANINGS } from '../meanings'

// ─── Narrative builders ───────────────────────────────────────────────────────

function buildKaalSarpNarrative(
  rahuSign: string, rahuHouse: number,
  ketuSign: string, ketuHouse: number,
  isFull: boolean, isReduced: boolean,
): string {
  const parts: string[] = []
  parts.push(
    `In your chart, Rahu is in ${rahuSign} (${ordinalSuffix(rahuHouse)} house) and Ketu is in ${ketuSign} (${ordinalSuffix(ketuHouse)} house). ${isFull ? 'All seven visible planets fall on one side of the Rahu-Ketu axis' : 'Six of the seven visible planets fall on one side of the Rahu-Ketu axis (partial Kaal Sarp)'} — the condition for Kaal Sarp Yoga.`
  )
  parts.push(
    `This axis defines the primary tension in your chart between worldly ambition and spiritual release. Planets hemmed within this axis tend to experience their results more intensely — with periods of significant focus and momentum, as well as periods where things feel held back or directed by forces beyond your control. There can be a quality of fateful patterning in life events, particularly around the themes of the houses Rahu and Ketu occupy.`
  )
  if (isReduced) {
    parts.push(
      `Your chart has meaningful relief conditions — such as a strong Lagna lord or Jupiter aspecting the Moon or Ascendant — which soften the intensity of this dosha. The effect is present but moderated.`
    )
  }
  return parts.join('\n\n')
}

const MANGAL_HOUSE_THEME: Record<number, string> = {
  1: 'the 1st house — the house of self and overall health, making Mars a prominent force in your personal energy and how you assert yourself',
  4: 'the 4th house — the house of home and emotional security, creating tension or intensity within the domestic sphere and private life',
  7: 'the 7th house — the house of marriage and partnerships, which is the house most associated with Mangal Dosha\'s effects on relationships',
  8: 'the 8th house — the house of transformation and sudden events, which is considered one of the stronger positions for this dosha\'s impact',
  12: 'the 12th house — the house of loss, isolation, and the hidden, which can affect the quality of private and intimate life',
}

function buildMangalNarrative(
  marsSign: string, houseFromLagna: number,
  fromMoon: boolean, houseFromMoon: number,
  fromVenus: boolean, houseFromVenus: number,
  isReduced: boolean,
): string {
  const parts: string[] = []
  const houseTheme = MANGAL_HOUSE_THEME[houseFromLagna] ?? `the ${ordinalSuffix(houseFromLagna)} house`
  parts.push(
    `Mars is placed in ${marsSign} in ${houseTheme}. In classical Vedic astrology, Mangal Dosha arises when Mars occupies the 1st, 4th, 7th, 8th, or 12th house from the Lagna — positions that can intensify Mars's energy in domains connected to relationships, health, and home life.`
  )
  const modifiers: string[] = []
  if (fromMoon) modifiers.push(`Mars also occupies the ${ordinalSuffix(houseFromMoon)} house from the Moon`)
  if (fromVenus) modifiers.push(`and the ${ordinalSuffix(houseFromVenus)} house from Venus`)
  if (modifiers.length > 0) {
    parts.push(`${modifiers.join(', ')} — which reinforces the dosha across multiple reference points in the chart.`)
  }
  if (isReduced) {
    parts.push(
      `Your chart has cancellation factors that reduce the intensity of this dosha. Mars in its own sign or exaltation, or Jupiter's aspect, are among the classical relief conditions — and one or more of these are present in your chart. The dosha still exists but operates at a moderated level.`
    )
  } else {
    parts.push(
      `In practice, Mangal Dosha does not automatically create difficulty — its expression depends on the rest of the chart and the period in question. It can manifest as intensity, drive, or impatience in relationships and the areas of life Mars touches rather than as a predictable negative outcome.`
    )
  }
  return parts.join('\n\n')
}

function buildGrahanNarrative(
  matches: { lum: string; node: string; orb: number }[],
  lumHouse: number, lumSign: string,
  isReduced: boolean,
): string {
  const parts: string[] = []
  const matchDesc = matches.map(mt => `${mt.lum} conjunct ${mt.node} (orb ${mt.orb.toFixed(1)}°)`).join(' and ')
  const primaryLum = matches[0].lum
  const primaryNode = matches[0].node
  parts.push(
    `In your chart, ${matchDesc} — in ${lumSign} in the ${ordinalSuffix(lumHouse)} house. This is the condition for Grahan Yoga: when a luminary (Sun or Moon) is in the same sign as a lunar node, the node\'s shadowing quality affects the luminary's expression.`
  )
  parts.push(
    `${primaryLum === 'Moon' ? 'The Moon governs the emotional mind, instincts, and receptivity. Ketu or Rahu conjunct the Moon can intensify emotional sensitivity, create unusual perceptual awareness, or produce a tendency toward anxiety, detachment, or obsessive thought patterns — depending on the node involved and the overall chart.' : 'The Sun governs vitality, self-expression, and authority. When conjunct a node, it can produce an unusual or unconventional relationship with self-image, authority, or the father figure — sometimes manifesting as intensity of purpose, sometimes as a tendency to obscure or overstate personal identity.'}`
  )
  if (primaryNode === 'Rahu') {
    parts.push(`Rahu's conjunction with ${primaryLum} tends to amplify and obsess — intensifying the luminary's significations and pulling them toward unfamiliar or unconventional territory.`)
  } else {
    parts.push(`Ketu's conjunction with ${primaryLum} tends to dissociate — creating a quality of past-life familiarity with the luminary's domain, sometimes producing deep insight but also a detachment from its ordinary satisfactions.`)
  }
  if (isReduced) {
    parts.push(`Jupiter's aspect on the luminary in your chart provides meaningful relief, softening the eclipse quality of this configuration.`)
  }
  return parts.join('\n\n')
}

function buildAngarakNarrative(sign: string, house: number, orb: number, isReduced: boolean): string {
  const parts: string[] = []
  parts.push(
    `Mars and Rahu are conjunct in ${sign} in the ${ordinalSuffix(house)} house of your chart (orb ${orb.toFixed(1)}°). This is Angarak Yoga — the combination of Mars (the planet of drive, aggression, and action) and Rahu (the node associated with amplification and unconventional desire) in the same sign.`
  )
  parts.push(
    `This conjunction can intensify both planets' qualities: Mars's assertiveness and Rahu's restlessness combine to produce a strong, sometimes volatile, energy. There can be a compulsive or driven quality to how effort is expressed — an ability to act boldly and break through obstacles, alongside a tendency toward impulsiveness or excess. The house placement shapes where this energy concentrates most.`
  )
  if (isReduced) {
    parts.push(`Jupiter's aspect on this conjunction in your chart provides a moderating influence, lending a degree of wisdom and restraint to this intense combination.`)
  }
  return parts.join('\n\n')
}

function buildVishNarrative(
  moonSign: string, moonHouse: number,
  satSign: string, isSameSign: boolean, orb: number,
  isReduced: boolean,
): string {
  const parts: string[] = []
  if (isSameSign) {
    parts.push(
      `The Moon and Saturn are conjunct in ${moonSign} in the ${ordinalSuffix(moonHouse)} house of your chart (orb ${orb.toFixed(1)}°). This is Vish Yoga — named for the friction that arises when the Moon (emotional, responsive, fluid) and Saturn (slow, restricting, structuring) share the same sign.`
    )
    parts.push(
      `Saturn's nature is to limit and crystallise; the Moon's is to flow and respond. Their conjunction can create an emotional quality that tends toward seriousness, caution, or a feeling of emotional heaviness — particularly in the areas of life governed by the house they share. At the same time, this combination can produce a depth of character, practicality under pressure, and an ability to endure difficulty with steadiness.`
    )
  } else {
    parts.push(
      `Saturn in ${satSign} casts an aspect on your Moon in ${moonSign} (${ordinalSuffix(moonHouse)} house). This is Vish Yoga — the Moon under Saturn's restricting aspect can create emotional caution, seriousness, or a tendency to feel the weight of circumstances more than others.`
    )
    parts.push(
      `An aspecting Saturn is generally milder than a conjunction in the same sign, but the effect remains — emotional responses may be measured, contained, or slower to express. This can also manifest as emotional maturity, a strong sense of responsibility, and a capacity for sustained effort in areas that matter most.`
    )
  }
  if (isReduced) {
    parts.push(`Your chart has relief conditions — such as Jupiter's aspect on the Moon or the Moon in its own or exalted sign — which moderate the restrictive quality of this combination.`)
  }
  return parts.join('\n\n')
}

function emptyDosha(id: string): DoshaResult {
  const m = DOSHA_MEANINGS[id]
  return {
    id,
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: false,
    score: 0,
    severity: null,
    scoreBreakdown: {
      base: 0,
      placementSeverity: 0,
      orbCloseness: 0,
      planetIntensity: 0,
      afflictionBoost: 0,
      lifeAreaImpact: 0,
      cancellationRelief: 0,
      final: 0,
    },
    technicalReason: '',
    planetsInvolved: [],
    housesInvolved: [],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: false,
    isReduced: false,
  }
}

// ---------- Kaal Sarp ----------

function detectKaalSarp(ctx: YogaEngineInput): DoshaResult {
  const m = DOSHA_MEANINGS.kaalSarp
  const rahu = ctx.planets.Rahu
  const ketu = ctx.planets.Ketu
  if (!rahu || !ketu) return emptyDosha('kaalSarp')

  const VISIBLE: PlanetKey[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ]
  const visiblePlanets = VISIBLE.map((k) => ctx.planets[k]).filter(Boolean) as PlanetData[]

  const rahuLon = rahu.longitude
  const ketuLon = ketu.longitude

  /**
   * Arc 1: planets travelling from Rahu → Ketu (forward in zodiac)
   * Arc 2: planets travelling from Ketu → Rahu
   */
  function isInArcRahuToKetu(lon: number): boolean {
    const a = (lon - rahuLon + 360) % 360
    const b = (ketuLon - rahuLon + 360) % 360
    return a > 0 && a < b
  }

  let inRahuKetuArc = 0
  let inKetuRahuArc = 0
  for (const p of visiblePlanets) {
    if (isInArcRahuToKetu(p.longitude)) inRahuKetuArc++
    else inKetuRahuArc++
  }

  const total = visiblePlanets.length
  const isFull = inRahuKetuArc === total || inKetuRahuArc === total
  const isPartial =
    !isFull && (inRahuKetuArc === total - 1 || inKetuRahuArc === total - 1)

  if (!isFull && !isPartial) return emptyDosha('kaalSarp')

  // Cancellation factors
  let relief = 0
  if (isPartial) relief += 12
  // Strong Lagna lord
  const lagnaLordKey = getHouseLord(1, ctx.ascendant)
  const lagnaLord = ctx.planets[lagnaLordKey]
  if (lagnaLord) {
    const d = getDignity(lagnaLordKey, lagnaLord)
    if (d === 'exalted' || d === 'own' || d === 'mooltrikona') relief += 8
  }
  // Jupiter aspect on Lagna or Moon
  const jup = ctx.planets.Jupiter
  if (jup) {
    const ascAsPlanet = { signNumber: ctx.ascendant.signNumber } as PlanetData
    if (planetAspectsPlanet('Jupiter', jup, ascAsPlanet)) relief += 6
    if (ctx.planets.Moon && planetAspectsPlanet('Jupiter', jup, ctx.planets.Moon)) relief += 6
  }

  const placement = isFull ? 18 : 10
  const orbCloseness = isFull ? 12 : 6
  const intensity = 8
  const afflictionBoost = (() => {
    let b = 0
    // Sun/Moon conjunct node
    if (ctx.planets.Sun && ctx.planets.Sun.signNumber === rahu.signNumber) b += 5
    if (ctx.planets.Moon && ctx.planets.Moon.signNumber === rahu.signNumber) b += 5
    return Math.min(15, b)
  })()
  const lifeAreaImpact = 6

  const breakdown = computeDoshaScore({
    placementSeverity: placement,
    orbCloseness,
    planetIntensity: intensity,
    afflictionBoost,
    lifeAreaImpact,
    cancellationRelief: relief,
  })
  if (breakdown.final <= 0) return emptyDosha('kaalSarp')
  return {
    id: 'kaalSarp',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: isFull
      ? 'All seven visible planets are on one side of the Rahu-Ketu axis.'
      : `Six of seven visible planets are on one side of the Rahu-Ketu axis (partial).`,
    chartNarrative: buildKaalSarpNarrative(
      rahu.sign, getPlanetHouseFromLagna(rahu, ctx.ascendant),
      ketu.sign, getPlanetHouseFromLagna(ketu, ctx.ascendant),
      isFull, relief >= 12,
    ),
    planetsInvolved: ['Rahu', 'Ketu'],
    housesInvolved: [
      getPlanetHouseFromLagna(rahu, ctx.ascendant),
      getPlanetHouseFromLagna(ketu, ctx.ascendant),
    ],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive:
      ctx.currentDasha?.mahadasha === 'Rahu' || ctx.currentDasha?.mahadasha === 'Ketu',
    isReduced: relief >= 12,
    meta: { isFull, isPartial },
  }
}

// ---------- Mangal Dosha ----------

function detectMangal(ctx: YogaEngineInput): DoshaResult {
  const m = DOSHA_MEANINGS.mangal
  const mars = ctx.planets.Mars
  if (!mars) return emptyDosha('mangal')

  const MANGAL_HOUSES = [1, 4, 7, 8, 12]
  const houseFromLagna = getPlanetHouseFromLagna(mars, ctx.ascendant)
  const houseFromMoon = ctx.planets.Moon
    ? getHouseFromReference(mars.signNumber, ctx.planets.Moon.signNumber)
    : 0
  const houseFromVenus = ctx.planets.Venus
    ? getHouseFromReference(mars.signNumber, ctx.planets.Venus.signNumber)
    : 0
  const fromLagna = MANGAL_HOUSES.includes(houseFromLagna)
  const fromMoon = MANGAL_HOUSES.includes(houseFromMoon)
  const fromVenus = MANGAL_HOUSES.includes(houseFromVenus)
  // Strict rule: Lagna is required. Moon/Venus alone do not trigger the dosha.
  if (!fromLagna) return emptyDosha('mangal')

  // Placement severity based on which Lagna house Mars occupies
  const placement = (houseFromLagna === 7 || houseFromLagna === 8) ? 20 : 15

  // Moon/Venus boost severity only when Lagna is already triggered
  let afflictionBoost = 0
  if (fromMoon) afflictionBoost += 6
  if (fromVenus) afflictionBoost += 6
  afflictionBoost = Math.min(15, afflictionBoost)

  // Mars affecting 7th house / lord / Venus
  const lord7Sign = ((ctx.ascendant.signNumber - 1 + 6) % 12) + 1
  if (
    mars.signNumber === lord7Sign ||
    (ctx.planets.Venus && planetAspectsPlanet('Mars', mars, ctx.planets.Venus))
  ) {
    afflictionBoost = Math.min(15, afflictionBoost + 5)
  }

  // Cancellation factors
  let relief = 0
  // Mars in own sign
  if (mars.sign === 'Aries' || mars.sign === 'Scorpio') relief += 12
  if (isExalted('Mars', mars)) relief += 12
  // Jupiter aspect or conjunct Mars
  const jup = ctx.planets.Jupiter
  if (jup && (jup.signNumber === mars.signNumber || planetAspectsPlanet('Jupiter', jup, mars)))
    relief += 8
  // Mars in friendly sign
  const marsDignity = getDignity('Mars', mars)
  if (marsDignity === 'friendly') relief += 4

  const orbCloseness = 8
  const planetIntensity = (() => {
    if (marsDignity === 'exalted') return 10
    if (marsDignity === 'own' || marsDignity === 'mooltrikona') return 9
    if (marsDignity === 'debilitated') return 6
    return 7
  })()
  const lifeAreaImpact = fromLagna && (houseFromLagna === 7 || houseFromLagna === 8) ? 10 : 6

  const breakdown = computeDoshaScore({
    placementSeverity: placement,
    orbCloseness,
    planetIntensity,
    afflictionBoost,
    lifeAreaImpact,
    cancellationRelief: relief,
  })
  if (breakdown.final <= 0) return emptyDosha('mangal')

  const modifiers: string[] = []
  if (fromMoon) modifiers.push(`also in Mangal house from Moon (house ${houseFromMoon})`)
  if (fromVenus) modifiers.push(`also in Mangal house from Venus (house ${houseFromVenus})`)
  const modStr = modifiers.length > 0 ? ` — ${modifiers.join('; ')}` : ''

  return {
    id: 'mangal',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Mars is in the ${houseFromLagna}th house from Lagna${modStr}.`,
    chartNarrative: buildMangalNarrative(
      mars.sign, houseFromLagna,
      fromMoon, houseFromMoon,
      fromVenus, houseFromVenus,
      relief >= 8,
    ),
    planetsInvolved: ['Mars'],
    housesInvolved: [houseFromLagna],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: ctx.currentDasha?.mahadasha === 'Mars',
    isReduced: relief >= 8,
    meta: { fromLagna, fromMoon, fromVenus },
  }
}

// ---------- Grahan ----------

function detectGrahan(ctx: YogaEngineInput): DoshaResult {
  const m = DOSHA_MEANINGS.grahan
  const sun = ctx.planets.Sun
  const moon = ctx.planets.Moon
  const rahu = ctx.planets.Rahu
  const ketu = ctx.planets.Ketu
  if (!rahu || !ketu) return emptyDosha('grahan')

  const matches: { lum: PlanetKey; node: PlanetKey; orb: number }[] = []
  for (const lum of [sun, moon].filter(Boolean) as PlanetData[]) {
    const lumKey: PlanetKey = lum === sun ? 'Sun' : 'Moon'
    for (const node of [rahu, ketu]) {
      if (node.signNumber === lum.signNumber) {
        matches.push({
          lum: lumKey,
          node: node === rahu ? 'Rahu' : 'Ketu',
          orb: degreeDiff(lum.longitude, node.longitude),
        })
      }
    }
  }
  if (matches.length === 0) return emptyDosha('grahan')

  // Use closest match for scoring
  matches.sort((a, b) => a.orb - b.orb)
  const closest = matches[0]
  let placement = 0
  if (closest.orb <= 3) placement = 20
  else if (closest.orb <= 6) placement = 15
  else if (closest.orb <= 12) placement = 10
  else placement = 5

  let orbCloseness = 0
  if (closest.orb <= 3) orbCloseness = 15
  else if (closest.orb <= 6) orbCloseness = 12
  else if (closest.orb <= 12) orbCloseness = 8
  else orbCloseness = 4

  let relief = 0
  // Jupiter aspect on luminary
  const jup = ctx.planets.Jupiter
  const lumData = ctx.planets[closest.lum]
  if (jup && lumData && planetAspectsPlanet('Jupiter', jup, lumData)) relief += 10
  if (closest.orb > 12) relief += 10

  const breakdown = computeDoshaScore({
    placementSeverity: placement,
    orbCloseness,
    planetIntensity: 8,
    afflictionBoost: matches.length > 1 ? 8 : 4,
    lifeAreaImpact: closest.lum === 'Moon' ? 8 : 6,
    cancellationRelief: relief,
  })
  if (breakdown.final <= 0) return emptyDosha('grahan')
  const involved: PlanetKey[] = matches.flatMap((m) => [m.lum, m.node])
  const houseInv = lumData ? [getPlanetHouseFromLagna(lumData, ctx.ascendant)] : []
  return {
    id: 'grahan',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: matches
      .map((mt) => `${mt.lum} conjunct ${mt.node} (orb ${mt.orb.toFixed(1)}°)`)
      .join('; '),
    chartNarrative: buildGrahanNarrative(
      matches,
      houseInv[0] ?? 0,
      lumData?.sign ?? '',
      relief >= 10,
    ),
    planetsInvolved: Array.from(new Set(involved)),
    housesInvolved: houseInv,
    lifeAreas: m.defaultLifeAreas,
    currentlyActive:
      ctx.currentDasha?.mahadasha === 'Sun' ||
      ctx.currentDasha?.mahadasha === 'Moon' ||
      ctx.currentDasha?.mahadasha === 'Rahu' ||
      ctx.currentDasha?.mahadasha === 'Ketu',
    isReduced: relief >= 10,
  }
}

// ---------- Angarak (Mars + Rahu) ----------

function detectAngarak(ctx: YogaEngineInput): DoshaResult {
  const m = DOSHA_MEANINGS.angarak
  const mars = ctx.planets.Mars
  const rahu = ctx.planets.Rahu
  if (!mars || !rahu || mars.signNumber !== rahu.signNumber) return emptyDosha('angarak')

  const orb = degreeDiff(mars.longitude, rahu.longitude)
  let placement = 18
  let orbCloseness = 0
  if (orb <= 3) orbCloseness = 15
  else if (orb <= 6) orbCloseness = 12
  else if (orb <= 12) orbCloseness = 8
  else {
    orbCloseness = 4
    placement = 10
  }

  let relief = 0
  const jup = ctx.planets.Jupiter
  if (jup && planetAspectsPlanet('Jupiter', jup, mars)) relief += 10
  if (orb > 12) relief += 8

  const breakdown = computeDoshaScore({
    placementSeverity: placement,
    orbCloseness,
    planetIntensity: 8,
    afflictionBoost: 5,
    lifeAreaImpact: 6,
    cancellationRelief: relief,
  })
  if (breakdown.final <= 0) return emptyDosha('angarak')
  return {
    id: 'angarak',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Mars conjunct Rahu in ${mars.sign} (orb ${orb.toFixed(1)}°).`,
    chartNarrative: buildAngarakNarrative(mars.sign, getPlanetHouseFromLagna(mars, ctx.ascendant), orb, relief >= 10),
    planetsInvolved: ['Mars', 'Rahu'],
    housesInvolved: [getPlanetHouseFromLagna(mars, ctx.ascendant)],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive:
      ctx.currentDasha?.mahadasha === 'Mars' || ctx.currentDasha?.mahadasha === 'Rahu',
    isReduced: relief >= 10,
  }
}

// ---------- Vish (Moon + Saturn) ----------

function detectVish(ctx: YogaEngineInput): DoshaResult {
  const m = DOSHA_MEANINGS.vish
  const moon = ctx.planets.Moon
  const sat = ctx.planets.Saturn
  if (!moon || !sat) return emptyDosha('vish')

  const sameSignBoth = moon.signNumber === sat.signNumber
  const satAspectsMoon = planetAspectsPlanet('Saturn', sat, moon)
  if (!sameSignBoth && !satAspectsMoon) return emptyDosha('vish')

  const orb = sameSignBoth ? degreeDiff(moon.longitude, sat.longitude) : 999
  let placement = sameSignBoth ? 18 : 12
  let orbCloseness = 0
  if (sameSignBoth) {
    if (orb <= 3) orbCloseness = 15
    else if (orb <= 6) orbCloseness = 12
    else if (orb <= 12) orbCloseness = 8
    else orbCloseness = 4
  } else {
    orbCloseness = 6
  }

  let relief = 0
  const jup = ctx.planets.Jupiter
  if (jup && planetAspectsPlanet('Jupiter', jup, moon)) relief += 10
  // Moon strong in own/exalted sign
  const moonDignity = getDignity('Moon', moon)
  if (moonDignity === 'exalted' || moonDignity === 'own') relief += 8

  const breakdown = computeDoshaScore({
    placementSeverity: placement,
    orbCloseness,
    planetIntensity: 7,
    afflictionBoost: 4,
    lifeAreaImpact: 8,
    cancellationRelief: relief,
  })
  if (breakdown.final <= 0) return emptyDosha('vish')
  return {
    id: 'vish',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: sameSignBoth
      ? `Moon conjunct Saturn in ${moon.sign} (orb ${orb.toFixed(1)}°).`
      : `Saturn aspects the Moon.`,
    chartNarrative: buildVishNarrative(
      moon.sign, getPlanetHouseFromLagna(moon, ctx.ascendant),
      sat.sign, sameSignBoth, orb === 999 ? 0 : orb,
      relief >= 10,
    ),
    planetsInvolved: ['Moon', 'Saturn'],
    housesInvolved: [getPlanetHouseFromLagna(moon, ctx.ascendant)],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive:
      ctx.currentDasha?.mahadasha === 'Moon' || ctx.currentDasha?.mahadasha === 'Saturn',
    isReduced: relief >= 10,
  }
}

export function detectDoshas(ctx: YogaEngineInput): DoshaResult[] {
  return [
    detectKaalSarp(ctx),
    detectMangal(ctx),
    detectGrahan(ctx),
    detectAngarak(ctx),
    detectVish(ctx),
  ]
}
