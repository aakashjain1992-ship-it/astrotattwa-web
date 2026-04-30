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
  ordinalSuffix,
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

// ─── Narrative builders ───────────────────────────────────────────────────────

type RelVia = ReadonlyArray<string>

function viaLabel(via: RelVia): string {
  if (via.includes('sameHouse')) return 'conjunct in the same sign'
  if (via.includes('exchange')) return 'in mutual sign exchange'
  if (via.includes('mutualAspect')) return 'in mutual aspect'
  if (via.includes('oneAspectsOther')) return 'aspecting each other'
  if (via.includes('placedInOtherHouse')) return 'placed in each other\'s house'
  return 'connected'
}

function buildRajNarrative(
  lordA: string, houseA: number, signA: string, houseAPlaced: number,
  lordB: string, houseB: number, signB: string, houseBPlaced: number,
  via: RelVia,
  type: 'raj9_10' | 'kendraTrikona' | 'dharmaKarma',
): string {
  const viaStr = viaLabel(via)
  const parts: string[] = []

  if (type === 'raj9_10' || type === 'dharmaKarma') {
    parts.push(
      `The ${ordinalSuffix(houseA)} lord of your chart is ${lordA} (in ${signA}, placed in the ${ordinalSuffix(houseAPlaced)} house), and the ${ordinalSuffix(houseB)} lord is ${lordB} (in ${signB}, placed in the ${ordinalSuffix(houseBPlaced)} house). These two lords are ${viaStr} — connecting the house of dharma and fortune (9th) with the house of career and public standing (10th).`
    )
    parts.push(
      `This is one of the most powerful Raj Yoga combinations in classical Vedic astrology. The alignment of fortune and purposeful action in the same stream gives your efforts a quality of timing and direction that supports recognition, advancement, and meaningful achievement. Results tend to consolidate during the Mahadasha or Antardasha of ${lordA} or ${lordB}.`
    )
  } else {
    const kendraDesc = houseA >= houseB
      ? `the ${ordinalSuffix(houseA)} house (Kendra — a house of central importance in the chart)`
      : `the ${ordinalSuffix(houseA)} house`
    const trikonaDesc = houseA < houseB
      ? `the ${ordinalSuffix(houseB)} house (Trikona — a house of fortune and dharma)`
      : `the ${ordinalSuffix(houseB)} house`
    parts.push(
      `The lord of ${kendraDesc} is ${lordA} (${signA}, in the ${ordinalSuffix(houseAPlaced)} house), and the lord of ${trikonaDesc} is ${lordB} (${signB}, in the ${ordinalSuffix(houseBPlaced)} house). These two lords are ${viaStr} — forming a Kendra-Trikona Raj Yoga.`
    )
    parts.push(
      `Kendra-Trikona connections bring the stability and force of the Kendra houses into alliance with the grace and fortune of the Trikona houses. The combination supports sustained progress in practical life — where effort meets opportunity. The yoga expresses most clearly during ${lordA} or ${lordB} Mahadasha and Antardasha.`
    )
  }
  return parts.join('\n\n')
}

function buildLakshmiNarrative(
  lord9: string, l9Dignity: string, l9House: number, l9Sign: string,
  lord1: string, l1Dignity: string, l1House: number, l1Sign: string,
): string {
  const parts: string[] = []
  parts.push(
    `Lakshmi Yoga arises when both the 9th lord and Lagna lord are well-dignified and well-placed. In your chart, ${lord9} — the 9th lord — is ${l9Dignity} in ${l9Sign} in the ${ordinalSuffix(l9House)} house, and ${lord1} — your Lagna lord — is ${l1Dignity} in ${l1Sign} in the ${ordinalSuffix(l1House)} house.`
  )
  parts.push(
    `The 9th lord governs fortune, dharma, and the quality of opportunities that flow naturally into your life. The Lagna lord governs your overall vitality, identity, and the capacity to act on those opportunities. When both are strong and well-placed simultaneously, it creates a condition where good fortune aligns with personal capability — and this alignment tends to sustain rather than fluctuate.`
  )
  return parts.join('\n\n')
}

function buildAmalaNarrative(benefics: string[], referenceLabel: string, sign: string): string {
  const planetStr = benefics.length === 1 ? benefics[0] : `${benefics.slice(0, -1).join(', ')} and ${benefics[benefics.length - 1]}`
  const parts: string[] = []
  parts.push(
    `${planetStr} in ${sign} is placed in the 10th from ${referenceLabel} — the most prominent house for career, public life, and lasting contribution. This is the condition for Amala Yoga: a natural benefic in the 10th creates a quality of ethical clarity and genuine goodness in how you engage with your work and the world.`
  )
  parts.push(
    `The 10th house represents what you build that is visible and enduring. A benefic here — particularly Jupiter or Venus — tends to support a reputation built on integrity rather than mere ambition, and a professional life that carries a quality of service or creative merit rather than purely transactional outcomes.`
  )
  return parts.join('\n\n')
}

