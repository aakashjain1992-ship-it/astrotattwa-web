import { dignityOf } from "./dignity";
import { kpFromLongitude } from "./kpLords";
import { norm360, signDeg, SIGNS } from "./constants";

const COMBUST_ORB: Record<string, number> = { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15 };

function combustion(planet: string, lon: number, sunLon?: number) {
  const orb = COMBUST_ORB[planet];
  if (!orb || typeof sunLon !== "number" || planet === "Sun") return { combust: false as const, combustionOrbDeg: undefined as number | undefined };

  const d = Math.abs((norm360(lon) - norm360(sunLon) + 540) % 360 - 180);
  if (d <= orb) return { combust: true as const, combustionOrbDeg: d };
  return { combust: false as const, combustionOrbDeg: undefined };
}

// NEW: Proper exhausted calculation
function isExhausted(
  planet: string,
  isDebilitated: boolean,
  isCombust: boolean,
  speed: number | undefined
): boolean {
  // Rahu and Ketu are always retrograde, don't check speed for them
  if (planet === "Rahu" || planet === "Ketu") {
    return isDebilitated || isCombust;
  }

  // For other planets, check: debilitated OR combust OR very slow motion
  const hasSlowSpeed = speed !== undefined && Math.abs(speed) < 0.5;
  
  return isDebilitated || isCombust || hasSlowSpeed;
}

export function buildPlanet(key: string, lon: number, speed: number | undefined, sunLon: number | undefined) {
  const sd = signDeg(lon);
  const retro = key === "Rahu" || key === "Ketu" || (typeof speed === "number" && speed < 0);
  const comb = combustion(key, lon, sunLon);
  const dign = dignityOf(key, lon);

  // Calculate signNumber (1-12) from sign name
  const signNumber = SIGNS.indexOf(sd.sign) + 1;

  // Calculate exhausted state properly
  const exhausted = isExhausted(key, dign.debilitated, comb.combust, speed);

  return {
    key,
    longitude: norm360(lon),
    speed,
    retrograde: retro,
    combust: comb.combust,
    combustionOrbDeg: comb.combustionOrbDeg,
    exalted: dign.exalted,
    debilitated: dign.debilitated,
    exhausted, // UPDATED: Proper calculation (debilitated OR combust OR slow speed)
    sign: sd.sign,
    signNumber, // Day 1, Task 2 - Added signNumber (1-12)
    degreeInSign: sd.degreeInSign,
    kp: kpFromLongitude(lon),
  };
}
