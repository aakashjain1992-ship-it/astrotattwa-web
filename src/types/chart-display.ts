/**
 * Chart Display Types
 * 
 * Types for rendering birth charts in the UI.
 * Based on the API response from /api/calculate
 */

// ===== PLANET DATA =====

export interface PlanetData {
  key: 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';
  longitude: number;
  speed: number;
  retrograde: boolean;
  combust: boolean;
  combustionOrbDeg?: number;
  exalted: boolean;
  debilitated: boolean;
  exhausted: boolean;
  sign: string;
  signNumber: number;
  degreeInSign: number;
  kp: {
    rasiLord: string;
    nakshatraName: string;
    nakshatraPada: number;
    nakshatraLord: string;
    subLord: string;
    subSubLord: string;
    nakshatraIndex: number;
    withinNakshatraSeconds: number;
    elapsedFractionOfNakshatra: number;
  };
}

export interface AscendantData {
  key: 'Ascendant';
  longitude: number;
  retrograde: false;
  combust: false;
  exalted: false;
  debilitated: false;
  exhausted: false;
  sign: string;
  signNumber: number;
  degreeInSign: number;
  kp: {
    rasiLord: string;
    nakshatraName: string;
    nakshatraPada: number;
    nakshatraLord: string;
    subLord: string;
    subSubLord: string;
    nakshatraIndex: number;
    withinNakshatraSeconds: number;
    elapsedFractionOfNakshatra: number;
  };
}

export interface ChartData {
  planets: Record<PlanetData['key'], PlanetData>;
  ascendant: AscendantData;
  nakshatra: {
    name: string;
    pada: number;
    lord: string;
  };
  dasa: {
    balance: {
      classical360: {
        mahadashaLord: string;
        balanceYears: number;
        balanceMonths: number;
        balanceDays: number;
        balanceText: string;
        elapsedFractionOfNakshatra: number;
        remainingYearsFloat: number;
      };
    };
    currentMahadasha: {
      lord: string;
      startUtc: string;
      endUtc: string;
      durationDays: number;
      durationYears: number;
    };
    allMahadashas: Array<{
      lord: string;
      startUtc: string;
      endUtc: string;
      durationDays: number;
      durationYears: number;
    }>;
  };
  avakahada: {
    ascendantSign: string;
    ascendantLord: string;
    rasiSign: string;
    rasiLord: string;
    nakshatra: string;
    nakshatraPada: number;
    nakshatraLord: string;
    yoga: string;
    karan: string;
    gana: string;
    yoni: string;
    nadi: string;
    varan: string;
    vashya: string;
    varga: string;
    yunja: string;
    hansak: string;
    nameAlphabet: string;
    payaRasi: string;
    payaNakshatra: string;
    sunSignWestern: string;
  };
  name: string;
  gender: 'male' | 'female';
  timePeriod: 'AM' | 'PM';
  cityId: string;
}

export interface PlanetDisplayInfo {
  key: PlanetData['key'];
  symbol: string;
  degree: number;
  statusFlags: string[];
  longitude: number;
  fullData: PlanetData;
}

export interface HouseInfo {
  houseNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rasiNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rasiName: string;
  planets: PlanetDisplayInfo[];
  isAscendant: boolean;
}

export const PLANET_SYMBOLS: Record<PlanetData['key'], string> = {
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

export const PLANET_FULL_NAMES: Record<PlanetData['key'], string> = {
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

export const PLANET_SANSKRIT_NAMES: Record<PlanetData['key'], string> = {
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

export const RASHI_NAMES: string[] = [
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
];

export const HOUSE_SIGNIFICATIONS: Record<number, string> = {
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

export type PlanetKey = PlanetData['key'];
export type HouseNumber = HouseInfo['houseNumber'];
export type RashiNumber = HouseInfo['rasiNumber'];
export type StatusFlag = 'R' | 'C' | 'D' | 'S' | '↑' | '↓';
