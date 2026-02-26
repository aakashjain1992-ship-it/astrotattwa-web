/**
 * Unified Divisional Chart Builder
 
 * COMPLETE VERSION with ALL 16 standard divisional charts

 * @version 2.0.0
 * @created February 7, 2026
 * @updated February 26, 2026 - Added D5, D6, D8, D11, D16, D20, D24, D27
 */

import type { 
  PlanetData, 
  AscendantData, 
  HouseInfo, 
  StatusFlag 
} from '@/types/astrology';
import { RASHI_NAMES, PLANET_SYMBOLS } from '@/types/astrology';

// ===== DIVISION CONFIGURATIONS =====

/**
 * Configuration for a divisional chart calculation
 */
export interface DivisionConfig {
  /** Division type identifier */
 type: 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8' | 'D9' | 'D10' | 'D11' | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D40' | 'D45' | 'D60';  
  /** Display name */
  name: string;
  
  /** Sanskrit name */
  sanskritName: string;
  
  /** Number of divisions per sign (e.g., 2 for Hora, 3 for Drekkana) */
  divisor: number;
  
  /** Sign calculation function - takes longitude, returns sign number (1-12) */
  calculateSign: (longitude: number) => number;
}

/**
 * Hora (D2) Configuration
 * Divides each sign into 2 parts (15° each)
 * Odd signs: First half → Leo, Second half → Cancer
 * Even signs: First half → Cancer, Second half → Leo
 */
export const HORA_CONFIG: DivisionConfig = {
  type: 'D2',
  name: 'Hora',
  sanskritName: 'Horā',
  divisor: 2,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const isFirstHalf = degreeInSign < 15;
    const isOddSign = signIndex % 2 === 0; // 0,2,4,6,8,10 are odd signs (Aries, Gemini, etc.)
    
    if (isOddSign) {
      return isFirstHalf ? 5 : 4; // Leo : Cancer
    } else {
      return isFirstHalf ? 4 : 5; // Cancer : Leo
    }
  },
};

/**
 * Drekkana (D3) Configuration
 * Divides each sign into 3 parts (10° each)
 * Start from the sign itself, count 0, 4, 8 signs ahead
 */
export const DREKKANA_CONFIG: DivisionConfig = {
  type: 'D3',
  name: 'Drekkana',
  sanskritName: 'Dreṣkāṇa',
  divisor: 3,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const drekkanaIndex = Math.floor(degreeInSign / 10); // 0, 1, or 2
    const offsets = [0, 4, 8];
    const resultSignIndex = (signIndex + offsets[drekkanaIndex]) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Chaturthamsa (D4) Configuration
 */
export const CHATURTHAMSA_CONFIG: DivisionConfig = {
  type: 'D4',
  name: 'Chaturthamsa',
  sanskritName: 'Chaturthāṁśa',
  divisor: 4,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const chaturthamsaPart = Math.floor(degreeInSign / 7.5);
    const resultSignIndex = (signIndex + (chaturthamsaPart * 3)) % 12;
    return resultSignIndex + 1;
  },
};
/**
 * Panchamamsa (D5) Configuration - NEW
 * Shows fame, power, authority, and influence
 */
export const PANCHAMAMSA_CONFIG: DivisionConfig = {
  type: 'D5',
  name: 'Panchamamsa',
  sanskritName: 'Pañcamāṁśa',
  divisor: 5,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const panchamamsaPart = Math.floor(degreeInSign / 6); // 0-4
    const isOddSign = signIndex % 2 === 0;
    const startSign = isOddSign ? signIndex : (signIndex + 8) % 12;
    const resultSignIndex = (startSign + panchamamsaPart) % 12;
    return resultSignIndex + 1;
  },
};
/**
 * Shashtamsa (D6) Configuration - NEW
 * Shows diseases, debts, enemies, and obstacles
 */
