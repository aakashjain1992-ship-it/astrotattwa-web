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
  signNumToName,
  ordinalSuffix,
  getSignInHouse,
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

// ─── Narrative builders ───────────────────────────────────────────────────────

const DEBILITATION_SIGN: Partial<Record<string, string>> = {
  Sun: 'Libra', Moon: 'Scorpio', Mars: 'Cancer', Mercury: 'Pisces',
  Jupiter: 'Capricorn', Venus: 'Virgo', Saturn: 'Aries',
}

function buildNeechaBhangaNarrative(
  cancellations: { planet: string; rule: string }[],
  planets: Record<string, { sign: string; combust: boolean }>,
): string {
  const parts: string[] = []
  const planetStr = cancellations.map(c => `${c.planet} (debilitated in ${DEBILITATION_SIGN[c.planet] ?? planets[c.planet]?.sign ?? 'its sign'})`).join(' and ')
  parts.push(
    `Neecha Bhanga Raja Yoga arises when a debilitated planet has its weakness cancelled by specific chart conditions. In your chart, ${planetStr} — and the cancellation condition is met, converting the debilitation into a source of eventual strength rather than sustained weakness.`
  )
  const ruleDesc = cancellations.map(c => {
    const combust = planets[c.planet]?.combust ? ' Note: the planet is also combust, which partially limits the cancellation — results are real but may arrive later or with more effort than a fully free planet would suggest.' : ''
    return `For ${c.planet}: ${c.rule}.${combust}`
  })
  parts.push(ruleDesc.join('\n\n'))
  parts.push(
    `The classical understanding is that a debilitated planet with Neecha Bhanga often produces results late in life or after a period of struggle — but when the results come, they carry a depth and character that a naturally well-placed planet might not. The timing tends to coincide with the Mahadasha or Antardasha of the involved planet(s).`
  )
  return parts.join('\n\n')
}

const PARIVARTANA_HOUSE_THEME: Record<number, string> = {
  1: 'self, identity, and health', 2: 'resources and speech', 3: 'communication and initiative',
  4: 'home and emotional security', 5: 'intelligence and creativity', 6: 'obstacles and service',
  7: 'relationships and partnerships', 8: 'transformation and hidden matters',
  9: 'fortune and higher wisdom', 10: 'career and public life', 11: 'income and social networks',
  12: 'retreat, loss, and spiritual life',
}

const PARIVARTANA_SUBTYPE_TEXT: Record<string, string> = {
  maha: 'Both planets are in good houses (Kendra, Trikona, 2nd, or 11th), making this a Maha Parivartana — a strongly positive sign exchange that tends to support both houses involved and the domains they rule.',
  dainya: 'One of the planets is in a dusthana house (6th, 8th, or 12th), making this a Dainya Parivartana. The exchange is present but one side carries a complicating quality — gains are possible but may come with effort, delay, or a degree of challenge in one of the two areas involved.',
  khala: 'One of the planets is in the 3rd house, making this a Khala Parivartana — a mixed exchange that can bring ambition and effort but with less consistent or settled results than a Maha exchange.',
  mixed: 'This is a general Parivartana — a sign exchange with a mixed placement profile.',
}

function buildParivartanaNarrative(
  a: string, aHouse: number, aSign: string,
  b: string, bHouse: number, bSign: string,
  subtype: string, allExchangeCount: number,
): string {
  const parts: string[] = []
  parts.push(
    `${a} in ${aSign} (${ordinalSuffix(aHouse)} house) and ${b} in ${bSign} (${ordinalSuffix(bHouse)} house) are in sign exchange — each planet is placed in the sign owned by the other. This is Parivartana Yoga: the two planets behave as though conjunct, creating a deep mutual link between ${PARIVARTANA_HOUSE_THEME[aHouse] ?? `the ${ordinalSuffix(aHouse)} house`} and ${PARIVARTANA_HOUSE_THEME[bHouse] ?? `the ${ordinalSuffix(bHouse)} house`}.`
  )
  parts.push(PARIVARTANA_SUBTYPE_TEXT[subtype] ?? PARIVARTANA_SUBTYPE_TEXT.mixed)
  if (allExchangeCount > 1) {
    parts.push(`Your chart contains ${allExchangeCount} sign exchanges in total — the one shown here is the most favourably placed. Multiple exchanges intensify the mutual weaving between houses and can create a chart with unusually strong inter-house connections.`)
  }
  return parts.join('\n\n')
}

