// ─────────────────────────────────────────────────────────────────────────────
// Panchang Core Calculations
// Tithi, Nakshatra, Yoga, Karana, Vara, Paksha computations.
// All inputs are sidereal (Lahiri) longitudes.
// ─────────────────────────────────────────────────────────────────────────────
import {
  TITHI_NAMES, NAKSHATRA_NAMES, YOGA_NAMES, YOGA_AUSPICIOUS,
  KARANA_NAMES_MOVABLE, VARA_NAMES, VARA_RULING_PLANETS,
  RASHI_NAMES,
} from './constants'
import {
  findTransitTime, formatLocalTime, getBodyIds,
} from './ephemeris'
import { sweCalcSidereal } from '@/lib/astrology/swissEph'
import type {
  TithiEntry, NakshatraEntry, YogaEntry, KaranaEntry, VaraData,
  SunMoonPosition,
} from './types'

// ── Helper: normalize longitude to 0–360 ──────────────────────────────────
function norm(x: number): number {
  return ((x % 360) + 360) % 360
}

// ── Tithi ─────────────────────────────────────────────────────────────────
/** Returns tithi number 1–30 from moon and sun longitudes */
export function getTithiNumber(moonLon: number, sunLon: number): number {
  const diff = norm(moonLon - sunLon)
  return Math.floor(diff / 12) + 1
}

export function getTithiName(tithiNum: number): string {
  return TITHI_NAMES[tithiNum - 1] ?? 'Unknown'
}

export function getPaksha(tithiNum: number): 'Shukla' | 'Krishna' {
  return tithiNum <= 15 ? 'Shukla' : 'Krishna'
}

/**
 * Compute up to 2 tithi entries for the day.
 * Returns array with 1 entry (tithi spans day) or 2 (tithi changes mid-day).
 */
export async function computeTithis(
  dateStr: string,
  timezone: string,
  sunriseJD: number,
  _sunsetJD: number
): Promise<TithiEntry[]> {
  const ids = await getBodyIds()
  const dayEndJD = sunriseJD + 1 // search until next sunrise

  // Get tithi at sunrise
  const moonAtSunrise = await sweCalcSidereal(sunriseJD, ids.MOON)
  const sunAtSunrise = await sweCalcSidereal(sunriseJD, ids.SUN)
  const tithiAtSunrise = getTithiNumber(moonAtSunrise.lon, sunAtSunrise.lon)

  // End of first tithi: when (moon-sun) reaches tithiAtSunrise * 12
  const targetDeg = tithiAtSunrise * 12
  const endJD = await findTransitTime(
    sunriseJD,
    (m, s) => norm(m - s),
    targetDeg,
    12.2 // effective speed deg/day
  )

  const entry1: TithiEntry = {
    number: tithiAtSunrise,
    name: getTithiName(tithiAtSunrise),
    paksha: getPaksha(tithiAtSunrise),
    endTime: endJD && endJD < dayEndJD
      ? formatLocalTime(endJD, timezone, dateStr)
      : null,
  }

  const entries: TithiEntry[] = [entry1]

  // If tithi ends before next sunrise, show the second tithi
  if (endJD && endJD < dayEndJD) {
    const tithi2 = (tithiAtSunrise % 30) + 1
    const target2 = tithi2 * 12
    const end2JD = await findTransitTime(
      endJD,
      (m, s) => norm(m - s),
      target2,
      12.2
    )
    entries.push({
      number: tithi2,
      name: getTithiName(tithi2),
      paksha: getPaksha(tithi2),
      endTime: end2JD && end2JD < dayEndJD
        ? formatLocalTime(end2JD, timezone, dateStr)
        : null,
    })
  }

  return entries
}

// ── Nakshatra ─────────────────────────────────────────────────────────────
export function getNakshatraIndex(moonLon: number): number {
  return Math.floor(norm(moonLon) / (360 / 27)) // 0-indexed
}

export function getNakshatraPada(moonLon: number): number {
  const degInNakshatra = norm(moonLon) % (360 / 27)
  return Math.floor(degInNakshatra / (360 / 108)) + 1 // 1–4
}

