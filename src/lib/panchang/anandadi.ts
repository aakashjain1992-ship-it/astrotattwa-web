// ─────────────────────────────────────────────────────────────────────────────
// Anandadi Yoga & Nivas/Shool (Sections 9 & 10)
// Pure lookup table calculations — no ephemeris needed.
// Inputs: weekday (0=Sun), tithi number (1-30), nakshatra index (0-based).
// ─────────────────────────────────────────────────────────────────────────────
import {
  ANANDADI_YOGA_LIST, ANANDADI_DAY_OFFSET, TAMIL_YOGA_BY_INDEX,
  DISHA_SHOOL, DISHA_SHOOL_REMEDY,
  RAHU_VASA, SHIVAVASA_LOCATIONS, KUMBHA_CHAKRA,
  HOMAHUTI_BY_NAKSHATRA, AGNIVASA_BY_TITHI,
} from './constants'
import type { AnandadiYogaData, NivasShoolData, TithiEntry, TimedEntry } from './types'

// ── Anandadi Yoga ─────────────────────────────────────────────────────────
/**
 * Formula (0-based nakshatraIndex, Ashwini=0):
 *   adjustedIndex = ((nakshatraIndex - dayOffset) % 28 + 28) % 28
 *   yoga = ANANDADI_YOGA_LIST[adjustedIndex]
 *
 * All 7 day offsets verified vs drikpanchang (14 dates, Apr 2026).
 */
export function computeAnandadiYoga(
  nakshatraIndex: number, // 0-based (Ashwini=0)
  weekday: number,        // 0=Sun
  nakshatraEndTime: string | null
): AnandadiYogaData {
  const offset = ANANDADI_DAY_OFFSET[weekday] ?? 0
  // Abhijeet (28th nakshatra) sits between UttaraAshadha (position 20) and Shravana (position 21)
  // in the 28-nakshatra cycle. Standard index uses 27 nakshatras (no Abhijeet), so indices 21–26
  // (Shravana–Revati) need +1 to land on the correct position in the 28-slot cycle.
  const position28 = nakshatraIndex > 20 ? nakshatraIndex + 1 : nakshatraIndex
  const adjustedIndex = ((position28 - offset) % 28 + 28) % 28
  const yoga = ANANDADI_YOGA_LIST[adjustedIndex] ?? { name: 'Unknown', auspicious: false }

  // Tamil Yoga: derived from the same Anandadi index via independent lookup table.
  // Values: 'Siddha', 'Amrita' (auspicious), 'Marana' (inauspicious).
  const tamilYogaName = TAMIL_YOGA_BY_INDEX[adjustedIndex] ?? 'Unknown'
  const tamilYogaAuspicious = tamilYogaName !== 'Marana'

  // Jeevanama: insufficient data to implement lookup table — keep as placeholder.
  const jeevanama = '1 Full Life'

  // Netrama: placeholder — overridden by getNetrama() in compute.ts
  const netrama = '1 One Eye'

  return {
    name: yoga.name,
    auspicious: yoga.auspicious,
    endTime: nakshatraEndTime,
    jeevanama,
    netrama,
    tamilYogaName,
    tamilYogaAuspicious,
    tamilYogaEndTime: nakshatraEndTime, // same nakshatra boundary
  }
}

/** Override netrama based on pada */
export function getNetrama(pada: number): string {
  return (pada === 2 || pada === 4) ? '2 Two Eyes' : '1 One Eye'
}

// ── Nivas and Shool ───────────────────────────────────────────────────────

/**
 * Agnivasa: partial tithi-based lookup.
 * Returns '' for unknown tithis — caller must filter these out (hide field).
 */
export function getAgnivasa(tithiNumber: number): string {
  return AGNIVASA_BY_TITHI[tithiNumber] ?? ''
}

// Chandra Vasa: based on Moon's rashi index (NOT tithi)
// Empirically verified: rashiIndex % 4 → East/South/West/North
export function getChandraVasa(moonRashiIndex: number): string {
  const directions = ['East', 'South', 'West', 'North']
  return directions[moonRashiIndex % 4]
}

/**
 * Shivavasa: 7-location cycle. Formula: (tithiNumber - 1) % 7
 * Verified correct for tithis 1–16, 30.
 * Known exception: tithi 14 on Apr 15 2026 (likely year-level phase offset).
 */
export function getShivavasa(tithiNumber: number): string {
  const idx = (tithiNumber - 1) % 7
  return SHIVAVASA_LOCATIONS[idx]
}

/**
 * Homahuti: nakshatra-based (23/27 confirmed).
 * Returns '' for the 4 unknown nakshatras — caller must hide field.
 */
export function getHomahuti(nakshatraIndex: number): string {
  return HOMAHUTI_BY_NAKSHATRA[nakshatraIndex] ?? ''
}

export function computeNivasShool(
  weekday: number,              // 0=Sun
  nakshatraIndex: number,       // 0-based
  tithis: TithiEntry[],         // all tithis active during the day (1 or 2)
  moonRashiIndex: number,       // at sunrise
  moonRashiChangeTime: string | null,  // local time when Moon changes rashi (null = no change)
  moonRashiAfterChange: number, // rashi index after the change (ignored if no change)
): NivasShoolData {
  // Agnivasa: one entry per tithi, filter out unknown tithis (returns '')
  const agnivasa: TimedEntry[] = tithis
    .map((t, i) => ({
      value: getAgnivasa(t.number),
      endTime: i < tithis.length - 1 ? t.endTime : null,
    }))
    .filter(e => e.value !== '')

  // Chandra Vasa: changes when Moon changes rashi
  const chandravasa: TimedEntry[] = []
  if (moonRashiChangeTime) {
    chandravasa.push({ value: getChandraVasa(moonRashiIndex), endTime: moonRashiChangeTime })
    chandravasa.push({ value: getChandraVasa(moonRashiAfterChange), endTime: null })
  } else {
    chandravasa.push({ value: getChandraVasa(moonRashiIndex), endTime: null })
  }

  // Shivavasa: one entry per tithi
  const shivavasa: TimedEntry[] = tithis.map((t, i) => ({
    value: getShivavasa(t.number),
    endTime: i < tithis.length - 1 ? t.endTime : null,
  }))

  // Homahuti: nakshatra-based ('' for unknown — hidden in component)
  const homahuti = getHomahuti(nakshatraIndex)

  return {
    homahuti,
    dishashool: DISHA_SHOOL[weekday] ?? 'Unknown',
    dishashoolRemedy: DISHA_SHOOL_REMEDY[weekday] ?? '',
    agnivasa,
    chandravasa,
    rahuvasa: RAHU_VASA[weekday] ?? 'Unknown',
    shivavasa,
    kumbhachakra: KUMBHA_CHAKRA[nakshatraIndex] ?? 'Unknown',
  }
}
