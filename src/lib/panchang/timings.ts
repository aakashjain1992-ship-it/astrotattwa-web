// ─────────────────────────────────────────────────────────────────────────────
// Panchang Timings
// Auspicious and inauspicious timing calculations:
// Brahma Muhurta, Rahu Kalam, Yamaganda, Gulikai, Muhurtas, Amrit Kalam, etc.
// All times relative to sunrise/sunset.
// ─────────────────────────────────────────────────────────────────────────────
import {
  RAHU_KALAM_PART, YAMAGANDA_PART, GULIKAI_PART,
  DUR_MUHURTAM_PARTS, AMRIT_KALAM_GHATI, VARJYAM_GHATI, BAANA_BY_WEEKDAY,
} from './constants'
import { formatLocalTime } from './ephemeris'
import type { AuspiciousTiming, InauspiciousTiming } from './types'

/** Convert a JD offset to local time string */
function jdToStr(jd: number, timezone: string, baseDateStr: string): string {
  return formatLocalTime(jd, timezone, baseDateStr)
}

/** Build AuspiciousTiming from two JDs */
function auspTime(startJD: number, endJD: number, tz: string, date: string): AuspiciousTiming {
  return { start: jdToStr(startJD, tz, date), end: jdToStr(endJD, tz, date) }
}

/** Build InauspiciousTiming from two JDs */
function inausTime(startJD: number, endJD: number, tz: string, date: string): InauspiciousTiming {
  return { start: jdToStr(startJD, tz, date), end: jdToStr(endJD, tz, date) }
}

// ── Brahma Muhurta ────────────────────────────────────────────────────────
/** 1h 36min before sunrise → 48min before sunrise */
export function brahmaMuhurta(sunriseJD: number, tz: string, date: string): AuspiciousTiming {
  const start = sunriseJD - (96 / 1440)  // 96 min before
  const end = sunriseJD - (48 / 1440)    // 48 min before
  return auspTime(start, end, tz, date)
}

// ── Pratah Sandhya ────────────────────────────────────────────────────────
/** 48min before sunrise → sunrise */
export function pratahSandhya(sunriseJD: number, tz: string, date: string): AuspiciousTiming {
  const start = sunriseJD - (48 / 1440)
  return auspTime(start, sunriseJD, tz, date)
}

// ── Abhijit Muhurta ───────────────────────────────────────────────────────
/** Local noon ± 24 min. noon = (sunrise + sunset) / 2 */
export function abhijitMuhurta(sunriseJD: number, sunsetJD: number, tz: string, date: string): AuspiciousTiming {
  const noon = (sunriseJD + sunsetJD) / 2
  const start = noon - (24 / 1440)
  const end = noon + (24 / 1440)
  return auspTime(start, end, tz, date)
}

// ── Vijaya Muhurta ────────────────────────────────────────────────────────
/**
 * 11th of 15 proportional day muhurtas (sunrise to sunset).
 * Day is divided into 15 equal parts; Vijaya = part 11.
 * Verified against drikpanchang: matches within 1 minute (sunrise offset).
 */
export function vijayaMuhurta(sunriseJD: number, sunsetJD: number, tz: string, date: string): AuspiciousTiming {
  const muhurtaDuration = (sunsetJD - sunriseJD) / 15
  const start = sunriseJD + 10 * muhurtaDuration
  const end   = start + muhurtaDuration
  return auspTime(start, end, tz, date)
}

// ── Godhuli Muhurta ───────────────────────────────────────────────────────
/** Sunset ± 12 min */
export function godhuliMuhurta(sunsetJD: number, tz: string, date: string): AuspiciousTiming {
  const start = sunsetJD - (12 / 1440)
  const end = sunsetJD + (12 / 1440)
  return auspTime(start, end, tz, date)
}

// ── Sayahna Sandhya ───────────────────────────────────────────────────────
/** Sunset → 48min after sunset */
export function sayahnaSandhya(sunsetJD: number, tz: string, date: string): AuspiciousTiming {
  const end = sunsetJD + (48 / 1440)
  return auspTime(sunsetJD, end, tz, date)
}

// ── Nishita Muhurta ───────────────────────────────────────────────────────
/** Midnight ± 24 min. midnight = (sunset + nextSunrise) / 2 */
export function nishitaMuhurta(sunsetJD: number, nextSunriseJD: number, tz: string, date: string): AuspiciousTiming {
  const midnight = (sunsetJD + nextSunriseJD) / 2
  const start = midnight - (24 / 1440)
  const end = midnight + (24 / 1440)
  return auspTime(start, end, tz, date)
}

