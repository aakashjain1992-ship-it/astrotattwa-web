/**
 * Yoga Engine — Shared helpers.
 *
 * All house/lord/connection logic is centralised here so detectors stay declarative.
 * Reuses primitives from the strength engine (no duplication).
 */

import type { PlanetData, AscendantData, PlanetKey } from '@/types/astrology'
import {
  getLordOfSignPublic,
  getHousesRuled,
  degreeDiff,
} from '@/lib/astrology/strength'

export const KENDRA_HOUSES = [1, 4, 7, 10] as const
export const TRIKONA_HOUSES = [1, 5, 9] as const
export const DUSTHANA_HOUSES = [6, 8, 12] as const
export const UPACHAYA_HOUSES = [3, 6, 10, 11] as const
export const WEALTH_HOUSES = [2, 5, 9, 11] as const

export const NATURAL_BENEFICS: ReadonlySet<PlanetKey> = new Set([
  'Jupiter',
  'Venus',
  'Mercury',
])
export const NATURAL_MALEFICS: ReadonlySet<PlanetKey> = new Set([
  'Saturn',
  'Mars',
  'Sun',
  'Rahu',
  'Ketu',
])

export const PLANET_KEYS: readonly PlanetKey[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
]

export const NON_LUMINARY_NON_NODE: readonly PlanetKey[] = [
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
]

// Own-sign + mooltrikona combined for Mahapurusha checks
export const OWN_OR_EXALT_OR_MT: Record<PlanetKey, readonly string[]> = {
  Sun: ['Leo', 'Aries'],
  Moon: ['Cancer', 'Taurus'],
  Mars: ['Aries', 'Scorpio', 'Capricorn'],
  Mercury: ['Gemini', 'Virgo'],
  Jupiter: ['Sagittarius', 'Pisces', 'Cancer'],
  Venus: ['Taurus', 'Libra', 'Pisces'],
  Saturn: ['Capricorn', 'Aquarius', 'Libra'],
  Rahu: [],
  Ketu: [],
}

const SIGN_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const

export function signNameToNumber(sign: string): number {
  const i = SIGN_ORDER.indexOf(sign as typeof SIGN_ORDER[number])
  return i === -1 ? 0 : i + 1
}

// ---------- House / placement helpers ----------

/**
 * House number of a planet relative to a reference sign (e.g. Lagna or Moon's sign).
 * Returns 1-12. Uses Whole-Sign houses (matches calculate.ts).
 */
export function getHouseFromReference(
  planetSignNum: number,
  refSignNum: number,
): number {
  return ((planetSignNum - refSignNum + 12) % 12) + 1
}

export function getPlanetHouseFromLagna(
  planet: PlanetData,
  ascendant: AscendantData,
): number {
  return getHouseFromReference(planet.signNumber, ascendant.signNumber)
}

export function getPlanetHouseFromMoon(
  planet: PlanetData,
  moon: PlanetData,
): number {
  return getHouseFromReference(planet.signNumber, moon.signNumber)
}

/** Sign number occupying a given house, given an ascendant. */
export function getSignInHouse(houseNumber: number, ascSignNum: number): number {
  return ((ascSignNum - 1 + houseNumber - 1) % 12) + 1
}

/** Lord planet of a given house, given an ascendant. */
export function getHouseLord(
  houseNumber: number,
  ascendant: AscendantData,
): PlanetKey {
  const sign = getSignInHouse(houseNumber, ascendant.signNumber)
  return getLordOfSignPublic(sign) as PlanetKey
}

/** Get all planets occupying a given sign-number. */
export function getPlanetsInSign(
  signNum: number,
  planets: Record<string, PlanetData>,
  exclude: ReadonlyArray<PlanetKey> = [],
): PlanetKey[] {
  const out: PlanetKey[] = []
  for (const [key, p] of Object.entries(planets)) {
    if (key === 'Ascendant') continue
    if (exclude.includes(key as PlanetKey)) continue
    if (p.signNumber === signNum) out.push(key as PlanetKey)
  }
  return out
}

/** Planets in a specific house from the ascendant. */
export function getPlanetsInHouseFromLagna(
  houseNumber: number,
  ascendant: AscendantData,
  planets: Record<string, PlanetData>,
  exclude: ReadonlyArray<PlanetKey> = [],
): PlanetKey[] {
  const sign = getSignInHouse(houseNumber, ascendant.signNumber)
  return getPlanetsInSign(sign, planets, exclude)
}

/** Planets in a specific house counted from the Moon's sign. */
export function getPlanetsInHouseFromMoon(
  houseNumber: number,
  moon: PlanetData,
  planets: Record<string, PlanetData>,
  exclude: ReadonlyArray<PlanetKey> = ['Moon'],
): PlanetKey[] {
  const sign = getSignInHouse(houseNumber, moon.signNumber)
  return getPlanetsInSign(sign, planets, exclude)
}

