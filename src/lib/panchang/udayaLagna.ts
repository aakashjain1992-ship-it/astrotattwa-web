// ─────────────────────────────────────────────────────────────────────────────
// Udaya Lagna & Panchaka Rahita Muhurta
// Computes the rising sign (Lagna) at each ~2-hour slot throughout the day.
// Also computes Panchaka Rahita Muhurta slots based on the nakshatra of the
// rising lagna degree — a finer-grained classification that can subdivide
// within a single lagna period when the lagna degree crosses a nakshatra boundary.
// ─────────────────────────────────────────────────────────────────────────────
import { sweAscendantSidereal } from '@/lib/astrology/swissEph'
import { formatLocalTime } from './ephemeris'
import { RASHI_NAMES, PANCHAKA_BY_NAKSHATRA } from './constants'
import type { UdayaLagnaSlot, PanchakaSlot } from './types'

// Nakshatra width in degrees (360 / 27)
const NAK_WIDTH = 40 / 3  // 13.333...°

type PanchakaType = 'good' | 'roga' | 'mrityu' | 'agni' | 'raja' | 'chora'

function getPanchakaType(ascDeg: number): PanchakaType {
  const normalized = ((ascDeg % 360) + 360) % 360
  const nakIdx = Math.floor(normalized / NAK_WIDTH)
  return PANCHAKA_BY_NAKSHATRA[nakIdx] ?? 'good'
}

function getRashiIndex(ascDeg: number): number {
  return Math.floor(((ascDeg % 360) + 360) % 360 / 30)
}