export async function computeNakshatras(
  dateStr: string,
  timezone: string,
  sunriseJD: number
): Promise<NakshatraEntry[]> {
  const ids = await getBodyIds()
  const dayEndJD = sunriseJD + 1

  const moonAtSunrise = await sweCalcSidereal(sunriseJD, ids.MOON)
  const nIdx = getNakshatraIndex(moonAtSunrise.lon)
  const pada = getNakshatraPada(moonAtSunrise.lon)
  const nakshatraSize = 360 / 27

  // End of current nakshatra
  const targetEnd = (nIdx + 1) * nakshatraSize
  const endJD = await findTransitTime(
    sunriseJD,
    (m, _s) => norm(m),
    targetEnd,
    13.2 // moon speed deg/day
  )

  const entry1: NakshatraEntry = {
    index: nIdx + 1,
    name: NAKSHATRA_NAMES[nIdx],
    pada,
    endTime: endJD && endJD < dayEndJD
      ? formatLocalTime(endJD, timezone, dateStr)
      : null,
  }

  const entries: NakshatraEntry[] = [entry1]

  if (endJD && endJD < dayEndJD) {
    const nIdx2 = (nIdx + 1) % 27
    const moonAt = await sweCalcSidereal(endJD + 0.01 / 24, ids.MOON)
    const pada2 = getNakshatraPada(moonAt.lon)
    const targetEnd2 = (nIdx2 + 1) * nakshatraSize
    const end2JD = await findTransitTime(
      endJD,
      (m, _s) => norm(m),
      targetEnd2,
      13.2
    )
    entries.push({
      index: nIdx2 + 1,
      name: NAKSHATRA_NAMES[nIdx2],
      pada: pada2,
      endTime: end2JD && end2JD < dayEndJD
        ? formatLocalTime(end2JD, timezone, dateStr)
        : null,
    })
  }

  return entries
}

// ── Yoga ──────────────────────────────────────────────────────────────────
export function getYogaIndex(moonLon: number, sunLon: number): number {
  const combined = norm(moonLon + sunLon)
  return Math.floor(combined / (360 / 27)) // 0-indexed
}

export async function computeYogas(
  dateStr: string,
  timezone: string,
  sunriseJD: number
): Promise<YogaEntry[]> {
  const ids = await getBodyIds()
  const dayEndJD = sunriseJD + 1
  const yogaSize = 360 / 27

  const moon = await sweCalcSidereal(sunriseJD, ids.MOON)
  const sun = await sweCalcSidereal(sunriseJD, ids.SUN)
  const yIdx = getYogaIndex(moon.lon, sun.lon)
  const targetEnd = (yIdx + 1) * yogaSize

  const endJD = await findTransitTime(
    sunriseJD,
    (m, s) => norm(m + s),
    targetEnd,
    14.2 // sun+moon combined speed
  )

  const entry1: YogaEntry = {
    index: yIdx + 1,
    name: YOGA_NAMES[yIdx],
    auspicious: YOGA_AUSPICIOUS[yIdx],
    endTime: endJD && endJD < dayEndJD
      ? formatLocalTime(endJD, timezone, dateStr)
      : null,
  }

  const entries: YogaEntry[] = [entry1]

  if (endJD && endJD < dayEndJD) {
    const yIdx2 = (yIdx + 1) % 27
    const targetEnd2 = (yIdx2 + 1) * yogaSize
    const end2JD = await findTransitTime(
      endJD,
      (m, s) => norm(m + s),
      targetEnd2,
      14.2
    )
    entries.push({
      index: yIdx2 + 1,
      name: YOGA_NAMES[yIdx2],
      auspicious: YOGA_AUSPICIOUS[yIdx2],
      endTime: end2JD && end2JD < dayEndJD
        ? formatLocalTime(end2JD, timezone, dateStr)
        : null,
    })
  }

  return entries
}

// ── Karana ────────────────────────────────────────────────────────────────
/**
 * Karana = half-tithi (each tithi has 2 karanas).
 * 60 karanas per lunar cycle:
 * - Karana 1: Kimstughna (fixed)
 * - Karanas 2–57: 8 cycles of 7 movable karanas
 * - Karana 58: Shakuni (fixed)
 * - Karana 59: Chatushpada (fixed)
 * - Karana 60: Naga (fixed)
 */