/** Planets in a specific house counted from any planet (e.g. Venus). */
export function getPlanetsInHouseFromPlanet(
  houseNumber: number,
  fromPlanet: PlanetData,
  planets: Record<string, PlanetData>,
  exclude: ReadonlyArray<PlanetKey> = [],
): PlanetKey[] {
  const sign = getSignInHouse(houseNumber, fromPlanet.signNumber)
  return getPlanetsInSign(sign, planets, exclude)
}

// ---------- Sign relationship helpers ----------

export function sameSign(a: PlanetData, b: PlanetData): boolean {
  return a.signNumber === b.signNumber
}

/**
 * Vedic sign-based aspects (matches strength engine's aspectEngine).
 * Returns true if planet `from` aspects sign `toSign`.
 */
export function planetAspectsSign(
  fromPlanet: PlanetKey,
  fromSignNum: number,
  toSignNum: number,
): boolean {
  const mod = (n: number) => ((n - 1 + 120) % 12) + 1
  const offsets: number[] = [6] // 7th aspect — all planets
  if (fromPlanet === 'Mars') offsets.push(3, 7)
  else if (fromPlanet === 'Jupiter') offsets.push(4, 8)
  else if (fromPlanet === 'Saturn') offsets.push(2, 9)
  else if (fromPlanet === 'Rahu' || fromPlanet === 'Ketu') offsets.push(4, 8)
  return offsets.some((o) => mod(fromSignNum + o) === toSignNum)
}

export function planetAspectsPlanet(
  fromKey: PlanetKey,
  fromData: PlanetData,
  toData: PlanetData,
): boolean {
  return planetAspectsSign(fromKey, fromData.signNumber, toData.signNumber)
}

/** True if either A aspects B's sign or vice versa. */
export function mutualAspect(
  aKey: PlanetKey,
  aData: PlanetData,
  bKey: PlanetKey,
  bData: PlanetData,
): boolean {
  return (
    planetAspectsPlanet(aKey, aData, bData) ||
    planetAspectsPlanet(bKey, bData, aData)
  )
}

/** Sign-exchange (Parivartana) — A is in B's sign AND B is in A's sign. */
export function exchangeSigns(
  aKey: PlanetKey,
  aData: PlanetData,
  bKey: PlanetKey,
  bData: PlanetData,
  ascendant: AscendantData,
): boolean {
  const aOwns = getHousesRuled(aKey, ascendant.signNumber).map((h) =>
    getSignInHouse(h, ascendant.signNumber),
  )
  const bOwns = getHousesRuled(bKey, ascendant.signNumber).map((h) =>
    getSignInHouse(h, ascendant.signNumber),
  )
  return bOwns.includes(aData.signNumber) && aOwns.includes(bData.signNumber)
}

// ---------- Lord-connection helpers ----------

export interface LordConnection {
  connected: boolean
  via: ReadonlyArray<
    | 'sameHouse'
    | 'mutualAspect'
    | 'oneAspectsOther'
    | 'exchange'
    | 'placedInOtherHouse'
  >
}

/**
 * Are two house-lords "connected" per classical Raj-Yoga rules?
 * Returns connection types found.
 */
export function lordsConnected(
  lordA: PlanetKey,
  houseA: number,
  lordB: PlanetKey,
  houseB: number,
  planets: Record<string, PlanetData>,
  ascendant: AscendantData,
): LordConnection {
  if (lordA === lordB) {
    return { connected: false, via: [] } // same planet rules both — skip
  }
  const a = planets[lordA]
  const b = planets[lordB]
  if (!a || !b) return { connected: false, via: [] }

  const via: LordConnection['via'][number][] = []
  if (sameSign(a, b)) via.push('sameHouse')
  if (mutualAspect(lordA, a, lordB, b)) {
    if (
      planetAspectsPlanet(lordA, a, b) &&
      planetAspectsPlanet(lordB, b, a)
    ) {
      via.push('mutualAspect')
    } else {
      via.push('oneAspectsOther')
    }
  }
  if (exchangeSigns(lordA, a, lordB, b, ascendant)) via.push('exchange')

  // A placed in B's house, or vice versa
  const aHouse = getPlanetHouseFromLagna(a, ascendant)
  const bHouse = getPlanetHouseFromLagna(b, ascendant)
  if (aHouse === houseB || bHouse === houseA) via.push('placedInOtherHouse')

  return { connected: via.length > 0, via }
}

// ---------- Dignity helpers ----------

const EXALTATION_SIGN: Record<PlanetKey, string> = {
  Sun: 'Aries',
  Moon: 'Taurus',
  Mars: 'Capricorn',
  Mercury: 'Virgo',
  Jupiter: 'Cancer',
  Venus: 'Pisces',
  Saturn: 'Libra',
  Rahu: 'Taurus',
  Ketu: 'Scorpio',
}