function buildVasumatiNarrative(planets: string[], count: number, fromMoon: boolean): string {
  const planetStr = planets.length === 1 ? planets[0] : `${planets.slice(0, -1).join(', ')} and ${planets[planets.length - 1]}`
  const ref = fromMoon ? 'Moon' : 'Lagna'
  const parts: string[] = []
  parts.push(
    `Vasumati Yoga forms when two or more natural benefics occupy upachaya houses (3rd, 6th, 10th, or 11th). In your chart, ${planetStr} — ${count >= 3 ? 'three' : 'two'} benefic planet${count > 1 ? 's' : ''} — are placed in the upachaya houses from ${ref}.`
  )
  parts.push(
    `Upachaya houses are growth houses — their themes strengthen and expand over time rather than peaking early. Benefics in these positions support material growth, the expansion of your professional and social sphere, and a steady accumulation of resources and influence. The effect of this yoga tends to build progressively through life rather than arriving as a single peak.`
  )
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

function buildLordConnectionResult(
  id: 'kendraTrikona' | 'dharmaKarmadhipati',
  lordA: PlanetKey,
  houseA: number,
  lordB: PlanetKey,
  houseB: number,
  via: ReadonlyArray<RelationshipKind>,
  ctx: YogaEngineInput,
  narrativeType?: 'raj9_10' | 'kendraTrikona' | 'dharmaKarma',
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
    chartNarrative: buildRajNarrative(
      lordA, houseA, a.sign, aHouse,
      lordB, houseB, b.sign, bHouse,
      via,
      narrativeType ?? (id === 'kendraTrikona' ? 'kendraTrikona' : 'dharmaKarma'),
    ),
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

function detectDharmaKarmadhipati(ctx: YogaEngineInput): YogaResult {
  const conn = lordConnectionVia(ctx, 9, 10)
  if (!conn) return empty('dharmaKarmadhipati')
  return buildLordConnectionResult('dharmaKarmadhipati', conn.lordA, 9, conn.lordB, 10, conn.via, ctx)
}

function detectKendraTrikona(ctx: YogaEngineInput): YogaResult {
  // All four Kendra lords — including 1st (Lagna lord) which forms powerful 1-5 and 1-9 Raj Yogas.
  const kendraSet = [1, 4, 7, 10] as const
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
      // Use relationship quality score as tiebreaker (conjunction > exchange > aspect)
      // via.length is wrong here — ['oneAspectsOther','placedInOtherHouse'] (len=2)
      // would beat a pure ['sameHouse'] conjunction (len=1) despite conjunction being stronger.
      const s = scoreLordRelationship(conn.via)
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
  // Classical BPHS Lakshmi Yoga: 9th lord must be in own or exalted sign (strict).
  // Lagna lord may be friendly+ — it provides the channel for fortune to manifest.
  const l9StrongDignities: ReadonlyArray<typeof l9Dignity> = ['exalted', 'mooltrikona', 'own']
  const l1StrongDignities: ReadonlyArray<typeof l1Dignity> = [
    'exalted',
    'mooltrikona',
    'own',
    'friendly',
  ]
  if (!l9StrongDignities.includes(l9Dignity) || !l1StrongDignities.includes(l1Dignity))
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
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedCombust: l9.combust || l1.combust,
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
    chartNarrative: buildLakshmiNarrative(lord9, l9Dignity, l9House, l9.sign, lord1, l1Dignity, l1House, l1.sign),
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
  // Classical BPHS Amala Yoga: Jupiter or Venus ONLY in the 10th from Lagna or Moon.
  // Mercury and waxing Moon are contextual benefics but do NOT qualify for Amala.
  const isAmalaQualifier = (k: PlanetKey): boolean => k === 'Jupiter' || k === 'Venus'
  const beneficsInTenth: PlanetKey[] = []
  let referenceLabel = ''
  for (const k of fromLagna) {
    if (isAmalaQualifier(k)) {
      beneficsInTenth.push(k)
      referenceLabel = '10th from Lagna'
    }
  }
  for (const k of fromMoon) {
    if (isAmalaQualifier(k)) {
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
    chartNarrative: buildAmalaNarrative(beneficsInTenth, referenceLabel, ctx.planets[beneficsInTenth[0]]?.sign ?? ''),
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
      // Classical Vasumati: natural benefics = Jupiter, Venus, Mercury.
      // Waxing Moon is excluded — Moon's benefic nature is conditional and
      // classical texts do not count Moon among the Vasumati qualifiers.
      if (key === 'Moon' || key === 'Sun' || key === 'Rahu' || key === 'Ketu') continue
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
    chartNarrative: buildVasumatiNarrative(best.planets, best.count, useMoon),
    planetsInvolved: best.planets,
    housesInvolved: [...UPACHAYA_HOUSES],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectRajYogas(ctx: YogaEngineInput): YogaResult[] {
  return [
    detectKendraTrikona(ctx),
    detectDharmaKarmadhipati(ctx),
    detectLakshmi(ctx),
    detectAmala(ctx),
    detectVasumati(ctx),
  ]
}
