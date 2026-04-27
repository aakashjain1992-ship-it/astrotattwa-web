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
} from '../helpers'
import {
  computeDoshaScore,
  getSeverityLabel,
} from '../scoring'
import { DOSHA_MEANINGS } from '../meanings'

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
  if (!fromLagna && !fromMoon && !fromVenus) return emptyDosha('mangal')

  // Placement severity
  let placement = 0
  if (fromLagna) {
    if (houseFromLagna === 7 || houseFromLagna === 8) placement = 20
    else placement = 15
  }
  // Multi-reference boost
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

  const refs: string[] = []
  if (fromLagna) refs.push(`Lagna (house ${houseFromLagna})`)
  if (fromMoon) refs.push(`Moon (house ${houseFromMoon})`)
  if (fromVenus) refs.push(`Venus (house ${houseFromVenus})`)

  return {
    id: 'mangal',
    name: m.name,
    category: 'dosha',
    nature: 'challenging',
    present: true,
    score: breakdown.final,
    severity: getSeverityLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Mars is in a Mangal-house from: ${refs.join(', ')}.`,
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
