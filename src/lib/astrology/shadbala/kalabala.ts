/**
 * Kala Bala — Temporal Strength
 *
 * Eight sub-components:
 *   1. Nathonnatha Bala  — day/night strength (0–60 virupas)
 *   2. Paksha Bala       — lunar phase (0–60 virupas)
 *   3. Tribhaga Bala     — hour-third lord (0 or 30 virupas)
 *   4. Abda Bala         — year lord (0 or 15 virupas)
 *   5. Masa Bala         — month lord (0 or 30 virupas)
 *   6. Vara Bala         — weekday lord (0 or 45 virupas)
 *   7. Hora Bala         — hora lord (0 or 60 virupas)
 *   8. Ayana Bala        — solstice/ayana strength (0–30 virupas)
 */

import type { KalaBala } from './types'

// Chaldean order used for hora, weekday, and related cycles
const CHALDEAN: ReadonlyArray<string> = [
  'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'
]
// Weekday lord order: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const WEEKDAY_LORD: ReadonlyArray<string> = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
]

// ── 1. Nathonnatha Bala ───────────────────────────────────────────────────────

/**
 * Day/night strength.
 * Day planets (Sun, Jupiter, Venus): strong during the day.
 * Night planets (Moon, Mars, Saturn): strong at night.
 * Mercury: always 30 (neutral).
 */
function nathonnathaBala(
  planet: string,
  birthJD: number,
  sunriseJD: number,
  sunsetJD: number
): number {
  if (planet === 'Mercury') return 30
  const isDayPlanet = planet === 'Sun' || planet === 'Jupiter' || planet === 'Venus'
  const isDay = birthJD >= sunriseJD && birthJD < sunsetJD

  // Proportional: scale by how deeply within day or night the birth occurred
  // Day planets peak at solar noon (midday), night planets peak at midnight
  if (isDay) {
    const dayLen = sunsetJD - sunriseJD
    if (dayLen <= 0) return isDayPlanet ? 60 : 0
    // Ratio 0→1: sunrise to sunset; peaks at 0.5 (noon)
    const ratio = (birthJD - sunriseJD) / dayLen
    // Day strength: 0 at edges (sunrise/sunset), 60 at noon
    const dayStrength = 60 * (1 - Math.abs(ratio - 0.5) * 2)
    return isDayPlanet ? Math.max(0, dayStrength) : Math.max(0, 60 - dayStrength)
  } else {
    // Night: could cross midnight; use fraction of night from sunset to next sunrise
    const nightLen = (sunriseJD + 1) - sunsetJD  // approximate — next sunrise ~1 JD day later
    const nightPos = birthJD >= sunsetJD
      ? (birthJD - sunsetJD) / nightLen
      : (birthJD + 1 - sunsetJD) / nightLen
    // Night strength peaks at midnight (ratio 0.5)
    const nightStrength = 60 * (1 - Math.abs(Math.max(0, Math.min(1, nightPos)) - 0.5) * 2)
    return isDayPlanet ? Math.max(0, 60 - nightStrength) : Math.max(0, nightStrength)
  }
}

// ── 2. Paksha Bala ───────────────────────────────────────────────────────────

/**
 * Lunar-phase strength.
 * Natural benefics (Moon, Mercury, Jupiter, Venus) stronger in waxing paksha.
 * Natural malefics (Sun, Mars, Saturn) stronger in waning paksha.
 *
 * Phase angle = (moonLon − sunLon + 360) % 360
 *   0–180° = waxing (Shukla Paksha)
 *   180–360° = waning (Krishna Paksha)
 */
function pakshabala(planet: string, moonLon: number, sunLon: number): number {
  const phase = ((moonLon - sunLon) + 360) % 360
  const isBenefic =
    planet === 'Moon' || planet === 'Mercury' ||
    planet === 'Jupiter' || planet === 'Venus'
  if (isBenefic) {
    return phase <= 180 ? phase / 3 : (360 - phase) / 3
  } else {
    // Malefic: strong in waning half
    return phase > 180 ? (phase - 180) / 3 : (180 - phase) / 3
  }
}

// ── 3. Tribhaga Bala ─────────────────────────────────────────────────────────

