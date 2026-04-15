// ─── Lo Shu Grid Core Calculation Engine ─────────────────────────────────────
import type {
  NumerologyResult,
  PlaneResult,
  PlaneStrength,
  PlaneType,
  Arrow,
  RajYoga,
  KarmicLesson,
  SpecialCondition,
  LoShuGrid,
  LoShuGridCell,
} from '@/types/numerology'
import { calculateChaldean } from './chaldean'
import { KARMIC_LESSON_MEANINGS, ARROW_MEANINGS, RAJ_YOGA_MEANINGS } from './meanings'

// ─── Digit Extraction ─────────────────────────────────────────────────────────

/** Extract all non-zero digits from a DOB string (DD-MM-YYYY) */
export function extractDigits(dob: string): number[] {
  return dob
    .split('')
    .filter((c) => c !== '-')
    .map(Number)
    .filter((n) => n !== 0)
}

// ─── Frequency Map ────────────────────────────────────────────────────────────

/** Count occurrences of 1–9 in the digit list */
export function buildFrequency(digits: number[]): Record<number, number> {
  const freq: Record<number, number> = {}
  for (let i = 1; i <= 9; i++) freq[i] = 0
  for (const d of digits) {
    if (d >= 1 && d <= 9) freq[d] = (freq[d] ?? 0) + 1
  }
  return freq
}

// ─── Reduction ────────────────────────────────────────────────────────────────

/** Reduce a number to single digit, keeping master numbers 11, 22, 33 */
export function reduceMaster(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n
  while (n > 9) {
    n = String(n)
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0)
    if (n === 11 || n === 22 || n === 33) return n
  }
  return n
}

// ─── Life Path (Day digits only) ──────────────────────────────────────────────

/**
 * Life Path = sum of the day (DD) digits, reduced to single digit.
 * Master numbers 11, 22, 33 are preserved.
 * e.g. DOB 25-03-1992 → day = 25 → 2+5 = 7
 */
export function calcLifePath(dob: string): { raw: number; reduced: number } {
  const dd = dob.split('-')[0]
  const raw = dd
    .split('')
    .map(Number)
    .filter((n) => n !== 0)
    .reduce((sum, d) => sum + d, 0)
  return { raw, reduced: reduceMaster(raw) }
}

// ─── Destiny (All DOB digits) ─────────────────────────────────────────────────

/**
 * Destiny = sum of ALL digits in full DOB, reduced to single digit.
 * Master numbers 11, 22, 33 are preserved.
 * e.g. 25-03-1992 → 2+5+3+1+9+9+2 = 31 → 4
 */
export function calcDestiny(dob: string): { raw: number; reduced: number } {
  const digits = extractDigits(dob)
  const raw = digits.reduce((sum, d) => sum + d, 0)
  return { raw, reduced: reduceMaster(raw) }
}

// ─── Lo Shu Grid ─────────────────────────────────────────────────────────────

/**
 * Standard Lo Shu Grid layout:
 *   4 | 9 | 2   ← Mental Plane
 *   3 | 5 | 7   ← Emotional Plane
 *   8 | 1 | 6   ← Physical Plane
 */
const GRID_LAYOUT: [[number, number, number], [number, number, number], [number, number, number]] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
]

export function buildGrid(freq: Record<number, number>): LoShuGrid {
  return GRID_LAYOUT.map((row) =>
    row.map((num) => {
      const count = freq[num] ?? 0
      return count > 0 ? Array(count).fill(num) : null
    })
  ) as LoShuGrid
}

// ─── Planes Analysis ──────────────────────────────────────────────────────────

const PLANES: Array<{
  name: string
  numbers: [number, number, number]
  description: string
  type: PlaneType
}> = [
  { name: 'Mental Plane',     numbers: [4, 9, 2], description: 'Thinking, planning and intelligence', type: 'horizontal' },
  { name: 'Emotional Plane',  numbers: [3, 5, 7], description: 'Feelings, intuition and relationships', type: 'horizontal' },
  { name: 'Physical Plane',   numbers: [8, 1, 6], description: 'Action, execution and material life', type: 'horizontal' },
  { name: 'Practical Plane',  numbers: [4, 3, 8], description: 'Work ethic and discipline in action', type: 'vertical' },
  { name: 'Willpower Plane',  numbers: [9, 5, 1], description: 'Determination, focus and inner drive', type: 'vertical' },
  { name: 'Action Plane',     numbers: [2, 7, 6], description: 'Execution, decision-making and response', type: 'vertical' },
]

