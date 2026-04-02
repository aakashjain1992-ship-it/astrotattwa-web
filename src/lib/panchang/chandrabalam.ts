// ─────────────────────────────────────────────────────────────────────────────
// Chandrabalam & Tarabalam
// Chandrabalam: Moon sign favorability for people based on birth rashi.
// Tarabalam: Nakshatra favorability based on birth nakshatra vs current nakshatra.
// ─────────────────────────────────────────────────────────────────────────────
import { RASHI_NAMES, NAKSHATRA_NAMES, TARA_QUALITY } from './constants'
import type { ChandrabalamData, TarabalamData } from './types'

/**
 * Chandrabalam: Favorable for birth rashis that are:
 * Current Moon Rashi, 3rd, 6th, 7th, 10th, 11th from current Moon rashi.
 * (1-indexed positions from current rashi, wrapping around 12 rashis)
 */
export function computeChandrabalam(moonRashiIndex: number): ChandrabalamData {
  const offsets = [0, 2, 5, 6, 9, 10] // positions: same, 3rd-1, 6th-1, 7th-1, 10th-1, 11th-1
  const favorableRashis = offsets.map(offset => {
    const idx = (moonRashiIndex + offset) % 12
    return RASHI_NAMES[idx]
  })
  return {
    currentMoonRashi: RASHI_NAMES[moonRashiIndex],
    favorableRashis,
  }
}

/**
 * Tarabalam: For each of the 27 nakshatras as a birth nakshatra,
 * calculate the tara count from current nakshatra and determine if favorable.
 *
 * Tara count = ((currentNakshatraIndex - birthNakshatraIndex + 27) % 27) + 1
 * Favorable taras: 2 (Sampat), 4 (Kshema), 6 (Sadhana), 8 (Mitra), 9 (Param Mitra)
 * Mixed: 1 (Janma)
 * Bad: 3 (Vipat), 5 (Pratyak), 7 (Vadha)
 */
export function computeTarabalam(currentNakshatraIndex: number): TarabalamData {
  const favorableNakshatras: string[] = []

  for (let birthIdx = 0; birthIdx < 27; birthIdx++) {
    // Tara count cycles in groups of 9
    const taraRaw = ((currentNakshatraIndex - birthIdx + 27) % 27) + 1
    const taraInCycle = ((taraRaw - 1) % 9) + 1 // 1–9
    const quality = TARA_QUALITY[taraInCycle - 1]
    if (quality === 'good' || quality === 'mixed') {
      favorableNakshatras.push(NAKSHATRA_NAMES[birthIdx])
    }
  }

  return {
    currentNakshatra: NAKSHATRA_NAMES[currentNakshatraIndex],
    favorableNakshatras,
  }
}