/** Binary search for precise rashi transition JD */
async function narrowRashiTransition(
  jdBefore: number,
  jdAfter: number,
  lat: number,
  lng: number,
  maxIter = 8
): Promise<number> {
  let lo = jdBefore
  let hi = jdAfter
  const targetRashi = getRashiIndex(await sweAscendantSidereal(hi, lat, lng))
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2
    if (getRashiIndex(await sweAscendantSidereal(mid, lat, lng)) === targetRashi) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

/** Binary search for precise nakshatra transition JD */
async function narrowNakshatraTransition(
  jdBefore: number,
  jdAfter: number,
  lat: number,
  lng: number,
  maxIter = 8
): Promise<number> {
  let lo = jdBefore
  let hi = jdAfter
  const targetNak = Math.floor(((await sweAscendantSidereal(hi, lat, lng) % 360) + 360) % 360 / NAK_WIDTH)
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2
    const nak = Math.floor(((await sweAscendantSidereal(mid, lat, lng) % 360) + 360) % 360 / NAK_WIDTH)
    if (nak === targetNak) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

/**
 * Compute Udaya Lagna slots and Panchaka Rahita Muhurta slots for the day.
 *
 * Lagna slots: which rashi is rising at each ~2-hour period.
 * Panchaka slots: finer classification by nakshatra of the lagna degree —
 *   transitions whenever the lagna degree crosses a nakshatra boundary.
 */
export async function computeUdayaLagna(
  dateStr: string,
  sunriseJD: number,
  lat: number,
  lng: number,
  timezone: string
): Promise<{ lagnaSlots: UdayaLagnaSlot[]; panchakaSlots: PanchakaSlot[] }> {
  const startJD = sunriseJD - 1 / 24   // 1 hour before sunrise
  const endJD   = sunriseJD + 23 / 24  // 23 hours after sunrise
  const STEP_DAYS = 2 / (24 * 60)      // sample every 2 minutes

  interface Sample {
    jd: number
    rashiIndex: number
    nakshatraIndex: number
    panchakaType: PanchakaType
  }

  const samples: Sample[] = []
  let jd = startJD
  while (jd <= endJD) {
    const asc = await sweAscendantSidereal(jd, lat, lng)
    const normalized = ((asc % 360) + 360) % 360
    samples.push({
      jd,
      rashiIndex: Math.floor(normalized / 30),
      nakshatraIndex: Math.floor(normalized / NAK_WIDTH),
      panchakaType: getPanchakaType(normalized),
    })
    jd += STEP_DAYS
  }

  // ── Rashi transitions → Udaya Lagna slots ─────────────────────────────────
  const rashiTransitions: Array<{ jd: number; rashiIndex: number }> = []
  let prevRashi = samples[0]?.rashiIndex ?? -1

  for (let i = 1; i < samples.length; i++) {
    const s = samples[i]
    if (s.rashiIndex !== prevRashi) {
      const preciseJD = await narrowRashiTransition(
        samples[i - 1].jd, s.jd, lat, lng
      )
      rashiTransitions.push({ jd: preciseJD, rashiIndex: s.rashiIndex })
      prevRashi = s.rashiIndex
    }
  }

  const lagnaSlots: UdayaLagnaSlot[] = []
  for (let i = 0; i < rashiTransitions.length; i++) {
    const curr = rashiTransitions[i]
    const next = rashiTransitions[i + 1]
    if (curr.jd > endJD) break

    // Panchaka type: based on nakshatra at the lagna's starting degree (lagnaIndex * 30°)
    const startNakIdx = Math.floor((curr.rashiIndex * 30) / NAK_WIDTH)
    const lagnaStartPanchaka: PanchakaType = PANCHAKA_BY_NAKSHATRA[startNakIdx] ?? 'good'

    lagnaSlots.push({
      lagnaIndex: curr.rashiIndex,
      lagnaName: RASHI_NAMES[curr.rashiIndex],
      startTime: formatLocalTime(Math.max(curr.jd, startJD), timezone, dateStr),
      endTime: next
        ? formatLocalTime(next.jd, timezone, dateStr)
        : formatLocalTime(endJD, timezone, dateStr),
      panchakaType: lagnaStartPanchaka,
    })
  }

  // ── Nakshatra transitions → Panchaka Rahita Muhurta slots ────────────────
  const nakTransitions: Array<{ jd: number; panchakaType: PanchakaType }> = []
  let prevNak = samples[0]?.nakshatraIndex ?? -1

  for (let i = 1; i < samples.length; i++) {
    const s = samples[i]
    if (s.nakshatraIndex !== prevNak) {
      const preciseJD = await narrowNakshatraTransition(
        samples[i - 1].jd, s.jd, lat, lng
      )
      nakTransitions.push({ jd: preciseJD, panchakaType: s.panchakaType })
      prevNak = s.nakshatraIndex
    }
  }

  const panchakaSlots: PanchakaSlot[] = []
  // First slot starts at startJD
  const firstType = samples[0]?.panchakaType ?? 'good'
  if (nakTransitions.length === 0) {
    panchakaSlots.push({
      startTime: formatLocalTime(startJD, timezone, dateStr),
      endTime: null,
      panchakaType: firstType,
    })
  } else {
    // First slot: from startJD to first nakshatra transition
    panchakaSlots.push({
      startTime: formatLocalTime(startJD, timezone, dateStr),
      endTime: formatLocalTime(nakTransitions[0].jd, timezone, dateStr),
      panchakaType: firstType,
    })
    // Middle slots
    for (let i = 0; i < nakTransitions.length - 1; i++) {
      panchakaSlots.push({
        startTime: formatLocalTime(nakTransitions[i].jd, timezone, dateStr),
        endTime: formatLocalTime(nakTransitions[i + 1].jd, timezone, dateStr),
        panchakaType: nakTransitions[i].panchakaType,
      })
    }
    // Last slot: from last transition to end of window
    const last = nakTransitions[nakTransitions.length - 1]
    panchakaSlots.push({
      startTime: formatLocalTime(last.jd, timezone, dateStr),
      endTime: null,  // open-ended (extends to end of display window)
      panchakaType: last.panchakaType,
    })
  }

  // Merge consecutive slots of the same type (especially long "good" stretches)
  const mergedSlots: PanchakaSlot[] = []
  for (const slot of panchakaSlots) {
    const last = mergedSlots[mergedSlots.length - 1]
    if (last && last.panchakaType === slot.panchakaType) {
      // Extend the previous slot's end time
      mergedSlots[mergedSlots.length - 1] = { ...last, endTime: slot.endTime }
    } else {
      mergedSlots.push(slot)
    }
  }

  return { lagnaSlots: lagnaSlots.slice(0, 12), panchakaSlots: mergedSlots }
}
