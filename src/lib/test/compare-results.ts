// src/lib/test/compare-results.ts

/**
 * Test Result Comparison Logic
 * Compares actual calculation results against expected test case data
 */

export interface PlanetComparison {
  planet: string;
  expected: number;
  actual: number;
  difference: number; // in arcminutes
  tolerance: number; // in arcminutes
  passed: boolean;
  nodeMode?: 'TRUE' | 'MEAN';
  trueDifference?: number; 
  meanDifference?: number;
}

export interface AscendantComparison {
  expected: number;
  actual: number;
  difference: number; // in arcminutes
  tolerance: number; // in arcminutes
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
  status: 'passed' | 'failed';
  planets: PlanetComparison[];
  ascendant: AscendantComparison;
  dasha: DashaComparison;
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
}

/**
 * Calculate difference in arcminutes between two longitudes
 */
function calculateArcminuteDifference(expected: number, actual: number): number {
  const diffDegrees = Math.abs(expected - actual);
  return diffDegrees * 60; // Convert degrees to arcminutes
}



/**
 * Compare planetary positions
 */

export function comparePlanets(
  expectedPlanets: Record<string, { longitude: number }>,
  actualPlanets: Record<string, { longitude: number }>,
  tolerance: number = 1.0, // Default: 1 arcminute
  rahuKetuModes?: { trueNode: { Rahu: number; Ketu: number }; meanNode: { Rahu: number; Ketu: number } } 

): PlanetComparison[] {
  require('fs').appendFileSync('/tmp/rahu-debug.txt', `rahuKetuModes: ${JSON.stringify(rahuKetuModes)}\n`);


  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const comparisons: PlanetComparison[] = [];

  for (const planet of planetNames) {
    const expected = expectedPlanets[planet];
    const actual = actualPlanets[planet];

    if (!expected || !actual) {
      // Planet missing in either expected or actual data
      comparisons.push({
        planet,
        expected: expected?.longitude || 0,
        actual: actual?.longitude || 0,
        difference: 999, // Large number to indicate error
        tolerance,
        passed: false,
      });
      continue;
    }

    // Special handling for Rahu/Ketu - check both modes
  if ((planet === 'Rahu' || planet === 'Ketu') && rahuKetuModes) {
    const trueValue = rahuKetuModes.trueNode[planet];
    const meanValue = rahuKetuModes.meanNode[planet];
    
    const trueDiff = calculateArcminuteDifference(expected.longitude, trueValue);
    const meanDiff = calculateArcminuteDifference(expected.longitude, meanValue);
    
    // Use whichever is closer
    const useMean = meanDiff < trueDiff;
    const actualValue = useMean ? meanValue : trueValue;
    const difference = useMean ? meanDiff : trueDiff;
    
    comparisons.push({
      planet,
      expected: expected.longitude,
      actual: actual.Value,
      difference,
      tolerance,
      passed: difference <= tolerance,
      nodeMode: useMean ? 'MEAN' : 'TRUE',
      trueDifference: trueDiff,
      meanDifference: meanDiff,
    });
  } else {
    // Regular planet comparison
    const difference = calculateArcminuteDifference(expected.longitude, actual.longitude);
    comparisons.push({
      planet,
      expected: expected.longitude,
      actual: actual.longitude,
      difference,
      tolerance,
      passed: difference <= tolerance,
    });
  }
} 
 return comparisons;
}  

/**
 * Compare ascendant position
 */
export function compareAscendant(
  expectedAscendant: { longitude: number },
  actualAscendant: { longitude: number },
  tolerance: number = 2.0 // Default: 2 arcminutes
): AscendantComparison {
  const difference = calculateArcminuteDifference(expectedAscendant.longitude, actualAscendant.longitude);
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
 * Compare dasha (mahadasha lord only for now)
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
 * Compare complete test case
 */
export function compareTestCase(
  testCaseId: string,
  testCaseName: string,
  expected: {
    planets: Record<string, { longitude: number }>;
    ascendant: { longitude: number };
    dasha: { mahadasha: string };
  },
  actual: {
    planets: Record<string, { longitude: number }>;
    ascendant: { longitude: number };
    dasha: { mahadasha: string };
    rahuKetuModes?: { trueNode: { Rahu: number; Ketu: number }; meanNode: { Rahu: number; Ketu: number } }; 
  },
  tolerances: {
    planet: number;
    ascendant: number;
  }
): TestCaseResult {
  // Compare all components
  require('fs').appendFileSync('/tmp/rahu-debug.txt', `IN compareTestCase: ${JSON.stringify(actual.rahuKetuModes)}\n`);
  
  const planetComparisons = comparePlanets(expected.planets, actual.planets, tolerances.planet,actual.rahuKetuModes);
  const ascendantComparison = compareAscendant(expected.ascendant, actual.ascendant, tolerances.ascendant);
  const dashaComparison = compareDasha(expected.dasha, actual.dasha);

  // Calculate summary
  const planetsPassed = planetComparisons.filter(p => p.passed).length;
  const planetsTotal = planetComparisons.length;
  const ascendantPassed = ascendantComparison.passed ? 1 : 0;
  const dashaPassed = dashaComparison.passed ? 1 : 0;

  const totalChecks = planetsTotal + 1 + 1; // 9 planets + 1 ascendant + 1 dasha
  const passedChecks = planetsPassed + ascendantPassed + dashaPassed;
  const failedChecks = totalChecks - passedChecks;

  const status = failedChecks === 0 ? 'passed' : 'failed';

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
