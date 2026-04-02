// ─────────────────────────────────────────────────────────────────────────────
// Panchang Ephemeris
// Swiss Ephemeris wrappers for sunrise/sunset/moonrise/moonset and
// precise planet positions for panchang calculations.
// ─────────────────────────────────────────────────────────────────────────────
import { getSwe, sweCalcSidereal, sweJuldayUTC } from '@/lib/astrology/swissEph'
import { getTimezoneOffsetMinutes } from '@/lib/astrology/time'

// Extended swisseph interface to access rise_trans (not in base type)
type SweExt = Awaited<ReturnType<typeof getSwe>> & {
  swe_rise_trans?: (
    jdstart: number,
    ipl: number,
    starname: string | null,
    epheflag: number,
    rsmi: number,
    geopos: [number, number, number],
    atpress: number,
    attemp: number
  ) => { retval: number; tret: number[]; serr: string }
}

// Rise/set flags (numeric constants from swisseph spec)
const SE_CALC_RISE = 1
const SE_CALC_SET = 2

/** Convert a Julian Day (UTC) to local time string "HH:MM" */
function jdToLocalTime(jd: number, timezone: string): string {
  // JD 2451545.0 = J2000.0 = 2000-01-01 12:00 UTC
  const msFromEpoch = (jd - 2440587.5) * 86400000
  const utcDate = new Date(msFromEpoch)
  return utcDate.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).replace(/^24:/, '00:')
}

/** Convert a Julian Day (UTC) to a Date object (UTC) */
export function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000)
}

/** Convert a local date "YYYY-MM-DD" + timezone to JD at local midnight (≈ UTC midnight) */
export async function localMidnightJD(dateStr: string, timezone: string): Promise<number> {
  const [y, m, d] = dateStr.split('-').map(Number)
  // Use noon local time to get timezone offset (avoids DST edge cases)
  const noonMs = Date.UTC(y, m - 1, d, 12, 0, 0)
  const offsetMin = getTimezoneOffsetMinutes(new Date(noonMs), timezone)
  // Local midnight = UTC midnight + offsetMin minutes
  const midnightMs = Date.UTC(y, m - 1, d, 0, 0, 0) - offsetMin * 60000
  const midnightUtc = new Date(midnightMs)
  return sweJuldayUTC(midnightUtc)
}

/** Get JD for local midnight + Nh hours */
export async function localTimeJD(dateStr: string, timezone: string, hoursFromMidnight: number): Promise<number> {
  const midJD = await localMidnightJD(dateStr, timezone)
  return midJD + hoursFromMidnight / 24
}

/** Get sunrise JD for a given date and location */
async function getRiseTrans(
  jdStart: number,
  body: number,
  rsmi: number,
  lat: number,
  lng: number
): Promise<number | null> {
  const s = (await getSwe()) as SweExt
  if (typeof s.swe_rise_trans !== 'function') {
    throw new Error('swe_rise_trans not available in this swisseph build')
  }
  const sweFlags = (s as unknown as Record<string, unknown>)['SEFLG_SWIEPH']
  const ephFlag = typeof sweFlags === 'number' ? sweFlags : 2
  const result = s.swe_rise_trans(
    jdStart,
    body,
    null,
    ephFlag,
    rsmi,
    [lng, lat, 0], // NOTE: longitude first
    1013.25,       // standard atmospheric pressure
    15             // standard temperature
  )
  if (result.retval < 0) return null   // event doesn't occur (e.g. polar region)
  return result.tret[0]
}

export interface RiseSetResult {
  sunriseJD: number
  sunsetJD: number
  moonriseJD: number | null
  moonsetJD: number | null
  sunriseLocal: string
  sunsetLocal: string
  moonriseLocal: string | null
  moonsetLocal: string | null
}

/** Compute sunrise, sunset, moonrise, moonset for a given date/location */
export async function computeRiseSet(
  dateStr: string,
  lat: number,
  lng: number,
  timezone: string
): Promise<RiseSetResult> {
  // Start search from local midnight
  const jdStart = await localMidnightJD(dateStr, timezone)
  const s = await getSwe()

  const sunriseJD = await getRiseTrans(jdStart, s.SE_SUN, SE_CALC_RISE, lat, lng)
  const sunsetJD = await getRiseTrans(jdStart, s.SE_SUN, SE_CALC_SET, lat, lng)
  const moonriseJD = await getRiseTrans(jdStart, s.SE_MOON, SE_CALC_RISE, lat, lng)
  const moonsetJD = await getRiseTrans(jdStart, s.SE_MOON, SE_CALC_SET, lat, lng)

  if (!sunriseJD || !sunsetJD) throw new Error('Could not compute sunrise/sunset')

  return {
    sunriseJD,
    sunsetJD,
    moonriseJD,
    moonsetJD,
    sunriseLocal: jdToLocalTime(sunriseJD, timezone),
    sunsetLocal: jdToLocalTime(sunsetJD, timezone),
    moonriseLocal: moonriseJD ? jdToLocalTime(moonriseJD, timezone) : null,
    moonsetLocal: moonsetJD ? jdToLocalTime(moonsetJD, timezone) : null,
  }
}

