// ─────────────────────────────────────────────────────────────────────────────
// Panchang Types
// All panchang-specific TypeScript types and interfaces.
// ─────────────────────────────────────────────────────────────────────────────

/** "HH:MM" or "HH:MM, MMM DD" when crossing midnight */
export type LocalTime = string

export interface TithiEntry {
  number: number           // 1–30 (15=Purnima, 30=Amavasya)
  name: string             // "Pratipada", "Purnima", etc.
  paksha: 'Shukla' | 'Krishna'
  endTime: LocalTime | null // null = extends past midnight
}

export interface NakshatraEntry {
  index: number            // 1–27
  name: string
  pada: number             // 1–4
  endTime: LocalTime | null
}

export interface YogaEntry {
  index: number            // 1–27
  name: string
  auspicious: boolean
  endTime: LocalTime | null
}

export interface KaranaEntry {
  name: string
  endTime: LocalTime | null
}

export interface VaraData {
  name: string             // "Guruvara"
  ruling_planet: string    // "Jupiter"
}

export interface SunMoonPosition {
  longitude: number        // sidereal degrees 0–360
  rashi: string            // Sanskrit rashi name
  rashiIndex: number       // 0–11
  nakshatraIndex: number   // 0–26
  nakshatraName: string
  pada: number             // 1–4
}

export interface AuspiciousTiming {
  start: LocalTime
  end: LocalTime
}

export interface InauspiciousTiming {
  start: LocalTime
  end: LocalTime
}

export interface SpecialYoga {
  name: string
  description: string
  auspicious: boolean      // false = inauspicious
}

export interface ChandrabalamData {
  currentMoonRashi: string
  favorableRashis: string[]  // 6 rashis: current + 3rd,6th,7th,10th,11th
}

export interface TarabalamData {
  currentNakshatra: string
  favorableNakshatras: string[]  // nakshatras with favorable tara
}

export interface LunarCalendar {
  vikramSamvat: number
  vikramSamvatName: string     // "Siddharthi", "Kilaka", etc.
  shakaSamvat: number
  gujaratiSamvat: number
  chandramasaPurnimanta: string // "Chaitra", "Vaishakha", etc.
  chandramasaAmanta: string
  pravishte: number             // days elapsed in lunar month
}

export interface RituAyana {
  drikRitu: string    // "Vasant", "Grishma", etc.
  vedicRitu: string
  drikAyana: 'Uttarayana' | 'Dakshinayana'
  vedicAyana: 'Uttarayana' | 'Dakshinayana'
  madhyahna: LocalTime  // local noon
  dinamana: string      // day duration "Xh Ym"
  ratrimana: string     // night duration "Xh Ym"
}

export interface OtherCalendars {
  kaliyuga: number
  kaliAhargana: number
  julianDate: string
  julianDay: number
  lahiriAyanamsha: number
  nationalCivilDate: string
  rataDie: number
  modifiedJulianDay: number
}

export interface AnandadiYogaData {
  name: string
  auspicious: boolean
  endTime: LocalTime | null  // changes with nakshatra
  jeevanama: string          // "1 Full Life"
  netrama: string            // "2 Two Eyes"
}

// Section 10: Nivas and Shool
export interface NivasShoolData {
  homahuti: string           // weekday-based planet
  dishashool: string         // inauspicious travel direction
  dishashoolRemedy: string   // remedy
  agnivasa: string           // tithi-based: Swarga/Prithvi/Patala + endTime
  agnivisaEndTime: LocalTime | null
  chandravasa: string        // tithi-based direction
  chandravaisaEndTime: LocalTime | null
  rahuvasa: string           // weekday-based direction
  shivavasa: string          // tithi-based location
  shivavasaEndTime: LocalTime | null
  kumbhachakra: string       // nakshatra-based direction
}

export interface MantriMandala {
  vsYear: number
  raja: string
  mantri: string
  sasyadhipati: string
  dhanadhipati: string
  rasadhipati: string
  senadhipati: string
  dhanyadhipati: string
  meghadhipati: string
  nirasadhipati: string
  phaladhipati: string
}

export interface UdayaLagnaSlot {
  lagnaIndex: number    // 0–11
  lagnaName: string     // Sanskrit rashi name
  startTime: LocalTime
  endTime: LocalTime
  panchakaType: 'good' | 'roga' | 'mrityu' | 'agni' | 'raja' | 'chora'
}

export interface FestivalData {
  id: string
  date: string          // "YYYY-MM-DD"
  name: string
  type: 'major' | 'minor' | 'fast' | 'auspicious'
  description?: string
  image_url?: string
}

// ─── Main Panchang Output Object ───────────────────────────────────────────

export interface PanchangData {
  // Meta
  date: string           // "YYYY-MM-DD"
  locationName: string
  timezone: string
  lat: number
  lng: number

  // Sun/Moon
  sunrise: LocalTime
  sunset: LocalTime
  moonrise: LocalTime | null
  moonset: LocalTime | null

  // Core Panchang (Pancha = 5 elements)
  tithi: TithiEntry[]          // 1 or 2 entries (if tithi changes mid-day)
  nakshatra: NakshatraEntry[]  // 1 or 2 entries
  yoga: YogaEntry[]            // 1 or 2 entries
  karana: KaranaEntry[]        // 2–3 entries per day
  vara: VaraData
  paksha: 'Shukla' | 'Krishna'

  // Positions
  sunPosition: SunMoonPosition
  moonPosition: SunMoonPosition

  // Timings
  brahmaMuhurta: AuspiciousTiming
  pratahSandhya: AuspiciousTiming
  abhijitMuhurta: AuspiciousTiming
  vijayaMuhurta: AuspiciousTiming
  godhuliMuhurta: AuspiciousTiming
  sayahnaSandhya: AuspiciousTiming
  nishitaMuhurta: AuspiciousTiming
  amritKalam: AuspiciousTiming | null

  rahuKalam: InauspiciousTiming
  yamaganda: InauspiciousTiming
  gulikaiKalam: InauspiciousTiming
  durMuhurtam: InauspiciousTiming[]   // up to 2 per day
  varjyam: AuspiciousTiming | null
  baana: string                       // e.g. "Agni Baana"

  // Calendar
  lunarCalendar: LunarCalendar
  rituAyana: RituAyana
  otherCalendars: OtherCalendars
  mantriMandala: MantriMandala

  // Yogas & Special
  specialYogas: SpecialYoga[]
  anandadiYoga: AnandadiYogaData

  // Section 10
  nivasShool: NivasShoolData

  // Chandrabalam / Tarabalam
  chandrabalam: ChandrabalamData
  tarabalam: TarabalamData

  // Udaya Lagna
  udayaLagnaSlots: UdayaLagnaSlot[]

  // Festivals
  festivals: FestivalData[]
}

// Input to the compute function
export interface PanchangInput {
  date: string       // "YYYY-MM-DD"
  lat: number
  lng: number
  timezone: string   // "Asia/Kolkata"
  locationName?: string
}
