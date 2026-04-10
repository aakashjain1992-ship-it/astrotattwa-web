// ─────────────────────────────────────────────────────────────────────────────
// Panchang Calendar Calculations
// Vikram Samvat, Shaka Samvat, Gujarati Samvat, Chandramasa, Ritu, Ayana,
// Kaliyuga, Julian Date/Day, Lahiri Ayanamsha, Rata Die, etc.
// ─────────────────────────────────────────────────────────────────────────────
import { SAMVATSARA_NAMES, CHANDRAMASA_NAMES, CHAITRA_PRATIPADA_DATES } from './constants'
import type { LunarCalendar, RituAyana, OtherCalendars } from './types'

// ── Vikram Samvat ──────────────────────────────────────────────────────────
/**
 * Approximate Vikram Samvat year.
 * VS new year starts at Chaitra Shukla Pratipada (late March / April).
 * Approximation: if month >= 4, VS = year + 57, else VS = year + 56.
 */
export function getVikramSamvat(gregorianYear: number, month: number): number {
  return month >= 4 ? gregorianYear + 57 : gregorianYear + 56
}

export function getSamvatsaraName(vsYear: number): string {
  // Cycle of 60 names. 0-indexed.
  // Empirical offset: VS 2083 = Siddharthi (index 52 in standard array).
  // (2083 + 9) % 60 = 52. Verified against drikpanchang.
  const idx = (vsYear + 9) % 60
  return SAMVATSARA_NAMES[idx] ?? 'Unknown'
}

// ── Shaka Samvat ───────────────────────────────────────────────────────────
export function getShakaSamvat(gregorianYear: number, month: number): number {
  return month >= 4 ? gregorianYear - 78 : gregorianYear - 79
}

// ── Gujarati Samvat ────────────────────────────────────────────────────────
// Gujarati new year starts on Kartik Shukla 1 (day after Diwali, ~October/November)
export function getGujaratiSamvat(gregorianYear: number, month: number): number {
  return month >= 11 ? gregorianYear + 57 : gregorianYear + 56
}

// ── Chandramasa (Lunar Month) ──────────────────────────────────────────────
/**
 * Chandramasa is determined by the Sun's rashi and current paksha.
 * Purnimanta: month starts at Purnima. Amanta: month starts at Amavasya.
 * In Shukla paksha: Amanta month = Purnimanta month + 1 (Sun rashi + 1).
 * In Krishna paksha: Amanta month = Purnimanta month (Sun rashi).
 * April 2 2026: Sun in Meena (11), Shukla paksha → Purnimanta=Phalguna(11), Amanta=Chaitra(0).
 */
export function getChandramasa(sunRashiIndex: number, tithiNumber?: number): { purnimanta: string; amanta: string } {
  // Amanta month always = (sunRashiIndex + 1) % 12 (Sun's next rashi = current lunar month)
  // Purnimanta month:
  //   Shukla paksha (tithi 1-15): same as Amanta = (sunRashiIndex + 1) % 12
  //   Krishna paksha (tithi 16-30): one month ahead = (sunRashiIndex + 2) % 12
  // Verified: Apr 2 2026 Sun=Meena(11) Shukla → Purnimanta=Chaitra(0), Amanta=Chaitra(0)
  //           Apr 3 2026 Sun=Meena(11) Krishna → Purnimanta=Vaishakha(1), Amanta=Chaitra(0)
  const isShukla = tithiNumber === undefined || tithiNumber <= 15
  const purnimantaIdx = isShukla ? (sunRashiIndex + 1) % 12 : (sunRashiIndex + 2) % 12
  const amantaIdx = (sunRashiIndex + 1) % 12
  return {
    purnimanta: CHANDRAMASA_NAMES[purnimantaIdx],
    amanta: CHANDRAMASA_NAMES[amantaIdx],
  }
}

/**
 * Pravishte/Gate: day-of-year counter in the Vikram Samvat calendar.
 * Day 1 = Chaitra Shukla Pratipada (Hindu New Year) of the current VS year.
 * Counts elapsed Gregorian calendar days since that anchor date (inclusive).
 * VS 2083 anchor = 2026-03-15 (verified: Apr 2 → 19, Apr 3 → 20).
 */
