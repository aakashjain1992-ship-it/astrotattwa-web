// ─────────────────────────────────────────────────────────────────────────────
// Udaya Lagna & Panchaka Rahita Muhurta
// Computes the rising sign (Lagna) at each ~2-hour slot throughout the day.
// Each lagna stays on the horizon for approximately 2 hours (varies by latitude).
// ─────────────────────────────────────────────────────────────────────────────
import { sweAscendantSidereal } from '@/lib/astrology/swissEph'
import { formatLocalTime } from './ephemeris'
import { RASHI_NAMES, PANCHAKA_TYPE } from './constants'
import type { UdayaLagnaSlot } from './types'

/**
 * Compute Udaya Lagna slots for the day.
 * Samples the ascendant every ~2 minutes to find rashi transitions.
 * Returns all 12 lagna time windows.
 */
export async function computeUdayaLagna(
  dateStr: string,
  sunriseJD: number,
  lat: number,
  lng: number,
  timezone: string
): Promise<UdayaLagnaSlot[]> {
  // Search from 1 hour before sunrise to 24 hours later
  const startJD = sunriseJD - 1 / 24
  const endJD = sunriseJD + 23 / 24

  // Sample every 2 minutes to find transitions (finer sampling reduces lagna time drift)
  const STEP_DAYS = 2 / (24 * 60)
  const samples: Array<{ jd: number; rashiIndex: number }> = []

  let jd = startJD
  while (jd <= endJD) {
    const asc = await sweAscendantSidereal(jd, lat, lng)
    const rashiIndex = Math.floor(((asc % 360) + 360) % 360 / 30)
    samples.push({ jd, rashiIndex })
    jd += STEP_DAYS
  }

  // Find transition points (where rashi changes)
  const transitions: Array<{ jd: number; rashiIndex: number }> = []
  let prevRashi = samples[0]?.rashiIndex ?? -1

  for (const sample of samples) {
    if (sample.rashiIndex !== prevRashi) {
      // Narrow down the transition with binary search
      const preciseJD = await narrowTransition(
        samples[samples.indexOf(sample) - 1]?.jd ?? sample.jd - STEP_DAYS,
        sample.jd,
        lat, lng
      )
      transitions.push({ jd: preciseJD, rashiIndex: sample.rashiIndex })
      prevRashi = sample.rashiIndex
    }
  }

  // Build slots from transitions
  const slots: UdayaLagnaSlot[] = []
  for (let i = 0; i < transitions.length; i++) {
    const curr = transitions[i]
    const next = transitions[i + 1]

    // Only include slots that overlap with the day
    if (curr.jd > endJD) break

    slots.push({
      lagnaIndex: curr.rashiIndex,
      lagnaName: RASHI_NAMES[curr.rashiIndex],
      startTime: formatLocalTime(Math.max(curr.jd, startJD), timezone, dateStr),
      endTime: next ? formatLocalTime(next.jd, timezone, dateStr) : formatLocalTime(endJD, timezone, dateStr),
      panchakaType: PANCHAKA_TYPE[curr.rashiIndex],
    })
  }

  // Ensure we have 12 slots (may be fewer near polar latitudes)
  return slots.slice(0, 12)
}

/** Binary search for precise lagna transition time */
async function narrowTransition(
  jdBefore: number,
  jdAfter: number,
  lat: number,
  lng: number,
  maxIter = 8
): Promise<number> {
  let lo = jdBefore
  let hi = jdAfter
  const targetRashi = Math.floor(((await sweAscendantSidereal(hi, lat, lng)) % 360 + 360) % 360 / 30)

  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2
    const asc = await sweAscendantSidereal(mid, lat, lng)
    const rashiMid = Math.floor(((asc % 360) + 360) % 360 / 30)
    if (rashiMid === targetRashi) hi = mid
    else lo = mid
  }

  return (lo + hi) / 2
}
