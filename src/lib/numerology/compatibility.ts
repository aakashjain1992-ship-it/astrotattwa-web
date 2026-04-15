// ─── Lo Shu Grid Compatibility Engine ────────────────────────────────────────
import type {
  NumerologyResult,
  CompatibilityResult,
  NumberPairCompatibility,
  GridCompatibility,
  ArrowCompatibility,
  YogaCompatibility,
  CompatibilityScoreBreakdown,
} from "@/types/numerology"
import {
  getLPPairMeaning,
  getCompatibilityLabel,
} from "./compatibilityMeanings"

// ─── Single-digit normaliser (for master numbers in grid context) ──────────────

function toGridDigit(n: number): number {
  if (n <= 9) return n
  return String(n)
    .split("")
    .map(Number)
    .reduce((a, b) => a + b, 0)
}

// ─── Life Path / Destiny Compatibility ────────────────────────────────────────

function calcNumberPairCompatibility(
  n1: number,
  n2: number
): NumberPairCompatibility {
  const meaning = getLPPairMeaning(n1, n2)
  return {
    n1,
    n2,
    score: meaning.score,
    label: meaning.label,
    description: meaning.description,
  }
}

// ─── Grid Compatibility ───────────────────────────────────────────────────────

function calcGridCompatibility(
  freq1: Record<number, number>,
  freq2: Record<number, number>
): GridCompatibility {
  const shared: number[] = []
  const missingInBoth: number[] = []
  const p1Only: number[] = []
  const p2Only: number[] = []

  for (let n = 1; n <= 9; n++) {
    const has1 = (freq1[n] ?? 0) > 0
    const has2 = (freq2[n] ?? 0) > 0

    if (has1 && has2) shared.push(n)
    else if (!has1 && !has2) missingInBoth.push(n)
    else if (has1 && !has2) p1Only.push(n)
    else if (!has1 && has2) p2Only.push(n)
  }

  // Complementary score: reward what one has that fills the other's gap
  // Max complementary = all 9 numbers collectively covered
  const totalCovered = new Set([...shared, ...p1Only, ...p2Only]).size
  const complementaryRaw = totalCovered / 9

  // Penalise shared blind spots (both missing same numbers)
  const blindSpotPenalty = missingInBoth.length * 4  // -4 pts per shared gap

  const complementaryScore = Math.max(
    0,
    Math.min(100, Math.round(complementaryRaw * 100 - blindSpotPenalty))
  )

  return { shared, missingInBoth, p1Only, p2Only, complementaryScore }
}

// ─── Arrow Compatibility ──────────────────────────────────────────────────────

const ARROW_LABELS: Record<string, string> = {
  "1-5-9": "Determination",
  "2-5-8": "Emotional Balance",
  "3-5-7": "Spiritual Insight",
  "4-5-6": "Practicality",
  "1-2-3": "Planning",
  "7-8-9": "Action",
}

function arrowKey(nums: number[]): string {
  return [...nums].sort((a, b) => a - b).join("-")
}

const ARROW_DEFS: Array<[number, number, number]> = [
  [1, 5, 9],
  [2, 5, 8],
  [3, 5, 7],
  [4, 5, 6],
  [1, 2, 3],
  [7, 8, 9],
]

function hasArrow(freq: Record<number, number>, nums: [number, number, number]): boolean {
  return nums.every((n) => (freq[n] ?? 0) > 0)
}

function calcArrowCompatibility(
  freq1: Record<number, number>,
  freq2: Record<number, number>
): ArrowCompatibility {
  const bothPresent: string[] = []
  const bothMissing: string[] = []
  const p1Only: string[] = []
  const p2Only: string[] = []

  for (const nums of ARROW_DEFS) {
    const has1 = hasArrow(freq1, nums)
    const has2 = hasArrow(freq2, nums)
    const key = arrowKey(nums)
    const label = ARROW_LABELS[key] ?? key

    if (has1 && has2) bothPresent.push(label)
    else if (!has1 && !has2) bothMissing.push(label)
    else if (has1) p1Only.push(label)
    else p2Only.push(label)
  }

  // Score: shared strengths good, complementary also good, shared gaps neutral
  const sharedStrengthScore = bothPresent.length * 20      // up to 120 raw
  const complementaryScore = (p1Only.length + p2Only.length) * 10  // up to 120 raw

  const raw = (sharedStrengthScore + complementaryScore) / 2.4  // normalise ~0-100
  const harmonyScore = Math.min(100, Math.round(raw))

  return { bothPresent, bothMissing, p1Only, p2Only, harmonyScore }
}

// ─── Raj Yoga Compatibility ───────────────────────────────────────────────────

function calcYogaCompatibility(
  r1: NumerologyResult,
  r2: NumerologyResult
): YogaCompatibility {
  const active1 = r1.rajYogas.filter((y) => y.active).map((y) => y.name)
  const active2 = r2.rajYogas.filter((y) => y.active).map((y) => y.name)
  const set1 = new Set(active1)
  const set2 = new Set(active2)

  const bothActive = active1.filter((n) => set2.has(n))
  const p1Only = active1.filter((n) => !set2.has(n))
  const p2Only = active2.filter((n) => !set1.has(n))

  // Score: shared active yogas are excellent; both having yogas (even different) is good
  const bothActiveScore = bothActive.length * 35   // up to 140
  const uniqueScore = (p1Only.length + p2Only.length) * 10  // up to 80
  const raw = (bothActiveScore + uniqueScore) / 2.2
  const alignmentScore = Math.min(100, Math.round(raw))

  return { bothActive, p1Only, p2Only, alignmentScore }
}

