/**
 * Special yogas:
 *   - Neecha Bhanga Raja Yoga (uses checkNeechaBhanga from strength engine)
 *   - Parivartana
 *   - Dhana
 *   - Shubha Kartari
 *   - Paap Kartari
 */

import type { PlanetKey } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  WEALTH_HOUSES,
  PLANET_KEYS,
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  DUSTHANA_HOUSES,
  getHouseLord,
  getPlanetHouseFromLagna,
  getPlanetsInHouseFromLagna,
  getDignity,
  isDebilitated,
  isContextualBenefic,
  isContextualMalefic,
  exchangeSigns,
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
  getStrengthLabel,
} from '../scoring'
import { YOGA_MEANINGS } from '../meanings'
import { checkNeechaBhanga } from '@/lib/astrology/strength'

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

function detectNeechaBhanga(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.neechaBhanga
  const cancellations: { planet: PlanetKey; rule: string }[] = []
  for (const k of PLANET_KEYS) {
    const p = ctx.planets[k]
    if (!p || !isDebilitated(k, p)) continue
    const result = checkNeechaBhanga(k, ctx.planets, ctx.ascendant)
    if (result.isApplied) {
      cancellations.push({ planet: k, rule: result.rule ?? 'cancellation condition met' })
    }
  }
  if (cancellations.length === 0) return empty('neechaBhanga')

  // Strength based on number of cancellations + condition of debilitated planet
  const conditions = cancellations.map((c) => ({
    dignity: getDignity(c.planet, ctx.planets[c.planet]),
    combust: ctx.planets[c.planet].combust,
  }))
  const planetStrength = Math.round(
    conditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / conditions.length,
  )
  const houses = cancellations.map((c) => getPlanetHouseFromLagna(ctx.planets[c.planet], ctx.ascendant))
  const houseStrength = scoreHousePlacement(houses)
  const dignity = 8 // mid — debilitated by definition, but cancelled
  const aspect = scoreAspectSupport({})
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const involved = cancellations.map((c) => c.planet)
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: involved.includes(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: involved.includes(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: involved.includes(ctx.currentDasha?.pratyantar as PlanetKey),
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
    id: 'neechaBhanga',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: cancellations
      .map((c) => `${c.planet} debilitated — ${c.rule}`)
      .join('; '),
    planetsInvolved: involved,
    housesInvolved: houses,
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function detectParivartana(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.parivartana
  const found: { a: PlanetKey; b: PlanetKey; aHouse: number; bHouse: number }[] = []
  // Examine planet pairs only (not nodes — they don't own signs)
  const candidates: PlanetKey[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const A = candidates[i]
      const B = candidates[j]
      const a = ctx.planets[A]
      const b = ctx.planets[B]
      if (!a || !b) continue
      if (exchangeSigns(A, a, B, b, ctx.ascendant)) {
        found.push({
          a: A,
          b: B,
          aHouse: getPlanetHouseFromLagna(a, ctx.ascendant),
          bHouse: getPlanetHouseFromLagna(b, ctx.ascendant),
        })
      }
    }
  }
  if (found.length === 0) return empty('parivartana')

  // Pick the strongest pair (best house placement)
  const best = found.reduce((acc, cur) => {
    const aS = scoreHousePlacement([cur.aHouse, cur.bHouse])
    const bS = scoreHousePlacement([acc.aHouse, acc.bHouse])
    return aS > bS ? cur : acc
  })

  const aData = ctx.planets[best.a]!
  const bData = ctx.planets[best.b]!
  const aDignity = getDignity(best.a, aData)
  const bDignity = getDignity(best.b, bData)
  const planetStrength = Math.round(
    (scorePlanetCondition({ dignity: aDignity, combust: aData.combust }) +
      scorePlanetCondition({ dignity: bDignity, combust: bData.combust })) /
      2,
  )
  const houseStrength = scoreHousePlacement([best.aHouse, best.bHouse])
  const dignity = Math.round((scoreDignity(aDignity) + scoreDignity(bDignity)) / 2)
  const aspect = scoreAspectSupport({})
  const relationship = scoreLordRelationship(['exchange'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      ctx.currentDasha?.mahadasha === best.a || ctx.currentDasha?.mahadasha === best.b,
    antardashaIsYogaPlanet:
      ctx.currentDasha?.antardasha === best.a || ctx.currentDasha?.antardasha === best.b,
    pratyantarIsYogaPlanet:
      ctx.currentDasha?.pratyantar === best.a || ctx.currentDasha?.pratyantar === best.b,
    dashaUnavailable: !ctx.currentDasha,
  })
  // Subtype label
  const goodHouses = new Set<number>([
    ...KENDRA_HOUSES,
    ...TRIKONA_HOUSES,
    2,
    11,
  ])
  const dustSet = new Set<number>(DUSTHANA_HOUSES as readonly number[])
  let subtype: 'maha' | 'dainya' | 'khala' | 'mixed' = 'mixed'
  if ([best.aHouse, best.bHouse].every((h) => goodHouses.has(h))) subtype = 'maha'
  else if ([best.aHouse, best.bHouse].some((h) => dustSet.has(h))) subtype = 'dainya'
  else if ([best.aHouse, best.bHouse].includes(3)) subtype = 'khala'

  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity,
    aspect,
    relationship,
    dasha,
    afflictionPenalty: 0,
    cancellationPenalty: subtype === 'dainya' ? 8 : 0,
  })
  return {
    id: 'parivartana',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `${best.a} (house ${best.aHouse}) and ${best.b} (house ${best.bHouse}) are in sign-exchange${found.length > 1 ? ` (${found.length} exchanges total)` : ''}. Subtype: ${subtype}.`,
    planetsInvolved: [best.a, best.b],
    housesInvolved: [best.aHouse, best.bHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
    meta: { subtype, allExchanges: found },
  }
}

function detectDhana(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.dhana
  const wealthLordPairs: { a: PlanetKey; b: PlanetKey; ah: number; bh: number }[] = []
  const lords = WEALTH_HOUSES.map((h) => ({ house: h, lord: getHouseLord(h, ctx.ascendant) }))

  for (let i = 0; i < lords.length; i++) {
    for (let j = i + 1; j < lords.length; j++) {
      const A = lords[i]
      const B = lords[j]
      if (A.lord === B.lord) continue
      const conn = lordsConnected(A.lord, A.house, B.lord, B.house, ctx.planets, ctx.ascendant)
      if (conn.connected) {
        wealthLordPairs.push({ a: A.lord, b: B.lord, ah: A.house, bh: B.house })
      }
    }
  }
  if (wealthLordPairs.length === 0) return empty('dhana')

  // Strength: bonus if 2-11 or 5-9 connected
  const has2_11 = wealthLordPairs.some(
    (p) => (p.ah === 2 && p.bh === 11) || (p.ah === 11 && p.bh === 2),
  )
  const has5_9 = wealthLordPairs.some(
    (p) => (p.ah === 5 && p.bh === 9) || (p.ah === 9 && p.bh === 5),
  )

  // Average involved planet strength
  const involvedSet = new Set<PlanetKey>()
  for (const p of wealthLordPairs) {
    involvedSet.add(p.a)
    involvedSet.add(p.b)
  }
  const involved = Array.from(involvedSet)
  const conditions = involved.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    conditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / conditions.length,
  )
  const dignity = Math.round(
    conditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) / conditions.length,
  )
  const houses = involved.map((k) => getPlanetHouseFromLagna(ctx.planets[k], ctx.ascendant))
  const houseStrength = scoreHousePlacement(houses)
  const aspect = scoreAspectSupport({})
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: involved.includes(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: involved.includes(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: involved.includes(ctx.currentDasha?.pratyantar as PlanetKey),
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: involved.some((k) => isDebilitated(k, ctx.planets[k])),
    involvedCombust: involved.some((k) => ctx.planets[k].combust),
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
    // Bonuses via base
    base: 30 + (has2_11 ? 5 : 0) + (has5_9 ? 5 : 0),
  })
  return {
    id: 'dhana',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Wealth-house lords connected: ${wealthLordPairs
      .map((p) => `${p.a}(${p.ah}L) ↔ ${p.b}(${p.bh}L)`)
      .join('; ')}.`,
    planetsInvolved: involved,
    housesInvolved: [...WEALTH_HOUSES],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function detectKartari(
  id: 'shubhaKartari' | 'paapKartari',
  ctx: YogaEngineInput,
): YogaResult {
  const m = YOGA_MEANINGS[id]
  const isBenefic = id === 'shubhaKartari'
  const planetsIn12 = getPlanetsInHouseFromLagna(12, ctx.ascendant, ctx.planets)
  const planetsIn2 = getPlanetsInHouseFromLagna(2, ctx.ascendant, ctx.planets)

  const filterFn = isBenefic
    ? (k: PlanetKey) => isContextualBenefic(k, ctx.planets[k], ctx.planets)
    : (k: PlanetKey) => isContextualMalefic(k, ctx.planets[k], ctx.planets)
  const in12 = planetsIn12.filter(filterFn)
  const in2 = planetsIn2.filter(filterFn)
  if (in12.length === 0 || in2.length === 0) return empty(id)

  const involved = Array.from(new Set<PlanetKey>([...in12, ...in2]))
  const conditions = involved.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    conditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / conditions.length,
  )
  const dignity = Math.round(
    conditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) / conditions.length,
  )
  const houseStrength = scoreHousePlacement([2, 12]) // 2 is wealth, 12 dusthana
  const aspect = scoreAspectSupport({})
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: involved.includes(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: involved.includes(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: involved.includes(ctx.currentDasha?.pratyantar as PlanetKey),
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
    id,
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `${isBenefic ? 'Benefic' : 'Malefic'}(s) in 12th: ${in12.join(', ') || '—'}; in 2nd: ${in2.join(', ') || '—'}.`,
    planetsInvolved: involved,
    housesInvolved: [2, 12],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectSpecialYogas(ctx: YogaEngineInput): YogaResult[] {
  return [
    detectNeechaBhanga(ctx),
    detectParivartana(ctx),
    detectDhana(ctx),
    detectKartari('shubhaKartari', ctx),
    detectKartari('paapKartari', ctx),
  ]
}
