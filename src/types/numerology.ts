// ─── Lo Shu Grid Numerology Types ────────────────────────────────────────────

export type PlaneStrength = 'Strong' | 'Moderate' | 'Weak' | 'Very Weak'
export type PlaneType = 'horizontal' | 'vertical'

export interface PlaneResult {
  name: string
  numbers: [number, number, number]
  presentCount: number
  strength: PlaneStrength
  description: string
  type: PlaneType
}

export interface Arrow {
  numbers: [number, number, number]
  label: string
  present: boolean          // true = all 3 present
  missing: boolean          // true = all 3 absent
  partial: boolean          // true = 1 or 2 present
  presentCount: number
  meaning: string           // context-specific meaning
}

export interface RajYoga {
  numbers: [number, number, number]
  name: string
  altName: string
  active: boolean
  meaning: string
  activeMeaning: string
  missingMeaning: string
}

export interface KarmicLesson {
  number: number
  lesson: string
  detail: string
}

export interface SpecialCondition {
  type: 'five-missing' | 'five-repeated' | 'corners-unstable' | 'corners-strong'
  title: string
  description: string
}

export interface ChaldeanLetterResult {
  letter: string
  value: number
}

export interface ChaldeanResult {
  name: string
  totalValue: number
  reducedValue: number     // master numbers 11/22/33 kept
  letterBreakdown: ChaldeanLetterResult[]
  isMasterNumber: boolean
}

// 3×3 grid — each cell contains repeated digit array or null if absent
export type LoShuGridCell = number[] | null
export type LoShuGrid = [[LoShuGridCell, LoShuGridCell, LoShuGridCell], [LoShuGridCell, LoShuGridCell, LoShuGridCell], [LoShuGridCell, LoShuGridCell, LoShuGridCell]]

export interface NumerologyResult {
  dob: string                          // DD-MM-YYYY
  name: string
  digits: number[]                     // extracted, zeros removed
  frequency: Record<number, number>    // 1–9 → count (DOB only, used for karmic lessons)
  gridFrequency: Record<number, number> // frequency + LP + Destiny (used for grid/planes/arrows/yogas)
  grid: LoShuGrid
  lifePathNumber: number               // sum of day digits, reduced, master kept
  lifePathRaw: number
  destinyNumber: number                // sum of all DOB digits, reduced, master kept
  destinyRaw: number
  planes: PlaneResult[]
  arrows: Arrow[]
  rajYogas: RajYoga[]
  karmicLessons: KarmicLesson[]        // only for missing numbers
  specialConditions: SpecialCondition[]
  chaldean: ChaldeanResult
  missingNumbers: number[]
  presentNumbers: number[]
}

export interface SavedNumerologyReading {
  id: string
  user_id: string
  name: string
  dob: string
  result_json: NumerologyResult
  created_at: string
}

// ─── Compatibility Types ──────────────────────────────────────────────────────

export interface NumberPairCompatibility {
  n1: number
  n2: number
  score: number       // 0-100
  label: string       // "Harmonious" | "Compatible" | "Neutral" | "Challenging"
  description: string
}

export interface GridCompatibility {
  shared: number[]           // numbers present in both grids (by gridFrequency)
  missingInBoth: number[]    // numbers absent from both grids
  p1Only: number[]           // what person1 has that person2 lacks
  p2Only: number[]           // what person2 has that person1 lacks
  complementaryScore: number // 0-100
}

export interface ArrowCompatibility {
  bothPresent: string[]   // arrow labels both carry (all 3 numbers present in both)
  bothMissing: string[]   // arrows both lack entirely
  p1Only: string[]        // arrows only person1 carries
  p2Only: string[]        // arrows only person2 carries
  harmonyScore: number    // 0-100
}

export interface YogaCompatibility {
  bothActive: string[]    // yoga names both have active
  p1Only: string[]
  p2Only: string[]
  alignmentScore: number  // 0-100
}

export interface CompatibilityScoreBreakdown {
  lifePath: number     // 0-30
  destiny: number      // 0-20
  grid: number         // 0-20
  arrows: number       // 0-15
  yogas: number        // 0-15
}

export interface CompatibilityResult {
  person1: NumerologyResult
  person2: NumerologyResult
  overallScore: number
  scoreBreakdown: CompatibilityScoreBreakdown
  lpCompatibility: NumberPairCompatibility
  destinyCompatibility: NumberPairCompatibility
  gridCompatibility: GridCompatibility
  arrowCompatibility: ArrowCompatibility
  yogaCompatibility: YogaCompatibility
  strengths: string[]
  challenges: string[]
  advice: string
}

export interface SavedCompatibilityReading {
  id: string
  user_id: string
  name1: string
  dob1: string
  name2: string
  dob2: string
  result_json: CompatibilityResult
  created_at: string
}

// For the number meanings reference
export interface NumberMeaning {
  number: number
  planet: string
  element: string
  keyword: string
  trait: string
  strength: string       // what it gives when present
  challenge: string      // what happens when missing/overdone
  career: string
  relationships: string
}

export interface ArrowMeaning {
  key: string
  label: string
  numbers: [number, number, number]
  presentTitle: string
  presentDetail: string
  missingTitle: string
  missingDetail: string
  partialDetail: string
}

export interface RajYogaMeaning {
  key: string
  name: string
  altName: string
  numbers: [number, number, number]
  activeDetail: string
  missingDetail: string
}