/**
 * Hour-third lord strength.
 * Day thirds → Mercury, Sun, Saturn (lords of 1st, 2nd, 3rd third).
 * Night thirds → Moon, Venus, Mars.
 * Jupiter: always 30.
 */
function tribhagaBala(
  planet: string,
  birthJD: number,
  sunriseJD: number,
  sunsetJD: number
): number {
  if (planet === 'Jupiter') return 30
  const isDay = birthJD >= sunriseJD && birthJD < sunsetJD
  const DAY_LORDS   = ['Mercury', 'Sun', 'Saturn']
  const NIGHT_LORDS = ['Moon', 'Venus', 'Mars']

  if (isDay) {
    const dayLen = sunsetJD - sunriseJD
    if (dayLen <= 0) return 0
    const pos   = (birthJD - sunriseJD) / dayLen
    const third = Math.min(2, Math.floor(pos * 3))
    return DAY_LORDS[third] === planet ? 30 : 0
  } else {
    // Night length (approximate — next sunrise not provided, use ~12h)
    const nightLen = sunriseJD + 1 - sunsetJD
    if (nightLen <= 0) return 0
    let nightPos: number
    if (birthJD >= sunsetJD) {
      nightPos = (birthJD - sunsetJD) / nightLen
    } else {
      // After midnight, before sunrise
      nightPos = (birthJD + 1 - sunsetJD) / nightLen
    }
    const third = Math.min(2, Math.floor(Math.max(0, nightPos) * 3))
    return NIGHT_LORDS[third] === planet ? 30 : 0
  }
}

// ── 4. Abda Bala ─────────────────────────────────────────────────────────────

/**
 * Year lord strength.
 * Classical: determined by the weekday of Mesha Sankranti.
 * Simplified: cycles the Chaldean weekday order by Julian year number.
 */
function abdaBala(planet: string, julianDayUT: number): number {
  // Julian year number since J2000 reference epoch
  const yearNum = Math.floor((julianDayUT - 1721045.5) / 365.25)
  const lord = WEEKDAY_LORD[((yearNum % 7) + 7) % 7]
  return lord === planet ? 15 : 0
}

// ── 5. Masa Bala ─────────────────────────────────────────────────────────────

/**
 * Month lord strength.
 * Lord = weekday of the most recent new Moon.
 */
function masaBala(
  planet: string,
  julianDayUT: number,
  moonLon: number,
  sunLon: number
): number {
  const phase = ((moonLon - sunLon) + 360) % 360
  const synodicPeriod = 29.53059
  const daysFromNewMoon = (phase / 360) * synodicPeriod
  const newMoonJD = julianDayUT - daysFromNewMoon
  // Weekday of new Moon: (floor(jd + 1.5) % 7), 0=Sun
  const weekday = Math.floor(newMoonJD + 1.5) % 7
  const lord = WEEKDAY_LORD[((weekday % 7) + 7) % 7]
  return lord === planet ? 30 : 0
}

// ── 6. Vara Bala ─────────────────────────────────────────────────────────────

/**
 * Weekday lord strength.
 * JD 0 = Monday. Weekday = (floor(jd + 1.5) % 7): 0=Sun, 1=Mon, …, 6=Sat.
 */
function varaBala(planet: string, julianDayUT: number): number {
  const weekday = Math.floor(julianDayUT + 1.5) % 7
  const lord = WEEKDAY_LORD[((weekday % 7) + 7) % 7]
  return lord === planet ? 45 : 0
}

// ── 7. Hora Bala ─────────────────────────────────────────────────────────────

/**
 * Hora (planetary hour) lord strength.
 * The 24 horas of the day cycle through the Chaldean order starting from
 * the weekday lord, with 12 horas by day and 12 by night.
 */
