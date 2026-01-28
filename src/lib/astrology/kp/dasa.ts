import { DASHA_ORDER, DASHA_YEARS } from "./constants";

type DashaLord = (typeof DASHA_ORDER)[number];

interface DashaBalance {
  classical360: {
    mahadashaLord: DashaLord;
    balanceYears: number;
    balanceMonths: number;
    balanceDays: number;
    balanceText: string;
    elapsedFractionOfNakshatra: number;
    remainingYearsFloat: number;
  };
}

interface MahadashaPeriod {
  lord: DashaLord;
  startUtc: string;
  endUtc: string;
  durationDays: number;
  durationYears: number;
}

interface AntardashaPeriod {
  lord: DashaLord;
  startUtc: string;
  endUtc: string;
  durationDays: number;
  durationYears: number;
}

interface PratyantarPeriod {
  lord: DashaLord;
  startUtc: string;
  endUtc: string;
  durationDays: number;
  durationYears: number;
}

interface SookshmaPeriod {
  lord: DashaLord;
  startUtc: string;
  endUtc: string;
  durationDays: number;
  durationYears: number;
}

interface DashaResult {
  balance: DashaBalance;
  currentMahadasha: MahadashaPeriod | null;
  allMahadashas: MahadashaPeriod[];
}

interface CurrentPeriods {
  mahadasha: MahadashaPeriod;
  antardasha: AntardashaPeriod;
  pratyantar: PratyantarPeriod;
  sookshma: SookshmaPeriod;
}

// Use 365.25 days for calendar calculations (actual solar year)
const CALENDAR_DAYS_PER_YEAR = 365.25;

/**
 * Calculate dasha balance at birth
 */
function balanceText(
  lord: DashaLord,
  elapsedFractionOfNak: number,
  yearDays: number
): DashaBalance["classical360"] {
  const remainingYearsFloat = DASHA_YEARS[lord] * (1 - elapsedFractionOfNak);
  const totalDays = remainingYearsFloat * yearDays;

  const years = Math.floor(totalDays / yearDays);
  let remainingDays = totalDays - years * yearDays;
  const months = Math.floor(remainingDays / 30);
  remainingDays = remainingDays - months * 30;
  const days = Math.round(remainingDays);

  return {
    mahadashaLord: lord,
    balanceYears: years,
    balanceMonths: months,
    balanceDays: days,
    balanceText: `${lord} ${years} Years ${months} Months ${days} Days`,
    elapsedFractionOfNakshatra: elapsedFractionOfNak,
    remainingYearsFloat,
  };
}

/**
 * Calculate all mahadasha periods from birth
 */
