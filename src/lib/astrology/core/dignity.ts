import { norm360, signDeg, SIGNS } from "./constants";

type Dignity = {
  exalted: boolean;
  debilitated: boolean; // "exhausted"
  exaltationSign?: (typeof SIGNS)[number];
  debilitationSign?: (typeof SIGNS)[number];
};

const EXALTATION_SIGN: Record<string, (typeof SIGNS)[number]> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mars: "Capricorn",
  Mercury: "Virgo",
  Jupiter: "Cancer",
  Venus: "Pisces",
  Saturn: "Libra",
  Rahu: "Taurus", // commonly used in many KP apps (varies by tradition)
  Ketu: "Scorpio", // commonly used in many KP apps (varies by tradition)
};

const DEBILITATION_SIGN: Record<string, (typeof SIGNS)[number]> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mars: "Cancer",
  Mercury: "Pisces",
  Jupiter: "Capricorn",
  Venus: "Virgo",
  Saturn: "Aries",
  Rahu: "Scorpio",
  Ketu: "Taurus",
};

export function dignityOf(planetKey: string, lon: number): Dignity {
  const { sign } = signDeg(norm360(lon));
  const ex = EXALTATION_SIGN[planetKey];
  const deb = DEBILITATION_SIGN[planetKey];
  return {
    exalted: !!ex && sign === ex,
    debilitated: !!deb && sign === deb,
    exaltationSign: ex,
    debilitationSign: deb,
  };
}
