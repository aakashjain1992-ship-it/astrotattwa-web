/**
 * Solar yogas — planets surrounding the Sun:
 *   - Vesi:        Planet(s) (not Moon/nodes) in 2nd from Sun
 *   - Vosi:        Planet(s) (not Moon/nodes) in 12th from Sun
 *   - Ubhayachari: Both 2nd and 12th from Sun occupied
 *
 * Classical rule: Sun, Moon, Rahu, Ketu do not qualify as the surrounding planet.
 */

import type { PlanetKey } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  getPlanetHouseFromLagna,
  getHouseFromReference,
  getDignity,
  isDebilitated,
  isContextualBenefic,
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
  getStrengthLabel,
} from '../scoring'
import { YOGA_MEANINGS } from '../meanings'

// Planets excluded from qualifying for solar yogas (classical rule)
const SOLAR_EXCLUDED: ReadonlySet<string> = new Set(['Sun', 'Moon', 'Rahu', 'Ketu', 'Ascendant'])

/** Returns planets occupying a specific house from the Sun (1-based, Whole Sign). */
function getSunSidePlanets(ctx: YogaEngineInput, sideHouse: 2 | 12): PlanetKey[] {
  const sun = ctx.planets.Sun
  if (!sun) return []
  const result: PlanetKey[] = []
  for (const [k, p] of Object.entries(ctx.planets)) {
    if (SOLAR_EXCLUDED.has(k)) continue
    if (getHouseFromReference(p.signNumber, sun.signNumber) === sideHouse) {
      result.push(k as PlanetKey)
    }
  }
  return result
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

// ─── Narrative builders ───────────────────────────────────────────────────────

function buildVesiNarrative(planets: PlanetKey[], sunSign: string, sunHouse: number): string {
  const planetStr = planets.length === 1
    ? planets[0]
    : `${planets.slice(0, -1).join(', ')} and ${planets[planets.length - 1]}`
  const parts: string[] = []
  parts.push(
    `Your Sun is in ${sunSign} in the ${ordinalSuffix(sunHouse)} house, with ${planetStr} placed in the immediately following sign — the 2nd from the Sun. This is Vesi Yoga: a planet running ahead of the Sun in the zodiacal sequence, providing forward-facing support to your sense of purpose and identity.`
  )
  parts.push(
    `The 2nd from the Sun represents resources, speech, and the momentum that follows solar expression. A planet here lends its own qualities as backing — ${planetStr.includes('Jupiter') || planetStr.includes('Venus') ? 'the benefic here adds a quality of wisdom or creative grace to how purpose translates into action' : 'the planet here shapes how your sense of direction and self-expression is backed in the chart'}. This yoga generally supports career focus, the ability to sustain effort, and a quality of purposeful follow-through that tends to be noticed over time.`
  )
  return parts.join('\n\n')
}

function buildVosiNarrative(planets: PlanetKey[], sunSign: string, sunHouse: number): string {
  const planetStr = planets.length === 1
    ? planets[0]
    : `${planets.slice(0, -1).join(', ')} and ${planets[planets.length - 1]}`
  const parts: string[] = []
  parts.push(
    `Your Sun is in ${sunSign} in the ${ordinalSuffix(sunHouse)} house, with ${planetStr} placed in the immediately preceding sign — the 12th from the Sun. This is Vosi Yoga: a planet operating just behind the Sun in the zodiacal cycle, providing a background of inner depth and preparation.`
  )
  parts.push(
    `The 12th from the Sun represents what underlies and precedes the Sun's visible expression — reflection, accumulated wisdom, inner preparation, and the quiet foundation from which outer action emerges. ${planetStr.includes('Jupiter') ? 'Jupiter here adds philosophical depth and a quality of principled judgment that supports the Sun\'s expression from behind the scenes.' : 'The planet here gives your solar expression an inner background quality'} — a sense of acting from experience and depth rather than only surface-level impulse. This yoga often supports creative work, thoughtful leadership, and a capacity for behind-the-scenes effectiveness.`
  )
  return parts.join('\n\n')
}

function buildUbhayachariNarrative(
  secPlanets: PlanetKey[],
  twelfthPlanets: PlanetKey[],
  sunSign: string,
  sunHouse: number,
): string {
  const secStr = secPlanets.length === 1 ? secPlanets[0] : secPlanets.join(' and ')
  const twelfthStr = twelfthPlanets.length === 1 ? twelfthPlanets[0] : twelfthPlanets.join(' and ')
  const parts: string[] = []
  parts.push(
    `Your Sun in ${sunSign} (${ordinalSuffix(sunHouse)} house) is flanked on both sides — ${secStr} in the 2nd from the Sun and ${twelfthStr} in the 12th from the Sun. This is Ubhayachari Yoga: the Sun receives planetary support from both the preceding and following signs simultaneously, creating a complete solar environment.`
  )
  parts.push(
    `This double-sided arrangement combines the depth of Vosi Yoga (background preparation, inner resources) with the momentum of Vesi Yoga (forward support, directed action). The Sun's expression of identity, purpose, and authority tends to be well-supported from both directions — you have both the reflective foundation and the forward-moving backing that makes purposeful action sustainable. Career clarity, personal authority, and the ability to inspire confidence in others tend to benefit from this pattern.`
  )
  return parts.join('\n\n')
}

// ─── Detectors ────────────────────────────────────────────────────────────────

function buildSideYoga(id: 'vesi' | 'vosi', side: 2 | 12, ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS[id]
  const sun = ctx.planets.Sun
  if (!sun) return empty(id)
  const planets = getSunSidePlanets(ctx, side)
  if (planets.length === 0) return empty(id)

  const sunHouse = getPlanetHouseFromLagna(sun, ctx.ascendant)
  const conditions = planets.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    conditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / conditions.length,
  )
  const dignity = Math.round(
    conditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) / conditions.length,
  )
  const beneficCount = planets.filter((k) => isContextualBenefic(k, ctx.planets[k], ctx.planets)).length
  // Benefics in the solar position = stronger yoga
  const houseStrength = beneficCount >= 1
    ? scoreHousePlacement([sunHouse]) + 4
    : scoreHousePlacement([sunHouse])
  const aspect = scoreAspectSupport({
    hasJupiterSupport: planets.includes('Jupiter'),
    hasVenusSupport: planets.includes('Venus'),
  })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet:
      planets.includes(ctx.currentDasha?.mahadasha as PlanetKey) ||
      ctx.currentDasha?.mahadasha === 'Sun',
    antardashaIsYogaPlanet:
      planets.includes(ctx.currentDasha?.antardasha as PlanetKey) ||
      ctx.currentDasha?.antardasha === 'Sun',
    pratyantarIsYogaPlanet: planets.includes(ctx.currentDasha?.pratyantar as PlanetKey),
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: planets.some((k) => isDebilitated(k, ctx.planets[k])),
    involvedCombust: planets.some((k) => ctx.planets[k].combust),
  })
  const breakdown = computeYogaScore({
    planetStrength, houseStrength, dignity, aspect, relationship, dasha,
    afflictionPenalty, cancellationPenalty: 0,
  })
  const narrative = id === 'vesi'
    ? buildVesiNarrative(planets, sun.sign, sunHouse)
    : buildVosiNarrative(planets, sun.sign, sunHouse)
  return {
    id,
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Planet(s) in ${side === 2 ? '2nd' : '12th'} from Sun (${sun.sign}): ${planets.join(', ')}.`,
    chartNarrative: narrative,
    planetsInvolved: ['Sun', ...planets],
    housesInvolved: [sunHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

function detectUbhayachari(ctx: YogaEngineInput): YogaResult {
  const m = YOGA_MEANINGS.ubhayachari
  const sun = ctx.planets.Sun
  if (!sun) return empty('ubhayachari')

  const secPlanets = getSunSidePlanets(ctx, 2)
  const twelfthPlanets = getSunSidePlanets(ctx, 12)
  if (secPlanets.length === 0 || twelfthPlanets.length === 0) return empty('ubhayachari')

  const sunHouse = getPlanetHouseFromLagna(sun, ctx.ascendant)
  const allPlanets = [...secPlanets, ...twelfthPlanets]
  const conditions = allPlanets.map((k) => ({
    dignity: getDignity(k, ctx.planets[k]),
    combust: ctx.planets[k].combust,
  }))
  const planetStrength = Math.round(
    conditions.reduce((s, c) => s + scorePlanetCondition(c), 0) / conditions.length,
  )
  const dignity = Math.round(
    conditions.reduce((s, c) => s + scoreDignity(c.dignity), 0) / conditions.length,
  )
  const totalBenefics = allPlanets.filter((k) =>
    isContextualBenefic(k, ctx.planets[k], ctx.planets),
  ).length
  const houseStrength = totalBenefics >= 2 ? 14 : totalBenefics >= 1 ? 11 : 7
  const aspect = scoreAspectSupport({
    hasJupiterSupport: allPlanets.includes('Jupiter'),
    hasVenusSupport: allPlanets.includes('Venus'),
  })
  const relationship = scoreLordRelationship(['placedInOtherHouse'])
  const allWithSun = new Set<PlanetKey>(['Sun', ...allPlanets])
  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: allWithSun.has(ctx.currentDasha?.mahadasha as PlanetKey),
    antardashaIsYogaPlanet: allWithSun.has(ctx.currentDasha?.antardasha as PlanetKey),
    pratyantarIsYogaPlanet: allWithSun.has(ctx.currentDasha?.pratyantar as PlanetKey),
    dashaUnavailable: !ctx.currentDasha,
  })
  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: allPlanets.some((k) => isDebilitated(k, ctx.planets[k])),
    involvedCombust: allPlanets.some((k) => ctx.planets[k].combust),
  })
  const breakdown = computeYogaScore({
    planetStrength, houseStrength, dignity, aspect, relationship, dasha,
    afflictionPenalty, cancellationPenalty: 0,
  })
  return {
    id: 'ubhayachari',
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `Sun (${sun.sign}) flanked — 2nd: ${secPlanets.join(', ')}; 12th: ${twelfthPlanets.join(', ')}.`,
    chartNarrative: buildUbhayachariNarrative(secPlanets, twelfthPlanets, sun.sign, sunHouse),
    planetsInvolved: Array.from(allWithSun),
    housesInvolved: [sunHouse],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectSolarYogas(ctx: YogaEngineInput): YogaResult[] {
  return [
    buildSideYoga('vesi', 2, ctx),
    buildSideYoga('vosi', 12, ctx),
    detectUbhayachari(ctx),
  ]
}
