// ─────────────────────────────────────────────────────────────────────────────
// Panchang Main Compute Orchestrator
// Calls all sub-modules in order and assembles the full PanchangData object.
// This is the single entry point called by the API route.
// ─────────────────────────────────────────────────────────────────────────────
import { computeRiseSet, localMidnightJD, getPlanetPositions, getAyanamsha, findTransitTime, formatLocalTime } from './ephemeris'
import { computeTithis, computeNakshatras, computeYogas, computeKaranas, computeVara, getWeekday, buildPosition } from './core'
import {
  brahmaMuhurta, pratahSandhya, abhijitMuhurta, vijayaMuhurta,
  godhuliMuhurta, sayahnaSandhya, nishitaMuhurta, amritKalam,
  varjyam, rahuKalam, yamaganda, gulikaiKalam, durMuhurtam, getBaana,
} from './timings'
import { detectSpecialYogas } from './specialYogas'
import { computeChandrabalam, computeTarabalam } from './chandrabalam'
import { buildLunarCalendar, buildRituAyana, buildOtherCalendars } from './calendar'
import { computeAnandadiYoga, getNetrama, computeNivasShool } from './anandadi'
import { computeUdayaLagna } from './udayaLagna'
import { MANTRI_MANDALA_TABLE, RASHI_NAMES, NAKSHATRA_NAMES } from './constants'
import type { PanchangData, PanchangInput, MantriMandala } from './types'

