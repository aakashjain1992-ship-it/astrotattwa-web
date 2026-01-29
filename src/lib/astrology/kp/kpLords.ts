import { DASHA_YEARS, DASHA_ORDER } from "./constants";

// Nakshatra span in arc-seconds: 360° / 27 nakshatras = 13.333° per nakshatra
// 13.333° × 3600 arc-seconds/degree = 48000 arc-seconds
const NAK_SPAN_SEC = 48000;

type DashaLord = (typeof DASHA_ORDER)[number];

export interface KpData {
  rasiLord: string;
  nakshatraName: string;
  nakshatraPada: number;
  nakshatraLord: DashaLord;
  subLord: DashaLord;
  subSubLord: DashaLord;
  nakshatraIndex: number;
  withinNakshatraSeconds: number;
  elapsedFractionOfNakshatra: number;
}

const NAK_NAMES = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

export function kpLordsOfLongitude(x: number): KpData {
  // CRITICAL FIX: Use Math.floor instead of Math.round to preserve precision
  let sec = Math.floor(3600 * x) % (360 * 3600);

  const nakIndex = Math.floor(sec / NAK_SPAN_SEC);
  const nakLord = DASHA_ORDER[nakIndex % 9];
  const withinNakSec = sec % NAK_SPAN_SEC;

  const rasiIndex = Math.floor(x / 30);
  const rasiLord = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"][rasiIndex];

  const pada = Math.floor(withinNakSec / (NAK_SPAN_SEC / 4)) + 1;

  // Sub-lord calculation
  const subTable = buildSubTable(nakLord);
  const subIdx = subTable.findIndex((s) => withinNakSec < s.endSec);
  const subLord = subIdx >= 0 ? subTable[subIdx].planet : nakLord;

  // Sub-sub calculation
  const subSubTable = buildSubSubTable(nakLord, subLord);
  const subSubIdx = subSubTable.findIndex((s) => withinNakSec < s.endSec);
  const subSubLord = subSubIdx >= 0 ? subSubTable[subSubIdx].planet : subLord;

  return {
    rasiLord,
    nakshatraName: NAK_NAMES[nakIndex],
    nakshatraPada: pada,
    nakshatraLord: nakLord,
    subLord,
    subSubLord,
    nakshatraIndex: nakIndex,
    withinNakshatraSeconds: withinNakSec,
    elapsedFractionOfNakshatra: withinNakSec / NAK_SPAN_SEC,
  };
}

function buildSubTable(lord: DashaLord) {
  const idx = DASHA_ORDER.indexOf(lord);
  const table: { planet: DashaLord; endSec: number }[] = [];
  let cumul = 0;
  for (let i = 0; i < 9; i++) {
    const p = DASHA_ORDER[(idx + i) % 9];
    const ratio = DASHA_YEARS[p] / 120;
    cumul += ratio * NAK_SPAN_SEC;
    table.push({ planet: p, endSec: cumul });
  }
  return table;
}

function buildSubSubTable(nakLord: DashaLord, subLord: DashaLord) {
  const nakIdx = DASHA_ORDER.indexOf(nakLord);
  const subIdx = DASHA_ORDER.indexOf(subLord);

  const subStart = (() => {
    let s = 0;
    for (let i = 0; i < 9; i++) {
      const p = DASHA_ORDER[(nakIdx + i) % 9];
      if (p === subLord) return s;
      s += (DASHA_YEARS[p] / 120) * NAK_SPAN_SEC;
    }
    return 0;
  })();

  const subSpan = (DASHA_YEARS[subLord] / 120) * NAK_SPAN_SEC;

  const table: { planet: DashaLord; endSec: number }[] = [];
  let cumul = subStart;
  for (let i = 0; i < 9; i++) {
    const p = DASHA_ORDER[(subIdx + i) % 9];
    const ratio = DASHA_YEARS[p] / 120;
    cumul += ratio * subSpan;
    table.push({ planet: p, endSec: cumul });
  }
  return table;
}

// Export alias for backward compatibility
export const kpFromLongitude = kpLordsOfLongitude;
