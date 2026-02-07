/**
 * Centralized Astrology Types
 * 
 * Consolidates all astrology-related type definitions that were previously
 * scattered across multiple files (chartHelpers.ts, divisional files, components)
 * 
 * @version 1.0.0
 * @created February 7, 2026
 */

// ===== CORE PLANET & CELESTIAL TYPES =====

/**
 * Available planet keys in Vedic astrology
 */
export type PlanetKey = 
  | 'Sun' 
  | 'Moon' 
  | 'Mars' 
  | 'Mercury' 
  | 'Jupiter' 
  | 'Venus' 
  | 'Saturn' 
  | 'Rahu' 
  | 'Ketu';

/**
 * Complete planet data from ephemeris calculations
 */
export interface PlanetData {
  /** Planet identifier */
  key: PlanetKey;
  
  /** Absolute longitude (0-360°) */
  longitude: number;
  
  /** Speed in degrees per day */
  speed: number;
  
  /** Whether planet is retrograde */
  retrograde: boolean;
  
  /** Whether planet is combust (too close to Sun) */
  combust: boolean;
  
  /** Combustion orb in degrees (if combust) */
  combustionOrbDeg?: number;
  
  /** Whether planet is exalted in current sign */
  exalted: boolean;
  
  /** Whether planet is debilitated in current sign */
  debilitated: boolean;
  
  /** Whether planet is exhausted (low degrees in sign) */
  exhausted: boolean;
  
  /** Current sign name (e.g., "Aries", "Taurus") */
  sign: string;
  
  /** Sign number (1-12) */
  signNumber: number;
  
  /** Degrees within the sign (0-30°) */
  degreeInSign: number;
  
  /** Krishnamurti Paddhati system data */
  kp: KPData;
}

/**
 * Ascendant (Lagna) data
 */
export interface AscendantData {
  /** Always 'Ascendant' */
  key: 'Ascendant';
  
  /** Absolute longitude (0-360°) */
  longitude: number;
  
  /** Always false for ascendant */
  retrograde: false;
  
  /** Always false for ascendant */
  combust: false;
  
  /** Always false for ascendant */
  exalted: false;
  
  /** Always false for ascendant */
  debilitated: false;
  
  /** Always false for ascendant */
  exhausted: false;
  
  /** Current sign name */
  sign: string;
  
  /** Sign number (1-12) */
  signNumber: number;
  
  /** Degrees within the sign (0-30°) */
  degreeInSign: number;
  
  /** KP system data */
  kp: KPData;
}

/**
 * Krishnamurti Paddhati (KP) system data
 */
export interface KPData {
  /** Lord of the Rashi (sign) */
  rasiLord: string;
  
  /** Name of the Nakshatra (lunar mansion) */
  nakshatraName: string;
  
  /** Pada (quarter) of the Nakshatra (1-4) */
  nakshatraPada: number;
  
  /** Lord of the Nakshatra */
  nakshatraLord: string;
  
  /** Sub-lord in KP system */
  subLord: string;
  
  /** Sub-sub-lord in KP system */
  subSubLord: string;
  
  /** Nakshatra index (0-26) */
  nakshatraIndex: number;
  
  /** Seconds elapsed within the Nakshatra */
  withinNakshatraSeconds: number;
  
  /** Fraction of Nakshatra elapsed (0-1) */
  elapsedFractionOfNakshatra: number;
}

// ===== HOUSE & CHART STRUCTURE TYPES =====

/**
 * House number (1-12)
 */
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Rashi (sign) number (1-12)
 */
export type RashiNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Planet display information for chart rendering
 */
export interface PlanetDisplayInfo {
  /** Planet key */
  key: PlanetKey;
  
  /** Short symbol (e.g., "Su", "Mo", "Ma") */
  symbol: string;
  
  /** Degree within sign */
  degree: number;
  
  /** Status flags: R=Retrograde, C=Combust, E=Exalted, D=Debilitated */
  statusFlags: StatusFlag[];
  
  /** Absolute longitude */
  longitude: number;
  
  /** Full planet data */
  fullData: PlanetData;
}

/**
 * Status flags for planets
 */
export type StatusFlag = 'R' | 'C' | 'E' | 'D' | 'S'| '↑' | '↓';

/**
 * House information for chart display
 */
export interface HouseInfo {
  /** House number (1-12) */
  houseNumber: HouseNumber;
  
  /** Rashi (sign) number in this house (1-12) */
  rasiNumber: RashiNumber;
  
  /** Rashi (sign) name */
  rasiName: string;
  
  /** Planets in this house */
  planets: PlanetDisplayInfo[];
  
  /** Whether this house contains the Ascendant */
  isAscendant: boolean;
}

// ===== DASHA (PLANETARY PERIOD) TYPES =====

/**
 * Mahadasha period information
 */
export interface MahadashaInfo {
  /** Lord of the Mahadasha */
  lord: string;
  
  /** Start date in UTC */
  startUtc: string;
  
  /** End date in UTC */
  endUtc: string;
  
  /** Duration in days */
  durationDays: number;
  
  /** Duration in years */
  durationYears: number;
}

/**
 * Dasha balance at birth
 */
export interface DashaBalance {
  /** Classical 360-day year calculation */
  classical360: {
    /** Lord of the Mahadasha at birth */
    mahadashaLord: string;
    
    /** Remaining years */
    balanceYears: number;
    
    /** Remaining months */
    balanceMonths: number;
    
    /** Remaining days */
    balanceDays: number;
    
    /** Human-readable balance text */
    balanceText: string;
    
    /** Fraction of Nakshatra elapsed */
    elapsedFractionOfNakshatra: number;
    
    /** Remaining years as float */
    remainingYearsFloat: number;
  };
}