// ─── Overall Score ────────────────────────────────────────────────────────────

function calcScoreBreakdown(
  lpScore: number,
  destScore: number,
  gridScore: number,
  arrowScore: number,
  yogaScore: number
): CompatibilityScoreBreakdown {
  // Normalise each component to its max contribution
  return {
    lifePath: Math.round((lpScore / 100) * 30),
    destiny: Math.round((destScore / 100) * 20),
    grid: Math.round((gridScore / 100) * 20),
    arrows: Math.round((arrowScore / 100) * 15),
    yogas: Math.round((yogaScore / 100) * 15),
  }
}

// ─── Strengths & Challenges ───────────────────────────────────────────────────

function buildStrengthsAndChallenges(
  lpMeaning: ReturnType<typeof getLPPairMeaning>,
  grid: GridCompatibility,
  arrows: ArrowCompatibility,
  yogas: YogaCompatibility,
  score: number
): { strengths: string[]; challenges: string[]; advice: string } {
  const strengths: string[] = []
  const challenges: string[] = []

  // From LP pair
  if (lpMeaning.strengths.length > 0) strengths.push(lpMeaning.strengths[0])
  if (lpMeaning.challenges.length > 0) challenges.push(lpMeaning.challenges[0])

  // Grid analysis
  if (grid.complementaryScore >= 70) {
    strengths.push(
      grid.p1Only.length > 0 && grid.p2Only.length > 0
        ? `Highly complementary grids — you fill each other's gaps across numbers ${grid.p1Only.join(", ")} and ${grid.p2Only.join(", ")}`
        : "Well-balanced combined number presence"
    )
  }
  if (grid.missingInBoth.length >= 3) {
    challenges.push(
      `Shared blind spots: both of you are missing ${grid.missingInBoth.join(", ")} — these themes require conscious attention`
    )
  }

  // Arrows
  if (arrows.bothPresent.length > 0) {
    strengths.push(`Shared Arrow of ${arrows.bothPresent.join(" & ")} — aligned natural strengths`)
  }
  if (arrows.bothMissing.length >= 2) {
    challenges.push(`Both lack the Arrow of ${arrows.bothMissing.slice(0, 2).join(" and ")} — a shared growth area`)
  }

  // Yogas
  if (yogas.bothActive.length > 0) {
    strengths.push(`Both carry the ${yogas.bothActive.join(" & ")} — exceptional alignment in life purpose`)
  }

  // Build advice
  let advice = lpMeaning.description + " "
  if (score >= 80) {
    advice += "Your numerological alignment is strong. Focus on channelling your combined energy toward a shared vision — you have the compatibility to build something truly lasting."
  } else if (score >= 65) {
    advice += "There is real compatibility here, with some areas requiring conscious nurturing. Lean into your complementary differences rather than letting them become friction points."
  } else if (score >= 50) {
    advice += "This pairing has genuine potential but requires more active effort than most. Understanding each other's core number drives — and respecting them — is the foundation for success."
  } else {
    advice += "This is a growth-oriented pairing where differences run deep. The work is harder, but so is the potential for transformation. Awareness, patience, and genuine appreciation of contrast are essential."
  }

  return { strengths: strengths.slice(0, 4), challenges: challenges.slice(0, 4), advice }
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function calculateCompatibility(
  person1: NumerologyResult,
  person2: NumerologyResult
): CompatibilityResult {
  const lp1 = toGridDigit(person1.lifePathNumber)
  const lp2 = toGridDigit(person2.lifePathNumber)
  const dn1 = toGridDigit(person1.destinyNumber)
  const dn2 = toGridDigit(person2.destinyNumber)

  const lpCompatibility = calcNumberPairCompatibility(lp1, lp2)
  const destinyCompatibility = calcNumberPairCompatibility(dn1, dn2)

  const gridCompatibility = calcGridCompatibility(
    person1.gridFrequency,
    person2.gridFrequency
  )
  const arrowCompatibility = calcArrowCompatibility(
    person1.gridFrequency,
    person2.gridFrequency
  )
  const yogaCompatibility = calcYogaCompatibility(person1, person2)

  const breakdown = calcScoreBreakdown(
    lpCompatibility.score,
    destinyCompatibility.score,
    gridCompatibility.complementaryScore,
    arrowCompatibility.harmonyScore,
    yogaCompatibility.alignmentScore
  )

  const overallScore =
    breakdown.lifePath +
    breakdown.destiny +
    breakdown.grid +
    breakdown.arrows +
    breakdown.yogas

  const lpMeaning = getLPPairMeaning(lp1, lp2)
  const { strengths, challenges, advice } = buildStrengthsAndChallenges(
    lpMeaning,
    gridCompatibility,
    arrowCompatibility,
    yogaCompatibility,
    overallScore
  )

  // Set labels on pair objects based on actual scores
  lpCompatibility.label = getCompatibilityLabel(lpCompatibility.score)
  destinyCompatibility.label = getCompatibilityLabel(destinyCompatibility.score)

  return {
    person1,
    person2,
    overallScore,
    scoreBreakdown: breakdown,
    lpCompatibility,
    destinyCompatibility,
    gridCompatibility,
    arrowCompatibility,
    yogaCompatibility,
    strengths,
    challenges,
    advice,
  }
}