function horaBala(
  planet: string,
  birthJD: number,
  sunriseJD: number,
  sunsetJD: number,
  julianDayUT: number
): number {
  const weekday = Math.floor(julianDayUT + 1.5) % 7
  const dayLord = WEEKDAY_LORD[((weekday % 7) + 7) % 7]
  const startIdx = CHALDEAN.indexOf(dayLord)
  if (startIdx === -1) return 0

  const isDay = birthJD >= sunriseJD && birthJD < sunsetJD
  let horaNumber: number

  if (isDay) {
    const horaLen = (sunsetJD - sunriseJD) / 12
    if (horaLen <= 0) return 0
    horaNumber = Math.min(11, Math.floor((birthJD - sunriseJD) / horaLen))
  } else {
    const nightLen = sunriseJD + 1 - sunsetJD
    if (nightLen <= 0) return 0
    const horaLen = nightLen / 12
    const nightStart = birthJD >= sunsetJD
      ? birthJD - sunsetJD
      : birthJD + 1 - sunsetJD
    horaNumber = 12 + Math.min(11, Math.floor(Math.max(0, nightStart) / horaLen))
  }

  const horaLord = CHALDEAN[(startIdx + horaNumber) % 7]
  return horaLord === planet ? 60 : 0
}

// ── 8. Ayana Bala ─────────────────────────────────────────────────────────────

/**
 * Ayana (solstice) strength.
 * Benefics (Moon, Mercury, Jupiter, Venus) stronger in Uttarayana (northward Sun).
 * Malefics (Sun, Mars, Saturn) stronger in Dakshinayana (southward Sun).
 * Score scales from 0–30 based on Sun's sign distance from peak sign.
 */
/**
 * Ayana Bala — solstice-based strength.
 * Classical peak signs per BPHS:
 *   Benefics (Moon, Mercury, Jupiter, Venus): peak at Cancer (sign 4, summer solstice / northernmost)
 *   Malefics (Sun, Mars, Saturn): peak at Capricorn (sign 10, winter solstice / southernmost)
 * Score: 30 at peak sign, diminishes by 5 per sign distance, minimum 0.
 */
function ayanaBala(planet: string, sunLon: number): number {
  const sunSign = Math.floor(sunLon / 30) + 1  // 1–12
  const isBenefic =
    planet === 'Moon' || planet === 'Mercury' ||
    planet === 'Jupiter' || planet === 'Venus'

  const peakSign = isBenefic ? 4 : 10  // Cancer for benefics, Capricorn for malefics
  const dist = Math.min(Math.abs(sunSign - peakSign), 12 - Math.abs(sunSign - peakSign))
  return Math.max(0, 30 - dist * 5)
}

// ── Aggregator ────────────────────────────────────────────────────────────────

/**
 * Compute total Kala Bala for a planet.
 *
 * @param planet     - Planet name
 * @param birthJD    - Julian Day of birth (UT)
 * @param sunriseJD  - Julian Day of sunrise on birth day
 * @param sunsetJD   - Julian Day of sunset on birth day
 * @param julianDayUT - Julian Day of birth (UT), same as birthJD (kept separate for clarity)
 * @param moonLon    - Moon's sidereal longitude
 * @param sunLon     - Sun's sidereal longitude
 */
export function computeKalaBala(
  planet: string,
  birthJD: number,
  sunriseJD: number,
  sunsetJD: number,
  julianDayUT: number,
  moonLon: number,
  sunLon: number
): KalaBala {
  const nathonnatha = nathonnathaBala(planet, birthJD, sunriseJD, sunsetJD)
  const paksha      = pakshabala(planet, moonLon, sunLon)
  const tribhaga    = tribhagaBala(planet, birthJD, sunriseJD, sunsetJD)
  const abda        = abdaBala(planet, julianDayUT)
  const masa        = masaBala(planet, julianDayUT, moonLon, sunLon)
  const vara        = varaBala(planet, julianDayUT)
  const hora        = horaBala(planet, birthJD, sunriseJD, sunsetJD, julianDayUT)
  const ayana       = ayanaBala(planet, sunLon)

  const total = nathonnatha + paksha + tribhaga + abda + masa + vara + hora + ayana

  const r = (v: number) => Math.round(v * 100) / 100
  return {
    nathonnathaBala: r(nathonnatha),
    pakshabala:      r(paksha),
    tribhagaBala:    r(tribhaga),
    abdaBala:        r(abda),
    masaBala:        r(masa),
    varaBala:        r(vara),
    horaBala:        r(hora),
    ayanaBala:       r(ayana),
    total:           r(total),
  }
}
