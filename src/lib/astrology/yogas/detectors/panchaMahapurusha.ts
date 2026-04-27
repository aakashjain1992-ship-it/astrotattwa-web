/**
 * Pancha Mahapurusha Yogas — 5 detectors.
 *
 * Rule: A non-luminary, non-node planet (Mars, Mercury, Jupiter, Venus, Saturn)
 *   is in a Kendra house from Lagna AND in its own / Mooltrikona / exalted sign.
 */

import type { PlanetKey, PlanetData } from '@/types/astrology'
import type { YogaResult, YogaEngineInput } from '../types'
import {
  KENDRA_HOUSES,
  OWN_OR_EXALT_OR_MT,
  getPlanetHouseFromLagna,
  getDignity,
  isContextualBenefic,
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
  scoreCancellationPenalty,
  getStrengthLabel,
} from '../scoring'
import { YOGA_MEANINGS } from '../meanings'

// ─── Planet-specific theme text ───────────────────────────────────────────────

const PLANET_THEME: Record<string, { quality: string; domains: string; strength: string }> = {
  Mars: {
    quality: 'Ruchaka',
    domains: 'courage, drive, physical vitality, and the capacity to act decisively. Mars governs athletic ability, leadership in difficult conditions, and the willingness to push through resistance.',
    strength: 'Your chart suggests a strong assertive energy — an ability to take initiative, defend what matters, and lead through action rather than words.',
  },
  Mercury: {
    quality: 'Bhadra',
    domains: 'intelligence, analytical precision, communication, and practical skill. Mercury governs the ability to learn, reason, articulate ideas, and excel in commerce, technology, writing, or advisory roles.',
    strength: 'Your chart suggests a sharp and discerning mind — an ability to process information quickly, communicate with clarity, and find solutions where others see only complexity.',
  },
  Jupiter: {
    quality: 'Hamsa',
    domains: 'wisdom, knowledge, good judgment, and spiritual grace. Jupiter governs teaching, philosophy, law, and the ability to offer guidance that is genuinely beneficial to others.',
    strength: 'Your chart suggests a naturally expansive and benevolent quality — a capacity for principled thinking, broad perspective, and earning trust through honesty and sound counsel.',
  },
  Venus: {
    quality: 'Malavya',
    domains: 'refinement, aesthetic sensibility, harmony, and the enjoyment of life\'s pleasures. Venus governs the arts, relationships, beauty, comfort, and the ability to create environments others find inspiring.',
    strength: 'Your chart suggests a magnetic personal quality — an eye for beauty, a desire for harmony, and the ability to attract favourable relationships, resources, and creative opportunities.',
  },
  Saturn: {
    quality: 'Shasha',
    domains: 'discipline, endurance, structure, and the ability to build lasting results over time. Saturn governs service, administration, resource management, and achievement through sustained effort.',
    strength: 'Your chart suggests a capacity for steady, methodical effort — a resilience that outlasts short-term obstacles and an ability to earn authority through demonstrated reliability.',
  },
}

const KENDRA_HOUSE_MEANING: Record<number, string> = {
  1: 'the 1st house — the house of self, body, and overall life direction',
  4: 'the 4th house — the house of home, emotional foundation, and inner peace',
  7: 'the 7th house — the house of partnerships, relationships, and public dealings',
  10: 'the 10th house — the house of career, reputation, and public life',
}

const DIGNITY_LABEL: Record<string, string> = {
  exalted: 'in its sign of exaltation',
  own: 'in its own sign',
  mooltrikona: 'in its Mooltrikona sign',
}

function buildMahapurushaaNarrative(
  planet: string,
  sign: string,
  house: number,
  dignity: string,
): string {
  const theme = PLANET_THEME[planet]
  if (!theme) return ''
  const dignityStr = DIGNITY_LABEL[dignity] ?? `in ${sign}`
  const houseStr = KENDRA_HOUSE_MEANING[house] ?? `the ${house}th house`
  const parts: string[] = []

  parts.push(
    `${planet} is placed ${dignityStr} (${sign}) in ${houseStr} of your chart. This is the classical condition for ${theme.quality} Yoga — a Pancha Mahapurusha configuration where ${planet} is at its strongest possible dignity and placed in a house of central importance to the life.`
  )
  parts.push(
    `${planet} in this position governs ${theme.domains} ${theme.strength}`
  )

  if (house === 10) {
    parts.push(
      `The 10th house placement is particularly significant for career and public recognition — ${planet}'s qualities are likely to express themselves through your profession and the role you occupy in the wider world.`
    )
  } else if (house === 7) {
    parts.push(
      `The 7th house placement means ${planet}'s qualities also shape your relationships and how you engage in partnerships — professional and personal. Others are likely to experience this planetary energy directly through their dealings with you.`
    )
  }

  return parts.join('\n\n')
}

