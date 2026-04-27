/**
 * Moon-based yogas — 5 detectors.
 *  - Gaja-Kesari: Jupiter in Kendra from Moon
 *  - Sunapha:     Planet (not Sun, not nodes) in 2nd from Moon
 *  - Anapha:      Planet (not Sun, not nodes) in 12th from Moon
 *  - Durudhura:   Both 2nd and 12th from Moon occupied
 *  - Kemadruma:   No planets (excl Sun + nodes) in 2nd or 12th from Moon
 */

import type { PlanetKey } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  KENDRA_HOUSES,
  getPlanetHouseFromLagna,
  getPlanetHouseFromMoon,
  getPlanetsInHouseFromMoon,
  getDignity,
  isContextualBenefic,
  isExalted,
  isDebilitated,
  planetAspectsPlanet,
  ordinalSuffix,
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
  scoreCancellationPenalty,
  getStrengthLabel,
} from '../scoring'
import { YOGA_MEANINGS } from '../meanings'

// ─── Narrative builders ───────────────────────────────────────────────────────

function buildGajaKesariNarrative(
  moonSign: string, moonHouse: number,
  jupSign: string, jupHouseFromLagna: number, houseFromMoon: number,
): string {
  const parts: string[] = []
  parts.push(
    `Your Moon is in ${moonSign} in the ${ordinalSuffix(moonHouse)} house, and Jupiter is in ${jupSign} in the ${ordinalSuffix(jupHouseFromLagna)} house — placing Jupiter in the ${ordinalSuffix(houseFromMoon)} from the Moon (a Kendra position). This is the classical arrangement for Gaja-Kesari Yoga, one of the most celebrated configurations in Vedic astrology.`
  )
  parts.push(
    `Jupiter's Kendra placement from the Moon brings its qualities of wisdom, generosity, and sound judgment into direct support of the emotional self. The Moon represents your inner world, instincts, and public reputation; Jupiter's strength here can lend a quality of grace and optimism to your emotional responses and how others perceive you.`
  )
  return parts.join('\n\n')
}

function buildSunaphaAnaphaNarrative(
  side: 2 | 12,
  planets: PlanetKey[],
  moonSign: string,
  moonHouse: number,
): string {
  const sideLabel = side === 2 ? '2nd' : '12th'
  const sideTheme = side === 2
    ? 'the house of resources, speech, and what you accumulate'
    : 'the house of release, retreat, and what lies beyond the visible'
  const planetStr = planets.length === 1 ? planets[0] : `${planets.slice(0, -1).join(', ')} and ${planets[planets.length - 1]}`
  const parts: string[] = []
  parts.push(
    `Your Moon is in ${moonSign} in the ${ordinalSuffix(moonHouse)} house, with ${planetStr} placed in the ${sideLabel} house from the Moon — ${sideTheme}. This is the condition for ${side === 2 ? 'Sunapha' : 'Anapha'} Yoga, formed when a planet (other than the Sun or nodes) supports the Moon from this adjacent position.`
  )
  if (side === 2) {
    parts.push(
      `The 2nd from the Moon supports your capacity to gather, sustain, and give voice to your inner life. ${planetStr} in this position can bring a quality of resourcefulness and expressive strength — a tendency to back up emotional awareness with practical action or meaningful speech.`
    )
  } else {
    parts.push(
      `The 12th from the Moon supports the Moon's capacity to rest, reflect, and release. ${planetStr} here can bring a contemplative or spiritually inclined quality to the emotional nature — a comfort with solitude and an ability to process experience inwardly before it surfaces outwardly.`
    )
  }
  return parts.join('\n\n')
}

function buildDurudharaNarrative(
  secPlanets: PlanetKey[], twelfthPlanets: PlanetKey[],
  moonSign: string, moonHouse: number,
): string {
  const secStr = secPlanets.join(' and ')
  const twelfthStr = twelfthPlanets.join(' and ')
  const parts: string[] = []
  parts.push(
    `Your Moon in ${moonSign} (${ordinalSuffix(moonHouse)} house) is flanked on both sides — ${secStr} in the 2nd from the Moon and ${twelfthStr} in the 12th from the Moon. This is Durudhura Yoga: the Moon receives planetary support from both adjacent houses simultaneously.`
  )
  parts.push(
    `This surrounding pattern gives the Moon a quality of containment and stability — it is neither entirely solitary nor pulled in only one direction. Resources, expression, and contemplative depth are all active around your emotional centre, which can make for a rich inner life and a personality that others find well-rounded and grounded.`
  )
  return parts.join('\n\n')
}

function buildKemadrumaNarrative(moonSign: string, moonHouse: number): string {
  const parts: string[] = []
  parts.push(
    `Your Moon in ${moonSign} (${ordinalSuffix(moonHouse)} house) has no planets in the 2nd or 12th from it — the classical condition for Kemadruma Yoga. The Moon stands without adjacent planetary support, which can create an emotional self that must rely on its own inner resources rather than outer reinforcement.`
  )
  parts.push(
    `This placement does not mean difficulty is inevitable — many Kemadruma cancellation factors are recognised in classical texts (Jupiter's aspect, Moon in a Kendra, or planets in the Moon's Kendra). The yoga's effect is most significant when few or none of these relief conditions are present. Where it does operate, it can manifest as a tendency to feel emotionally self-sufficient or, at times, unsupported — but also as genuine resilience and independence of spirit.`
  )
  return parts.join('\n\n')
}

