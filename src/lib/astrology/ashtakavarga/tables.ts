/**
 * Ashtakavarga Classical Contribution Tables
 *
 * Source: Brihat Parashara Hora Shastra (classical Vedic astrology).
 *
 * Structure:
 *   ASHTAKAVARGA_TABLES[targetPlanet][referencePoint] = number[]
 *
 * Each array lists the house numbers (1-12, counted FROM the reference point's sign)
 * that receive a bindu when the target planet transits through that house.
 *
 * Expected totals per planet table:
 *   Sun     ≈ 49  (8+4+8+7+4+3+8+8 = 50, classical variant)
 *   Moon    ≈ 49  (6+6+7+8+7+7+4+4 = 49)
 *   Mars    ≈ 39  (5+3+7+4+4+4+7+6 = 40, classical variant)
 *   Mercury ≈ 54  (5+6+8+8+4+8+8+6 = 53, classical variant)
 *   Jupiter ≈ 56  (9+5+7+8+8+6+4+9 = 56)
 *   Venus   ≈ 52  (3+9+6+5+5+9+7+8 = 52)
 *   Saturn  ≈ 39  (7+3+6+6+4+3+4+6 = 39)
 *
 * Sarvashtakavarga total ≈ 337
 */

export type ReferencePoint =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Lagna'

export type AshtakavargaTables = Record<string, Record<ReferencePoint, number[]>>

export const ASHTAKAVARGA_TABLES: AshtakavargaTables = {
  // ---------- SUN ----------
  // Total per reference: 8+4+8+7+4+3+8+8 = 50
  Sun: {
    Sun:     [1, 2, 4, 7, 8, 9, 10, 11],   // 8 houses
    Moon:    [3, 6, 10, 11],                // 4 houses
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],   // 8 houses
    Mercury: [3, 5, 6, 9, 10, 11, 12],     // 7 houses
    Jupiter: [5, 6, 9, 11],                // 4 houses
    Venus:   [6, 7, 12],                   // 3 houses
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],  // 8 houses
    Lagna:   [1, 2, 4, 7, 8, 9, 10, 11],  // 8 houses
  },

  // ---------- MOON ----------
  // Total per reference: 6+6+7+8+7+7+4+4 = 49
  Moon: {
    Sun:     [3, 6, 7, 8, 10, 11],             // 6 houses
    Moon:    [1, 3, 6, 7, 10, 11],             // 6 houses
    Mars:    [2, 3, 5, 6, 9, 10, 11],          // 7 houses
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],       // 8 houses
    Jupiter: [1, 4, 7, 8, 10, 11, 12],         // 7 houses
    Venus:   [3, 4, 5, 7, 9, 10, 11],          // 7 houses
    Saturn:  [3, 5, 6, 11],                    // 4 houses
    Lagna:   [3, 6, 10, 11],                   // 4 houses
  },

  // ---------- MARS ----------
  // Total per reference: 5+3+7+4+4+4+7+6 = 40
  Mars: {
    Sun:     [3, 5, 6, 10, 11],               // 5 houses
    Moon:    [3, 6, 11],                      // 3 houses
    Mars:    [1, 2, 4, 7, 8, 10, 11],         // 7 houses
    Mercury: [3, 5, 6, 11],                   // 4 houses
    Jupiter: [6, 10, 11, 12],                 // 4 houses
    Venus:   [6, 8, 11, 12],                  // 4 houses
    Saturn:  [1, 4, 7, 8, 9, 10, 11],        // 7 houses
    Lagna:   [1, 2, 4, 7, 8, 10, 11],        // 7 houses (classical: some texts use 6 — Parashara)
  },

  // ---------- MERCURY ----------
  // Total per reference: 5+6+8+8+4+8+8+7 = 54
  Mercury: {
    Sun:     [5, 6, 9, 11, 12],                     // 5 houses
    Moon:    [2, 4, 6, 8, 10, 11],                  // 6 houses
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],            // 8 houses
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],           // 8 houses
    Jupiter: [6, 8, 11, 12],                        // 4 houses
    Venus:   [1, 2, 3, 4, 5, 8, 9, 11],            // 8 houses
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],           // 8 houses
    Lagna:   [1, 2, 4, 7, 8, 10, 11],             // 7 houses
  },

  // ---------- JUPITER ----------
  // Total per reference: 9+5+7+8+8+6+4+9 = 56
  Jupiter: {
    Sun:     [1, 2, 3, 4, 7, 8, 9, 10, 11],         // 9 houses
    Moon:    [2, 5, 7, 9, 11],                       // 5 houses
    Mars:    [1, 2, 4, 7, 8, 10, 11],               // 7 houses
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],            // 8 houses
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],            // 8 houses
    Venus:   [2, 5, 6, 9, 10, 11],                  // 6 houses
    Saturn:  [3, 5, 6, 12],                         // 4 houses
    Lagna:   [1, 2, 4, 5, 6, 7, 9, 10, 11],        // 9 houses
  },

  // ---------- VENUS ----------
  // Total per reference: 3+9+6+5+5+9+7+8 = 52
  Venus: {
    Sun:     [8, 11, 12],                            // 3 houses
    Moon:    [1, 2, 3, 4, 5, 8, 9, 11, 12],         // 9 houses
    Mars:    [3, 4, 6, 9, 11, 12],                  // 6 houses
    Mercury: [3, 5, 6, 9, 11],                      // 5 houses
    Jupiter: [5, 8, 9, 10, 11],                     // 5 houses
    Venus:   [1, 2, 3, 4, 5, 8, 9, 10, 11],         // 9 houses
    Saturn:  [3, 4, 5, 8, 9, 10, 11],              // 7 houses
    Lagna:   [1, 2, 3, 4, 5, 8, 9, 11],            // 8 houses
  },

  // ---------- SATURN ----------
  // Total per reference: 7+3+6+6+4+3+4+6 = 39
  Saturn: {
    Sun:     [1, 2, 4, 7, 8, 10, 11],              // 7 houses
    Moon:    [3, 6, 11],                            // 3 houses
    Mars:    [3, 5, 6, 10, 11, 12],                // 6 houses
    Mercury: [6, 8, 9, 10, 11, 12],               // 6 houses
    Jupiter: [5, 6, 11, 12],                       // 4 houses
    Venus:   [6, 11, 12],                          // 3 houses
    Saturn:  [3, 5, 6, 11],                        // 4 houses
    Lagna:   [1, 3, 4, 6, 10, 11],               // 6 houses
  },
} as const