// ── Amrit Kalam ───────────────────────────────────────────────────────────
/**
 * Based on nakshatra lookup table.
 * Offset in ghatis (1 ghati = 24 min) from midnight, duration 4 ghatis = 96 min.
 */
export function amritKalam(
  nakshatraIndex: number, // 0-based
  midnightJD: number,
  tz: string,
  date: string
): AuspiciousTiming | null {
  const ghati = AMRIT_KALAM_GHATI[nakshatraIndex]
  if (ghati === undefined) return null
  const startJD = midnightJD + (ghati * 24) / 1440
  const endJD = startJD + 96 / 1440
  return auspTime(startJD, endJD, tz, date)
}

// ── Varjyam ───────────────────────────────────────────────────────────────
export function varjyam(
  nakshatraIndex: number,
  midnightJD: number,
  tz: string,
  date: string
): AuspiciousTiming | null {
  const ghati = VARJYAM_GHATI[nakshatraIndex]
  if (ghati === undefined) return null
  const startJD = midnightJD + (ghati * 24) / 1440
  const endJD = startJD + 96 / 1440
  return auspTime(startJD, endJD, tz, date)
}

// ── Rahu Kalam / Yamaganda / Gulikai ─────────────────────────────────────
/**
 * Day is divided into 8 equal parts from sunrise to sunset.
 * Each "part" index (0-based) corresponds to a specific timing.
 */
export function computeOctantTiming(
  sunriseJD: number,
  sunsetJD: number,
  partIndex: number, // 0-based
  tz: string,
  date: string
): InauspiciousTiming {
  const dayDur = sunsetJD - sunriseJD
  const partDur = dayDur / 8
  const start = sunriseJD + partIndex * partDur
  const end = start + partDur
  return inausTime(start, end, tz, date)
}

export function rahuKalam(
  weekday: number, // 0=Sun
  sunriseJD: number,
  sunsetJD: number,
  tz: string,
  date: string
): InauspiciousTiming {
  return computeOctantTiming(sunriseJD, sunsetJD, RAHU_KALAM_PART[weekday], tz, date)
}

export function yamaganda(
  weekday: number,
  sunriseJD: number,
  sunsetJD: number,
  tz: string,
  date: string
): InauspiciousTiming {
  return computeOctantTiming(sunriseJD, sunsetJD, YAMAGANDA_PART[weekday], tz, date)
}

export function gulikaiKalam(
  weekday: number,
  sunriseJD: number,
  sunsetJD: number,
  tz: string,
  date: string
): InauspiciousTiming {
  return computeOctantTiming(sunriseJD, sunsetJD, GULIKAI_PART[weekday], tz, date)
}

// ── Dur Muhurtam ──────────────────────────────────────────────────────────
/**
 * Day divided into 30 muhurtas (each = dayDur/30).
 * Returns 2 inauspicious timing windows per day.
 */
export function durMuhurtam(
  weekday: number,
  sunriseJD: number,
  sunsetJD: number,
  tz: string,
  date: string
): InauspiciousTiming[] {
  const parts = DUR_MUHURTAM_PARTS[weekday] ?? [5, 7]
  const dayDur = sunsetJD - sunriseJD
  const muhurtaDur = dayDur / 15  // Day has 15 muhurtas (each ~48 min = 2 ghatis)

  return parts.map(partNum => {
    const start = sunriseJD + (partNum - 1) * muhurtaDur
    const end = start + muhurtaDur
    return inausTime(start, end, tz, date)
  })
}

// ── Baana ─────────────────────────────────────────────────────────────────
export function getBaana(weekday: number): string {
  return BAANA_BY_WEEKDAY[weekday] ?? 'Unknown'
}

// ── Madhyahna (local noon) ────────────────────────────────────────────────
export function getMadhyahna(sunriseJD: number, sunsetJD: number, tz: string, date: string): string {
  const noon = (sunriseJD + sunsetJD) / 2
  return formatLocalTime(noon, tz, date)
}

// ── Day/Night durations ───────────────────────────────────────────────────
function minsToHM(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}h ${m}m`
}

export function getDinamana(sunriseJD: number, sunsetJD: number): string {
  return minsToHM((sunsetJD - sunriseJD) * 24 * 60)
}

export function getRatrimana(sunsetJD: number, nextSunriseJD: number): string {
  return minsToHM((nextSunriseJD - sunsetJD) * 24 * 60)
}
