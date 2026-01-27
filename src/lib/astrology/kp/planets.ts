import { dignityOf } from "./dignity";
import { kpFromLongitude } from "./kpLords";
import { norm360, signDeg } from "./constants";

const COMBUST_ORB: Record<string, number> = { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15 };

function combustion(planet: string, lon: number, sunLon?: number) {
  const orb = COMBUST_ORB[planet];
  if (!orb || typeof sunLon !== "number" || planet === "Sun") return { combust: false as const, combustionOrbDeg: undefined as number | undefined };

  const d = Math.abs((norm360(lon) - norm360(sunLon) + 540) % 360 - 180);
  if (d <= orb) return { combust: true as const, combustionOrbDeg: d };
  return { combust: false as const, combustionOrbDeg: undefined };
}

export function buildPlanet(key: string, lon: number, speed: number | undefined, sunLon: number | undefined) {
  const sd = signDeg(lon);
  const retro = key === "Rahu" || key === "Ketu" || (typeof speed === "number" && speed < 0);
  const comb = combustion(key, lon, sunLon);
  const dign = dignityOf(key, lon);

  return {
    key,
    longitude: norm360(lon),
    speed,
    retrograde: retro,
    combust: comb.combust,
    combustionOrbDeg: comb.combustionOrbDeg,
    // "Exhausted" requested → expose as "debilitated" and also alias it
    exalted: dign.exalted,
    debilitated: dign.debilitated,
    exhausted: dign.debilitated,
    sign: sd.sign,
    degreeInSign: sd.degreeInSign,
    kp: kpFromLongitude(lon),
  };
}
