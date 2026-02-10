import { getBodyIds, sweAscendantSidereal, sweCalcSidereal, sweJuldayUTC } from "@/lib/astrology/swissEph";
import { localDateTimeToUtc, parseBirth } from "@/lib/astrology/time";
import { AYANAMSHA_LABEL, norm360 } from "./constants";
import { buildPlanet } from "./planets";
import { vimshottariDasha } from "./dasa";
import { calculateAvakahada } from "./avakahada";

export async function calculateKpChart(input: {
  name?: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}) {
  const bodies = await getBodyIds();

  const { yy, mm, dd, hh, mi } = parseBirth(input.birthDate, input.birthTime);
  const { utc: birthUtc, offsetMinutes } = localDateTimeToUtc(yy, mm, dd, hh, mi, input.timezone);

  const jdUt = await sweJuldayUTC(birthUtc);

  // Sun first (needed for combustion calc)
  const sun = await sweCalcSidereal(jdUt, bodies.SUN);
  const planets: any = {};
  planets.Sun = buildPlanet("Sun", sun.lon, sun.speed, undefined);
  const sunLon = planets.Sun.longitude;

  for (const [key, id] of [
    ["Moon", bodies.MOON],
    ["Mercury", bodies.MERCURY],
    ["Venus", bodies.VENUS],
    ["Mars", bodies.MARS],
    ["Jupiter", bodies.JUPITER],
    ["Saturn", bodies.SATURN],
  ] as const) {
    const res = await sweCalcSidereal(jdUt, id);
    planets[key] = buildPlanet(key, res.lon, res.speed, sunLon);
  }

 // Node - Calculate BOTH True and Mean
  
  let trueNodeLon: number;
  let meanNodeLon: number;
  
  try {
    trueNodeLon = (await sweCalcSidereal(jdUt, bodies.TRUE_NODE)).lon;
  } catch {
    trueNodeLon = 0; // fallback
  }
  
  try {
    meanNodeLon = (await sweCalcSidereal(jdUt, bodies.MEAN_NODE)).lon;
  } catch {
    meanNodeLon = 0; // fallback
  }
  
  // Use TRUE_NODE as primary
  const nodeLon = trueNodeLon || meanNodeLon;
  

  planets.Rahu = buildPlanet("Rahu", nodeLon, undefined, sunLon);
  planets.Ketu = buildPlanet("Ketu", norm360(nodeLon + 180), undefined, sunLon);
  
  // Store both modes for comparison
  const rahuKetuModes = {
    trueNode: {
      Rahu: trueNodeLon,
      Ketu: norm360(trueNodeLon + 180)
    },
    meanNode: {
      Rahu: meanNodeLon,
      Ketu: norm360(meanNodeLon + 180)
    }
  };
  
  const ascLon = await sweAscendantSidereal(jdUt, input.latitude, input.longitude);
  const ascendant = buildPlanet("Ascendant", ascLon, undefined, sunLon);

  const nakshatra = {
    name: planets.Moon.kp.nakshatraName,
    pada: planets.Moon.kp.nakshatraPada,
    lord: planets.Moon.kp.nakshatraLord,
  };

  const dasa = vimshottariDasha(
    planets.Moon.longitude,
    birthUtc,
    planets.Moon.kp.elapsedFractionOfNakshatra,
    planets.Moon.kp.nakshatraLord,
    360
  );

  // Calculate Avakahada Chakra attributes
  const avakahada = calculateAvakahada(
    ascLon,
    planets.Moon.longitude,
    planets.Sun.longitude,
    planets.Moon.kp.nakshatraIndex,
    planets.Moon.kp.nakshatraPada,
    planets.Moon.kp.nakshatraLord
  );

  return {
    input: {
      timezone: input.timezone,
      tzOffsetMinutes: offsetMinutes,
      localDateTime: `${input.birthDate}T${input.birthTime}`,
      utcDateTime: birthUtc.toISOString(),
      julianDayUT: jdUt,
      latitude: input.latitude,
      longitude: input.longitude,
    },
    ayanamsha: AYANAMSHA_LABEL,
    planets,
    ascendant,
    nakshatra,
    dasa,
    avakahada,
    rahuKetuModes, 
  };
}
