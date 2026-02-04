/**
 * Test Result Comparison Logic
 * Compares actual calculation results against expected test case data
 *
 * Rules:
 * - All tolerances are in ARC-MINUTES.
 * - Default tolerance is 4 arcmin for EVERYTHING (planets + ascendant).
 * - Longitude differences are circular (wrap-safe across 0°/360°).
 * - Rahu/Ketu: if rahuKetuModes provided, compare expected against BOTH true & mean node,
 *   pick the closer one and record which node mode was used.
 */

export interface PlanetComparison {
  planet: string;
  expected: number; // degrees
  actual: number; // degrees
  difference: number; // arcminutes
  tolerance: number; // arcminutes
  passed: boolean;
  nodeMode?: "TRUE" | "MEAN";
  trueDifference?: number; // arcminutes
  meanDifference?: number; // arcminutes
}

export interface AscendantComparison {
  expected: number; // degrees
  actual: number; // degrees
  difference: number; // arcminutes
  tolerance: number; // arcminutes
  passed: boolean;
}

export interface DashaComparison {
  expectedMahadasha: string;
  actualMahadasha: string;
  passed: boolean;
}

export interface TestCaseResult {
  testCaseId: string;
  testCaseName: string;
  status: "passed" | "failed";
  planets: PlanetComparison[];
  ascendant: AscendantComparison;
  dasha: DashaComparison;
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
}

export type RahuKetuModes = {
  trueNode: { Rahu: number; Ketu: number };
  meanNode: { Rahu: number; Ketu: number };
};

export type LongitudeMap = Record<string, { longitude: number }>;

const DEFAULT_TOLERANCE_ARCMIN = 4;

/**
 * Circular difference in arcminutes between two longitudes (wrap-safe).
 * Example: 359.9° vs 0.1° => 0.2° => 12 arcmin
 */
function arcminDiff(expectedDeg: number, actualDeg: number): number {
  const raw = Math.abs(expectedDeg - actualDeg) % 360;
  const diffDeg = Math.min(raw, 360 - raw);
  return diffDeg * 60;
}

/**
 * Compare planetary positions.
 * toleranceArcMin is ARC-MINUTES. Default = 4.
 */
export function comparePlanets(
  expectedPlanets: LongitudeMap,
  actualPlanets: LongitudeMap,
  toleranceArcMin: number = DEFAULT_TOLERANCE_ARCMIN,
  rahuKetuModes?: RahuKetuModes
): PlanetComparison[] {
  const planetNames = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
    "Rahu",
    "Ketu",
  ] as const;

  const comparisons: PlanetComparison[] = [];
  const tolerance = toleranceArcMin ?? DEFAULT_TOLERANCE_ARCMIN;

  for (const planet of planetNames) {
    const expected = expectedPlanets[planet];
    const actual = actualPlanets[planet];

    // Missing data => fail but keep structure intact
    if (!expected || !actual) {
      comparisons.push({
        planet,
        expected: expected?.longitude ?? 0,
        actual: actual?.longitude ?? 0,
        difference: 999,
        tolerance,
        passed: false,
      });
      continue;
    }

    // Rahu/Ketu handling if node modes available
    if ((planet === "Rahu" || planet === "Ketu") && rahuKetuModes) {
      const node = planet as "Rahu" | "Ketu";

      const trueValue = rahuKetuModes.trueNode[node];
      const meanValue = rahuKetuModes.meanNode[node];

      const trueDifference = arcminDiff(expected.longitude, trueValue);
      const meanDifference = arcminDiff(expected.longitude, meanValue);

      // Choose the closer one (tie -> MEAN by default)
      const useMean = meanDifference <= trueDifference;
      const chosenActual = useMean ? meanValue : trueValue;
      const difference = useMean ? meanDifference : trueDifference;

      comparisons.push({
        planet,
        expected: expected.longitude,
        actual: chosenActual,
        difference,
        tolerance,
        passed: difference <= tolerance,
        nodeMode: useMean ? "MEAN" : "TRUE",
        trueDifference,
        meanDifference,
      });
      continue;
    }

    // Normal planet
    const difference = arcminDiff(expected.longitude, actual.longitude);

    comparisons.push({
      planet,
      expected: expected.longitude,
      actual: actual.longitude,
      difference,
      tolerance,
      passed: difference <= tolerance,
    });
  }

  return comparisons;
}

/**
 * Compare ascendant position.
 * toleranceArcMin is ARC-MINUTES. Default = 4.
 */
export function compareAscendant(
  expectedAscendant: { longitude: number },
  actualAscendant: { longitude: number },
  toleranceArcMin: number = DEFAULT_TOLERANCE_ARCMIN
): AscendantComparison {
  const tolerance = toleranceArcMin ?? DEFAULT_TOLERANCE_ARCMIN;
  const difference = arcminDiff(expectedAscendant.longitude, actualAscendant.longitude);
  const passed = difference <= tolerance;

  return {
    expected: expectedAscendant.longitude,
    actual: actualAscendant.longitude,
    difference,
    tolerance,
    passed,
  };
}

/**
 * Compare dasha (mahadasha lord only)
 */
export function compareDasha(
  expectedDasha: { mahadasha: string },
  actualDasha: { mahadasha: string }
): DashaComparison {
  const passed = expectedDasha.mahadasha === actualDasha.mahadasha;

  return {
    expectedMahadasha: expectedDasha.mahadasha,
    actualMahadasha: actualDasha.mahadasha,
    passed,
  };
}

/**
 * Compare complete test case.
 *
 * tolerances are ARC-MINUTES.
 * Defaults:
 * - planet: 4 arcmin
 * - ascendant: 4 arcmin
 */
export function compareTestCase(
  testCaseId: string,
  testCaseName: string,
  expected: {
    planets: LongitudeMap;
    ascendant: { longitude: number };
    dasha: { mahadasha: string };
  },
  actual: {
    planets: LongitudeMap;
    ascendant: { longitude: number };
    dasha: { mahadasha: string };
    rahuKetuModes?: RahuKetuModes;
  },
  tolerances?: {
    planet?: number; // arcminutes
    ascendant?: number; // arcminutes
  }
): TestCaseResult {
  // 🔒 Default = 4 arcmin for EVERYTHING
  const planetTol = tolerances?.planet ?? DEFAULT_TOLERANCE_ARCMIN;
  const ascendantTol = tolerances?.ascendant ?? DEFAULT_TOLERANCE_ARCMIN;

  const planetComparisons = comparePlanets(
    expected.planets,
    actual.planets,
    planetTol,
    actual.rahuKetuModes
  );

  const ascendantComparison = compareAscendant(
    expected.ascendant,
    actual.ascendant,
    ascendantTol
  );

  const dashaComparison = compareDasha(expected.dasha, actual.dasha);

  const planetsPassed = planetComparisons.filter((p) => p.passed).length;
  const planetsTotal = planetComparisons.length;

  const ascendantPassed = ascendantComparison.passed ? 1 : 0;
  const dashaPassed = dashaComparison.passed ? 1 : 0;

  const totalChecks = planetsTotal + 1 + 1;
  const passedChecks = planetsPassed + ascendantPassed + dashaPassed;
  const failedChecks = totalChecks - passedChecks;

  const status: "passed" | "failed" = failedChecks === 0 ? "passed" : "failed";

  return {
    testCaseId,
    testCaseName,
    status,
    planets: planetComparisons,
    ascendant: ascendantComparison,
    dasha: dashaComparison,
    summary: {
      totalChecks,
      passedChecks,
      failedChecks,
    },
  };
}