export async function computePanchang(input: PanchangInput): Promise<PanchangData> {
  const { date, lat, lng, timezone, locationName = '' } = input
  const [year, month, day] = date.split('-').map(Number)

  // ── 1. Sunrise / Sunset / Moonrise / Moonset ─────────────────────────
  const riseSet = await computeRiseSet(date, lat, lng, timezone)
  const { sunriseJD, sunsetJD } = riseSet

  // Next day sunrise (for night duration, Nishita)
  const tomorrowDate = new Date(Date.UTC(year, month - 1, day + 1))
  const tomorrowStr = tomorrowDate.toISOString().slice(0, 10)
  const tomorrowRise = await computeRiseSet(tomorrowStr, lat, lng, timezone)
  const nextSunriseJD = tomorrowRise.sunriseJD

  // ── 2. Planet positions at sunrise ───────────────────────────────────
  const planets = await getPlanetPositions(sunriseJD)
  const sunPos = buildPosition(planets.sun.lon)
  const moonPos = buildPosition(planets.moon.lon)

  // ── 3. Core Panchang ──────────────────────────────────────────────────
  const [tithis, nakshatras, yogas, karanas] = await Promise.all([
    computeTithis(date, timezone, sunriseJD, sunsetJD),
    computeNakshatras(date, timezone, sunriseJD),
    computeYogas(date, timezone, sunriseJD),
    computeKaranas(date, timezone, sunriseJD),
  ])

  const vara = computeVara(date, timezone, sunriseJD)
  const weekday = getWeekday(date, timezone, sunriseJD)
  const paksha = tithis[0]?.paksha ?? 'Shukla'

  // ── 4. Timings ────────────────────────────────────────────────────────
  const midnightJD = await localMidnightJD(date, timezone)

  const timings = {
    brahmaMuhurta: brahmaMuhurta(sunriseJD, timezone, date),
    pratahSandhya: pratahSandhya(sunriseJD, timezone, date),
    abhijitMuhurta: abhijitMuhurta(sunriseJD, sunsetJD, timezone, date),
    vijayaMuhurta: vijayaMuhurta(sunriseJD, sunsetJD, timezone, date),
    godhuliMuhurta: godhuliMuhurta(sunsetJD, timezone, date),
    sayahnaSandhya: sayahnaSandhya(sunsetJD, timezone, date),
    nishitaMuhurta: nishitaMuhurta(sunsetJD, nextSunriseJD, timezone, date),
    amritKalam: amritKalam(moonPos.nakshatraIndex, midnightJD, timezone, date),
    rahuKalam: rahuKalam(weekday, sunriseJD, sunsetJD, timezone, date),
    yamaganda: yamaganda(weekday, sunriseJD, sunsetJD, timezone, date),
    gulikaiKalam: gulikaiKalam(weekday, sunriseJD, sunsetJD, timezone, date),
    durMuhurtam: durMuhurtam(weekday, sunriseJD, sunsetJD, timezone, date),
    varjyam: varjyam(moonPos.nakshatraIndex, midnightJD, timezone, date),
    baana: getBaana(weekday),
  }

  // ── 5. Special Yogas ──────────────────────────────────────────────────
  const karanaNames = karanas.map(k => k.name)
  const tithiNumber = tithis[0]?.number ?? 1
  const specialYogas = detectSpecialYogas(
    moonPos.nakshatraIndex,
    tithiNumber,
    weekday,
    moonPos.rashiIndex,
    karanaNames
  )

  // ── 6. Chandrabalam / Tarabalam ───────────────────────────────────────
  const chandrabalam = computeChandrabalam(moonPos.rashiIndex)
  const tarabalam = computeTarabalam(moonPos.nakshatraIndex)

  // ── 7. Calendar / Epoch ───────────────────────────────────────────────
  const ayanamsha = await getAyanamsha(sunriseJD)
  const lunarCalendar = buildLunarCalendar(year, month, day, sunPos.rashiIndex, tithiNumber)
  const rituAyana = buildRituAyana(sunPos.rashiIndex, sunriseJD, sunsetJD, nextSunriseJD, timezone)
  const otherCalendars = buildOtherCalendars(year, month, day, sunriseJD, ayanamsha)

  // ── 8. Mantri Mandala ─────────────────────────────────────────────────
  const vsYear = lunarCalendar.vikramSamvat
  const mmData = MANTRI_MANDALA_TABLE[vsYear] ?? MANTRI_MANDALA_TABLE[2083] // fallback
  const mantriMandala: MantriMandala = {
    vsYear,
    raja: mmData.raja,
    mantri: mmData.mantri,
    sasyadhipati: mmData.sasyadhipati,
    dhanadhipati: mmData.dhanadhipati,
    rasadhipati: mmData.rasadhipati,
    senadhipati: mmData.senadhipati,
    dhanyadhipati: mmData.dhanyadhipati,
    meghadhipati: mmData.meghadhipati,
    nirasadhipati: mmData.nirasadhipati,
    phaladhipati: mmData.phaladhipati,
  }

  // ── 9. Anandadi Yoga (Section 9) ─────────────────────────────────────
  const nakshatraEndTime = nakshatras[0]?.endTime ?? null
  const anandadiYoga = computeAnandadiYoga(moonPos.nakshatraIndex, weekday, nakshatraEndTime)
  // Override netrama with actual pada
  const anandadiWithNetrama = {
    ...anandadiYoga,
    netrama: getNetrama(moonPos.pada),
  }

  // ── 10. Nivas and Shool (Section 10) ──────────────────────────────────
  // Detect Moon rashi change during the day (for Chandra Vasa, BUG-04)
  // Next rashi boundary in degrees. Use 360 (not 0) for the Meena→Mesha wrap
  // so findTransitTime can converge correctly (target must be > current moon lon).
  const nextRashiIdx = (moonPos.rashiIndex + 1) % 12
  const moonRashiChangeBoundary = nextRashiIdx === 0 ? 360 : nextRashiIdx * 30
  const moonRashiChangeJD = await findTransitTime(
    sunriseJD,
    (m, _s) => ((m % 360) + 360) % 360,
    moonRashiChangeBoundary,
    13.2
  )
  const dayEndJD = sunriseJD + 1
  const moonRashiChangeTime = (moonRashiChangeJD && moonRashiChangeJD < dayEndJD)
    ? formatLocalTime(moonRashiChangeJD, timezone, date)
    : null
  const moonRashiAfterChange = (moonPos.rashiIndex + 1) % 12
  const moonRashiAfterChangeName = moonRashiChangeTime
    ? (RASHI_NAMES[moonRashiAfterChange] ?? null)
    : null

  // ── Sun pada transition ───────────────────────────────────────────────────
  // Each pada = 10/3 degrees (360° / 108 padas). Search up to 2 days ahead.
  const SUN_PADA_WIDTH = 10 / 3
  const sunPadaIdx = Math.floor(sunPos.longitude / SUN_PADA_WIDTH)
  const sunNextPadaBoundary = (sunPadaIdx + 1) * SUN_PADA_WIDTH  // always > sunPos.longitude
  const sunPadaChangeJD = await findTransitTime(
    sunriseJD,
    (_m, s) => s,
    sunNextPadaBoundary,
    1.0  // sun moves ~1°/day
  )
  const sunNextPadaTime = sunPadaChangeJD
    ? formatLocalTime(sunPadaChangeJD, timezone, date)
    : null
  const sunNextPadaLabel: string | null = sunNextPadaTime
    ? (sunPos.pada === 4
        ? `${NAKSHATRA_NAMES[(sunPos.nakshatraIndex + 1) % 27]}, Pada 1`
        : `Pada ${sunPos.pada + 1}`)
    : null

  const nivasShool = computeNivasShool(
    weekday,
    moonPos.nakshatraIndex,
    tithis,
    moonPos.rashiIndex,
    moonRashiChangeTime,
    moonRashiAfterChange,
  )

  // ── 11. Udaya Lagna & Panchaka Rahita Muhurta ────────────────────────
  const { lagnaSlots: udayaLagnaSlots, panchakaSlots } = await computeUdayaLagna(date, sunriseJD, lat, lng, timezone)

  // ── Assemble ──────────────────────────────────────────────────────────
  return {
    date,
    locationName,
    timezone,
    lat,
    lng,

    sunrise: riseSet.sunriseLocal,
    sunset: riseSet.sunsetLocal,
    moonrise: riseSet.moonriseLocal,
    moonset: riseSet.moonsetLocal,

    tithi: tithis,
    nakshatra: nakshatras,
    yoga: yogas,
    karana: karanas,
    vara,
    paksha,

    sunPosition: sunPos,
    moonPosition: moonPos,

    moonRashiChangeTime,
    moonRashiAfterChangeName,
    sunNextPadaTime,
    sunNextPadaLabel,

    brahmaMuhurta: timings.brahmaMuhurta,
    pratahSandhya: timings.pratahSandhya,
    abhijitMuhurta: timings.abhijitMuhurta,
    vijayaMuhurta: timings.vijayaMuhurta,
    godhuliMuhurta: timings.godhuliMuhurta,
    sayahnaSandhya: timings.sayahnaSandhya,
    nishitaMuhurta: timings.nishitaMuhurta,
    amritKalam: timings.amritKalam,

    rahuKalam: timings.rahuKalam,
    yamaganda: timings.yamaganda,
    gulikaiKalam: timings.gulikaiKalam,
    durMuhurtam: timings.durMuhurtam,
    varjyam: timings.varjyam,
    baana: timings.baana,

    lunarCalendar,
    rituAyana,
    otherCalendars,
    mantriMandala,

    specialYogas,
    anandadiYoga: anandadiWithNetrama,
    nivasShool,
    chandrabalam,
    tarabalam,
    udayaLagnaSlots,
    panchakaSlots,
    festivals: [], // populated by API route from DB
  }
}