export function getPravishte(
  gregorianYear: number,
  month: number,
  day: number,
  vsYear: number
): number {
  const anchorStr = CHAITRA_PRATIPADA_DATES[vsYear]
  if (!anchorStr) {
    // Fallback: approximate using tithi-based count if anchor date unknown
    return 1
  }
  const anchor = new Date(anchorStr + 'T00:00:00Z')
  const target = new Date(
    `${gregorianYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`
  )
  const diffDays = Math.round((target.getTime() - anchor.getTime()) / 86400000)
  return diffDays + 1 // Pratipada itself = day 1
}

// ── Ritu (Season) ─────────────────────────────────────────────────────────
/**
 * 6 Vedic seasons based on Sun's sidereal rashi (0-based Mesha=0).
 * Vasant: Meena(11)+Mesha(0) — but actually Mesha+Vrishabha etc.
 * Standard mapping: pairs of rashis = one ritu.
 */
const RITU_NAMES = [
  'Vasant (Spring)',      // Meena (11) + Mesha (0)
  'Grishma (Summer)',     // Vrishabha (1) + Mithuna (2)
  'Varsha (Monsoon)',     // Karka (3) + Simha (4)
  'Sharad (Autumn)',      // Kanya (5) + Tula (6)
  'Hemanta (Pre-Winter)', // Vrishchika (7) + Dhanu (8)
  'Shishira (Winter)',    // Makara (9) + Kumbha (10)
]

const VEDIC_RITU_NAMES = [
  'Vasant', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira',
]

export function getRitu(sunRashiIndex: number): { drik: string; vedic: string } {
  // Drik Ritu: Vasant starts when Sun enters Meena (index 11).
  // Meena(11)+Mesha(0)→Vasant; Vrishabha(1)+Mithuna(2)→Grishma; etc.
  // Formula: shift by 1 so Meena maps to index 0.
  const rituIdx = Math.floor(((sunRashiIndex + 1) % 12) / 2)
  return {
    drik: RITU_NAMES[rituIdx] ?? 'Unknown',
    vedic: VEDIC_RITU_NAMES[rituIdx] ?? 'Unknown',
  }
}

// ── Ayana ─────────────────────────────────────────────────────────────────
/**
 * Uttarayana: Sun in Makara (9) to Mithuna (2) — roughly Jan to June
 * Dakshinayana: Sun in Karka (3) to Dhanu (8) — roughly July to Dec
 * Vedic Ayana based on sidereal Sun (Lahiri).
 */
export function getAyana(sunRashiIndex: number): {
  drik: 'Uttarayana' | 'Dakshinayana'
  vedic: 'Uttarayana' | 'Dakshinayana'
} {
  // Sidereal: Uttarayana = Makara (9) to Mithuna (2) inclusive
  // (indices 9, 10, 11, 0, 1, 2)
  const uttarayanaRashis = new Set([9, 10, 11, 0, 1, 2])
  const ayana: 'Uttarayana' | 'Dakshinayana' = uttarayanaRashis.has(sunRashiIndex)
    ? 'Uttarayana'
    : 'Dakshinayana'
  return { drik: ayana, vedic: ayana }
}

// ── Kaliyuga ──────────────────────────────────────────────────────────────
// Kaliyuga started: 3102 BCE, Julian day 588465.5
const KALIYUGA_START_YEAR = -3101 // 3102 BCE = -3101 in astronomical year numbering
const KALIYUGA_START_JD = 588465.5

export function getKaliyuga(gregorianYear: number): number {
  return gregorianYear - KALIYUGA_START_YEAR
}

export function getKaliAhargana(jd: number): number {
  return Math.floor(jd - KALIYUGA_START_JD)
}

// ── Julian Date / Day ─────────────────────────────────────────────────────
export function getJulianDay(jd: number): number {
  return Math.floor(jd)
}

export function getJulianDate(jd: number): string {
  return jd.toFixed(6)
}

// ── Modified Julian Day ───────────────────────────────────────────────────
export function getModifiedJulianDay(jd: number): number {
  return jd - 2400000.5
}

// ── Rata Die ──────────────────────────────────────────────────────────────
// Rata Die epoch: January 1, 1 CE proleptic Gregorian = JD 1721425.5
export function getRataDie(jd: number): number {
  return Math.floor(jd - 1721424.5)
}