export function getKaranaName(karanaSeq: number): string {
  // karanaSeq: 1-based, 1–60
  if (karanaSeq === 1) return 'Kimstughna'
  if (karanaSeq >= 58) {
    const fixedNames = ['Shakuni', 'Chatushpada', 'Naga']
    return fixedNames[karanaSeq - 58]
  }
  // Movable: positions 2–57 cycle through 7 movable types
  return KARANA_NAMES_MOVABLE[(karanaSeq - 2) % 7]
}

export function getKaranaSeq(moonLon: number, sunLon: number): number {
  const diff = norm(moonLon - sunLon)
  return Math.floor(diff / 6) + 1 // 1–60
}

export async function computeKaranas(
  dateStr: string,
  timezone: string,
  sunriseJD: number
): Promise<KaranaEntry[]> {
  const ids = await getBodyIds()
  const dayEndJD = sunriseJD + 1

  const moonAtSR = await sweCalcSidereal(sunriseJD, ids.MOON)
  const sunAtSR = await sweCalcSidereal(sunriseJD, ids.SUN)
  const seq0 = getKaranaSeq(moonAtSR.lon, sunAtSR.lon)
  const target0 = seq0 * 6

  const end0JD = await findTransitTime(
    sunriseJD,
    (m, s) => norm(m - s),
    target0,
    12.2
  )

  const entries: KaranaEntry[] = [{
    name: getKaranaName(seq0),
    endTime: end0JD && end0JD < dayEndJD
      ? formatLocalTime(end0JD, timezone, dateStr)
      : null,
  }]

  // Up to 2 more karanas within the day
  let prevJD = end0JD
  for (let i = 1; i <= 2; i++) {
    if (!prevJD || prevJD >= dayEndJD) break
    const seqN = ((seq0 + i - 1) % 60) + 1
    const targetN = seqN * 6
    const endNJD = await findTransitTime(
      prevJD,
      (m, s) => norm(m - s),
      targetN,
      12.2
    )
    entries.push({
      name: getKaranaName(seqN),
      endTime: endNJD && endNJD < dayEndJD
        ? formatLocalTime(endNJD, timezone, dateStr)
        : null,
    })
    prevJD = endNJD
  }

  return entries
}

// ── Vara (weekday) ────────────────────────────────────────────────────────
export function computeVara(dateStr: string, timezone: string, sunriseJD: number): VaraData {
  // Use the local date from sunrise to determine weekday
  const sunriseDate = new Date((sunriseJD - 2440587.5) * 86400000)
  const localDay = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'short'
  }).format(sunriseDate)
  // Map short weekday name to 0-6
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
  }
  const dayIdx = dayMap[localDay] ?? new Date(dateStr + 'T00:00:00').getDay()
  return {
    name: VARA_NAMES[dayIdx],
    ruling_planet: VARA_RULING_PLANETS[dayIdx],
  }
}

/** Get weekday index (0=Sun) from a local date string + timezone */
export function getWeekday(dateStr: string, timezone: string, sunriseJD: number): number {
  const sunriseDate = new Date((sunriseJD - 2440587.5) * 86400000)
  const localDay = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'short'
  }).format(sunriseDate)
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
  }
  return dayMap[localDay] ?? new Date(dateStr + 'T00:00:00').getDay()
}

// ── Sun/Moon Position ─────────────────────────────────────────────────────
export function buildPosition(lon: number): SunMoonPosition {
  const rashiIndex = Math.floor(norm(lon) / 30)
  const nakshatraIndex = Math.floor(norm(lon) / (360 / 27))
  const degInNakshatra = norm(lon) % (360 / 27)
  const pada = Math.floor(degInNakshatra / (360 / 108)) + 1

  return {
    longitude: lon,
    rashi: RASHI_NAMES[rashiIndex],
    rashiIndex,
    nakshatraIndex,
    nakshatraName: NAKSHATRA_NAMES[nakshatraIndex],
    pada,
  }
}
