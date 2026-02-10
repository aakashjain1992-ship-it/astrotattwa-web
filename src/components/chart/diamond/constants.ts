/**
 * Diamond Chart Constants
 * Position data and type definitions for North Indian chart layout
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

import type { HouseInfo, PlanetDisplayInfo } from '@/types/astrology';

// Re-export with backward-compatible names
export type HouseData = HouseInfo;
export type PlanetInHouse = PlanetDisplayInfo;


export type ChartSize = 'sm' | 'md' | 'lg';

// ============================================
// SIZE CONFIGURATIONS
// ============================================

export const CHART_SIZES: Record<ChartSize, { viewBox: number; maxWidth: string }> = {
  sm: { viewBox: 600, maxWidth: '300px' },
  md: { viewBox: 600, maxWidth: '450px' },
  lg: { viewBox: 600, maxWidth: '600px' },
};

// ============================================
// HOUSE POSITIONS (for planet placement)
// House 1 at TOP (12 o'clock), going ANTI-CLOCKWISE
// ============================================

export const HOUSE_POSITIONS: Record<number, { x: number; y: number }> = {
  1:  { x: 300, y: 150 },   // Top center (12 o'clock) - ASC
  2:  { x: 150, y: 75 },    // Top-left (11 o'clock)
  3:  { x: 75, y: 150 },    // Left-top (10 o'clock)
  4:  { x: 120, y: 300 },    // Left-center (9 o'clock)
  5:  { x: 75, y: 450 },    // Left-bottom (8 o'clock)
  6:  { x: 150, y: 525 },   // Bottom-left (7 o'clock)
  7:  { x: 300, y: 450 },   // Bottom center (6 o'clock)
  8:  { x: 450, y: 525 },   // Bottom-right (5 o'clock)
  9:  { x: 525, y: 450 },   // Right-bottom (4 o'clock)
  10: { x: 480, y: 300 },   // Right-center (3 o'clock)
  11: { x: 525, y: 150 },   // Right-top (2 o'clock)
  12: { x: 450, y: 75 },    // Top-right (1 o'clock)
};

// ============================================
// RASHI POSITIONS (at edges of chart)
// Numbers displayed at the outer edges
// ============================================

export const RASHI_POSITIONS: Record<number, { x: number; y: number }> = {
  1:  { x: 300, y: 40 },    // Top
  2:  { x: 120, y: 60 },    // Top-left
  3:  { x: 40, y: 150 },    // Left-top
  4:  { x: 40, y: 300 },    // Left-center
  5:  { x: 40, y: 450 },    // Left-bottom
  6:  { x: 120, y: 540 },   // Bottom-left
  7:  { x: 300, y: 560 },   // Bottom
  8:  { x: 480, y: 540 },   // Bottom-right
  9:  { x: 560, y: 450 },   // Right-bottom
  10: { x: 560, y: 300 },   // Right-center
  11: { x: 560, y: 150 },   // Right-top
  12: { x: 480, y: 60 },    // Top-right
};

// ============================================
// GRID LINE COORDINATES
// Diamond geometry for 600x600 viewBox
// ============================================

export const GRID_LINES = {
  // Outer square
  outerSquare: { x: 0, y: 0, width: 600, height: 600 },
  
  // Corner-to-corner diagonals
  diagonals: [
    { x1: 0, y1: 600, x2: 600, y2: 0 },     // Bottom-left to top-right
    { x1: 0, y1: 0, x2: 600, y2: 600 },     // Top-left to bottom-right
  ],
  
  // Inner diamond (midpoint-to-midpoint)
  innerDiamond: [
    { x1: 300, y1: 0, x2: 600, y2: 300 },   // Top to right
    { x1: 600, y1: 300, x2: 300, y2: 600 }, // Right to bottom
    { x1: 300, y1: 600, x2: 0, y2: 300 },   // Bottom to left
    { x1: 0, y1: 300, x2: 300, y2: 0 },     // Left to top
  ],
};

// ============================================
// PLANET SYMBOLS
// ============================================

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

// ============================================
// RASHI (ZODIAC) NAMES
// ============================================

export const RASHI_NAMES: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// ============================================
// PLANET SPACING
// When multiple planets are in one house
// ============================================

export const PLANET_SPACING = {
  vertical: 45,    // Pixels between stacked planets
  fontSize: {
    degree: 12,    // Degree text size
    symbol: 16,    // Planet symbol size
    status: 10,    // Status flags size
  },
};