interface MahapurushaSpec {
  id: keyof typeof YOGA_MEANINGS
  planet: PlanetKey
}

const SPECS: MahapurushaSpec[] = [
  { id: 'ruchaka', planet: 'Mars' },
  { id: 'bhadra', planet: 'Mercury' },
  { id: 'hamsa', planet: 'Jupiter' },
  { id: 'malavya', planet: 'Venus' },
  { id: 'shasha', planet: 'Saturn' },
]

function isAfflictedByMaleficAspect(
  target: PlanetKey,
  targetData: PlanetData,
  planets: Record<string, PlanetData>,
): boolean {
  for (const k of ['Saturn', 'Mars', 'Rahu', 'Ketu'] as PlanetKey[]) {
    if (k === target) continue
    const p = planets[k]
    if (!p) continue
    if (planetAspectsPlanet(k, p, targetData)) return true
  }
  return false
}

function buildEmpty(spec: MahapurushaSpec): YogaResult {
  const m = YOGA_MEANINGS[spec.id]
  return {
    id: spec.id,
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
    planetsInvolved: [spec.planet],
    housesInvolved: [],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: false,
  }
}

function detectOne(spec: MahapurushaSpec, ctx: YogaEngineInput): YogaResult {
  const planet = ctx.planets[spec.planet]
  if (!planet) return buildEmpty(spec)

  const house = getPlanetHouseFromLagna(planet, ctx.ascendant)
  const inKendra = (KENDRA_HOUSES as readonly number[]).includes(house)
  const inSign = OWN_OR_EXALT_OR_MT[spec.planet].includes(planet.sign)
  const present = inKendra && inSign
  if (!present) return buildEmpty(spec)

  const dignity = getDignity(spec.planet, planet)
  const dignityScore = scoreDignity(dignity)
  const planetStrength = scorePlanetCondition({ dignity, combust: planet.combust })
  const houseStrength = scoreHousePlacement([house])

  // Aspect support
  const jupiter = ctx.planets.Jupiter
  const venus = ctx.planets.Venus
  const moon = ctx.planets.Moon
  const aspect = scoreAspectSupport({
    hasJupiterSupport:
      !!jupiter && spec.planet !== 'Jupiter' && planetAspectsPlanet('Jupiter', jupiter, planet),
    hasVenusSupport:
      !!venus && spec.planet !== 'Venus' && planetAspectsPlanet('Venus', venus, planet),
    hasMercurySupport: false,
    hasWaxingMoonSupport:
      !!moon && spec.planet !== 'Moon' && isContextualBenefic('Moon', moon, ctx.planets),
  })
  const relationship = scoreLordRelationship(['conjunction']) // self placement

  const dasha = scoreDashaActivation({
    mahadashaIsYogaPlanet: ctx.currentDasha?.mahadasha === spec.planet,
    antardashaIsYogaPlanet: ctx.currentDasha?.antardasha === spec.planet,
    pratyantarIsYogaPlanet: ctx.currentDasha?.pratyantar === spec.planet,
    dashaUnavailable: !ctx.currentDasha,
  })

  const afflictionPenalty = scoreAfflictionPenalty({
    involvedDebilitated: false, // own/exalted is the condition
    involvedCombust: planet.combust,
    involvedConjunctNode: ['Rahu', 'Ketu'].some(
      (n) => ctx.planets[n]?.signNumber === planet.signNumber,
    ),
    involvedAfflictedBySaturnOrMars:
      spec.planet !== 'Saturn' &&
      spec.planet !== 'Mars' &&
      isAfflictedByMaleficAspect(spec.planet, planet, ctx.planets),
  })
  const cancellationPenalty = scoreCancellationPenalty({})

  const breakdown = computeYogaScore({
    planetStrength,
    houseStrength,
    dignity: dignityScore,
    aspect,
    relationship,
    dasha,
    afflictionPenalty,
    cancellationPenalty,
  })
  const m = YOGA_MEANINGS[spec.id]
  return {
    id: spec.id,
    name: m.name,
    category: m.category,
    nature: m.nature,
    present: true,
    score: breakdown.final,
    strength: getStrengthLabel(breakdown.final),
    scoreBreakdown: breakdown,
    technicalReason: `${spec.planet} is in ${planet.sign} (${dignity}) in house ${house} (Kendra).`,
    chartNarrative: buildMahapurushaaNarrative(spec.planet, planet.sign, house, dignity),
    planetsInvolved: [spec.planet],
    housesInvolved: [house],
    lifeAreas: m.defaultLifeAreas,
    currentlyActive: dasha > 0,
  }
}

export function detectPanchaMahapurusha(ctx: YogaEngineInput): YogaResult[] {
  return SPECS.map((s) => detectOne(s, ctx))
}
