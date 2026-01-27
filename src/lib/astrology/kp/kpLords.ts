import { DASHA_ORDER, DASHA_YEARS, NAKSHATRA_NAMES, RASI_LORDS_12, norm360 } from "./constants";

const NAK_LORDS_9 = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"] as const;

// 360° = 1296000 arc-seconds; Nakshatra = 13°20' = 48000 arc-seconds
const ZODIAC_SEC = 1296000;
const NAK_SEC = 48000;
const PADA_SEC = 12000;

function splitSeconds(totalSeconds: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[i];
    const n = (DASHA_YEARS[lord] / 120) * totalSeconds;
    const sec = i === 8 ? totalSeconds - sum : Math.floor(n);
    out.push(sec);
    sum += sec;
  }
  const check = out.reduce((a, b) => a + b, 0);
  if (check !== totalSeconds) out[8] += totalSeconds - check;
  return out;
}
const NAK_SPLIT = splitSeconds(NAK_SEC);

function pickLordInSeconds(startLord: string, posSeconds: number, totalSeconds: number, table?: number[]) {
  const startIndex = (DASHA_ORDER as readonly string[]).indexOf(startLord);
  if (startIndex < 0) throw new Error(`Unknown startLord: ${startLord}`);

  const arr = table ?? splitSeconds(totalSeconds);
  let cursor = 0;

  for (let i = 0; i < 9; i++) {
    const idx = (startIndex + i) % 9;
    const lord = DASHA_ORDER[idx];
    const end = cursor + arr[idx];
    if (posSeconds < end || i === 8) return { lord, start: cursor, end };
    cursor = end;
  }
  return { lord: startLord, start: 0, end: totalSeconds };
}

export function kpFromLongitude(lon: number) {
  const x = norm360(lon);
  const rasiLord = RASI_LORDS_12[Math.floor(x / 30)];

  let sec = Math.round(3600 * x) % ZODIAC_SEC;
  if (sec < 0) sec += ZODIAC_SEC;

  const nakIndex = Math.floor(sec / NAK_SEC);
  const withinNak = sec - nakIndex * NAK_SEC;

  const nakshatraName = NAKSHATRA_NAMES[nakIndex];
  const nakshatraLord = NAK_LORDS_9[nakIndex % 9];
  const pada = Math.floor(withinNak / PADA_SEC) + 1;

  const sub = pickLordInSeconds(nakshatraLord, withinNak, NAK_SEC, NAK_SPLIT);
  const subLord = sub.lord;

  const posInSub = withinNak - sub.start;
  const subLen = sub.end - sub.start;
  const subSplit = splitSeconds(subLen);
  const subSubLord = pickLordInSeconds(subLord, posInSub, subLen, subSplit).lord;

  return {
    rasiLord,
    nakshatraName,
    nakshatraPada: pada,
    nakshatraLord,
    subLord,
    subSubLord,
    nakshatraIndex: nakIndex,
    withinNakshatraSeconds: withinNak,
    elapsedFractionOfNakshatra: withinNak / NAK_SEC,
  };
}