function strengthFromCount(count: number): PlaneStrength {
  if (count === 3) return 'Strong'
  if (count === 2) return 'Moderate'
  if (count === 1) return 'Weak'
  return 'Very Weak'
}

export function calcPlanes(freq: Record<number, number>): PlaneResult[] {
  return PLANES.map((plane) => {
    const presentCount = plane.numbers.filter((n) => (freq[n] ?? 0) > 0).length
    return {
      ...plane,
      presentCount,
      strength: strengthFromCount(presentCount),
    }
  })
}

// ─── Arrows Analysis ──────────────────────────────────────────────────────────

const ARROW_DEFINITIONS: Array<{
  numbers: [number, number, number]
  label: string
}> = [
  { numbers: [1, 5, 9], label: 'Determination' },
  { numbers: [2, 5, 8], label: 'Emotional Balance' },
  { numbers: [3, 5, 7], label: 'Spiritual Insight' },
  { numbers: [4, 5, 6], label: 'Practicality' },
  { numbers: [1, 2, 3], label: 'Planning' },
  { numbers: [7, 8, 9], label: 'Action' },
]

export function calcArrows(freq: Record<number, number>): Arrow[] {
  return ARROW_DEFINITIONS.map(({ numbers, label }) => {
    const presentCount = numbers.filter((n) => (freq[n] ?? 0) > 0).length
    const present = presentCount === 3
    const missing = presentCount === 0
    const partial = !present && !missing
    const key = numbers.join('-')
    const arrowMeaning = ARROW_MEANINGS[key]
    const meaning = present
      ? arrowMeaning?.presentDetail ?? ''
      : missing
      ? arrowMeaning?.missingDetail ?? ''
      : arrowMeaning?.partialDetail ?? ''
    return { numbers, label, present, missing, partial, presentCount, meaning }
  })
}

// ─── Raj Yogas ────────────────────────────────────────────────────────────────

const RAJ_YOGA_DEFINITIONS: Array<{
  numbers: [number, number, number]
  name: string
  altName: string
}> = [
  { numbers: [1, 5, 9], name: 'Willpower Raj Yoga',  altName: '' },
  { numbers: [2, 5, 8], name: 'Silver Raj Yoga',      altName: 'Emotional Raj Yoga' },
  { numbers: [3, 5, 7], name: 'Spiritual Raj Yoga',   altName: '' },
  { numbers: [4, 5, 6], name: 'Golden Raj Yoga',      altName: 'Practical Raj Yoga' },
]

export function calcRajYogas(freq: Record<number, number>): RajYoga[] {
  return RAJ_YOGA_DEFINITIONS.map(({ numbers, name, altName }) => {
    const active = numbers.every((n) => (freq[n] ?? 0) > 0)
    const key = numbers.join('-')
    const yogaMeaning = RAJ_YOGA_MEANINGS[key]
    return {
      numbers,
      name,
      altName,
      active,
      meaning: active ? yogaMeaning?.activeDetail ?? '' : yogaMeaning?.missingDetail ?? '',
      activeMeaning: yogaMeaning?.activeDetail ?? '',
      missingMeaning: yogaMeaning?.missingDetail ?? '',
    }
  })
}

// ─── Karmic Lessons ───────────────────────────────────────────────────────────

export function calcKarmicLessons(freq: Record<number, number>): KarmicLesson[] {
  const lessons: KarmicLesson[] = []
  for (let n = 1; n <= 9; n++) {
    if ((freq[n] ?? 0) === 0) {
      const meaning = KARMIC_LESSON_MEANINGS[n]
      if (meaning) {
        lessons.push({ number: n, lesson: meaning.lesson, detail: meaning.detail })
      }
    }
  }
  return lessons
}

// ─── Special Conditions ───────────────────────────────────────────────────────

const CORNERS = [4, 2, 8, 6]