export const SHASHTAMSA_CONFIG: DivisionConfig = {
  type: 'D6',
  name: 'Shashtamsa',
  sanskritName: 'Ṣaṣṭhāṁśa',
  divisor: 6,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const shashtamsaPart = Math.floor(degreeInSign / 5); // 0-5
    const isOddSign = signIndex % 2 === 0;
    const startSign = isOddSign ? signIndex : (signIndex + 6) % 12;
    const resultSignIndex = (startSign + shashtamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Saptamsa (D7) Configuration
 * Divides each sign into 7 parts (~4.29° each)
 * Odd signs start from themselves, even signs start from 7th sign
 */
export const SAPTAMSA_CONFIG: DivisionConfig = {
  type: 'D7',
  name: 'Saptamsa',
  sanskritName: 'Saptāṁśa',
  divisor: 7,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const saptamsaPart = Math.floor(degreeInSign / (30 / 7));
    const isOddSign = signIndex % 2 === 0;
    const startSign = isOddSign ? signIndex : (signIndex + 6) % 12;
    const resultSignIndex = (startSign + saptamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Ashtamsa (D8) Configuration - NEW
 * Shows sudden events, accidents, and longevity
 */
export const ASHTAMSA_CONFIG: DivisionConfig = {
  type: 'D8',
  name: 'Ashtamsa',
  sanskritName: 'Aṣṭāṁśa',
  divisor: 8,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const ashtamsaPart = Math.floor(degreeInSign / 3.75); // 0-7
    
    // Movable signs: Aries, Cancer, Libra, Capricorn (0, 3, 6, 9)
    // Fixed signs: Taurus, Leo, Scorpio, Aquarius (1, 4, 7, 10)
    // Dual signs: Gemini, Virgo, Sagittarius, Pisces (2, 5, 8, 11)
    const signType = signIndex % 3; // 0=movable, 1=fixed, 2=dual
    
    let startSign: number;
    if (signType === 0) {
      startSign = signIndex; // Movable: start from same sign
    } else if (signType === 1) {
      startSign = (signIndex + 8) % 12; // Fixed: start from 9th sign
    } else {
      startSign = (signIndex + 4) % 12; // Dual: start from 5th sign
    }
    
    const resultSignIndex = (startSign + ashtamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Navamsa (D9) Configuration
 * Divides each sign into 9 parts (3°20' each)
 * THE MOST IMPORTANT divisional chart after D1
 * Shows: spouse, dharma, inner strength, spiritual inclinations
 * 
 */
export const NAVAMSA_CONFIG: DivisionConfig = {
  type: 'D9',
  name: 'Navamsa',
  sanskritName: 'Navāṁśa',
  divisor: 9,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const navamsaPart = Math.floor(degreeInSign / (30 / 9)); // 0-8
    
    // Element-based starting signs
    const element = signIndex % 4; // Fire=0, Earth=1, Air=2, Water=3
    const startSigns = [0, 9, 6, 3]; // Aries, Capricorn, Libra, Cancer
    const startSign = startSigns[element];
    
    const resultSignIndex = (startSign + navamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Dasamsa (D10) Configuration
 * Divides each sign into 10 parts (3° each)
 * Used for career, profession, status, and achievements
 * 
 * Rules:
 * - Odd signs start from the sign itself
 * - Even signs start from the 9th sign from itself
 */
export const DASAMSA_CONFIG: DivisionConfig = {
  type: 'D10',
  name: 'Dasamsa',
  sanskritName: 'Daśāṁśa',
  divisor: 10,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const dasamsaPart = Math.floor(degreeInSign / 3);
    const isOddSign = signIndex % 2 === 0;
    const startSign = isOddSign ? signIndex : (signIndex + 8) % 12;
    const resultSignIndex = (startSign + dasamsaPart) % 12;
    return resultSignIndex + 1;
  },
};


/**
 * Ekadasamsa (D11) Configuration - NEW
 * Shows gains, honors, achievements, and fulfillment
 */
export const EKADASAMSA_CONFIG: DivisionConfig = {
  type: 'D11',
  name: 'Ekadasamsa',
  sanskritName: 'Ekādaśāṁśa',
  divisor: 11,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const ekadasamsaPart = Math.floor(degreeInSign / (30 / 11)); // 0-10
    // Both odd and even signs start from the same sign in D11
    const resultSignIndex = (signIndex + ekadasamsaPart) % 12;
    return resultSignIndex + 1;
  },
};


/**
 * Dwadasamsa (D12) Configuration
 * Divides each sign into 12 parts (2.5° each)
 * Start from the sign itself
 */
export const DWADASAMSA_CONFIG: DivisionConfig = {
  type: 'D12',
  name: 'Dwadasamsa',
  sanskritName: 'Dvādaśāṁśa',
  divisor: 12,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const dwadamsamsaPart = Math.floor(degreeInSign / 2.5);
    const resultSignIndex = (signIndex + dwadamsamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Shodasamsa (D16) Configuration - NEW
 * Shows vehicles, conveyances, luxuries, and material comforts
 */
export const SHODASAMSA_CONFIG: DivisionConfig = {
  type: 'D16',
  name: 'Shodasamsa',
  sanskritName: 'Ṣoḍaśāṁśa',
  divisor: 16,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const shodasamsaPart = Math.floor(degreeInSign / 1.875); // 0-15
    
    const signType = signIndex % 3; // 0=movable, 1=fixed, 2=dual
    
    let startSign: number;
    if (signType === 0) {
      startSign = signIndex; // Movable: start from same sign
    } else if (signType === 1) {
      startSign = 4; // Fixed: start from Leo
    } else {
      startSign = 8; // Dual: start from Sagittarius
    }
    
    const resultSignIndex = (startSign + shodasamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Vimshamsa (D20) Configuration - NEW
 * Shows spiritual progress, religious inclinations, and worship
 */
export const VIMSHAMSA_CONFIG: DivisionConfig = {
  type: 'D20',
  name: 'Vimshamsa',
  sanskritName: 'Viṁśāṁśa',
  divisor: 20,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const vimsamsaPart = Math.floor(degreeInSign / 1.5); // 0-19
    
    const signType = signIndex % 3; // 0=movable, 1=fixed, 2=dual
    
    let startSign: number;
    if (signType === 0) {
      startSign = 0; // Movable: start from Aries
    } else if (signType === 1) {
      startSign = 8; // Fixed: start from Sagittarius
    } else {
      startSign = 4; // Dual: start from Leo
    }
    
    const resultSignIndex = (startSign + vimsamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Chaturvimshamsa/Siddhamsa (D24) Configuration - NEW
 * Shows education, learning, knowledge, and academic success
 */
export const SIDDHAMSA_CONFIG: DivisionConfig = {
  type: 'D24',
  name: 'Siddhamsa',
  sanskritName: 'Sidddhāṁśa',
  divisor: 24,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const siddhamsaPart = Math.floor(degreeInSign / 1.25); // 0-23
    const isOddSign = signIndex % 2 === 0;
    const startSign = isOddSign ? 4 : 3; // Odd: Leo, Even: Cancer
    const resultSignIndex = (startSign + siddhamsaPart) % 12;
    return resultSignIndex + 1;
  },
};

/**
 * Bhamsa/Nakshatramsa (D27) Configuration - NEW
 * Shows strengths, weaknesses, vitality, and overall health
 */
export const BHAMSA_CONFIG: DivisionConfig = {
  type: 'D27',
  name: 'Bhamsa',
  sanskritName: 'Bhāṁśa',
  divisor: 27,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const bhamsaPart = Math.floor(degreeInSign / (30 / 27)); // 0-26
    
    // Element-based starting signs (same as Navamsa logic)
    const element = signIndex % 4; // Fire=0, Earth=1, Air=2, Water=3
    const startSigns = [0, 3, 6, 9]; // Aries, Cancer, Libra, Capricorn
    const startSign = startSigns[element];
    
    const resultSignIndex = (startSign + bhamsaPart) % 12;
    return resultSignIndex + 1;
  },
};


/**
 * Trimsamsa (D30) Configuration
 * Divides each sign into 30 parts (1° each)
 * Used for misfortunes, weaknesses, hidden enemies, evil influences
 * 
 * Complex ruleset based on sign type (odd/even) with specific degree ranges
 */
export const TRIMSAMSA_CONFIG: DivisionConfig = {
  type: 'D30',
  name: 'Trimsamsa',
  sanskritName: 'Triṁśāṁśa',
  divisor: 30,
  calculateSign: (longitude: number): number => {
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const isOddSign = signIndex % 2 === 0;
    
    // Trimsamsa has specific degree ranges for each sign type
    if (isOddSign) {
      // Odd signs: Mars(5°), Saturn(5°), Jupiter(8°), Mercury(7°), Venus(5°)
      if (degreeInSign < 5) return (signIndex + 0) % 12 + 1; // Mars (same sign)
      if (degreeInSign < 10) return (signIndex + 10) % 12 + 1; // Saturn
      if (degreeInSign < 18) return (signIndex + 8) % 12 + 1; // Jupiter
      if (degreeInSign < 25) return (signIndex + 6) % 12 + 1; // Mercury
      return (signIndex + 4) % 12 + 1; // Venus
    } else {
      // Even signs: Venus(5°), Mercury(7°), Jupiter(8°), Saturn(5°), Mars(5°)
      if (degreeInSign < 5) return (signIndex + 4) % 12 + 1; // Venus
      if (degreeInSign < 12) return (signIndex + 6) % 12 + 1; // Mercury
      if (degreeInSign < 20) return (signIndex + 8) % 12 + 1; // Jupiter
      if (degreeInSign < 25) return (signIndex + 10) % 12 + 1; // Saturn
      return (signIndex + 0) % 12 + 1; // Mars
    }
  },
};



// ===== DIVISIONAL CHART BUILDER =====

/**
 * Builds houses for any divisional chart using the configuration

 * 
 * @param planets - Record of all planet positions
 * @param ascendant - Ascendant data
 * @param config - Division configuration (HORA_CONFIG, DREKKANA_CONFIG, etc.)
 * @returns Array of 12 houses with planets distributed
 * 
 * @example
 * ```ts
 * // Instead of: buildHoraHouses(planets, ascendant)
 * const horaHouses = buildDivisionalHouses(planets, ascendant, HORA_CONFIG);
 * 
 * // Instead of: buildDrekkanaHouses(planets, ascendant)
 * const drekkanaHouses = buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG);
 * ```
 */
export function buildDivisionalHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData,
  config: DivisionConfig
): HouseInfo[] {
  // Step 1: Calculate ascendant's divisional sign
  const ascLongitude = (ascendant.signNumber - 1) * 30 + ascendant.degreeInSign;
  const ascDivisionalSign = config.calculateSign(ascLongitude);
  
  // Step 2: Initialize 12 houses starting from ascendant's divisional sign
  const houses: HouseInfo[] = [];
  
  for (let i = 0; i < 12; i++) {
    const houseNumber = (i + 1) as HouseInfo['houseNumber'];
    const rasiNumber = (((ascDivisionalSign - 1 + i) % 12) + 1) as HouseInfo['rasiNumber'];
    
    houses.push({
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }
  
  // Step 3: Distribute planets into houses
  Object.entries(planets).forEach(([planetKey, planetData]) => {
    // Calculate planet's divisional sign
    const planetDivisionalSign = config.calculateSign(planetData.longitude);
    
    // Find which house this sign corresponds to
    const houseIndex = (planetDivisionalSign - ascDivisionalSign + 12) % 12;
    
    // Build status flags
    const statusFlags: StatusFlag[] = [];
    if (planetData.retrograde) statusFlags.push('R');
    if (planetData.combust) statusFlags.push('C');
    if (planetData.exalted) statusFlags.push('↑');
    if (planetData.debilitated) statusFlags.push('↓');
    
    // Add planet to house
    houses[houseIndex].planets.push({
      key: planetKey as PlanetData['key'],
      symbol: PLANET_SYMBOLS[planetKey as PlanetData['key']] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
      fullData: planetData,
    });
  });
  
  // Step 4: Sort planets within each house by degree
  houses.forEach(house => {
    house.planets.sort((a, b) => a.degree - b.degree);
  });
  
  return houses;
}

// ===== CONVENIENCE FUNCTIONS (BACKWARD COMPATIBILITY) =====

/**
 * Build Hora (D2) chart
 * @deprecated Use buildDivisionalHouses(planets, ascendant, HORA_CONFIG) instead
 */
export function buildHoraHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, HORA_CONFIG);
}

/**
 * Build Drekkana (D3) chart
 * @deprecated Use buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG) instead
 */
export function buildDrekkanaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG);
}

/**
 * Build Saptamsa (D7) chart
 * @deprecated Use buildDivisionalHouses(planets, ascendant, SAPTAMSA_CONFIG) instead
 */
export function buildSaptamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, SAPTAMSA_CONFIG);
}

/**
 * Build Dwadasamsa (D12) chart
 * @deprecated Use buildDivisionalHouses(planets, ascendant, DWADASAMSA_CONFIG) instead
 */
export function buildDwadamsamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  return buildDivisionalHouses(planets, ascendant, DWADASAMSA_CONFIG);
}

// ===== EXPORT ALL CONFIGS FOR EASY ACCESS =====

export const DIVISION_CONFIGS = {
  D2: HORA_CONFIG,
  D3: DREKKANA_CONFIG,
  D4: CHATURTHAMSA_CONFIG,
  D5: PANCHAMAMSA_CONFIG,      
  D6: SHASHTAMSA_CONFIG,        
  D7: SAPTAMSA_CONFIG,
  D8: ASHTAMSA_CONFIG,          
  D9: NAVAMSA_CONFIG,
  D10: DASAMSA_CONFIG,
  D11: EKADASAMSA_CONFIG,       
  D12: DWADASAMSA_CONFIG,
  D16: SHODASAMSA_CONFIG,       
  D20: VIMSHAMSA_CONFIG,        
  D24: SIDDHAMSA_CONFIG,        
  D27: BHAMSA_CONFIG,           
  D30: TRIMSAMSA_CONFIG,
} as const;

/**
 * Get division config by type
 * @param type - Division type (D2, D3, D7, D12, etc.)
 * @returns Division configuration or undefined if not found
 */
export function getDivisionConfig(type: DivisionConfig['type']): DivisionConfig | undefined {
  return DIVISION_CONFIGS[type as keyof typeof DIVISION_CONFIGS];
}