/**
 * Complete Dasha information
 */
export interface DashaInfo {
  /** Dasha balance at birth */
  balance: DashaBalance;
  
  /** Current Mahadasha */
  currentMahadasha: MahadashaInfo;
  
  /** All Mahadasha periods */
  allMahadashas: MahadashaInfo[];
}

// ===== NAKSHATRA (LUNAR MANSION) TYPES =====

/**
 * Nakshatra information
 */
export interface NakshatraInfo {
  /** Nakshatra name */
  name: string;
  
  /** Pada (quarter) - 1 to 4 */
  pada: number;
  
  /** Lord of the Nakshatra */
  lord: string;
}

// ===== AVAKAHADA CHAKRA TYPES =====

/**
 * Avakahada Chakra - 21 Vedic birth attributes
 */
export interface AvakahaddaChakra {
  /** Ascendant sign */
  ascendantSign: string;
  
  /** Lord of ascendant sign */
  ascendantLord: string;
  
  /** Moon's sign (Rasi) */
  rasiSign: string;
  
  /** Lord of Moon's sign */
  rasiLord: string;
  
  /** Moon's Nakshatra */
  nakshatra: string;
  
  /** Nakshatra Pada (1-4) */
  nakshatraPada: number;
  
  /** Lord of Nakshatra */
  nakshatraLord: string;
  
  /** Yoga - combination of Sun and Moon */
  yoga: string;
  
  /** Karan - half of Tithi */
  karan: string;
  
  /** Gana - temperament (Deva, Manushya, Rakshasa) */
  gana: string;
  
  /** Yoni - animal nature */
  yoni: string;
  
  /** Nadi - physiological type */
  nadi: string;
  
  /** Varan - caste/class */
  varan: string;
  
  /** Vashya - controlling/controllable signs */
  vashya: string;
  
  /** Varga - division category */
  varga: string;
  
  /** Yunja - pairs/compatibility */
  yunja: string;
  
  /** Hansak - swan type/spiritual nature */
  hansak: string;
  
  /** Name alphabet - recommended first letter */
  nameAlphabet: string;
  
  /** Paya of Rasi - metal, wood, etc. */
  payaRasi: string;
  
  /** Paya of Nakshatra */
  payaNakshatra: string;
  
  /** Western Sun sign */
  sunSignWestern: string;
}

// ===== COMPLETE CHART DATA =====

/**
 * Complete birth chart data
 */
export interface ChartData {
  /** All planet positions */
  planets: Record<PlanetKey, PlanetData>;
  
  /** Ascendant data */
  ascendant: AscendantData;
  
  /** Moon's Nakshatra */
  nakshatra: NakshatraInfo;
  
  /** Vimshottari Dasha system */
  dasa: DashaInfo;
  
  /** Avakahada Chakra - 21 attributes */
  avakahada: AvakahaddaChakra;
  
  /** Person's name */
  name: string;
  
  /** Gender */
  gender: 'male' | 'female';
  
  /** Time period (AM/PM) */
  timePeriod: 'AM' | 'PM';
  
  /** City ID from database */
  cityId: string;
}

// ===== CONSTANTS =====

/**
 * Planet symbols for display
 */
export const PLANET_SYMBOLS: Record<PlanetKey, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

/**
 * Full planet names
 */
export const PLANET_FULL_NAMES: Record<PlanetKey, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mars: 'Mars',
  Mercury: 'Mercury',
  Jupiter: 'Jupiter',
  Venus: 'Venus',
  Saturn: 'Saturn',
  Rahu: 'Rahu (North Node)',
  Ketu: 'Ketu (South Node)',
};

/**
 * Sanskrit planet names
 */
export const PLANET_SANSKRIT_NAMES: Record<PlanetKey, string> = {
  Sun: 'Surya',
  Moon: 'Chandra',
  Mars: 'Mangal',
  Mercury: 'Budha',
  Jupiter: 'Guru',
  Venus: 'Shukra',
  Saturn: 'Shani',
  Rahu: 'Rahu',
  Ketu: 'Ketu',
};

/**
 * Rashi (sign) names in order
 */
export const RASHI_NAMES: readonly string[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

/**
 * Sanskrit Rashi names
 */
export const RASHI_SANSKRIT_NAMES: readonly string[] = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrishchika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
] as const;

/**
 * House significations
 */
export const HOUSE_SIGNIFICATIONS: Record<HouseNumber, string> = {
  1: 'Self, Body, Personality',
  2: 'Wealth, Family, Speech',
  3: 'Siblings, Courage, Communication',
  4: 'Home, Mother, Comforts',
  5: 'Children, Intelligence, Romance',
  6: 'Enemies, Disease, Service',
  7: 'Spouse, Partnership, Marriage',
  8: 'Longevity, Transformation, Occult',
  9: 'Fortune, Father, Dharma',
  10: 'Career, Status, Reputation',
  11: 'Gains, Friends, Aspirations',
  12: 'Loss, Liberation, Foreign Lands',
};

/**
 * Nakshatra names in order
 */
export const NAKSHATRA_NAMES: readonly string[] = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
] as const;

/**
 * Nakshatra lords in order
 */
export const NAKSHATRA_LORDS: readonly string[] = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
] as const;
