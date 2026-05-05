/**
 * Doshas (8):
 *   - Kaal Sarp
 *   - Mangal
 *   - Grahan
 *   - Angarak (Mars + Rahu)
 *   - Vish (Moon + Saturn)
 *   - Shrapit (Saturn + Rahu)
 *   - Pitra (Sun + 9th house affliction)
 *   - Gandanta (planet/Lagna near water→fire sign junction)
 */

import type { PlanetKey, PlanetData } from '@/types/astrology'
import type { DoshaResult, YogaEngineInput } from '../types'
import {
  KENDRA_HOUSES,
  DUSTHANA_HOUSES,
  UPACHAYA_HOUSES,
  getPlanetHouseFromLagna,
  getHouseFromReference,
  getHouseLord,
  getDignity,
  isExalted,
  isDebilitated,
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
  isReduced: boolean,
): string {
  const parts: string[] = []
  parts.push(
    `In your chart, Rahu is in ${rahuSign} (${ordinalSuffix(rahuHouse)} house) and Ketu is in ${ketuSign} (${ordinalSuffix(ketuHouse)} house). All seven visible planets fall on one side of the Rahu-Ketu axis — the classical condition for Kaal Sarp Dosha.`
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
  // Classical rule: ALL 7 visible planets must be on one side of the Rahu-Ketu axis.
  // One planet outside the axis breaks the formation — partial Kaal Sarp is a modern
  // popularisation not found in classical texts and produces false positives.
  const isFull = inRahuKetuArc === total || inKetuRahuArc === total

  if (!isFull) return emptyDosha('kaalSarp')

  // Cancellation factors
  let relief = 0
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

  const placement = 18
  const orbCloseness = 12
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
    technicalReason: 'All seven visible planets are on one side of the Rahu-Ketu axis.',
    chartNarrative: buildKaalSarpNarrative(
      rahu.sign, getPlanetHouseFromLagna(rahu, ctx.ascendant),
      ketu.sign, getPlanetHouseFromLagna(ketu, ctx.ascendant),
      relief >= 12,
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

// ---------- Shrapit (Saturn + Rahu) ----------

const SHRAPIT_HOUSE_THEME: Record<number, string> = {
  1: 'the 1st house — the house of self, personality, and overall life direction',
  4: 'the 4th house — the house of home, emotional roots, and family security',
  5: 'the 5th house — the house of intelligence, creativity, and children',
  7: 'the 7th house — the house of partnerships, marriage, and public dealings',
  8: 'the 8th house — the house of deep transformation, hidden matters, and longevity',
  10: 'the 10th house — the house of career, authority, and social standing',
  11: 'the 11th house — the house of gains, aspirations, and long-term goals',
}

function buildShrapitNarrative(
  satSign: string, rahuSign: string, house: number, orb: number,
  isKendra: boolean, affectsLagnaMoon10: boolean,
  isReduced: boolean,
): string {
  const parts: string[] = []
  const houseTheme = SHRAPIT_HOUSE_THEME[house] ?? `the ${ordinalSuffix(house)} house`
  parts.push(
    `In your chart, Saturn and Rahu are conjunct in ${satSign} in ${houseTheme} (orb ${orb.toFixed(1)}°). This is the condition for Shrapit Dosha — the meeting of Saturn (discipline, karma, delay) and Rahu (amplification, ambition, restlessness) in the same sign.`
  )
  parts.push(
    `This pattern shows a strong karmic pressure signature: Saturn's need for slow, steady effort meets Rahu's intense, boundary-crossing desire. In practical terms, this can manifest as a feeling of working harder than others for equivalent results, periods of delay before recognition, overthinking combined with high ambition, and a tendency to carry responsibility early in life. There can also be sudden shifts — periods of standstill followed by rapid movement.`
  )
  if (isKendra || affectsLagnaMoon10) {
    parts.push(
      `The placement in ${affectsLagnaMoon10 ? 'a personally sensitive area of your chart' : 'an angular house'} increases the visibility of this pattern — its influence is likely to be felt in how you present yourself, how your career unfolds, or how relationships and home life are structured.`
    )
  }
  parts.push(
    `The same combination that creates pressure also builds endurance. Over time, Saturn-Rahu can produce deep maturity, the ability to survive difficult circumstances, and — when Saturn is well-placed or Jupiter provides support — a steady, authoritative rise that comes from genuine perseverance rather than luck.`
  )
  if (isReduced) {
    parts.push(
      `Your chart has meaningful relief conditions — Jupiter's aspect, a strong Saturn, or Rahu in an upachaya house — which moderate the pressure of this combination. The pattern exists but operates in a softened form.`
    )
  }
  return parts.join('\n\n')
}

function detectShrapit(ctx: YogaEngineInput): DoshaResult {
  const m = DOSHA_MEANINGS.shrapit
  const sat = ctx.planets.Saturn
  const rahu = ctx.planets.Rahu
  if (!sat || !rahu || sat.signNumber !== rahu.signNumber) return emptyDosha('shrapit')

  const orb = degreeDiff(sat.longitude, rahu.longitude)
  const house = getPlanetHouseFromLagna(sat, ctx.ascendant)

  // Placement severity: where Saturn+Rahu sit
  let placement: number
  if (KENDRA_HOUSES.includes(house as 1 | 4 | 7 | 10)) placement = 18
  else if (DUSTHANA_HOUSES.includes(house as 6 | 8 | 12)) placement = 12
  else placement = 10

  // Orb closeness
  let orbCloseness: number
  if (orb <= 3) orbCloseness = 15
  else if (orb <= 6) orbCloseness = 12
  else if (orb <= 12) orbCloseness = 8
  else orbCloseness = 4

  // Affliction boost — Lagna/Moon/10th are specifically sensitive per the spec
  let afflictionBoost = 0
  const isKendra = KENDRA_HOUSES.includes(house as 1 | 4 | 7 | 10)
  const moonHouse = ctx.planets.Moon
    ? getPlanetHouseFromLagna(ctx.planets.Moon, ctx.ascendant)
    : -1
  const affectsLagna = house === 1
  const affectsMoon = house === moonHouse
  const affects10th = house === 10
  if (affectsLagna) afflictionBoost += 5
  if (affectsMoon) afflictionBoost += 5
  if (affects10th && !affectsLagna) afflictionBoost += 3
  // Kendra positions (4 and 7) still get a smaller bump if not already covered
  if (isKendra && !affectsLagna && !affects10th) afflictionBoost += 3
  afflictionBoost = Math.min(15, afflictionBoost)

  // Cancellation relief
  let relief = 0
  const jup = ctx.planets.Jupiter
  if (jup) {
    if (planetAspectsPlanet('Jupiter', jup, sat)) relief += 6
    if (planetAspectsPlanet('Jupiter', jup, rahu)) relief += 4
  }
  // Rahu in upachaya (3/6/10/11) — Rahu is less destructive here
  if (UPACHAYA_HOUSES.includes(house as 3 | 6 | 10 | 11)) relief += 4
  // Saturn in own/exalted sign — disciplined, less chaotic
  const satDignity = getDignity('Saturn', sat)
  if (satDignity === 'exalted' || satDignity === 'own' || satDignity === 'mooltrikona') relief += 5
  // Strong Lagna lord
  const lagnaLordKey = getHouseLord(1, ctx.ascendant)
  const lagnaLord = ctx.planets[lagnaLordKey]
  if (lagnaLord) {
    const d = getDignity(lagnaLordKey, lagnaLord)
    if (d === 'exalted' || d === 'own' || d === 'mooltrikona') relief += 5
  }

  const breakdown = computeDoshaScore({
    placementSeverity: placement,
    orbCloseness,
    planetIntensity: 8,
    afflictionBoost,
    lifeAreaImpact: 6,
    cancellationRelief: relief,
  })

  // Minimum threshold per spec — very weak cases are not shown
  if (breakdown.final < 35) return emptyDosha('shrapit')

  return {
    id: 'shrapit',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Saturn conjunct Rahu in ${sat.sign} (${ordinalSuffix(house)} house, orb ${orb.toFixed(1)}°).`,
    chartNarrative: buildShrapitNarrative(
      sat.sign, rahu.sign, house, orb,
      isKendra, affectsLagna || affectsMoon || affects10th,
      relief >= 10,
    ),
    planetsInvolved: ['Saturn', 'Rahu'],
    housesInvolved: [house],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive:
      ctx.currentDasha?.mahadasha === 'Saturn' || ctx.currentDasha?.mahadasha === 'Rahu',
    isReduced: relief >= 10,
    meta: { orb, house, isKendra, affectsLagna, affectsMoon, affects10th },
  }
}

// ---------- Pitra (Sun + 9th house affliction) ----------

function buildPitraNarrative(
  sunSign: string, sunHouse: number,
  sunNodeConj: boolean, conjNode: string | null, conjOrb: number | null,
  sunAfflicted: boolean, afflictingPlanets: string[],
  ninthLordSign: string, ninthLordHouse: number,
  maleficsIn9th: string[],
  isReduced: boolean,
): string {
  const parts: string[] = []

  // Opening — what's in the chart
  const sunSignals: string[] = []
  if (sunNodeConj && conjNode) {
    sunSignals.push(`Sun conjunct ${conjNode} in ${sunSign} (orb ${conjOrb?.toFixed(1)}°)`)
  }
  if (sunAfflicted && afflictingPlanets.length > 0) {
    sunSignals.push(`Sun under the influence of ${afflictingPlanets.join(' and ')}`)
  }
  const ninthSignals: string[] = []
  if (maleficsIn9th.length > 0) {
    ninthSignals.push(`${maleficsIn9th.join(' and ')} in the 9th house`)
  }
  if (DUSTHANA_HOUSES.includes(ninthLordHouse as 6 | 8 | 12)) {
    ninthSignals.push(`9th lord in the ${ordinalSuffix(ninthLordHouse)} house`)
  }

  parts.push(
    `In your chart, this pattern is indicated by: ${[...sunSignals, ...ninthSignals].join('; ')}. Pitra Dosha is not a single planetary condition but a convergence — it requires both the Sun (representing the father, authority, and lineage) and the 9th house/lord (representing dharma, ancestors, and blessings) to be under stress simultaneously.`
  )
  parts.push(
    `In real terms, this pattern can show as a complex or evolving relationship with the father or authority figures, a sense of carrying family responsibility, a disconnect from inherited traditions, or a feeling that you must build your own path rather than follow one that was laid out. It can also indicate a strong pull toward understanding your roots and lineage more consciously over time.`
  )
  parts.push(
    `Different astrology traditions define this pattern differently — treat this as an indicative tendency, not a fixed outcome. Many people with this pattern go on to develop deep spiritual awareness, break generational cycles constructively, and build their own dharma that is more meaningful than the one they inherited.`
  )
  if (isReduced) {
    parts.push(
      `Jupiter's support — either aspecting the Sun, the 9th house, or the 9th lord — provides meaningful protection here. This is the classical relief condition for Pitra Dosha and significantly reduces the pattern's challenging dimension.`
    )
  }
  return parts.join('\n\n')
}

function detectPitra(ctx: YogaEngineInput): DoshaResult {
  const m = DOSHA_MEANINGS.pitra
  const sun = ctx.planets.Sun
  const rahu = ctx.planets.Rahu
  const ketu = ctx.planets.Ketu
  const jup = ctx.planets.Jupiter
  if (!sun) return emptyDosha('pitra')

  // ── Pillar 1: Sun disturbance ──────────────────────────────────────────────

  // 1a. Sun conjunct Rahu or Ketu (same sign)
  let sunNodeConj = false
  let conjNode: PlanetKey | null = null
  let conjOrb = 0
  if (rahu && sun.signNumber === rahu.signNumber) {
    sunNodeConj = true
    conjNode = 'Rahu'
    conjOrb = degreeDiff(sun.longitude, rahu.longitude)
  } else if (ketu && sun.signNumber === ketu.signNumber) {
    sunNodeConj = true
    conjNode = 'Ketu'
    conjOrb = degreeDiff(sun.longitude, ketu.longitude)
  }

  // 1b. Sun debilitated (Libra = signNumber 7)
  const sunDebilitated = sun.signNumber === 7

  // 1c. Malefic (Saturn or Mars) conjunct Sun or aspecting Sun
  const MALEFIC_KEYS: PlanetKey[] = ['Saturn', 'Mars', 'Rahu', 'Ketu']
  const afflictingPlanets: PlanetKey[] = []
  for (const key of MALEFIC_KEYS) {
    const p = ctx.planets[key]
    if (!p) continue
    if (p.signNumber === sun.signNumber) {
      // Rahu/Ketu conjunct already captured above — avoid double-counting for affliction list
      if (key !== 'Rahu' && key !== 'Ketu') afflictingPlanets.push(key)
    } else if (key !== 'Rahu' && key !== 'Ketu' && planetAspectsPlanet(key, p, sun)) {
      afflictingPlanets.push(key)
    }
  }
  const sunAfflicted = sunDebilitated || afflictingPlanets.length > 0

  const sunDisturbed = sunNodeConj || sunAfflicted

  // ── Pillar 2: 9th house / 9th lord disturbance ────────────────────────────

  // 2a. Malefics in the 9th house
  const STRONG_MALEFICS: PlanetKey[] = ['Saturn', 'Mars', 'Rahu', 'Ketu']
  const maleficsIn9th: PlanetKey[] = []
  for (const key of STRONG_MALEFICS) {
    const p = ctx.planets[key]
    if (p && getPlanetHouseFromLagna(p, ctx.ascendant) === 9) {
      maleficsIn9th.push(key)
    }
  }

  // 2b. 9th lord placement and condition
  const ninthLordKey = getHouseLord(9, ctx.ascendant)
  const ninthLord = ctx.planets[ninthLordKey]
  const ninthLordHouse = ninthLord ? getPlanetHouseFromLagna(ninthLord, ctx.ascendant) : 0
  const ninthLordInDusthana = ninthLord
    ? DUSTHANA_HOUSES.includes(ninthLordHouse as 6 | 8 | 12)
    : false
  const ninthLordDignity = ninthLord ? getDignity(ninthLordKey, ninthLord) : null
  const ninthLordDebilitated = ninthLordDignity === 'debilitated'

  // 2c. Is 9th lord conjunct a malefic?
  let ninthLordConjMalefic = false
  if (ninthLord) {
    for (const key of STRONG_MALEFICS) {
      const p = ctx.planets[key]
      if (p && p.signNumber === ninthLord.signNumber) {
        ninthLordConjMalefic = true
        break
      }
    }
  }

  const ninthAfflicted =
    maleficsIn9th.length >= 1 || ninthLordInDusthana || ninthLordDebilitated || ninthLordConjMalefic

  // ── Must have BOTH pillars (per spec) ────────────────────────────────────
  if (!sunDisturbed || !ninthAfflicted) return emptyDosha('pitra')

  // ── Score ─────────────────────────────────────────────────────────────────

  // placementSeverity: highest single primary signal
  let placement: number
  if (sunNodeConj) placement = 15
  else if (ninthLordInDusthana) placement = 12
  else placement = 8

  // orbCloseness: based on Sun-node orb if conjunction present
  let orbCloseness = 0
  if (sunNodeConj) {
    if (conjOrb <= 3) orbCloseness = 12
    else if (conjOrb <= 6) orbCloseness = 10
    else if (conjOrb <= 12) orbCloseness = 6
    else orbCloseness = 3
  }

  // afflictionBoost: 9th house malefics (weighted by planet)
  let afflictionBoost = 0
  for (const key of maleficsIn9th) {
    if (key === 'Ketu') afflictionBoost += 8        // Ketu in 9th = strongest Pitra signal
    else if (key === 'Rahu') afflictionBoost += 6
    else if (key === 'Saturn') afflictionBoost += 5
    else if (key === 'Mars') afflictionBoost += 4
  }
  if (ninthLordDebilitated) afflictionBoost += 5
  if (ninthLordConjMalefic) afflictionBoost += 4
  if (sunDebilitated) afflictionBoost += 4
  if (afflictingPlanets.length > 0) afflictionBoost += Math.min(6, afflictingPlanets.length * 3)
  afflictionBoost = Math.min(15, afflictionBoost)

  // Cancellation relief
  let relief = 0
  if (jup) {
    // Jupiter in 9th house
    if (getPlanetHouseFromLagna(jup, ctx.ascendant) === 9) relief += 10
    // Jupiter aspects 9th lord
    if (ninthLord && planetAspectsPlanet('Jupiter', jup, ninthLord)) relief += 8
    // Jupiter aspects Sun
    if (planetAspectsPlanet('Jupiter', jup, sun)) relief += 6
  }
  // 9th lord strong (own/exalted)
  if (ninthLordDignity === 'exalted' || ninthLordDignity === 'own' || ninthLordDignity === 'mooltrikona') {
    relief += 6
  }
  relief = Math.min(30, relief)

  const breakdown = computeDoshaScore({
    base: 20,  // lower base — medium/low confidence dosha
    placementSeverity: placement,
    orbCloseness,
    planetIntensity: 6,
    afflictionBoost,
    lifeAreaImpact: 6,
    cancellationRelief: relief,
  })

  // Minimum threshold per spec
  if (breakdown.final < 35) return emptyDosha('pitra')

  // currentlyActive: active when running Sun, Ketu (if Ketu triggered), or Saturn (if Saturn afflicted) MD
  const activeMahadashas: Set<string> = new Set(['Sun'])
  if (conjNode === 'Ketu' || maleficsIn9th.includes('Ketu')) activeMahadashas.add('Ketu')
  if (maleficsIn9th.includes('Saturn') || afflictingPlanets.includes('Saturn')) activeMahadashas.add('Saturn')
  const currentlyActive = !!ctx.currentDasha?.mahadasha &&
    activeMahadashas.has(ctx.currentDasha.mahadasha)

  const sunHouse = getPlanetHouseFromLagna(sun, ctx.ascendant)

  return {
    id: 'pitra',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: [
      sunNodeConj ? `Sun conjunct ${conjNode} (orb ${conjOrb.toFixed(1)}°)` : null,
      sunDebilitated ? 'Sun debilitated in Libra' : null,
      afflictingPlanets.length > 0 ? `Sun afflicted by ${afflictingPlanets.join(', ')}` : null,
      maleficsIn9th.length > 0 ? `${maleficsIn9th.join(', ')} in 9th house` : null,
      ninthLordInDusthana ? `9th lord in ${ordinalSuffix(ninthLordHouse)} house` : null,
      ninthLordDebilitated ? '9th lord debilitated' : null,
    ].filter(Boolean).join('; '),
    chartNarrative: buildPitraNarrative(
      sun.sign, sunHouse,
      sunNodeConj, conjNode, conjOrb,
      sunAfflicted, afflictingPlanets,
      ninthLord?.sign ?? '', ninthLordHouse,
      maleficsIn9th,
      relief >= 10,
    ),
    planetsInvolved: Array.from(new Set<PlanetKey>([
      'Sun',
      ...(conjNode ? [conjNode] : []),
      ...maleficsIn9th,
      ...afflictingPlanets,
    ])),
    housesInvolved: Array.from(new Set([sunHouse, 9])),
    lifeAreas: m.defaultLifeAreas,
    currentlyActive,
    isReduced: relief >= 10,
    meta: {
      sunNodeConj, conjNode, conjOrb,
      sunDebilitated, afflictingPlanets,
      maleficsIn9th, ninthLordHouse, ninthLordInDusthana,
    },
  }
}

// ---------- Gandanta (water→fire sign junction) ----------

// Water signs whose last 3° are Gandanta: Cancer=4, Scorpio=8, Pisces=12
const GANDANTA_WATER_SIGNS = new Set([4, 8, 12])
// Fire signs whose first 3° are Gandanta: Aries=1, Leo=5, Sagittarius=9
const GANDANTA_FIRE_SIGNS = new Set([1, 5, 9])
const GANDANTA_ORB = 3 // degrees

const GANDANTA_JUNCTION_NAME: Record<number, string> = {
  4: 'Cancer/Leo (Ashlesha/Magha nakshatra junction)',
  8: 'Scorpio/Sagittarius (Jyeshtha/Mula nakshatra junction)',
  12: 'Pisces/Aries (Revati/Ashwini nakshatra junction)',
  1: 'Pisces/Aries (Revati/Ashwini nakshatra junction)',
  5: 'Cancer/Leo (Ashlesha/Magha nakshatra junction)',
  9: 'Scorpio/Sagittarius (Jyeshtha/Mula nakshatra junction)',
}

interface GandantaItem {
  label: string
  key: string   // planet key or 'Lagna'
  signNumber: number
  degInSign: number
  proximity: number // degrees from junction (lower = more severe)
  isLuminary: boolean  // Sun, Moon, or Lagna
}

function getGandantaProximity(signNumber: number, longitude: number): number | null {
  const degInSign = longitude % 30
  if (GANDANTA_WATER_SIGNS.has(signNumber)) {
    const proximity = 30 - degInSign   // distance to end of sign
    if (proximity <= GANDANTA_ORB) return proximity
  }
  if (GANDANTA_FIRE_SIGNS.has(signNumber)) {
    if (degInSign <= GANDANTA_ORB) return degInSign
  }
  return null
}

function buildGandantaNarrative(items: GandantaItem[], isReduced: boolean): string {
  const parts: string[] = []
  const labels = items.map((i) => {
    const side = GANDANTA_WATER_SIGNS.has(i.signNumber) ? 'last' : 'first'
    return `${i.label} at ${i.proximity.toFixed(1)}° from the junction (${side} degrees of the sign)`
  })
  const junction = GANDANTA_JUNCTION_NAME[items[0].signNumber] ?? 'a water-fire sign junction'
  parts.push(
    `${labels.join(', ')} ${items.length === 1 ? 'is' : 'are'} placed in the Gandanta zone — within ${GANDANTA_ORB}° of the ${junction}. In Vedic astrology, the junctions between water and fire signs are considered sensitive degree areas, where the energy shifts from dissolution (water sign's ending) to emergence (fire sign's beginning).`
  )
  parts.push(
    `Planets or the Lagna in these degrees are said to occupy a point of transition rather than stable sign territory. This can describe qualities of inner complexity, a life that moves through significant phases of transformation, and at times a sense of standing between two states rather than being settled in one. The Moon and Lagna are most significant here; other planets carry weight proportional to their role in the chart.`
  )
  if (isReduced) {
    parts.push(
      `Jupiter's aspect on the Gandanta planet or Lagna provides meaningful protection — Jupiter's wisdom and stability can help navigate the sensitivity of these degrees constructively.`
    )
  }
  return parts.join('\n\n')
}

function detectGandanta(ctx: YogaEngineInput): DoshaResult {
  const m = DOSHA_MEANINGS.gandanta
  const items: GandantaItem[] = []

  // Check each classical planet
  const planetChecks: Array<{ key: PlanetKey; label: string; isLuminary: boolean }> = [
    { key: 'Sun', label: 'Sun', isLuminary: true },
    { key: 'Moon', label: 'Moon', isLuminary: true },
    { key: 'Mars', label: 'Mars', isLuminary: false },
    { key: 'Mercury', label: 'Mercury', isLuminary: false },
    { key: 'Jupiter', label: 'Jupiter', isLuminary: false },
    { key: 'Venus', label: 'Venus', isLuminary: false },
    { key: 'Saturn', label: 'Saturn', isLuminary: false },
  ]
  for (const { key, label, isLuminary } of planetChecks) {
    const p = ctx.planets[key]
    if (!p) continue
    const proximity = getGandantaProximity(p.signNumber, p.longitude)
    if (proximity !== null) {
      items.push({ label, key, signNumber: p.signNumber, degInSign: p.longitude % 30, proximity, isLuminary })
    }
  }

  // Check Lagna
  const lagnaProximity = getGandantaProximity(ctx.ascendant.signNumber, ctx.ascendant.longitude)
  if (lagnaProximity !== null) {
    items.push({
      label: 'Lagna',
      key: 'Lagna',
      signNumber: ctx.ascendant.signNumber,
      degInSign: ctx.ascendant.longitude % 30,
      proximity: lagnaProximity,
      isLuminary: true,  // Lagna counts as luminary-level significance
    })
  }

  if (items.length === 0) return emptyDosha('gandanta')

  // Sort by severity: luminaries first, then by proximity (closer = more severe)
  items.sort((a, b) => {
    if (a.isLuminary !== b.isLuminary) return a.isLuminary ? -1 : 1
    return a.proximity - b.proximity
  })

  const primary = items[0]
  const minProximity = primary.proximity

  // Placement severity based on what's in Gandanta
  const hasLuminaryOrLagna = items.some((i) => i.isLuminary)
  const luminaries = items.filter((i) => i.isLuminary)
  let placementSeverity = 0
  for (const item of items) {
    if (item.key === 'Moon' || item.key === 'Lagna') placementSeverity += 8
    else if (item.key === 'Sun') placementSeverity += 6
    else placementSeverity += 3
  }
  placementSeverity = Math.min(20, placementSeverity)

  // Orb closeness: closer to junction = more severe
  let orbCloseness: number
  if (minProximity <= 0.5) orbCloseness = 12
  else if (minProximity <= 1) orbCloseness = 10
  else if (minProximity <= 2) orbCloseness = 7
  else orbCloseness = 4

  // Planet intensity: luminaries in Gandanta are more significant
  const planetIntensity = hasLuminaryOrLagna ? 8 : 4

  // Extra boost for multiple planets in Gandanta
  const afflictionBoost = Math.min(8, (items.length - 1) * 3)

  // Life area impact
  const lifeAreaImpact = hasLuminaryOrLagna ? 7 : 4

  // Cancellation relief: Jupiter strongly placed and aspecting the primary Gandanta item
  let relief = 0
  const jup = ctx.planets.Jupiter
  const jupNotInGandanta = jup && getGandantaProximity(jup.signNumber, jup.longitude) === null
  if (jup && jupNotInGandanta) {
    const primaryData = primary.key !== 'Lagna' ? ctx.planets[primary.key as PlanetKey] : null
    if (primaryData && planetAspectsPlanet('Jupiter', jup, primaryData)) relief += 10
    // Jupiter in Kendra
    const jupHouse = getPlanetHouseFromLagna(jup, ctx.ascendant)
    if (KENDRA_HOUSES.includes(jupHouse as 1 | 4 | 7 | 10)) relief += 5
  }
  relief = Math.min(15, relief)

  const breakdown = computeDoshaScore({
    base: 15,
    placementSeverity,
    orbCloseness,
    planetIntensity,
    afflictionBoost,
    lifeAreaImpact,
    cancellationRelief: relief,
  })

  // Suppress very weak cases (e.g. only an outer planet at 2.5° from junction)
  if (breakdown.final < 20) return emptyDosha('gandanta')

  // currentlyActive: during the Mahadasha of any Gandanta planet
  const gandantaKeys = items.map((i) => i.key)
  const currentlyActive =
    (!!ctx.currentDasha?.mahadasha && gandantaKeys.includes(ctx.currentDasha.mahadasha)) ||
    (primary.key === 'Lagna' && !!ctx.currentDasha?.mahadasha)

  const planetsInvolved = items
    .filter((i) => i.key !== 'Lagna')
    .map((i) => i.key as PlanetKey)

  return {
    id: 'gandanta',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: items
      .map((i) => {
        const side = GANDANTA_WATER_SIGNS.has(i.signNumber) ? 'last' : 'first'
        return `${i.label} in ${side} ${i.proximity.toFixed(1)}° of sign ${i.signNumber}`
      })
      .join('; '),
    chartNarrative: buildGandantaNarrative(items, relief >= 10),
    planetsInvolved,
    housesInvolved: planetsInvolved.map((k) =>
      getPlanetHouseFromLagna(ctx.planets[k]!, ctx.ascendant),
    ),
    lifeAreas: m.defaultLifeAreas,
    currentlyActive,
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
    detectShrapit(ctx),
    detectPitra(ctx),
    detectGandanta(ctx),
  ]
}
