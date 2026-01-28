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

interface DashaResult {
  balance: DashaBalance;
  currentMahadasha: MahadashaPeriod | null;
  allMahadashas: MahadashaPeriod[];
}

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
 * Uses 365.25 days per year for actual calendar date calculations
 */
function calculateMahadashas(
  birthDateUtc: Date,
  nakLord: DashaLord,
  balanceYears: number,
  yearDays: number
): MahadashaPeriod[] {
  const mahadashas: MahadashaPeriod[] = [];
  
  // Use 365.25 days for calendar calculations (actual solar year)
  const CALENDAR_DAYS_PER_YEAR = 365.25;
  
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