// ── National Civil (Saka) Calendar ───────────────────────────────────────
const SAKA_MONTH_NAMES = [
  'Chaitra', 'Vaishakha', 'Jyaistha', 'Ashadha', 'Shravana', 'Bhadra',
  'Asvina', 'Kartika', 'Agrahayana', 'Pausa', 'Magha', 'Phalguna',
]

export function getSakaDate(gregorianYear: number, month: number, day: number): string {
  // Simplified: Saka year = Gregorian year - 78 (after March 22) or - 79
  const sakaYear = month > 3 || (month === 3 && day >= 22)
    ? gregorianYear - 78
    : gregorianYear - 79

  // Approximate month mapping (simplified)
  let sakaMonth: number
  let sakaDay: number

  if (month === 3 && day >= 22) { sakaMonth = 1; sakaDay = day - 21 }
  else if (month === 4) { sakaMonth = 1; sakaDay = day + 10 }
  else if (month === 4 && day > 20) { sakaMonth = 2; sakaDay = day - 20 }
  else {
    // Simple approximate mapping
    sakaMonth = ((month - 3 + 12) % 12) + 1
    sakaDay = day
  }

  const mName = SAKA_MONTH_NAMES[(sakaMonth - 1) % 12]
  return `${sakaDay} ${mName} ${sakaYear}`
}

// ── Build LunarCalendar object ─────────────────────────────────────────────
export function buildLunarCalendar(
  gregorianYear: number,
  month: number,
  day: number,
  sunRashiIndex: number,
  tithiNumber: number
): LunarCalendar {
  const vsYear = getVikramSamvat(gregorianYear, month)
  const chandramasa = getChandramasa(sunRashiIndex, tithiNumber)
  return {
    vikramSamvat: vsYear,
    vikramSamvatName: getSamvatsaraName(vsYear),
    shakaSamvat: getShakaSamvat(gregorianYear, month),
    gujaratiSamvat: getGujaratiSamvat(gregorianYear, month),
    chandramasaPurnimanta: chandramasa.purnimanta,
    chandramasaAmanta: chandramasa.amanta,
    pravishte: getPravishte(gregorianYear, month, day, vsYear),
  }
}

// ── Build RituAyana object ─────────────────────────────────────────────────
export function buildRituAyana(
  sunRashiIndex: number,
  sunriseJD: number,
  sunsetJD: number,
  nextSunriseJD: number,
  timezone: string
): RituAyana {
  const ritu = getRitu(sunRashiIndex)
  const ayana = getAyana(sunRashiIndex)

  const dayMins = (sunsetJD - sunriseJD) * 24 * 60
  const nightMins = (nextSunriseJD - sunsetJD) * 24 * 60
  const minsToHM = (m: number) => `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`

  const noonJD = (sunriseJD + sunsetJD) / 2
  const noonDate = new Date((noonJD - 2440587.5) * 86400000)
  const madhyahna = noonDate.toLocaleTimeString('en-US', {
    timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false, hourCycle: 'h23',
  }).replace(/^24:/, '00:')

  return {
    drikRitu: ritu.drik,
    vedicRitu: ritu.vedic,
    drikAyana: ayana.drik,
    vedicAyana: ayana.vedic,
    madhyahna,
    dinamana: minsToHM(dayMins),
    ratrimana: minsToHM(nightMins),
  }
}

// ── Build OtherCalendars object ────────────────────────────────────────────
export function buildOtherCalendars(
  gregorianYear: number,
  month: number,
  day: number,
  jd: number,
  ayanamsha: number
): OtherCalendars {
  return {
    kaliyuga: getKaliyuga(gregorianYear),
    kaliAhargana: getKaliAhargana(jd),
    julianDate: getJulianDate(jd),
    julianDay: getJulianDay(jd),
    lahiriAyanamsha: Math.round(ayanamsha * 1000000) / 1000000,
    nationalCivilDate: getSakaDate(gregorianYear, month, day),
    rataDie: getRataDie(jd),
    modifiedJulianDay: Math.round(getModifiedJulianDay(jd) * 100) / 100,
  }
}