function emptyResult(id: string): YogaResult {
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

function detectGajaKesari(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.gajaKesari
  const moon = ctx.planets.Moon
  const jup = ctx.planets.Jupiter
  if (!moon || !jup) return emptyResult('gajaKesari')

  const houseFromMoon = getPlanetHouseFromMoon(jup, moon)
  if (!(KENDRA_HOUSES as readonly number[]).includes(houseFromMoon))
    return emptyResult('gajaKesari')

  const jupDignity = getDignity('Jupiter', jup)
  const moonDignity = getDignity('Moon', moon)
  const planetStrength = Math.round(
    (scorePlanetCondition({ dignity: jupDignity, combust: jup.combust }) +
      scorePlanetCondition({ dignity: moonDignity, combust: moon.combust })) /
      2,
  )
  const houseStrength = scoreHousePlacement([
    getPlanetHouseFromLagna(jup, ctx.ascendant),
    getPlanetHouseFromLagna(moon, ctx.ascendant),
  ])
  const dignity = Math.round((scoreDignity(jupDignity) + scoreDignity(moonDignity)) / 2)
  const aspect = scoreAspectSupport({
    hasJupiterSupport: false,
    hasVenusSupport:
      !!ctx.planets.Venus && planetAspectsPlanet('Venus', ctx.planets.Venus, jup),
  })
  const relationship = scoreLordRelationship(['conjunction'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      ctx.currentDasha?.mahadasha === 'Jupiter' || ctx.currentDasha?.mahadasha === 'Moon',
    antardashaIsYogaPlanet:
      ctx.currentDasha?.antardasha === 'Jupiter' || ctx.currentDasha?.antardasha === 'Moon',
    pratyantarIsYogaPlanet:
      ctx.currentDasha?.pratyantar === 'Jupiter' || ctx.currentDasha?.pratyantar === 'Moon',
    dashaUnavailable: !ctx.currentDasha,
  })
  const nodesConj = ['Rahu', 'Ketu'].some(
    (n) =>
      ctx.planets[n]?.signNumber === jup.signNumber ||
      ctx.planets[n]?.signNumber === moon.signNumber,
  )
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: isDebilitated('Jupiter', jup) || isDebilitated('Moon', moon),
    involvedConjunctNode: nodesConj,
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
    id: 'gajaKesari',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Jupiter is in house ${houseFromMoon} from the Moon (Kendra).`,
    chartNarrative: buildGajaKesariNarrative(
      moon.sign, getPlanetHouseFromLagna(moon, ctx.ascendant),
      jup.sign, getPlanetHouseFromLagna(jup, ctx.ascendant), houseFromMoon,
    ),
    planetsInvolved: ['Jupiter', 'Moon'],
    housesInvolved: [houseFromMoon],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function detectSidePlanets(
  ctx: YogaEngineInput,
  houseFromMoon: 2 | 12,
): { planets: PlanetKey[]; beneficCount: number } {
  if (!ctx.planets.Moon) return { planets: [], beneficCount: 0 }
  const planets = getPlanetsInHouseFromMoon(houseFromMoon, ctx.planets.Moon, ctx.planets, [
    'Sun',
    'Rahu',
    'Ketu',
    'Moon',
  ])
  let beneficCount = 0
  for (const k of planets) {
    if (isContextualBenefic(k, ctx.planets[k], ctx.planets)) beneficCount++
  }
  return { planets, beneficCount }
}

function buildSideYoga(
  id: 'sunapha' | 'anapha',
  side: 2 | 12,
  ctx: YogaEngineInput,
): YogaResult {
  const m = YOGA_MEANINGS[id]
  const { planets, beneficCount } = detectSidePlanets(ctx, side)
  if (planets.length === 0) return emptyResult(id)

  // Strength from planets in side house
  const involvedConditions = planets.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    involvedConditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / planets.length,
  )
  const dignity = Math.round(
    involvedConditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) /
      planets.length,
  )
  const houseStrength = beneficCount >= 1 ? 12 : 6
  const aspect = scoreAspectSupport({
    hasWaxingMoonSupport: isContextualBenefic('Moon', ctx.planets.Moon, ctx.planets),
  })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: planets.includes(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: planets.includes(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: planets.includes(ctx.currentDasha?.pratyantar as PlanetKey),
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
    cancellationPenalty: beneficCount === 0 ? 5 : 0,
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
    technicalReason: `Planets in ${side === 2 ? '2nd' : '12th'} from Moon: ${planets.join(', ')}.`,
    chartNarrative: ctx.planets.Moon
      ? buildSunaphaAnaphaNarrative(side, planets, ctx.planets.Moon.sign, getPlanetHouseFromLagna(ctx.planets.Moon, ctx.ascendant))
      : undefined,
    planetsInvolved: ['Moon', ...planets],
    housesInvolved: [side],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function detectDurudhura(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.durudhura
  const sec = detectSidePlanets(ctx, 2)
  const twelfth = detectSidePlanets(ctx, 12)
  if (sec.planets.length === 0 || twelfth.planets.length === 0)
    return emptyResult('durudhura')

  const allPlanets: PlanetKey[] = [...sec.planets, ...twelfth.planets]
  const involvedConditions = allPlanets.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    involvedConditions.reduce((s, c) => s + scorePlanetCondition(c), 0) /
      involvedConditions.length,
  )
  const dignity = Math.round(
    involvedConditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) /
      involvedConditions.length,
  )
  const totalBenefics = sec.beneficCount + twelfth.beneficCount
  const houseStrength = totalBenefics >= 2 ? 14 : totalBenefics >= 1 ? 11 : 7
  const aspect = scoreAspectSupport({
    hasWaxingMoonSupport: isContextualBenefic('Moon', ctx.planets.Moon, ctx.planets),
    hasJupiterSupport: !!ctx.planets.Jupiter && allPlanets.includes('Jupiter'),
  })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const yogaPlanets = new Set<PlanetKey>(['Moon', ...allPlanets])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: yogaPlanets.has(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: yogaPlanets.has(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: yogaPlanets.has(ctx.currentDasha?.pratyantar as PlanetKey),
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
    id: 'durudhura',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Planets surround the Moon — 2nd: ${sec.planets.join(', ')}; 12th: ${twelfth.planets.join(', ')}. Includes Sunapha and Anapha conditions.`,
    chartNarrative: ctx.planets.Moon
      ? buildDurudharaNarrative(sec.planets, twelfth.planets, ctx.planets.Moon.sign, getPlanetHouseFromLagna(ctx.planets.Moon, ctx.ascendant))
      : undefined,
    planetsInvolved: Array.from(yogaPlanets),
    housesInvolved: [2, 12],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function detectKemadruma(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.kemadruma
  const sec = detectSidePlanets(ctx, 2)
  const twelfth = detectSidePlanets(ctx, 12)
  if (sec.planets.length > 0 || twelfth.planets.length > 0)
    return emptyResult('kemadruma')

  const moon = ctx.planets.Moon
  if (!moon) return emptyResult('kemadruma')

  // Cancellation factors per spec
  let cancellationFactor = 0
  // Jupiter aspects Moon
  const jup = ctx.planets.Jupiter
  if (jup && planetAspectsPlanet('Jupiter', jup, moon)) cancellationFactor += 6
  // Moon in Kendra from Lagna
  const moonHouse = getPlanetHouseFromLagna(moon, ctx.ascendant)
  if ((KENDRA_HOUSES as readonly number[]).includes(moonHouse)) cancellationFactor += 5
  // Moon strong by sign (own/exalted)
  if (isExalted('Moon', moon) || moon.sign === 'Cancer') cancellationFactor += 5
  // Planets in Kendra from Moon (other than Sun + nodes)
  let planetsInKendraFromMoon = 0
  for (const k of ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as PlanetKey[]) {
    const p = ctx.planets[k]
    if (!p) continue
    const hFromMoon = getPlanetHouseFromMoon(p, moon)
    if ((KENDRA_HOUSES as readonly number[]).includes(hFromMoon)) planetsInKendraFromMoon++
  }
  cancellationFactor += Math.min(6, planetsInKendraFromMoon * 2)

  const moonDignity = getDignity('Moon', moon)
  const planetStrength = scorePlanetCondition({
    dignity: moonDignity,
    combust: moon.combust,
  })
  const houseStrength = scoreHousePlacement([moonHouse])
  const dignity = scoreDignity(moonDignity)
  const aspect = scoreAspectSupport({})
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: ctx.currentDasha?.mahadasha === 'Moon',
    antardashaIsYogaPlanet: ctx.currentDasha?.antardasha === 'Moon',
    pratyantarIsYogaPlanet: ctx.currentDasha?.pratyantar === 'Moon',
    dashaUnavailable: !ctx.currentDasha,
  })
  const cancellationPenalty = scoreCancellationPenalty({
    kemadrumaCancellationFactor: cancellationFactor,
  })
  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity,
    aspect,
    relationship,
    dasha,
    afflictionPenalty: 0,
    cancellationPenalty,
  })
  if (breakdown.final <= 0) return emptyResult('kemadruma')
  return {
    id: 'kemadruma',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason:
      'No supportive planets in the 2nd or 12th from the Moon (excluding Sun and nodes).',
    chartNarrative: moon ? buildKemadrumaNarrative(moon.sign, moonHouse) : undefined,
    planetsInvolved: ['Moon'],
    housesInvolved: [moonHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectMoonYogas(ctx: YogaEngineInput): YogaResult[] {
  return [
    detectGajaKesari(ctx),
    buildSideYoga('sunapha', 2, ctx),
    buildSideYoga('anapha', 12, ctx),
    detectDurudhura(ctx),
    detectKemadruma(ctx),
  ]
}
