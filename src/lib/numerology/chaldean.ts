// ─── Chaldean Name Numerology ─────────────────────────────────────────────────
import type { ChaldeanResult } from '@/types/numerology'
import { reduceMaster } from './calculate'

/**
 * Chaldean letter values.
 * Key difference from Pythagorean: 9 is never assigned to any letter
 * (9 is considered divine/sacred in Chaldean numerology).
 *
 * A=1  B=2  C=3  D=4  E=5  F=8  G=3  H=5  I=1
 * J=1  K=2  L=3  M=4  N=5  O=7  P=8  Q=1  R=2
 * S=3  T=4  U=6  V=6  W=6  X=5  Y=1  Z=7
 */
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
}

const MASTER_NUMBERS = new Set([11, 22, 33])

/**
 * Calculate the Chaldean name number for a given name string.
 * - Only alphabetic characters are counted (spaces, hyphens ignored).
 * - Result is reduced to single digit, keeping master numbers 11/22/33.
 */
export function calculateChaldean(name: string): ChaldeanResult {
  const cleanName = name.trim().toUpperCase()

  const letterBreakdown = cleanName
    .split('')
    .filter((c) => /[A-Z]/.test(c))
    .map((letter) => ({
      letter,
      value: CHALDEAN_MAP[letter] ?? 0,
    }))

  const totalValue = letterBreakdown.reduce((sum, { value }) => sum + value, 0)
  const reducedValue = reduceMaster(totalValue)

  return {
    name: name.trim(),
    totalValue,
    reducedValue,
    letterBreakdown,
    isMasterNumber: MASTER_NUMBERS.has(reducedValue),
  }
}

/** Get the Chaldean value for a single letter (uppercase) */
export function getLetterValue(letter: string): number {
  return CHALDEAN_MAP[letter.toUpperCase()] ?? 0
}
