import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===== DECIMAL ROUNDING HELPERS - Day 1, Task 4 =====

/**
 * Round a number to specified decimal places
 * Default: 2 decimal places for all calculations
 * 
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 * 
 * @example
 * roundToDecimal(1.23456) // 1.23
 * roundToDecimal(1.23456, 4) // 1.2346
 */
export function roundToDecimal(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Round all numeric values in planet data to 2 decimal places
 * 
 * @param planet - Planet data object
 * @returns Planet data with rounded decimals
 */
export function roundPlanetDecimals(planet: any) {
  return {
    ...planet,
    longitude: roundToDecimal(planet.longitude),
    degreeInSign: roundToDecimal(planet.degreeInSign),
    speed: roundToDecimal(planet.speed),
    combustionOrbDegrees: planet.combustionOrbDegrees 
      ? roundToDecimal(planet.combustionOrbDegrees) 
      : undefined,
  };
}

/**
 * Round all planets in a planets object
 * 
 * @param planets - Object with planet names as keys
 * @returns Planets object with all decimals rounded to 2 places
 */
export function roundAllPlanets(planets: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const [name, data] of Object.entries(planets)) {
    result[name] = roundPlanetDecimals(data);
  }
  return result;
}

/**
 * Round ascendant data decimals
 * 
 * @param ascendant - Ascendant data object
 * @returns Ascendant data with rounded decimals
 */
export function roundAscendantDecimals(ascendant: any) {
  return {
    ...ascendant,
    longitude: roundToDecimal(ascendant.longitude),
    degreeInSign: roundToDecimal(ascendant.degreeInSign),
  };
}
