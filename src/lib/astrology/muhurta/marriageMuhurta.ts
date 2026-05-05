import { localMidnightJD, getPlanetPositions } from '@/lib/panchang/ephemeris'
import type { PanchangData } from '@/lib/panchang/types'
import type {
  MuhurtaDateResult,
  MuhurtaGrade,
  MuhurtaCheck,
  MuhurtaLagnaWindow,
  PersonalCompatibility,
  MuhurtaPersonInput,
} from './types'

// ─── Constants ───────────────────────────────────────────────────────────────

const VARA_MAP: Record<string, string> = {
  Ravivara: 'Sunday',
  Somavara: 'Monday',
  Mangalavara: 'Tuesday',
  Budhavara: 'Wednesday',
  Guruvara: 'Thursday',
  Shukravara: 'Friday',
  Shanivara: 'Saturday',
}

const AUSPICIOUS_VARAS = new Set(['Somavara', 'Budhavara', 'Guruvara', 'Shukravara'])
const NEUTRAL_VARAS = new Set(['Ravivara'])
// Mangalavara and Shanivara are avoid (score 0 + strong penalty)

// Auspicious tithis (1-indexed)
const AUSPICIOUS_TITHIS = new Set([2, 3, 5, 7, 10, 11, 13])
const NEUTRAL_TITHIS = new Set([1, 6, 12])
// Rikta/avoid: 4, 9, 14, 15 (Purnima), 30 (Amavasya), 8 (strong avoid)

// Auspicious nakshatras (1-indexed)
const AUSPICIOUS_NAKSHATRAS = new Set([4, 5, 12, 13, 15, 17, 19, 21, 26, 27])
const INAUSPICIOUS_NAKSHATRAS = new Set([3, 6, 9, 18, 23, 24])

// Favorable lagna indices (0-indexed): Taurus=1, Gemini=2, Cancer=3, Virgo=5, Libra=6, Sagittarius=8, Pisces=11
const FAVORABLE_LAGNA_INDICES = new Set([1, 2, 3, 5, 6, 8, 11])

// ─── Helpers ─────────────────────────────────────────────────────────────────

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

function gradeScore(score: number): MuhurtaGrade {
  if (score >= 75) return 'excellent'
  if (score >= 55) return 'good'
  if (score >= 35) return 'acceptable'
  return 'avoid'
}

function computePersonalCompat(
  weddingMoonRashiIndex: number,
  weddingNakshatraIndex0: number,
  person: MuhurtaPersonInput
): PersonalCompatibility {
  // Moon check: bad if wedding Moon is in 6th, 8th, or 12th house from natal Moon
  // Formula: (weddingMoonRashiIndex - (personMoonSign-1) + 12) % 12
  const moonOffset = (weddingMoonRashiIndex - (person.moonSignNumber - 1) + 12) % 12
  const BAD_MOON_OFFSETS = new Set([5, 7, 11])
  const moonOk = !BAD_MOON_OFFSETS.has(moonOffset)
  const houseNumber = moonOffset + 1
  const moonDetail = moonOk
    ? `Wedding Moon in ${houseNumber}th house from ${person.name}'s natal Moon — favorable`
    : `Wedding Moon in ${houseNumber}th house from ${person.name}'s natal Moon — unfavorable (6th/8th/12th)`

  // Tarabalam check
  // (weddingNakshatraIndex_0based - personNakshatraIndex_0based + 27) % 9
  // Bad if result is 2 (Vipat), 4 (Pratyak), 6 (Naidhana)
  const taraResult = (weddingNakshatraIndex0 - person.nakshatraIndex + 27) % 9
  const BAD_TARA = new Set([2, 4, 6])
  const TARA_NAMES: Record<number, string> = {
    0: 'Janma', 1: 'Sampat', 2: 'Vipat', 3: 'Kshema',
    4: 'Pratyak', 5: 'Sadhana', 6: 'Naidhana', 7: 'Mitra', 8: 'Parama Mitra',
  }
  const taraOk = !BAD_TARA.has(taraResult)
  const taraName = TARA_NAMES[taraResult] ?? 'Unknown'
  const taraDetail = taraOk
    ? `Tarabalam for ${person.name}: ${taraName} — favorable`
    : `Tarabalam for ${person.name}: ${taraName} — unfavorable (Vipat/Pratyak/Naidhana)`

  return { moonOk, taraOk, moonDetail, taraDetail }
}

