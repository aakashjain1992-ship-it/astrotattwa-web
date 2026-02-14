import path from "path";

export interface SweCalcResult {
  longitude?: number;
  latitude?: number;
  distance?: number;
  longitudeSpeed?: number;
  latitudeSpeed?: number;
  distanceSpeed?: number;
  data?: number[];
  rflag?: number;
  error?: string;
}


export interface SweHousesResult {
  cusps?: number[];
  ascmc?: number[];
  ascendant?: number;
  mc?: number;
}

export interface SwissEph {
  swe_set_ephe_path: (path: string) => void;
  swe_set_sid_mode: (mode: number, t0: number, ayan_t0: number) => void;
  swe_close: () => void;
  swe_julday: (year: number, month: number, day: number, hour: number, cal: number) => number;
  swe_revjul: (jd: number, cal: number) => { year: number; month: number; day: number; hour: number };
  swe_calc_ut: (jdUt: number, planet: number, flags: number) => SweCalcResult;
  swe_calc: (jd: number, planet: number, flags: number) => SweCalcResult;
  swe_houses?: (jd: number, lat: number, lon: number, hsys: string) => SweHousesResult;
  swe_houses_ex?: (jd: number, flags: number, lat: number, lon: number, hsys: string) => SweHousesResult;
  swe_get_ayanamsa_ut: (jdUt: number) => number;
  swe_get_ayanamsa: (jd: number) => number;
  SE_SUN: number;
  SE_MOON: number;
  SE_MERCURY: number;
  SE_VENUS: number;
  SE_MARS: number;
  SE_JUPITER: number;
  SE_SATURN: number;
  SE_URANUS: number;
  SE_NEPTUNE: number;
  SE_PLUTO: number;
  SE_MEAN_NODE: number;
  SE_TRUE_NODE: number;
  SE_CHIRON: number;
  SEFLG_SWIEPH: number;
  SEFLG_JPLEPH: number;
  SEFLG_SIDEREAL: number;
  SEFLG_SPEED: number;
  SEFLG_NOGDEFL: number;
  SEFLG_NOABERR: number;
  SEFLG_EQUATORIAL: number;
  SEFLG_XYZ: number;
  SEFLG_RADIANS: number;
  SEFLG_BARYCTR: number;
  SEFLG_TOPOCTR: number;
  SE_GREG_CAL: number;
  SE_JUL_CAL: number;
  SE_SIDM_LAHIRI: number;
  SE_SIDM_FAGAN_BRADLEY: number;
  SE_SIDM_RAMAN: number;
  SE_SIDM_TRUE_CITRA: number;
  SE_SIDM_TRUE_REVATI: number;
  SE_SIDM_TRUE_PUSHYA: number;
  SE_SIDM_USER: number;
}


let swe: SwissEph | null = null;

export async function getSwe(): Promise<SwissEph> {
  if (!swe) {
    swe = await import("swisseph") as unknown as SwissEph;
    const ephePath = path.join(process.cwd(), "public", "ephe");
    swe.swe_set_ephe_path(ephePath);
    // Lahiri ayanamsa (standard Vedic astrology)
    swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
  }
  return swe;
}

export async function sweJuldayUTC(utc: Date): Promise<number> {
  const s = await getSwe();
  const y = utc.getUTCFullYear();
  const m = utc.getUTCMonth() + 1;
  const d = utc.getUTCDate();
  const hour = utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600;
  return s.swe_julday(y, m, d, hour, s.SE_GREG_CAL);
}

export async function sweCalcSidereal(jdUt: number, body: number): Promise<{ lon: number; speed?: number }> {
  const s = await getSwe();
  const flags = s.SEFLG_SIDEREAL | s.SEFLG_SPEED;
  const res = s.swe_calc_ut(jdUt, body, flags);

  if (!res) throw new Error("Empty swe_calc_ut result");
  if (typeof res?.rflag === "number" && res.rflag < 0) throw new Error(res.error || "Swiss Ephemeris error");

  // Different bindings return different shapes; support the common ones.
  if (typeof res.longitude === "number") {
    return { lon: res.longitude, speed: typeof res.longitudeSpeed === "number" ? res.longitudeSpeed : undefined };
  }
  if (Array.isArray(res.data) && typeof res.data[0] === "number") {
    return { lon: res.data[0], speed: typeof res.data[3] === "number" ? res.data[3] : undefined };
  }
  throw new Error("Unknown SwissEph result shape");
}

export async function sweAscendantSidereal(jdUt: number, lat: number, lon: number): Promise<number> {
  const s = await getSwe();
  const flags = s.SEFLG_SIDEREAL;

  let res: SweHousesResult;
  if (typeof s.swe_houses_ex === "function") res = s.swe_houses_ex(jdUt, flags, lat, lon, "P");
  else if (typeof s.swe_houses === "function") res = s.swe_houses(jdUt, lat, lon, "P");
  else throw new Error("Swiss Ephemeris houses function not available.");

  const asc = (Array.isArray(res?.ascmc) ? res.ascmc[0] : undefined) ?? res?.ascendant;
  if (typeof asc !== "number") throw new Error("Could not extract ascendant from houses result");
  return asc;
}

export async function getBodyIds() {
  const s = await getSwe();
  return {
    SUN: s.SE_SUN,
    MOON: s.SE_MOON,
    MERCURY: s.SE_MERCURY,
    VENUS: s.SE_VENUS,
    MARS: s.SE_MARS,
    JUPITER: s.SE_JUPITER,
    SATURN: s.SE_SATURN,
    MEAN_NODE: s.SE_MEAN_NODE,
    TRUE_NODE: s.SE_TRUE_NODE,
  };
}
