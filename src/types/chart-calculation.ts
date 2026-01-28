/**
 * Updated Chart Calculation Types - Day 1, Task 1
 * 
 * Added fields:
 * - timePeriod (AM/PM)
 * - latitude, longitude, timezone (from city selection)
 * - Restricted gender to male/female only
 */

// ===== REQUEST TYPES =====

export interface ChartCalculationRequest {
  // Basic Info
  name: string;                    // Required, max 100 chars
  gender: 'male' | 'female';      // Required, only male/female allowed
  
  // Birth Details
  birthDate: string;              // Required, ISO format: "1992-03-25"
  birthTime: string;              // Required, 24h format: "11:55"
  timePeriod: 'AM' | 'PM';        // NEW: Required for UI display
  
  // Location (from city selection)
  cityId: string;                 // UUID from cities table
  latitude: number;               // NEW: -90 to 90
  longitude: number;              // NEW: -180 to 180
  timezone: string;               // NEW: e.g., "Asia/Kolkata"
}

// ===== VALIDATION CONSTRAINTS =====

export const ChartCalculationConstraints = {
  name: {
    minLength: 1,
    maxLength: 100,
  },
  gender: {
    allowedValues: ['male', 'female'] as const,
  },
  birthDate: {
    format: 'YYYY-MM-DD',
    minYear: 1900,
    maxYear: new Date().getFullYear(),
  },
  birthTime: {
    format: 'HH:MM',
    pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  timePeriod: {
    allowedValues: ['AM', 'PM'] as const,
  },
  latitude: {
    min: -90,
    max: 90,
  },
  longitude: {
    min: -180,
    max: 180,
  },
  timezone: {
    minLength: 1,
    examples: ['Asia/Kolkata', 'America/New_York', 'Europe/London'],
  },
} as const;

// ===== HELPER TYPES =====

export type Gender = ChartCalculationRequest['gender'];
export type TimePeriod = ChartCalculationRequest['timePeriod'];

// ===== EXAMPLE REQUEST =====

export const exampleChartRequest: ChartCalculationRequest = {
  name: 'Aakash Jain',
  gender: 'male',
  birthDate: '1992-03-25',
  birthTime: '11:55',
  timePeriod: 'AM',
  cityId: '550e8400-e29b-41d4-a716-446655440000', // Example UUID
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 'Asia/Kolkata',
};
