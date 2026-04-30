/**
 * Shadbala Types
 * Six-strength (Shadbala) planetary strength system for classical Vedic astrology.
 * Each planet receives a total virupa score from 6 components, compared to
 * classical required minimums to assess delivery of results.
 */

export interface SthanaBala {
  /** Exaltation strength: 0–60 virupas */
  ucchaBala: number
  /** Varga dignity average across D1, D2, D3, D7, D9, D12, D30: 0–45 virupas */
  saptavargajaBala: number
  /** Odd/even sign strength in D1 and D9: 0–30 virupas */
  ojayugmaBala: number
  /** House-based positional strength: 5, 7, or 10 virupas */
  kendradiBala: number
  /** Decanate-based strength: 0 or 15 virupas */
  drekkanaBala: number
  /** Sum of all Sthana Bala sub-components */
  total: number
}

export interface KalaBala {
  /** Day/night strength: 0–60 virupas */
  nathonnathaBala: number
  /** Lunar phase strength: 0–60 virupas */
  pakshabala: number
  /** Hour-third lord strength: 0 or 30 virupas */
  tribhagaBala: number
  /** Year lord strength: 0 or 15 virupas */
  abdaBala: number
  /** Month lord strength: 0 or 30 virupas */
  masaBala: number
  /** Weekday lord strength: 0 or 45 virupas */
  varaBala: number
  /** Hora lord strength: 0 or 60 virupas */
  horaBala: number
  /** Solstice-based strength: 0–30 virupas */
  ayanaBala: number
  /** Sum of all Kala Bala sub-components */
  total: number
}

export interface PlanetShadbala {
  planet: string
  sthanaBala: SthanaBala
  /** Directional strength: 0–60 virupas */
  digBala: number
  kalaBala: KalaBala
  /** Motional strength: 0–60 virupas */
  chestaBala: number
  /** Natural/inherent strength: fixed constant per planet */
  naisargikaBala: number
  /** Aspectual strength: −30 to +30 virupas */
  drikBala: number
  /** Sum of all 6 Shadbala components */
  total: number
  /** Classical minimum virupas required for this planet */
  requiredMinimum: number
  /** (total / requiredMinimum) * 100 */
  strengthPercent: number
  /** Qualitative strength label */
  strengthLabel: 'strong' | 'adequate' | 'weak'
}

export interface ShadbalaInput {
  planets: Record<string, {
    longitude: number
    speed: number
    retrograde: boolean
    signNumber: number
    degreeInSign: number
    combust: boolean
  }>
  ascendant: { longitude: number; signNumber: number; degreeInSign: number }
  birthDate: string
  birthTime: string
  latitude: number
  /** Birth place geographic longitude (NOT planet longitude) */
  birthplaceLongitude: number
  julianDayUT: number
  sunriseJD: number
  sunsetJD: number
}

export interface ShadbalaResult {
  version: 1
  /** Shadbala for 7 classical planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn */
  planets: PlanetShadbala[]
  generatedAt: string
}