function buildKartariNarrative(isBenefic: boolean, in12: string[], in2: string[]): string {
  const parts: string[] = []
  const planetStr12 = in12.join(' and ')
  const planetStr2 = in2.join(' and ')
  if (isBenefic) {
    parts.push(
      `Your Lagna (Ascendant) is flanked by natural benefics — ${planetStr12} in the 12th house and ${planetStr2} in the 2nd house. This is Shubha Kartari Yoga: the Lagna is enclosed by planets of grace and support on both sides.`
    )
    parts.push(
      `The 12th and 2nd houses are the immediate neighbours of the 1st. When benefics occupy both, they create a cushioning effect around the self and the life in general — supporting resilience, protecting against severe difficulty, and lending a quality of grace to circumstances that might otherwise be harder. The Lagna lord and the planet itself still matter, but the surrounding benefic field is a meaningful background support.`
    )
  } else {
    parts.push(
      `Your Lagna (Ascendant) is flanked by natural malefics — ${planetStr12} in the 12th house and ${planetStr2} in the 2nd house. This is Paap Kartari Yoga: the Lagna is enclosed by planets that carry a more pressuring or restricting quality.`
    )
    parts.push(
      `The 12th and 2nd are the immediate neighbours of the 1st house. When malefics occupy both, they create a kind of friction or resistance around the life in general — which can manifest as recurring effort required to maintain stability, a tendency to face obstacles from both sides of a situation, or a sense that progress comes through persistence rather than ease. The effect is meaningful but rarely severe on its own — the Lagna lord's condition and dignity also play a central role in how this operates.`
    )
  }
  return parts.join('\n\n')
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
  // Dignity reflects partial recovery: 4 for single rule, +2 per additional rule, capped at 10
  // (planet is still debilitated by nature — cancellation is never complete restoration)
  const dignity = Math.min(10, 4 + (cancellations.length - 1) * 2)
  const aspect = scoreAspectSupport({})
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const involved = cancellations.map((c) => c.planet)
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: involved.includes(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: involved.includes(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: involved.includes(ctx.currentDasha?.pratyantar as PlanetKey),
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedCombust: cancellations.some((c) => ctx.planets[c.planet].combust),
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
    id: 'neechaBhanga',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: cancellations
      .map((c) => {
        const combust = ctx.planets[c.planet].combust ? ' (combust — partial cancellation only)' : ''
        return `${c.planet} debilitated — ${c.rule}${combust}`
      })
      .join('; '),
    chartNarrative: buildNeechaBhangaNarrative(
      cancellations,
      Object.fromEntries(Object.entries(ctx.planets).map(([k, v]) => [k, { sign: v.sign, combust: v.combust }])),
    ),
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
    chartNarrative: buildParivartanaNarrative(
      best.a, best.aHouse, aData.sign,
      best.b, best.bHouse, bData.sign,
      subtype, found.length,
    ),
    planetsInvolved: [best.a, best.b],
    housesInvolved: [best.aHouse, best.bHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
    meta: { subtype, allExchanges: found },
  }
}

// ─── Dhana Yoga — "In your chart" narrative builder ─────────────────────────

const WEALTH_HOUSE_MEANING: Record<number, string> = {
  2:  'savings, family wealth, accumulated resources and speech',
  5:  'intelligence, creativity, merit, planning and past-life purity',
  9:  'fortune, dharma, higher wisdom and life opportunities',
  11: 'income, gains, social networks and fulfilment of desires',
}

const CONJUNCTION_HOUSE_NARRATIVE: Partial<Record<number, string>> = {
  1:  'This conjunction is in the 1st house — the house of self and overall life direction — tying wealth potential directly to personal drive and identity.',
  2:  'This conjunction is in the 2nd house itself — the house of wealth and family — which intensifies the financial potential of the yoga.',
  4:  'This conjunction is in the 4th house — the house of property, home and emotional comfort — suggesting wealth through real estate, family or private enterprise.',
  5:  'This conjunction is in the 5th house — the house of intelligence and merit — strengthening the link between creative ability, strategy and financial growth.',
  7:  'This conjunction is in the 7th house — the house of partnerships and business — suggesting wealth through relationships, deals or collaborative work.',
  9:  'This conjunction is in the 9th house — the house of fortune, dharma and opportunity. This adds an element of luck and divine support, suggesting gains can come through knowledge, advisory roles, consulting, teaching, networking, foreign connections or positions of wisdom and professional authority.',
  10: 'This conjunction is in the 10th house — the house of career and public standing — tying wealth directly to professional achievement and reputation.',
  11: 'This conjunction is in the 11th house itself — the house of income and gains — which directly intensifies the earning and accumulation potential of the yoga.',
}

const DUSTHANA_LORD_EFFECT: Record<number, string> = {
  6:  'can add effort, competition or health-related delays to how gains arrive. Working hard and managing obstacles will be part of the path.',
  8:  'can introduce delays, transformation or sudden changes before gains fully materialise. Results may be slower, more mature and dependent on persistence through difficult phases.',
  12: 'can create a tendency for wealth to flow out through expenditure, foreign dealings or spiritual investment. Gains are possible but may not accumulate as steadily.',
}

type WealthPair = { a: PlanetKey; b: PlanetKey; ah: number; bh: number; via: string[] }
type LordEntry = { house: number; lord: PlanetKey }

function buildDhanaNarrative(
  ctx: YogaEngineInput,
  lords: LordEntry[],
  pairs: WealthPair[],
): string {
  const { ascendant, planets } = ctx
  const DUSTHANA = [6, 8, 12]
  const parts: string[] = []

  const conjunctPairs = pairs.filter(p => p.via.includes('sameHouse'))
  const otherPairs = pairs.filter(p => !p.via.includes('sameHouse'))

  // ── Step 1: Main connection sentence ──────────────────────────────────────

  if (conjunctPairs.length > 0) {
    // Collect unique planets in all conjunct pairs — may be 2 or 3+
    const conjunctPlanets = [...new Set(conjunctPairs.flatMap(p => [p.a, p.b]))]
    const refPlanet = planets[conjunctPlanets[0]]
    const conjunctHouse = getPlanetHouseFromLagna(refPlanet, ascendant)
    const conjunctSign = refPlanet.sign

    const lordLabels = conjunctPlanets.map(pk => {
      const entry = lords.find(l => l.lord === pk)
      return entry ? `${ordinalSuffix(entry.house)} lord ${pk}` : pk
    })
    const lordStr = lordLabels.length === 2
      ? `${lordLabels[0]} and ${lordLabels[1]}`
      : `${lordLabels.slice(0, -1).join(', ')} and ${lordLabels[lordLabels.length - 1]}`

    parts.push(`Your ${lordStr} are conjunct in the ${ordinalSuffix(conjunctHouse)} house (${conjunctSign}).`)

    // Explain what houses are being connected
    const houseNums = [...new Set(conjunctPairs.flatMap(p => [p.ah, p.bh]))]
    const houseDesc = houseNums
      .filter(h => WEALTH_HOUSE_MEANING[h])
      .map(h => `the ${ordinalSuffix(h)} house (${WEALTH_HOUSE_MEANING[h]})`)
    if (houseDesc.length >= 2) {
      parts.push(
        `This directly connects ${houseDesc.slice(0, -1).join(', ')} and ${houseDesc[houseDesc.length - 1]}. When their lords meet in the same sign, the chart creates a clear channel between these wealth-supporting areas.`
      )
    }

    // Significance of the conjunction house
    const houseNarr = CONJUNCTION_HOUSE_NARRATIVE[conjunctHouse]
    if (houseNarr) parts.push(houseNarr)

  } else if (otherPairs.length > 0) {
    const main = otherPairs[0]
    const aHouse = getPlanetHouseFromLagna(planets[main.a], ascendant)
    const bHouse = getPlanetHouseFromLagna(planets[main.b], ascendant)

    if (main.via.includes('exchange')) {
      parts.push(
        `Your ${ordinalSuffix(main.ah)} lord ${main.a} and ${ordinalSuffix(main.bh)} lord ${main.b} exchange signs — each is placed in the other's house. This creates a strong mutual connection between ${WEALTH_HOUSE_MEANING[main.ah] ?? `the ${ordinalSuffix(main.ah)} house`} and ${WEALTH_HOUSE_MEANING[main.bh] ?? `the ${ordinalSuffix(main.bh)} house`}.`
      )
    } else if (main.via.includes('placedInOtherHouse')) {
      if (aHouse === main.bh) {
        parts.push(
          `Your ${ordinalSuffix(main.ah)} lord ${main.a} is placed in the ${ordinalSuffix(main.bh)} house — the domain of ${main.b}. This links ${WEALTH_HOUSE_MEANING[main.ah] ?? `the ${ordinalSuffix(main.ah)} house`} to ${WEALTH_HOUSE_MEANING[main.bh] ?? `the ${ordinalSuffix(main.bh)} house`}, creating a wealth connection through placement.`
        )
      } else if (bHouse === main.ah) {
        parts.push(
          `Your ${ordinalSuffix(main.bh)} lord ${main.b} is placed in the ${ordinalSuffix(main.ah)} house — the domain of ${main.a}. This links ${WEALTH_HOUSE_MEANING[main.bh] ?? `the ${ordinalSuffix(main.bh)} house`} to ${WEALTH_HOUSE_MEANING[main.ah] ?? `the ${ordinalSuffix(main.ah)} house`}, forming a Dhana Yoga through placement.`
        )
      }
    } else if (main.via.includes('mutualAspect') || main.via.includes('oneAspectsOther')) {
      parts.push(
        `Your ${ordinalSuffix(main.ah)} lord ${main.a} and ${ordinalSuffix(main.bh)} lord ${main.b} aspect each other, creating a connection between ${WEALTH_HOUSE_MEANING[main.ah] ?? `the ${ordinalSuffix(main.ah)} house`} and ${WEALTH_HOUSE_MEANING[main.bh] ?? `the ${ordinalSuffix(main.bh)} house`}.`
      )
    }
  }

  // ── Step 2: Complicating factors — connected lords in dusthana ─────────────

  const connectedLords = [...new Set(pairs.flatMap(p => [p.a, p.b]))]
  for (const pk of connectedLords) {
    const entry = lords.find(l => l.lord === pk)
    if (!entry) continue
    const lordHouse = getPlanetHouseFromLagna(planets[pk], ascendant)
    const effect = DUSTHANA_LORD_EFFECT[lordHouse]
    if (effect) {
      parts.push(
        `However, the ${ordinalSuffix(entry.house)} lord ${pk} is placed in the ${ordinalSuffix(lordHouse)} house. This ${effect} It does not cancel the Dhana Yoga but can affect its timing and the ease with which results appear.`
      )
    }
  }

  // ── Step 3: Unconnected lords with notable associations ────────────────────

  const disconnected = lords.filter(l => !connectedLords.includes(l.lord))
  for (const { house, lord } of disconnected) {
    const p = planets[lord]
    if (!p) continue
    const lordHouse = getPlanetHouseFromLagna(p, ascendant)
    const cotenants = Object.entries(planets)
      .filter(([k, v]) => k !== lord && k !== 'Ascendant' && v.signNumber === p.signNumber)
      .map(([k]) => k)
    const maleficCo = cotenants.filter(c => c === 'Rahu' || c === 'Ketu' || c === 'Saturn' || c === 'Mars')
    const inDusthana = DUSTHANA.includes(lordHouse)

    if (maleficCo.length > 0 || inDusthana) {
      const coStr = cotenants.length > 0 ? ` with ${cotenants.join(' and ')}` : ''
      const houseMeaning = WEALTH_HOUSE_MEANING[house] ?? `the ${ordinalSuffix(house)} house`
      let effect = ''
      if (maleficCo.includes('Rahu') || maleficCo.includes('Ketu')) {
        effect = `${lord}'s association with ${maleficCo.filter(c => c === 'Rahu' || c === 'Ketu').join(' and ')} can create unconventional or fluctuating patterns around ${houseMeaning}. Gains are still possible, but they may come in irregular cycles or require careful management rather than steady accumulation.`
      } else if (inDusthana) {
        effect = `${lord} being in the ${ordinalSuffix(lordHouse)} house adds some complexity to ${houseMeaning} — more effort or delays may be needed in this area.`
      } else {
        effect = `${lord}'s association with ${maleficCo.join(' and ')} adds some tension to ${houseMeaning}, which may create pressure or mixed results in this area.`
      }
      parts.push(
        `The ${ordinalSuffix(house)} lord ${lord} is in the ${ordinalSuffix(lordHouse)} house${coStr}. ${effect}`
      )
    }
  }

  // ── Step 4: Timing ──────────────────────────────────────────────────────────

  const timingPlanets = connectedLords.slice(0, 3)
  if (timingPlanets.length > 0) {
    const tStr = timingPlanets.length === 1
      ? timingPlanets[0]
      : `${timingPlanets.slice(0, -1).join(', ')} or ${timingPlanets[timingPlanets.length - 1]}`
    parts.push(
      `Results are likely to be clearest during ${tStr} Mahadasha or Antardasha, especially when supported by favourable transits to the wealth houses in the chart.`
    )
  }

  return parts.join('\n\n')
}

function viaDesc(via: string[]): string {
  if (via.includes('sameHouse')) return 'conjunct'
  if (via.includes('mutualAspect')) return 'mutual aspect'
  if (via.includes('oneAspectsOther')) return 'aspect'
  if (via.includes('exchange')) return 'sign exchange'
  if (via.includes('placedInOtherHouse')) return 'placed in each other\'s house'
  return 'connected'
}

function detectDhana(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.dhana
  const wealthLordPairs: { a: PlanetKey; b: PlanetKey; ah: number; bh: number; via: string[] }[] = []
  const lords = WEALTH_HOUSES.map((h) => ({ house: h, lord: getHouseLord(h, ctx.ascendant) }))

  for (let i = 0; i < lords.length; i++) {
    for (let j = i + 1; j < lords.length; j++) {
      const A = lords[i]
      const B = lords[j]
      if (A.lord === B.lord) continue
      const conn = lordsConnected(A.lord, A.house, B.lord, B.house, ctx.planets, ctx.ascendant)
      if (conn.connected) {
        wealthLordPairs.push({ a: A.lord, b: B.lord, ah: A.house, bh: B.house, via: conn.via })
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
  // Build rich per-chart technical reason
  const lagnaSign = ctx.ascendant.sign
  const lordLines = lords.map(({ house, lord }) => {
    if (!ctx.planets[lord]) return null
    const p = ctx.planets[lord]
    const houseSign = signNumToName(getSignInHouse(house, ctx.ascendant.signNumber))
    const placedHouse = getPlanetHouseFromLagna(p, ctx.ascendant)
    const cotenants = Object.entries(ctx.planets)
      .filter(([k, v]) => k !== lord && k !== 'Ascendant' && v.signNumber === p.signNumber)
      .map(([k]) => k)
    const coStr = cotenants.length > 0 ? `, with ${cotenants.join(' + ')}` : ''
    return `${ordinalSuffix(house)} lord ${lord} (${houseSign}) → ${ordinalSuffix(placedHouse)} house, ${p.sign}${coStr}`
  }).filter(Boolean)

  const connLines = wealthLordPairs
    .map((p) => `${ordinalSuffix(p.ah)} lord ${p.a} ↔ ${ordinalSuffix(p.bh)} lord ${p.b} (${viaDesc(p.via)})`)
    .join('; ')

  const technicalReason = `Lagna: ${lagnaSign}\n\nWealth lords:\n${lordLines.join('\n')}\n\nConnected pairs: ${connLines}.`

  // Include ALL wealth lords in planetsInvolved, not just the connected ones
  const allLordPlanets = [...new Set(lords.map((l) => l.lord))]

  return {
    id: 'dhana',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason,
    chartNarrative: buildDhanaNarrative(ctx, lords, wealthLordPairs),
    planetsInvolved: allLordPlanets,
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
    chartNarrative: buildKartariNarrative(isBenefic, in12, in2),
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
