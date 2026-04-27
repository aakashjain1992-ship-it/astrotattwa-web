/**
 * Raj / Wealth-supporting yogas:
 *   - Raj 9-10 lord
 *   - Kendra-Trikona (5/9 lord with 4/7/10 lord)
 *   - Dharma-Karmadhipati (alias for Raj 9-10)
 *   - Lakshmi
 *   - Amala
 *   - Vasumati
 */

import type { PlanetKey, PlanetData } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  UPACHAYA_HOUSES,
  getHouseLord,
  getPlanetHouseFromLagna,
  getPlanetHouseFromMoon,
  getPlanetsInHouseFromLagna,
  getPlanetsInHouseFromMoon,
  getDignity,
  isContextualBenefic,
  isExalted,
  isDebilitated,
  lordsConnected,
} from '../helpers'
import {
  computeYogaScore,
  scoreDignity,
  scorePlanetCondition,
  scoreHousePlacement,
  scoreLordRelationship,
  scoreAspectSupport,
  scoreDashaActivation,
  scoreAfflictionPenalty,
  scoreCancellationPenalty,
  getStrengthLabel,
  type RelationshipKind,
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

function buildLordConnectionResult(
  id: 'rajYoga9_10' | 'kendraTrikona' | 'dharmaKarmadhipati',
  lordA: PlanetKey,
  houseA: number,
  lordB: PlanetKey,
  houseB: number,
  via: ReadonlyArray<RelationshipKind>,
  ctx: YogaEngineInput,
): YogaResult {
  const m = YOGA_MEANINGS[id]
  const a = ctx.planets[lordA]!
  const b = ctx.planets[lordB]!
  const aDignity = getDignity(lordA, a)
  const bDignity = getDignity(lordB, b)
  const planetStrength = Math.round(
    (scorePlanetCondition({ dignity: aDignity, combust: a.combust }) +
      scorePlanetCondition({ dignity: bDignity, combust: b.combust })) /
      2,
  )
  const aHouse = getPlanetHouseFromLagna(a, ctx.ascendant)
  const bHouse = getPlanetHouseFromLagna(b, ctx.ascendant)
  const houseStrength = scoreHousePlacement([aHouse, bHouse])
  const dignity = Math.round((scoreDignity(aDignity) + scoreDignity(bDignity)) / 2)
  const aspect = scoreAspectSupport({})
  const relationship = scoreLordRelationship(via)
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      ctx.currentDasha?.mahadasha === lordA || ctx.currentDasha?.mahadasha === lordB,
    antardashaIsYogaPlanet:
      ctx.currentDasha?.antardasha === lordA || ctx.currentDasha?.antardasha === lordB,
    pratyantarIsYogaPlanet:
      ctx.currentDasha?.pratyantar === lordA || ctx.currentDasha?.pratyantar === lordB,
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: isDebilitated(lordA, a) || isDebilitated(lordB, b),
    involvedCombust: a.combust || b.combust,
  })
  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity,
    aspect,
    relationship,
    dasha,
    afflictionPenalty,
    cancellationPenalty: 0,
  })
  return {
    id,
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `${houseA}th lord ${lordA} (in house ${aHouse}) is connected with ${houseB}th lord ${lordB} (in house ${bHouse}) via ${via.join(', ')}.`,
    planetsInvolved: lordA === lordB ? [lordA] : [lordA, lordB],
    housesInvolved: [houseA, houseB],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function lordConnectionVia(
  ctx: YogaEngineInput,
  houseA: number,
  houseB: number,
): { lordA: PlanetKey; lordB: PlanetKey; via: ReadonlyArray<RelationshipKind> } | null {
  const lordA = getHouseLord(houseA, ctx.ascendant)
  const lordB = getHouseLord(houseB, ctx.ascendant)
  if (lordA === lordB) return null
  const conn = lordsConnected(lordA, houseA, lordB, houseB, ctx.planets, ctx.ascendant)
  if (!conn.connected) return null
  return { lordA, lordB, via: conn.via as ReadonlyArray<RelationshipKind> }
}

function detectRaj9_10(ctx: YogaEngineInput): YogaResult {
  const conn = lordConnectionVia(ctx, 9, 10)
  if (!conn) return empty('rajYoga9_10')
  return buildLordConnectionResult('rajYoga9_10', conn.lordA, 9, conn.lordB, 10, conn.via, ctx)
}

function detectDharmaKarmadhipati(ctx: YogaEngineInput): YogaResult {
  const conn = lordConnectionVia(ctx, 9, 10)
  if (!conn) return empty('dharmaKarmadhipati')
  return buildLordConnectionResult('dharmaKarmadhipati', conn.lordA, 9, conn.lordB, 10, conn.via, ctx)
}

function detectKendraTrikona(ctx: YogaEngineInput): YogaResult {
  // Strong pairs only — exclude pure 1L self-link
  const kendraSet = [4, 7, 10] as const
  const trikonaSet = [5, 9] as const
  let bestConn: {
    lordA: PlanetKey
    lordB: PlanetKey
    houseA: number
    houseB: number
    via: ReadonlyArray<RelationshipKind>
  } | null = null
  let bestStrength = -1

  for (const kh of kendraSet) {
    for (const th of trikonaSet) {
      const conn = lordConnectionVia(ctx, kh, th)
      if (!conn) continue
      // Use number of connection types as a tiebreaker
      const s = conn.via.length
      if (s > bestStrength) {
        bestStrength = s
        bestConn = { ...conn, houseA: kh, houseB: th }
      }
    }
  }
  if (!bestConn) return empty('kendraTrikona')
  return buildLordConnectionResult(
    'kendraTrikona',
    bestConn.lordA,
    bestConn.houseA,
    bestConn.lordB,
    bestConn.houseB,
    bestConn.via,
    ctx,
  )
}

function detectLakshmi(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.lakshmi
  const lord9 = getHouseLord(9, ctx.ascendant)
  const lord1 = getHouseLord(1, ctx.ascendant)
  const l9 = ctx.planets[lord9]
  const l1 = ctx.planets[lord1]
  if (!l9 || !l1) return empty('lakshmi')

  const l9Dignity = getDignity(lord9, l9)
  const l1Dignity = getDignity(lord1, l1)
  // Both must be at least friendly+ (or own/exalted/MT)
  const strongDignities: ReadonlyArray<typeof l9Dignity> = [
    'exalted',
    'mooltrikona',
    'own',
    'friendly',
  ]
  if (!strongDignities.includes(l9Dignity) || !strongDignities.includes(l1Dignity))
    return empty('lakshmi')

  const goodHouses = [1, 4, 5, 7, 9, 10]
  const l9House = getPlanetHouseFromLagna(l9, ctx.ascendant)
  const l1House = getPlanetHouseFromLagna(l1, ctx.ascendant)
  if (!goodHouses.includes(l9House) || !goodHouses.includes(l1House))
    return empty('lakshmi')

  const planetStrength = Math.round(
    (scorePlanetCondition({ dignity: l9Dignity, combust: l9.combust }) +
      scorePlanetCondition({ dignity: l1Dignity, combust: l1.combust })) /
      2,
  )
  const houseStrength = scoreHousePlacement([l9House, l1House])
  const dignity = Math.round((scoreDignity(l9Dignity) + scoreDignity(l1Dignity)) / 2)
  const aspect = scoreAspectSupport({})
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      ctx.currentDasha?.mahadasha === lord9 || ctx.currentDasha?.mahadasha === lord1,
    antardashaIsYogaPlanet:
      ctx.currentDasha?.antardasha === lord9 || ctx.currentDasha?.antardasha === lord1,
    pratyantarIsYogaPlanet:
      ctx.currentDasha?.pratyantar === lord9 || ctx.currentDasha?.pratyantar === lord1,
    dashaUnavailable: !ctx.currentDasha,
  })
  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity,
    aspect,
    relationship,
    dasha,
    afflictionPenalty: 0,
    cancellationPenalty: 0,
  })
  const involved: PlanetKey[] = lord9 === lord1 ? [lord9] : [lord9, lord1]
  return {
    id: 'lakshmi',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `9th lord ${lord9} (${l9Dignity}, house ${l9House}) and Lagna lord ${lord1} (${l1Dignity}, house ${l1House}) are both well-placed.`,
    planetsInvolved: involved,
    housesInvolved: [1, 9, l9House, l1House],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function detectAmala(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.amala
  const moon = ctx.planets.Moon
  if (!moon) return empty('amala')

  const fromLagna = getPlanetsInHouseFromLagna(10, ctx.ascendant, ctx.planets, ['Sun'])
  const fromMoon = getPlanetsInHouseFromMoon(10, moon, ctx.planets, ['Sun'])
  // Find any benefic in either
  const beneficsInTenth: PlanetKey[] = []
  let referenceLabel = ''
  for (const k of fromLagna) {
    if (isContextualBenefic(k, ctx.planets[k], ctx.planets)) {
      beneficsInTenth.push(k)
      referenceLabel = '10th from Lagna'
    }
  }
  for (const k of fromMoon) {
    if (isContextualBenefic(k, ctx.planets[k], ctx.planets)) {
      if (!beneficsInTenth.includes(k)) beneficsInTenth.push(k)
      if (!referenceLabel) referenceLabel = '10th from Moon'
    }
  }
  if (beneficsInTenth.length === 0) return empty('amala')

  const conditions = beneficsInTenth.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    conditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / conditions.length,
  )
  const dignity = Math.round(
    conditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) / conditions.length,
  )
  const houseStrength = scoreHousePlacement([10])
  const aspect = scoreAspectSupport({
    hasJupiterSupport: beneficsInTenth.includes('Jupiter'),
    hasVenusSupport: beneficsInTenth.includes('Venus'),
  })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: beneficsInTenth.includes(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: beneficsInTenth.includes(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: beneficsInTenth.includes(ctx.currentDasha?.pratyantar as PlanetKey),
    dashaUnavailable: !ctx.currentDasha,
  })
  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity,
    aspect,
    relationship,
    dasha,
    afflictionPenalty: 0,
    cancellationPenalty: 0,
  })
  return {
    id: 'amala',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Benefic(s) in ${referenceLabel}: ${beneficsInTenth.join(', ')}.`,
    planetsInvolved: beneficsInTenth,
    housesInvolved: [10],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function countBeneficsInUpachayas(
  ctx: YogaEngineInput,
  reference: PlanetData | { signNumber: number },
): { count: number; planets: PlanetKey[] } {
  const planets: PlanetKey[] = []
  const seen = new Set<PlanetKey>()
  for (const h of UPACHAYA_HOUSES) {
    const sign = ((reference.signNumber - 1 + h - 1) % 12) + 1
    for (const [k, p] of Object.entries(ctx.planets)) {
      if (k === 'Ascendant') continue
      if (p.signNumber !== sign) continue
      const key = k as PlanetKey
      if (!isContextualBenefic(key, p, ctx.planets)) continue
      if (seen.has(key)) continue
      seen.add(key)
      planets.push(key)
    }
  }
  return { count: planets.length, planets }
}

function detectVasumati(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.vasumati
  const moon = ctx.planets.Moon
  const fromLagna = countBeneficsInUpachayas(ctx, { signNumber: ctx.ascendant.signNumber })
  const fromMoon = moon ? countBeneficsInUpachayas(ctx, moon) : { count: 0, planets: [] }
  const useMoon = fromMoon.count > fromLagna.count
  const best = useMoon ? fromMoon : fromLagna
  if (best.count < 2) return empty('vasumati')

  const conditions = best.planets.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    conditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / conditions.length,
  )
  const dignity = Math.round(
    conditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) / conditions.length,
  )
  const houseStrength = best.count >= 3 ? 14 : 11
  const aspect = scoreAspectSupport({
    hasJupiterSupport: best.planets.includes('Jupiter'),
    hasVenusSupport: best.planets.includes('Venus'),
  })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: best.planets.includes(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: best.planets.includes(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: best.planets.includes(ctx.currentDasha?.pratyantar as PlanetKey),
    dashaUnavailable: !ctx.currentDasha,
  })
  // Affliction: count debilitated involved
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: best.planets.some((k) => isDebilitated(k, ctx.planets[k])),
    involvedCombust: best.planets.some((k) => ctx.planets[k].combust),
  })
  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity,
    aspect,
    relationship,
    dasha,
    afflictionPenalty,
    cancellationPenalty: 0,
  })
  return {
    id: 'vasumati',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `${best.count} benefic(s) in upachaya houses from ${useMoon ? 'Moon' : 'Lagna'}: ${best.planets.join(', ')}.`,
    planetsInvolved: best.planets,
    housesInvolved: [...UPACHAYA_HOUSES],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectRajYogas(ctx: YogaEngineInput): YogaResult[] {
  return [
    detectRaj9_10(ctx),
    detectKendraTrikona(ctx),
    detectDharmaKarmadhipati(ctx),
    detectLakshmi(ctx),
    detectAmala(ctx),
    detectVasumati(ctx),
  ]
}