export function calcSpecialConditions(freq: Record<number, number>): SpecialCondition[] {
  const conditions: SpecialCondition[] = []

  // Number 5 analysis
  const fiveCount = freq[5] ?? 0
  if (fiveCount === 0) {
    conditions.push({
      type: 'five-missing',
      title: 'Number 5 Missing',
      description:
        'The centre of the Lo Shu Grid is empty. Number 5 (Mercury) acts as the balance point of all energies. Its absence often signals instability — a tendency to swing between extremes without a stable anchor. Life lessons will frequently revolve around finding equilibrium, adaptability, and grounded self-expression.',
    })
  } else if (fiveCount >= 2) {
    conditions.push({
      type: 'five-repeated',
      title: `Number 5 Repeated (${fiveCount}×)`,
      description:
        `The centre of the grid is amplified with ${fiveCount} fives. Mercury's energy is intensified — bringing exceptional adaptability, curiosity, and communication skills, but also a tendency toward restlessness, scattered energy, and difficulty committing. Channelling this into structured creative pursuits is key.`,
    })
  }

  // Corner analysis
  const missingCorners = CORNERS.filter((n) => (freq[n] ?? 0) === 0)
  if (missingCorners.length >= 2) {
    conditions.push({
      type: 'corners-unstable',
      title: `Unstable Foundation (${missingCorners.length} corners missing: ${missingCorners.join(', ')})`,
      description:
        'The corners of the Lo Shu Grid (4, 2, 8, 6) represent the four pillars of worldly stability — discipline, cooperation, ambition, and harmony. With multiple corners absent, life may feel like it lacks structure. Building external routines and deliberately working on the missing corner themes can restore balance over time.',
    })
  } else if (missingCorners.length === 0) {
    conditions.push({
      type: 'corners-strong',
      title: 'All Corners Present — Stable Foundation',
      description:
        'All four corner numbers (4, 2, 8, 6) are present in your grid, indicating a naturally stable foundation. You have built-in capacity for discipline, cooperation, ambition, and harmony — the four pillars that support worldly success.',
    })
  }

  return conditions
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Full Lo Shu Grid numerology calculation.
 * @param dob  Date of birth in DD-MM-YYYY format
 * @param name Person's full name (used for Chaldean calculation)
 */
export function calculateNumerology(dob: string, name: string): NumerologyResult {
  const digits = extractDigits(dob)
  const frequency = buildFrequency(digits)   // DOB digits only — used for karmic lessons

  const lifePathCalc = calcLifePath(dob)
  const destinyCalc = calcDestiny(dob)

  // gridFrequency = DOB frequency + 1 for Life Path number + 1 for Destiny number
  // Master numbers (11, 22, 33) contribute as their reduced single digit for grid purposes
  const gridFrequency = { ...frequency }
  const lpGridNum = lifePathCalc.reduced > 9 ? reduceMaster(lifePathCalc.reduced) : lifePathCalc.reduced
  const dnGridNum  = destinyCalc.reduced  > 9 ? reduceMaster(destinyCalc.reduced)  : destinyCalc.reduced
  if (lpGridNum >= 1 && lpGridNum <= 9) gridFrequency[lpGridNum] = (gridFrequency[lpGridNum] ?? 0) + 1
  if (dnGridNum  >= 1 && dnGridNum  <= 9) gridFrequency[dnGridNum]  = (gridFrequency[dnGridNum]  ?? 0) + 1

  const grid = buildGrid(gridFrequency)

  const planes = calcPlanes(gridFrequency)
  const arrows = calcArrows(gridFrequency)
  const rajYogas = calcRajYogas(gridFrequency)
  const karmicLessons = calcKarmicLessons(frequency)          // DOB only
  const specialConditions = calcSpecialConditions(gridFrequency)
  const chaldean = calculateChaldean(name)

  const missingNumbers = Object.entries(frequency)
    .filter(([, count]) => count === 0)
    .map(([n]) => Number(n))
    .sort((a, b) => a - b)

  const presentNumbers = Object.entries(frequency)
    .filter(([, count]) => count > 0)
    .map(([n]) => Number(n))
    .sort((a, b) => a - b)

  return {
    dob,
    name,
    digits,
    frequency,
    gridFrequency,
    grid,
    lifePathNumber: lifePathCalc.reduced,
    lifePathRaw: lifePathCalc.raw,
    destinyNumber: destinyCalc.reduced,
    destinyRaw: destinyCalc.raw,
    planes,
    arrows,
    rajYogas,
    karmicLessons,
    specialConditions,
    chaldean,
    missingNumbers,
    presentNumbers,
  }
}