const DEBILITATION_SIGN: Record<PlanetKey, string> = {
  Sun: 'Libra',
  Moon: 'Scorpio',
  Mars: 'Cancer',
  Mercury: 'Pisces',
  Jupiter: 'Capricorn',
  Venus: 'Virgo',
  Saturn: 'Aries',
  Rahu: 'Scorpio',
  Ketu: 'Taurus',
}

export type DignityKind =
  | 'exalted'
  | 'mooltrikona'
  | 'own'
  | 'friendly'
  | 'neutral'
  | 'enemy'
  | 'debilitated'

const FRIENDS: Record<PlanetKey, ReadonlySet<PlanetKey>> = {
  Sun: new Set(['Moon', 'Mars', 'Jupiter']),
  Moon: new Set(['Sun', 'Mercury']),
  Mars: new Set(['Sun', 'Moon', 'Jupiter']),
  Mercury: new Set(['Sun', 'Venus']),
  Jupiter: new Set(['Sun', 'Moon', 'Mars']),
  Venus: new Set(['Mercury', 'Saturn']),
  Saturn: new Set(['Mercury', 'Venus']),
  Rahu: new Set(['Venus', 'Saturn']),
  Ketu: new Set(['Mars', 'Venus']),
}

const ENEMIES: Record<PlanetKey, ReadonlySet<PlanetKey>> = {
  Sun: new Set(['Venus', 'Saturn']),
  Moon: new Set([]),
  Mars: new Set(['Mercury']),
  Mercury: new Set(['Moon']),
  Jupiter: new Set(['Mercury', 'Venus']),
  Venus: new Set(['Sun', 'Moon']),
  Saturn: new Set(['Sun', 'Moon', 'Mars']),
  Rahu: new Set(['Sun', 'Moon', 'Mars']),
  Ketu: new Set(['Sun', 'Moon']),
}

export function getDignity(planet: PlanetKey, data: PlanetData): DignityKind {
  if (data.exalted || data.sign === EXALTATION_SIGN[planet]) return 'exalted'
  if (data.debilitated || data.sign === DEBILITATION_SIGN[planet])
    return 'debilitated'
  // Own sign
  const ownSigns = OWN_OR_EXALT_OR_MT[planet] ?? []
  if (ownSigns.includes(data.sign) && data.sign !== EXALTATION_SIGN[planet]) {
    return 'own'
  }
  const signLord = getLordOfSignPublic(data.signNumber) as PlanetKey
  if (signLord === planet) return 'own'
  if (FRIENDS[planet]?.has(signLord)) return 'friendly'
  if (ENEMIES[planet]?.has(signLord)) return 'enemy'
  return 'neutral'
}

export function isDebilitated(planet: PlanetKey, data: PlanetData): boolean {
  return data.debilitated || data.sign === DEBILITATION_SIGN[planet]
}

export function isExalted(planet: PlanetKey, data: PlanetData): boolean {
  return data.exalted || data.sign === EXALTATION_SIGN[planet]
}

export function getExaltationSign(planet: PlanetKey): string {
  return EXALTATION_SIGN[planet]
}

export function getDebilitationSign(planet: PlanetKey): string {
  return DEBILITATION_SIGN[planet]
}

// ---------- Benefic / malefic context helpers ----------

/** Waxing Moon = bright half (longitude difference Sun→Moon between 0° and 180°). */
export function isMoonWaxing(
  moon: PlanetData,
  sun: PlanetData,
): boolean {
  const diff = (moon.longitude - sun.longitude + 360) % 360
  return diff > 0 && diff < 180
}

/** Mercury is benefic when not conjunct a malefic in same sign. */
export function isMercuryBenefic(
  mercury: PlanetData,
  planets: Record<string, PlanetData>,
): boolean {
  for (const k of ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun'] as PlanetKey[]) {
    const p = planets[k]
    if (p && p.signNumber === mercury.signNumber) return false
  }
  return true
}

export function isContextualBenefic(
  key: PlanetKey,
  data: PlanetData,
  planets: Record<string, PlanetData>,
): boolean {
  if (key === 'Jupiter' || key === 'Venus') return true
  if (key === 'Mercury') return isMercuryBenefic(data, planets)
  if (key === 'Moon' && planets.Sun) return isMoonWaxing(data, planets.Sun)
  return false
}

export function isContextualMalefic(
  key: PlanetKey,
  data: PlanetData,
  planets: Record<string, PlanetData>,
): boolean {
  if (key === 'Saturn' || key === 'Mars' || key === 'Sun') return true
  if (key === 'Rahu' || key === 'Ketu') return true
  if (key === 'Mercury') return !isMercuryBenefic(data, planets)
  if (key === 'Moon' && planets.Sun) return !isMoonWaxing(data, planets.Sun)
  return false
}

// ---------- Orb helpers (re-export) ----------

export { degreeDiff }

export function withinOrb(
  a: PlanetData,
  b: PlanetData,
  maxDeg: number,
): boolean {
  return degreeDiff(a.longitude, b.longitude) <= maxDeg
}
