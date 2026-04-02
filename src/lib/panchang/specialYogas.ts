// ─────────────────────────────────────────────────────────────────────────────
// Special Yoga Detection
// Check for Ganda Mula, Panchaka, Bhadra, Dwipushkar, Tripushkar,
// Ravi Pushya, Guru Pushya, Sarvartha Siddhi, Amrit Siddhi, etc.
// ─────────────────────────────────────────────────────────────────────────────
import {
  GANDA_MULA_NAKSHATRAS, DWIPUSHKAR_WEEKDAYS, DWIPUSHKAR_TITHIS,
  DWIPUSHKAR_NAKSHATRAS, TRIPUSHKAR_TITHIS,
  SARVARTHA_SIDDHI_NAKSHATRAS, AMRIT_SIDDHI_NAKSHATRA,
} from './constants'
import type { SpecialYoga } from './types'

/** Nakshatra index (0-based), tithi number (1-30), weekday (0=Sun) */
export function detectSpecialYogas(
  nakshatraIndex: number,   // 0-based
  tithiNumber: number,      // 1-30
  weekday: number,          // 0=Sun
  moonRashiIndex: number,   // 0-based Mesha=0
  karanaNames: string[]     // karanas active today
): SpecialYoga[] {
  const yogas: SpecialYoga[] = []

  // ── Bhadra (Vishti Karana) ───────────────────────────────────────────
  if (karanaNames.some(k => k.toLowerCase().includes('vishti'))) {
    yogas.push({
      name: 'Bhadra (Vishti)',
      description: 'Vishti (Bhadra) Karana is active — inauspicious for new beginnings.',
      auspicious: false,
    })
  }

  // ── Ganda Mula ───────────────────────────────────────────────────────
  if (GANDA_MULA_NAKSHATRAS.has(nakshatraIndex)) {
    yogas.push({
      name: 'Ganda Mula',
      description: 'Moon in Ganda Mula nakshatra — requires special remedies.',
      auspicious: false,
    })
  }

  // ── Panchaka ─────────────────────────────────────────────────────────
  // Moon in Kumbha (10) or Meena (11) rashi
  if (moonRashiIndex === 10 || moonRashiIndex === 11) {
    yogas.push({
      name: 'Panchaka',
      description: 'Moon in Aquarius/Pisces — Panchaka period. Avoid inauspicious activities.',
      auspicious: false,
    })
  }

  // ── Ravi Pushya Yoga ─────────────────────────────────────────────────
  if (weekday === 0 && nakshatraIndex === 7) { // Sunday + Pushya (index 7)
    yogas.push({
      name: 'Ravi Pushya Yoga',
      description: 'Very auspicious — Sun in Pushya on Sunday. Excellent for new ventures.',
      auspicious: true,
    })
  }

  // ── Guru Pushya Yoga ─────────────────────────────────────────────────
  if (weekday === 4 && nakshatraIndex === 7) { // Thursday + Pushya
    yogas.push({
      name: 'Guru Pushya Yoga',
      description: 'Highly auspicious — Moon in Pushya on Thursday. Ideal for investments.',
      auspicious: true,
    })
  }

  // ── Dwipushkar Yoga ──────────────────────────────────────────────────
  if (
    DWIPUSHKAR_WEEKDAYS.has(weekday) &&
    DWIPUSHKAR_TITHIS.has(tithiNumber) &&
    DWIPUSHKAR_NAKSHATRAS.has(nakshatraIndex)
  ) {
    yogas.push({
      name: 'Dwipushkar Yoga',
      description: 'Actions done today are doubled — good deeds bring double reward, bad deeds double harm.',
      auspicious: true,
    })
  }

  // ── Tripushkar Yoga ──────────────────────────────────────────────────
  if (
    DWIPUSHKAR_WEEKDAYS.has(weekday) &&
    TRIPUSHKAR_TITHIS.has(tithiNumber) &&
    DWIPUSHKAR_NAKSHATRAS.has(nakshatraIndex)
  ) {
    yogas.push({
      name: 'Tripushkar Yoga',
      description: 'Actions done today are tripled — extremely powerful for good deeds.',
      auspicious: true,
    })
  }

  // ── Sarvartha Siddhi Yoga ────────────────────────────────────────────
  const sarNaks = SARVARTHA_SIDDHI_NAKSHATRAS[weekday] ?? []
  if (sarNaks.includes(nakshatraIndex)) {
    yogas.push({
      name: 'Sarvartha Siddhi Yoga',
      description: 'Auspicious yoga — work started today is likely to succeed.',
      auspicious: true,
    })
  }

  // ── Amrit Siddhi Yoga ────────────────────────────────────────────────
  if (AMRIT_SIDDHI_NAKSHATRA[weekday] === nakshatraIndex) {
    yogas.push({
      name: 'Amrit Siddhi Yoga',
      description: 'Very powerful auspicious yoga — excellent for important work.',
      auspicious: true,
    })
  }

  // ── Ravi Yoga ────────────────────────────────────────────────────────
  // Sunday AND Moon in specific nakshatras (Krittika, Uttara Phalguni, Uttara Ashadha)
  if (weekday === 0 && (nakshatraIndex === 2 || nakshatraIndex === 11 || nakshatraIndex === 20)) {
    yogas.push({
      name: 'Ravi Yoga',
      description: 'Sun-related auspicious yoga — good for leadership and government matters.',
      auspicious: true,
    })
  }

  // ── Aadal Yoga ───────────────────────────────────────────────────────
  // Thursday + Vishakha nakshatra (index 15) OR Rohini (3) on Monday ⚠️ verify
  if ((weekday === 4 && nakshatraIndex === 15) || (weekday === 1 && nakshatraIndex === 3)) {
    yogas.push({
      name: 'Aadal Yoga',
      description: 'Special combination of weekday and nakshatra.',
      auspicious: true,
    })
  }

  // ── Vidaal Yoga ──────────────────────────────────────────────────────
  // Specific inauspicious nakshatra+weekday combination ⚠️ verify
  if (weekday === 2 && (nakshatraIndex === 5 || nakshatraIndex === 6)) { // Tue + Ardra/Punarvasu
    yogas.push({
      name: 'Vidaal Yoga',
      description: 'Mildly inauspicious combination — avoid starting new work.',
      auspicious: false,
    })
  }

  // ── Jwalamukhi Yoga ──────────────────────────────────────────────────
  // Ashtami/Navami + Krittika/Magha/Vishakha/Mula ⚠️ verify
  if (
    (tithiNumber === 8 || tithiNumber === 9 || tithiNumber === 23 || tithiNumber === 24) &&
    (nakshatraIndex === 2 || nakshatraIndex === 9 || nakshatraIndex === 15 || nakshatraIndex === 18)
  ) {
    yogas.push({
      name: 'Jwalamukhi Yoga',
      description: 'Fiery yoga — caution advised, especially with fire and sharp objects.',
      auspicious: false,
    })
  }

  return yogas
}
