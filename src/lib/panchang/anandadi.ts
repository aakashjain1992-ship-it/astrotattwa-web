// ─────────────────────────────────────────────────────────────────────────────
// Anandadi Yoga & Nivas/Shool (Sections 9 & 10)
// Pure lookup table calculations — no ephemeris needed.
// Inputs: weekday (0=Sun), tithi number (1-30), nakshatra index (0-based).
// ─────────────────────────────────────────────────────────────────────────────
import {
  ANANDADI_YOGA_LIST, ANANDADI_DAY_OFFSET,
  DISHA_SHOOL, DISHA_SHOOL_REMEDY,
  RAHU_VASA, SHIVAVASA_LOCATIONS, KUMBHA_CHAKRA,
  HOMAHUTI_BY_NAKSHATRA, HOMAHUTI_BY_WEEKDAY,
} from './constants'
import type { AnandadiYogaData, NivasShoolData, TithiEntry, TimedEntry } from './types'

// ── Anandadi Yoga ─────────────────────────────────────────────────────────
/**
 * Formula:
 *   adjustedIndex = (nakshatraIndex - dayOffset + 28) % 28
 *   yoga = ANANDADI_YOGA_LIST[adjustedIndex]
 */
export function computeAnandadiYoga(
  nakshatraIndex: number, // 0-based (Ashwini=0)
  weekday: number,        // 0=Sun
  nakshatraEndTime: string | null
): AnandadiYogaData {
  const offset = ANANDADI_DAY_OFFSET[weekday] ?? 0
  // nakshatraIndex is 0-based; yoga table uses 0-based index into 28-item list
  const adjustedIndex = ((nakshatraIndex - offset) % 28 + 28) % 28
  const yoga = ANANDADI_YOGA_LIST[adjustedIndex] ?? { name: 'Unknown', auspicious: false }

  // Tamil Yoga: the next yoga in the 28-cycle (parallel system, runs concurrently)
  // It represents the upcoming yoga after the current Anandadi yoga period ends.
  const tamilYogaIndex = (adjustedIndex + 1) % 28
  const tamilYoga = ANANDADI_YOGA_LIST[tamilYogaIndex] ?? { name: 'Unknown', auspicious: false }

  // Jeevanama: 1 = Full Life (both auspicious and inauspicious yogas give 1 Full Life)
  // drikpanchang shows "1 Full Life" for all Anandadi yogas including inauspicious ones
  const jeevanama = '1 Full Life'

  // Netrama: based on nakshatra pada (pada 2 or 4 = Two Eyes; pada 1 or 3 = One Eye)
  // Since we compute this separately, we use a default here
  // (actual pada is passed from compute.ts to override if needed)
  const netrama = '2 Two Eyes'

  return {
    name: yoga.name,
    auspicious: yoga.auspicious,
    endTime: nakshatraEndTime,
    jeevanama,
    netrama,
    tamilYogaName: tamilYoga.name,
    tamilYogaAuspicious: tamilYoga.auspicious,
    tamilYogaEndTime: nakshatraEndTime, // same nakshatra boundary
  }
}

/** Override netrama based on pada */
export function getNetrama(pada: number): string {
  return (pada === 2 || pada === 4) ? '2 Two Eyes' : '1 One Eye'
}

// ── Nivas and Shool ───────────────────────────────────────────────────────

// Agnivasa: based on tithi number
export function getAgnivasa(tithiNumber: number): string {
  // Group: ceil(tithi/5) % 3 → 0=Swarga/Akasha, 1=Prithvi, 2=Patala
  const group = Math.ceil(tithiNumber / 5) % 3
  const locations = ['Akasha (Heaven)', 'Prithvi (Earth)', 'Patala (Nadir)']
  return locations[group] ?? 'Unknown'
}

// Chandra Vasa: based on Moon's rashi index (NOT tithi)
// Empirically verified: rashiIndex % 4 → East/South/West/North
export function getChandraVasa(moonRashiIndex: number): string {
  const directions = ['East', 'South', 'West', 'North']
  return directions[moonRashiIndex % 4]
}

// Shivavasa: 7-location cycle. Formula: (tithiNumber + 5) % 7
// Empirically verified against drikpanchang across 7 dates (Apr 2-8, 2026)
export function getShivavasa(tithiNumber: number): string {
  const idx = (tithiNumber + 5) % 7
  return SHIVAVASA_LOCATIONS[idx]
}

export function computeNivasShool(
  weekday: number,              // 0=Sun
  nakshatraIndex: number,       // 0-based
  tithis: TithiEntry[],         // all tithis active during the day (1 or 2)
  moonRashiIndex: number,       // at sunrise
  moonRashiChangeTime: string | null,  // local time when Moon changes rashi (null = no change today)
  moonRashiAfterChange: number, // rashi index after the change (ignored if no change)
): NivasShoolData {
  // Agnivasa: one entry per tithi
  const agnivasa: TimedEntry[] = tithis.map((t, i) => ({
    value: getAgnivasa(t.number),
    endTime: i < tithis.length - 1 ? t.endTime : null,
  }))

  // Chandra Vasa: changes when Moon changes rashi (BUG-04)
  const chandravasa: TimedEntry[] = []
  if (moonRashiChangeTime) {
    chandravasa.push({ value: getChandraVasa(moonRashiIndex), endTime: moonRashiChangeTime })
    chandravasa.push({ value: getChandraVasa(moonRashiAfterChange), endTime: null })
  } else {
    chandravasa.push({ value: getChandraVasa(moonRashiIndex), endTime: null })
  }

  // Shivavasa: one entry per tithi (BUG-05)
  const shivavasa: TimedEntry[] = tithis.map((t, i) => ({
    value: getShivavasa(t.number),
    endTime: i < tithis.length - 1 ? t.endTime : null,
  }))

  // Homahuti: nakshatra-based where verified, weekday fallback otherwise
  const homahuti = HOMAHUTI_BY_NAKSHATRA[nakshatraIndex] ?? HOMAHUTI_BY_WEEKDAY[weekday] ?? 'Unknown'

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