// ─── Main scoring function ────────────────────────────────────────────────────

export async function scoreMuhurtaDate(
  date: string,
  panchang: PanchangData,
  isJupiterRetro: boolean,
  isVenusRetro: boolean,
  isKharMaas: boolean,
  person1?: MuhurtaPersonInput,
  person2?: MuhurtaPersonInput
): Promise<MuhurtaDateResult> {
  const checks: MuhurtaCheck[] = []
  let score = 0

  // ── 1. Vara (weekday) — weight 15 ──────────────────────────────────────────
  const varaName = panchang.vara.name
  const dayOfWeek = VARA_MAP[varaName] ?? varaName
  const isVaraAuspicious = AUSPICIOUS_VARAS.has(varaName)
  const isVaraNeutral = NEUTRAL_VARAS.has(varaName)
  const isVaraAvoid = !isVaraAuspicious && !isVaraNeutral

  let varaScore = 0
  let varaDetail: string
  if (isVaraAuspicious) {
    varaScore = 15
    varaDetail = `${varaName} (${dayOfWeek}) is auspicious for marriage`
  } else if (isVaraNeutral) {
    varaScore = 5
    varaDetail = `${varaName} (${dayOfWeek}) is neutral for marriage`
  } else {
    varaScore = 0
    varaDetail = `${varaName} (${dayOfWeek}) is not recommended for marriage`
  }
  score += varaScore
  checks.push({
    name: 'Vara (Weekday)',
    passed: !isVaraAvoid,
    detail: varaDetail,
    weight: 15,
  })

  // ── 2. Tithi — weight 15 ────────────────────────────────────────────────────
  const tithi = panchang.tithi[0]
  const tithiNumber = tithi.number
  const isTithiAuspicious = AUSPICIOUS_TITHIS.has(tithiNumber)
  const isTithiNeutral = NEUTRAL_TITHIS.has(tithiNumber)
  const isTithiRikta = [4, 9, 14].includes(tithiNumber)
  const isTithiPurnimaAmavasya = tithiNumber === 15 || tithiNumber === 30
  const isTithiStrongAvoid = tithiNumber === 8

  let tithiScore = 0
  let tithiDetail: string
  if (isTithiAuspicious) {
    tithiScore = 15
    tithiDetail = `${tithi.name} (${tithi.paksha} ${tithiNumber}) is auspicious for marriage`
  } else if (isTithiNeutral) {
    tithiScore = 7
    tithiDetail = `${tithi.name} (${tithi.paksha} ${tithiNumber}) is neutral for marriage`
  } else if (isTithiStrongAvoid) {
    tithiScore = 0
    tithiDetail = `${tithi.name} (Ashtami) is strongly avoided for marriage`
  } else if (isTithiPurnimaAmavasya) {
    tithiScore = 0
    tithiDetail = `${tithi.name} is avoided for marriage`
  } else if (isTithiRikta) {
    tithiScore = 0
    tithiDetail = `${tithi.name} (Rikta tithi) is avoided for marriage`
  } else {
    tithiScore = 0
    tithiDetail = `${tithi.name} (${tithi.paksha} ${tithiNumber}) is not recommended for marriage`
  }
  score += tithiScore
  checks.push({
    name: 'Tithi',
    passed: isTithiAuspicious || isTithiNeutral,
    detail: tithiDetail,
    weight: 15,
  })

  // ── 3. Nakshatra — weight 15 ─────────────────────────────────────────────────
  const nakshatra = panchang.nakshatra[0]
  const nakshatraIndex1 = nakshatra.index  // 1-indexed
  const isNakshatraAuspicious = AUSPICIOUS_NAKSHATRAS.has(nakshatraIndex1)
  const isNakshatraInauspicious = INAUSPICIOUS_NAKSHATRAS.has(nakshatraIndex1)

  let nakshatraScore = 0
  let nakshatraDetail: string
  if (isNakshatraAuspicious) {
    nakshatraScore = 15
    nakshatraDetail = `${nakshatra.name} is an auspicious nakshatra for marriage`
  } else if (isNakshatraInauspicious) {
    nakshatraScore = 0
    nakshatraDetail = `${nakshatra.name} is not recommended for marriage`
  } else {
    nakshatraScore = 7
    nakshatraDetail = `${nakshatra.name} is a neutral nakshatra for marriage`
  }
  score += nakshatraScore
  checks.push({
    name: 'Nakshatra',
    passed: !isNakshatraInauspicious,
    detail: nakshatraDetail,
    weight: 15,
  })

  // ── 4. Lagna — weight 15 ────────────────────────────────────────────────────
  const lagnaWindows: MuhurtaLagnaWindow[] = panchang.udayaLagnaSlots.map(slot => ({
    lagnaName: slot.lagnaName,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isFavorable: FAVORABLE_LAGNA_INDICES.has(slot.lagnaIndex),
  }))
  const hasFavorableLagna = lagnaWindows.some(w => w.isFavorable)
  const favorableLagnaNames = lagnaWindows
    .filter(w => w.isFavorable)
    .map(w => `${w.lagnaName} (${w.startTime}–${w.endTime})`)
    .join(', ')

  const lagnaScore = hasFavorableLagna ? 15 : 0
  score += lagnaScore
  checks.push({
    name: 'Auspicious Lagna',
    passed: hasFavorableLagna,
    detail: hasFavorableLagna
      ? `Favorable lagna windows: ${favorableLagnaNames}`
      : 'No favorable lagna available today (Taurus, Gemini, Cancer, Virgo, Libra, Sagittarius, Pisces)',
    weight: 15,
  })

  // ── 5. Jupiter not retrograde — weight 10 ────────────────────────────────────
  const jupiterRetroScore = isJupiterRetro ? 0 : 10
  score += jupiterRetroScore
  checks.push({
    name: 'Jupiter Direct',
    passed: !isJupiterRetro,
    detail: isJupiterRetro
      ? 'Jupiter is retrograde — not ideal for starting new ventures like marriage'
      : 'Jupiter is direct — auspicious',
    weight: 10,
  })

  // ── 6. Venus not retrograde — weight 10 ─────────────────────────────────────
  const venusRetroScore = isVenusRetro ? 0 : 10
  score += venusRetroScore
  checks.push({
    name: 'Venus Direct',
    passed: !isVenusRetro,
    detail: isVenusRetro
      ? 'Venus is retrograde — not recommended for marriage'
      : 'Venus is direct — auspicious for marriage',
    weight: 10,
  })

  // ── 7. Jupiter not combust — weight 5 ────────────────────────────────────────
  // ── 8. Venus not combust — weight 5 ──────────────────────────────────────────
  const jdNoon = await localMidnightJD(date, panchang.timezone) + 0.5
  const positions = await getPlanetPositions(jdNoon)
  const sunLon = positions.sun.lon
  const jupiterLon = positions.jupiter.lon
  const venusLon = positions.venus.lon

  const jupSunDist = angularDistance(sunLon, jupiterLon)
  const venSunDist = angularDistance(sunLon, venusLon)

  const isJupiterCombust = jupSunDist < 11
  const isVenusCombust = venSunDist < 10

  const jupitercombustScore = isJupiterCombust ? 0 : 5
  score += jupitercombustScore
  checks.push({
    name: 'Jupiter Not Combust',
    passed: !isJupiterCombust,
    detail: isJupiterCombust
      ? `Jupiter is combust (${jupSunDist.toFixed(1)}° from Sun, threshold 11°) — weakened`
      : `Jupiter is not combust (${jupSunDist.toFixed(1)}° from Sun) — strong`,
    weight: 5,
  })

  const venusCombustScore = isVenusCombust ? 0 : 5
  score += venusCombustScore
  checks.push({
    name: 'Venus Not Combust',
    passed: !isVenusCombust,
    detail: isVenusCombust
      ? `Venus is combust (${venSunDist.toFixed(1)}° from Sun, threshold 10°) — weakened`
      : `Venus is not combust (${venSunDist.toFixed(1)}° from Sun) — strong`,
    weight: 5,
  })

  // ── 9. Not Khar Maas — weight 10 ─────────────────────────────────────────────
  const kharMaasScore = isKharMaas ? 0 : 10
  score += kharMaasScore
  checks.push({
    name: 'Not Khar Maas',
    passed: !isKharMaas,
    detail: isKharMaas
      ? 'Khar Maas (Sun in Sagittarius or Pisces) — marriages are avoided during this period'
      : 'Not Khar Maas — auspicious period',
    weight: 10,
  })

  // ── 10. Not Adhik Maas — weight 5 ────────────────────────────────────────────
  // TODO: compute isAdhikMaas from panchang once LunarCalendar exposes it
  const isAdhikMaas = false
  score += 5  // always award the 5 pts until engine supports this

  // ── 11. Personal compatibility — weight 5 per person ─────────────────────────
  const weddingMoonRashiIndex = panchang.moonPosition.rashiIndex  // 0-11
  const weddingNakshatraIndex0 = nakshatra.index - 1  // convert to 0-based

  let person1Compat: PersonalCompatibility | undefined
  let person2Compat: PersonalCompatibility | undefined

  if (person1) {
    person1Compat = computePersonalCompat(weddingMoonRashiIndex, weddingNakshatraIndex0, person1)
    const p1Score = (person1Compat.moonOk ? 2.5 : 0) + (person1Compat.taraOk ? 2.5 : 0)
    score += p1Score
    checks.push({
      name: `${person1.name} Moon Compatibility`,
      passed: person1Compat.moonOk,
      detail: person1Compat.moonDetail,
      weight: 2.5,
    })
    checks.push({
      name: `${person1.name} Tarabalam`,
      passed: person1Compat.taraOk,
      detail: person1Compat.taraDetail,
      weight: 2.5,
    })
  }

  if (person2) {
    person2Compat = computePersonalCompat(weddingMoonRashiIndex, weddingNakshatraIndex0, person2)
    const p2Score = (person2Compat.moonOk ? 2.5 : 0) + (person2Compat.taraOk ? 2.5 : 0)
    score += p2Score
    checks.push({
      name: `${person2.name} Moon Compatibility`,
      passed: person2Compat.moonOk,
      detail: person2Compat.moonDetail,
      weight: 2.5,
    })
    checks.push({
      name: `${person2.name} Tarabalam`,
      passed: person2Compat.taraOk,
      detail: person2Compat.taraDetail,
      weight: 2.5,
    })
  }

  // Clamp score to 100
  const finalScore = Math.min(100, Math.round(score))

  return {
    date,
    dayOfWeek,
    score: finalScore,
    grade: gradeScore(finalScore),
    tithi: {
      name: tithi.name,
      paksha: tithi.paksha,
      number: tithiNumber,
      isAuspicious: isTithiAuspicious,
    },
    nakshatra: {
      name: nakshatra.name,
      index: nakshatraIndex1,
      isAuspicious: isNakshatraAuspicious,
    },
    vara: {
      name: varaName,
      isAuspicious: isVaraAuspicious,
    },
    isKharMaas,
    isAdhikMaas,
    jupiterRetrograde: isJupiterRetro,
    venusRetrograde: isVenusRetro,
    jupiterCombust: isJupiterCombust,
    venusCombust: isVenusCombust,
    lagnaWindows,
    checks,
    ...(person1Compat && { person1Compat }),
    ...(person2Compat && { person2Compat }),
  }
}