/** Planet body constants shorthand */
export async function getBodyIds() {
  const s = await getSwe()
  return { SUN: s.SE_SUN, MOON: s.SE_MOON, MARS: s.SE_MARS, MERCURY: s.SE_MERCURY,
           JUPITER: s.SE_JUPITER, VENUS: s.SE_VENUS, SATURN: s.SE_SATURN,
           RAHU: s.SE_MEAN_NODE }
}

/** Get sidereal planet positions at a given JD */
export async function getPlanetPositions(jdUt: number) {
  const ids = await getBodyIds()
  const [sun, moon, mars, mercury, jupiter, venus, saturn, rahu] = await Promise.all([
    sweCalcSidereal(jdUt, ids.SUN),
    sweCalcSidereal(jdUt, ids.MOON),
    sweCalcSidereal(jdUt, ids.MARS),
    sweCalcSidereal(jdUt, ids.MERCURY),
    sweCalcSidereal(jdUt, ids.JUPITER),
    sweCalcSidereal(jdUt, ids.VENUS),
    sweCalcSidereal(jdUt, ids.SATURN),
    sweCalcSidereal(jdUt, ids.RAHU),
  ])
  return { sun, moon, mars, mercury, jupiter, venus, saturn, rahu }
}

/**
 * Find the JD when a function of Moon and Sun reaches a target value.
 * Used for tithi/yoga end time calculations.
 *
 * @param jdStart    - Starting JD (local day start)
 * @param computeFn  - Function of (moonLon, sunLon) → current value (degrees)
 * @param targetDeg  - Target degrees to reach
 * @param speedDeg   - Approximate combined speed (deg/day) for initial estimate
 */
export async function findTransitTime(
  jdStart: number,
  computeFn: (moonLon: number, sunLon: number) => number,
  targetDeg: number,
  speedDeg: number
): Promise<number | null> {
  const ids = await getBodyIds()
  const maxJD = jdStart + 2 // Search up to 2 days ahead

  const startMoon = await sweCalcSidereal(jdStart, ids.MOON)
  const startSun = await sweCalcSidereal(jdStart, ids.SUN)
  const startVal = computeFn(startMoon.lon, startSun.lon)

  // Normalize delta to [0, 360)
  const delta = ((targetDeg - startVal) % 360 + 360) % 360
  if (delta === 0) return jdStart

  let jd = jdStart + delta / speedDeg

  // Newton-Raphson refinement (3 iterations typically sufficient)
  for (let i = 0; i < 5; i++) {
    if (jd > maxJD) return null

    const moon = await sweCalcSidereal(jd, ids.MOON)
    const sun = await sweCalcSidereal(jd, ids.SUN)
    const val = computeFn(moon.lon, sun.lon)

    let diff = ((targetDeg - val) % 360 + 360) % 360
    if (diff > 180) diff -= 360 // Allow backward correction

    if (Math.abs(diff) < 0.0001) break // ~0.03 sec precision
    jd = jd + diff / speedDeg
  }

  if (jd < jdStart || jd > maxJD) return null
  return jd
}

/**
 * Format a JD as local time string, suffixing date if it crosses midnight.
 * E.g. "02:09 AM, Apr 03" if the time is after midnight vs the reference date.
 */
export function formatLocalTime(jd: number, timezone: string, baseDateStr: string): string {
  const date = jdToDate(jd)
  const local = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(date)

  const get = (t: string) => local.find(p => p.type === t)?.value ?? ''
  const hh = get('hour').replace(/^24/, '00')
  const mm = get('minute')
  const dd = `${get('year')}-${get('month')}-${get('day')}`

  const timeStr = `${hh}:${mm}`
  if (dd !== baseDateStr) {
    // Different day — show date suffix
    const dateSuffix = date.toLocaleDateString('en-US', {
      timeZone: timezone, month: 'short', day: 'numeric'
    })
    return `${timeStr}, ${dateSuffix}`
  }
  return timeStr
}

/** Get Lahiri ayanamsha value for a given JD */
export async function getAyanamsha(jdUt: number): Promise<number> {
  const s = await getSwe()
  return s.swe_get_ayanamsa_ut(jdUt)
}
