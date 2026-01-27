import { getBodyIds, sweAscendantSidereal, sweCalcSidereal, sweJuldayUTC } from "@/lib/astrology/swissEph";
import { localDateTimeToUtc, parseBirth } from "@/lib/astrology/time";
import { AYANAMSHA_LABEL, norm360 } from "./constants";
import { buildPlanet } from "./planets";
import { computeKpDasa } from "./dasa";

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

  // Node
  let nodeLon: number;
  try {
    nodeLon = (await sweCalcSidereal(jdUt, bodies.MEAN_NODE)).lon;
  } catch {
    nodeLon = (await sweCalcSidereal(jdUt, bodies.TRUE_NODE)).lon;
  }
  planets.Rahu = buildPlanet("Rahu", nodeLon, undefined, sunLon);
  planets.Ketu = buildPlanet("Ketu", norm360(nodeLon + 180), undefined, sunLon);

  const ascLon = await sweAscendantSidereal(jdUt, input.latitude, input.longitude);
  const ascendant = buildPlanet("Ascendant", ascLon, undefined, sunLon);

  const nakshatra = {
    name: planets.Moon.kp.nakshatraName,
    pada: planets.Moon.kp.nakshatraPada,
    lord: planets.Moon.kp.nakshatraLord,
  };

  const dasa = computeKpDasa(birthUtc, planets.Moon.longitude);

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
  };
}