function calculateMahadashas(
  birthDateUtc: Date,
  nakLord: DashaLord,
  balanceYears: number,
  yearDays: number
): MahadashaPeriod[] {
  const mahadashas: MahadashaPeriod[] = [];
  
  // Find the index of starting lord (from nakshatra)
  const startIndex = DASHA_ORDER.indexOf(nakLord);
  
  // Start from birth date
  let currentDate = new Date(birthDateUtc);
  
  // Calculate all 9 mahadashas
  for (let i = 0; i < DASHA_ORDER.length; i++) {
    const lordIndex = (startIndex + i) % DASHA_ORDER.length;
    const lord = DASHA_ORDER[lordIndex];
    
    // First mahadasha uses balance years, rest use full years
    const durationYears = i === 0 ? balanceYears : DASHA_YEARS[lord];
    
    // Convert to calendar days using 365.25 days per year
    const durationDays = durationYears * CALENDAR_DAYS_PER_YEAR;
    
    const startUtc = new Date(currentDate);
    const endUtc = new Date(currentDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    mahadashas.push({
      lord,
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString(),
      durationDays,
      durationYears,
    });
    
    currentDate = endUtc;
  }
  
  return mahadashas;
}

/**
 * Get current running mahadasha
 */
function getCurrentMahadasha(
  mahadashas: MahadashaPeriod[],
  currentDate: Date = new Date()
): MahadashaPeriod | null {
  const current = mahadashas.find((md) => {
    const start = new Date(md.startUtc);
    const end = new Date(md.endUtc);
    return currentDate >= start && currentDate < end;
  });
  
  return current || null;
}

/**
 * Calculate all 9 antardashas within a mahadasha
 */
export function calculateAntardashas(
  mahadashaLord: DashaLord,
  mahadashaStartUtc: string,
  mahadashaEndUtc: string
): AntardashaPeriod[] {
  const antardashas: AntardashaPeriod[] = [];
  
  const startIndex = DASHA_ORDER.indexOf(mahadashaLord);
  const mahadashaDurationYears = DASHA_YEARS[mahadashaLord];
  
  let currentDate = new Date(mahadashaStartUtc);
  
  // Calculate 9 antardashas
  for (let i = 0; i < DASHA_ORDER.length; i++) {
    const lordIndex = (startIndex + i) % DASHA_ORDER.length;
    const lord = DASHA_ORDER[lordIndex];
    
    // Antardasha duration = (Antardasha lord years / 120) × Mahadasha years
    const durationYears = (DASHA_YEARS[lord] / 120) * mahadashaDurationYears;
    const durationDays = durationYears * CALENDAR_DAYS_PER_YEAR;
    
    const startUtc = new Date(currentDate);
    const endUtc = new Date(currentDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    antardashas.push({
      lord,
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString(),
      durationDays,
      durationYears,
    });
    
    currentDate = endUtc;
  }
  
  return antardashas;
}

/**
 * Calculate all 9 pratyantars within an antardasha
 */
export function calculatePratyantars(
  mahadashaLord: DashaLord,
  antardashaLord: DashaLord,
  antardashaStartUtc: string,
  antardashaEndUtc: string
): PratyantarPeriod[] {
  const pratyantars: PratyantarPeriod[] = [];
  
  const startIndex = DASHA_ORDER.indexOf(antardashaLord);
  const mahadashaDurationYears = DASHA_YEARS[mahadashaLord];
  const antardashaDurationYears = (DASHA_YEARS[antardashaLord] / 120) * mahadashaDurationYears;
  
  let currentDate = new Date(antardashaStartUtc);
  
  // Calculate 9 pratyantars
  for (let i = 0; i < DASHA_ORDER.length; i++) {
    const lordIndex = (startIndex + i) % DASHA_ORDER.length;
    const lord = DASHA_ORDER[lordIndex];
    
    // Pratyantar duration = (Pratyantar lord years / 120) × Antardasha years
    const durationYears = (DASHA_YEARS[lord] / 120) * antardashaDurationYears;
    const durationDays = durationYears * CALENDAR_DAYS_PER_YEAR;
    
    const startUtc = new Date(currentDate);
    const endUtc = new Date(currentDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    pratyantars.push({
      lord,
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString(),
      durationDays,
      durationYears,
    });
    
    currentDate = endUtc;
  }
  
  return pratyantars;
}

/**
 * Calculate all 9 sookshmas within a pratyantar
 */
export function calculateSookshmas(
  mahadashaLord: DashaLord,
  antardashaLord: DashaLord,
  pratyantarLord: DashaLord,
  pratyantarStartUtc: string,
  pratyantarEndUtc: string
): SookshmaPeriod[] {
  const sookshmas: SookshmaPeriod[] = [];
  
  const startIndex = DASHA_ORDER.indexOf(pratyantarLord);
  const mahadashaDurationYears = DASHA_YEARS[mahadashaLord];
  const antardashaDurationYears = (DASHA_YEARS[antardashaLord] / 120) * mahadashaDurationYears;
  const pratyantarDurationYears = (DASHA_YEARS[pratyantarLord] / 120) * antardashaDurationYears;
  
  let currentDate = new Date(pratyantarStartUtc);
  
  // Calculate 9 sookshmas
  for (let i = 0; i < DASHA_ORDER.length; i++) {
    const lordIndex = (startIndex + i) % DASHA_ORDER.length;
    const lord = DASHA_ORDER[lordIndex];
    
    // Sookshma duration = (Sookshma lord years / 120) × Pratyantar years
    const durationYears = (DASHA_YEARS[lord] / 120) * pratyantarDurationYears;
    const durationDays = durationYears * CALENDAR_DAYS_PER_YEAR;
    
    const startUtc = new Date(currentDate);
    const endUtc = new Date(currentDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    sookshmas.push({
      lord,
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString(),
      durationDays,
      durationYears,
    });
    
    currentDate = endUtc;
  }
  
  return sookshmas;
}

/**
 * Get currently running periods at all levels
 */
export function getCurrentPeriods(
  birthDateUtc: Date,
  nakLord: DashaLord,
  balanceYears: number,
  currentDate: Date = new Date()
): CurrentPeriods | null {
  // Calculate all mahadashas
  const mahadashas = calculateMahadashas(birthDateUtc, nakLord, balanceYears, 360);
  
  // Find current mahadasha
  const currentMahadasha = getCurrentMahadasha(mahadashas, currentDate);
  if (!currentMahadasha) return null;
  
  // Calculate antardashas for current mahadasha
  const antardashas = calculateAntardashas(
    currentMahadasha.lord,
    currentMahadasha.startUtc,
    currentMahadasha.endUtc
  );
  
  // Find current antardasha
  const currentAntardasha = antardashas.find((ad) => {
    const start = new Date(ad.startUtc);
    const end = new Date(ad.endUtc);
    return currentDate >= start && currentDate < end;
  });
  if (!currentAntardasha) return null;
  
  // Calculate pratyantars for current antardasha
  const pratyantars = calculatePratyantars(
    currentMahadasha.lord,
    currentAntardasha.lord,
    currentAntardasha.startUtc,
    currentAntardasha.endUtc
  );
  
  // Find current pratyantar
  const currentPratyantar = pratyantars.find((pr) => {
    const start = new Date(pr.startUtc);
    const end = new Date(pr.endUtc);
    return currentDate >= start && currentDate < end;
  });
  if (!currentPratyantar) return null;
  
  // Calculate sookshmas for current pratyantar
  const sookshmas = calculateSookshmas(
    currentMahadasha.lord,
    currentAntardasha.lord,
    currentPratyantar.lord,
    currentPratyantar.startUtc,
    currentPratyantar.endUtc
  );
  
  // Find current sookshma
  const currentSookshma = sookshmas.find((sk) => {
    const start = new Date(sk.startUtc);
    const end = new Date(sk.endUtc);
    return currentDate >= start && currentDate < end;
  });
  if (!currentSookshma) return null;
  
  return {
    mahadasha: currentMahadasha,
    antardasha: currentAntardasha,
    pratyantar: currentPratyantar,
    sookshma: currentSookshma,
  };
}

/**
 * Main function to compute Vimshottari Dasha
 * Returns only essential data: balance + current mahadasha + all mahadashas
 */
export function vimshottariDasha(
  moonLongitude: number,
  birthDateUtc: Date,
  elapsedFractionOfNak: number,
  nakLord: DashaLord,
  yearDays = 360
): DashaResult {
  // Calculate balance at birth
  const balance = {
    classical360: balanceText(nakLord, elapsedFractionOfNak, yearDays),
  };

  // Calculate all 9 mahadasha periods from birth
  const allMahadashas = calculateMahadashas(
    birthDateUtc,
    nakLord,
    balance.classical360.remainingYearsFloat,
    yearDays
  );

  // Get current running mahadasha
  const currentMahadasha = getCurrentMahadasha(allMahadashas);

  return {
    balance,
    currentMahadasha,
    allMahadashas,
  };
}
