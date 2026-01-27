import { DASHA_ORDER, DASHA_YEARS, addDays } from "./constants";
import { kpFromLongitude } from "./kpLords";

function balanceText(lord: (typeof DASHA_ORDER)[number], elapsedFractionOfNak: number, yearDays: number) {
  const remainingYearsFloat = DASHA_YEARS[lord] * (1 - elapsedFractionOfNak);
  const totalDays = remainingYearsFloat * yearDays;

  const years = Math.floor(totalDays / yearDays);
  const rem = totalDays - years * yearDays;

  const months = Math.floor(rem / 30);
  const days = Math.floor(rem - months * 30 + 1e-9);

  return {
    yearDays,
    monthDays: 30,
    mahadashaLord: lord,
    balanceYears: years,
    balanceMonths: months,
    balanceDays: days,
    balanceText: `${lord} ${years} Years ${months} Months ${days} Days`,
    elapsedFractionOfNakshatra: elapsedFractionOfNak,
    remainingYearsFloat,
  };
}

function buildNine(lord: (typeof DASHA_ORDER)[number], totalYears: number, startUtc: Date, yearDays: number) {
  const startIndex = DASHA_ORDER.indexOf(lord);
  if (startIndex < 0) throw new Error(`Unknown lord: ${lord}`);

  const out: any[] = [];
  let cursor = new Date(startUtc.getTime());

  for (let i = 0; i < 9; i++) {
    const L = DASHA_ORDER[(startIndex + i) % 9];
    const durYears = (DASHA_YEARS[L] / 120) * totalYears;
    const durDays = durYears * yearDays;

    const s = cursor;
    const e = addDays(s, durDays);
    out.push({ lord: L, startUtc: s.toISOString(), endUtc: e.toISOString(), durationDays: durDays, durationYears: durYears });

    cursor = e;
  }
  return out;
}

function indexAt(periods: { startUtc: string; endUtc: string }[], at: Date) {
  const t = at.getTime();
  for (let i = 0; i < periods.length; i++) {
    const s = new Date(periods[i].startUtc).getTime();
    const e = new Date(periods[i].endUtc).getTime();
    if (t >= s && t < e) return i;
  }
  return Math.max(0, periods.length - 1);
}

function buildMahadashaCyclesFromStart(startLord: (typeof DASHA_ORDER)[number], mdStart: Date, yearDays: number) {
  const startIndex = DASHA_ORDER.indexOf(startLord);
  let cursor = new Date(mdStart.getTime());
  const cycles: any[] = [];

  for (let i = 0; i < 9; i++) {
    const mdLord = DASHA_ORDER[(startIndex + i) % 9];
    const mdYears = DASHA_YEARS[mdLord];
    const mdEnd = addDays(cursor, mdYears * yearDays);

    const antardashas = buildNine(mdLord, mdYears, cursor, yearDays).map((ad) => {
      const pratyantars = buildNine(ad.lord, ad.durationYears, new Date(ad.startUtc), yearDays);
      return { ...ad, pratyantars };
    });

    cycles.push({ lord: mdLord, startUtc: cursor.toISOString(), endUtc: mdEnd.toISOString(), antardashas });
    cursor = mdEnd;
  }
  return cycles;
}

export function computeKpDasa(birthUtc: Date, moonLonSidereal: number) {
  const moonKp = kpFromLongitude(moonLonSidereal);
  const mdLord = moonKp.nakshatraLord as (typeof DASHA_ORDER)[number];
  const elapsedFraction = moonKp.elapsedFractionOfNakshatra;

  const balance = {
    classical360: balanceText(mdLord, elapsedFraction, 360),
    display365: balanceText(mdLord, elapsedFraction, 365),
  };

  // core computation: 360-day Vimshottari
  const yearDays = 360;
  const mdYearsTotal = DASHA_YEARS[mdLord];
  const mdTotalDays = mdYearsTotal * yearDays;

  const elapsedDaysInMd = elapsedFraction * mdTotalDays;
  const mdStart = addDays(birthUtc, -elapsedDaysInMd);
  const mdEnd = addDays(mdStart, mdTotalDays);

  const antardashas = buildNine(mdLord, mdYearsTotal, mdStart, yearDays);
  const adIdx = indexAt(antardashas, birthUtc);
  const currentAd = antardashas[adIdx];

  const pratyantars = buildNine(currentAd.lord, currentAd.durationYears, new Date(currentAd.startUtc), yearDays);
  const pdIdx = indexAt(pratyantars, birthUtc);
  const currentPd = pratyantars[pdIdx];

  const sookshmas = buildNine(currentPd.lord, currentPd.durationYears, new Date(currentPd.startUtc), yearDays);

  const mahadashaCycle = buildMahadashaCyclesFromStart(mdLord, mdStart, yearDays);

  // UI cycle "from birth" (365-day slicing display style)
  const startIndex = DASHA_ORDER.indexOf(mdLord);
  let cursor = new Date(birthUtc.getTime());
  const mahadashaCycleFromBirth: any[] = [];
  for (let i = 0; i < 9; i++) {
    const L = DASHA_ORDER[(startIndex + i) % 9];
    const yrs = i === 0 ? mdYearsTotal : DASHA_YEARS[L];
    const end = addDays(cursor, 365 * yrs);
    const ads = buildNine(L, yrs, cursor, 365);
    mahadashaCycleFromBirth.push({ lord: L, startUtc: cursor.toISOString(), endUtc: end.toISOString(), antardashas: ads });
    cursor = end;
  }

  return {
    dateBasis: { yearDays, monthDays: 30 },
    birthUtc: birthUtc.toISOString(),
    mahadasha: { lord: mdLord, startUtc: mdStart.toISOString(), endUtc: mdEnd.toISOString(), balance },
    antardashas,
    current: {
      antardasha: currentAd,
      pratyantars,
      currentPratyantar: {
        pratyantar: currentPd,
        sookshmas,
      },
    },
    mahadashaCycle,
    mahadashaCycleFromBirth,
  };
}
