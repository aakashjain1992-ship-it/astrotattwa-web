// ─────────────────────────────────────────────────────────────────────────────
// Anandadi Yoga & Nivas/Shool (Sections 9 & 10)
// Pure lookup table calculations — no ephemeris needed.
// Inputs: weekday (0=Sun), tithi number (1-30), nakshatra index (0-based).
// ─────────────────────────────────────────────────────────────────────────────
import {
  ANANDADI_YOGA_LIST, ANANDADI_DAY_OFFSET,
  HOMAHUTI_BY_WEEKDAY, DISHA_SHOOL, DISHA_SHOOL_REMEDY,
  RAHU_VASA, SHIVAVASA_LOCATIONS, KUMBHA_CHAKRA,
} from './constants'
import type { AnandadiYogaData, NivasShoolData } from './types'

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

// Chandra Vasa: based on tithi number
export function getChandraVasa(tithiNumber: number): string {
  // Tithis 1-5→East, 6-10→South, 11-15→West, 16-20→North, 21-25→East, 26-30→South
  const directions = ['East', 'South', 'West', 'North']
  const groupIdx = Math.floor((tithiNumber - 1) / 5) % 4
  return directions[groupIdx]
}

// Shivavasa: based on tithi number (5-cycle: Kailash, Bhojana, Nandi, Shmashana, Gowri)
export function getShivavasa(tithiNumber: number): string {
  const idx = (tithiNumber - 1) % 5
  return SHIVAVASA_LOCATIONS[idx]
}

export function computeNivasShool(
  weekday: number,       // 0=Sun
  tithiNumber: number,   // 1-30
  nakshatraIndex: number, // 0-based
  tithiEndTime: string | null,
): NivasShoolData {
  const agnivasa = getAgnivasa(tithiNumber)
  const chandravasa = getChandraVasa(tithiNumber)
  const shivavasa = getShivavasa(tithiNumber)

  return {
    homahuti: HOMAHUTI_BY_WEEKDAY[weekday] ?? 'Unknown',
    dishashool: DISHA_SHOOL[weekday] ?? 'Unknown',
    dishashoolRemedy: DISHA_SHOOL_REMEDY[weekday] ?? '',
    agnivasa,
    agnivisaEndTime: tithiEndTime,
    chandravasa,
    chandravaisaEndTime: tithiEndTime,
    rahuvasa: RAHU_VASA[weekday] ?? 'Unknown',
    shivavasa,
    shivavasaEndTime: tithiEndTime,
    kumbhachakra: KUMBHA_CHAKRA[nakshatraIndex] ?? 'Unknown',
  }
}
