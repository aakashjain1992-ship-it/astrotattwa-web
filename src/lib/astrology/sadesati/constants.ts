/**
 * Sade Sati Constants
 * 
 * @file src/lib/astrology/sadesati/constants.ts
 * @version 1.0.0
 * @created February 28, 2026
 */

import type { SadeSatiPhase } from '@/types/sadesati';

/**
 * Saturn's average sidereal period
 * Saturn takes approximately 29.5 years to complete one zodiac cycle
 */
export const SATURN_SIDEREAL_PERIOD_YEARS = 29.457;

/**
 * Average time Saturn spends in one sign
 * 29.457 years / 12 signs ≈ 2.454 years per sign
 */
export const SATURN_PERIOD_PER_SIGN_YEARS = SATURN_SIDEREAL_PERIOD_YEARS / 12;

/**
 * Average days Saturn spends in one sign
 * Approximately 896 days
 */
export const SATURN_PERIOD_PER_SIGN_DAYS = SATURN_PERIOD_PER_SIGN_YEARS * 365.25;

/**
 * Total Sade Sati duration (3 signs × ~2.45 years)
 * Approximately 7.36 years
 */
export const SADESATI_TOTAL_YEARS = SATURN_PERIOD_PER_SIGN_YEARS * 3;

/**
 * Total Sade Sati duration in days
 * Approximately 2,688 days (7.36 years)
 */
export const SADESATI_TOTAL_DAYS = SATURN_PERIOD_PER_SIGN_DAYS * 3;

/**
 * Rashi (sign) names in order (1-12)
 */
export const RASHI_NAMES = [
  'Aries',      // 1 - Mesha
  'Taurus',     // 2 - Vrishabha
  'Gemini',     // 3 - Mithuna
  'Cancer',     // 4 - Karka
  'Leo',        // 5 - Simha
  'Virgo',      // 6 - Kanya
  'Libra',      // 7 - Tula
  'Scorpio',    // 8 - Vrishchika
  'Sagittarius',// 9 - Dhanu
  'Capricorn',  // 10 - Makara
  'Aquarius',   // 11 - Kumbha
  'Pisces',     // 12 - Meena
] as const;

/**
 * Sanskrit Rashi names
 */
export const RASHI_SANSKRIT_NAMES = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrishchika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
] as const;

/**
 * Phase descriptions
 */
export const PHASE_DESCRIPTIONS: Record<SadeSatiPhase, string> = {
  Rising: 'Saturn transiting 12th house from Moon - Challenges begin, expenses increase',
  Peak: 'Saturn transiting same sign as Moon - Maximum intensity, major life changes',
  Setting: 'Saturn transiting 2nd house from Moon - Financial pressure, gradual recovery',
};

/**
 * Detailed effects for each phase
 */
export const PHASE_EFFECTS: Record<SadeSatiPhase, string[]> = {
  Rising: [
    'Increased expenses and financial outflow',
    'Separation from loved ones or distant travel',
    'Hidden enemies and obstacles emerge',
    'Sleep disturbances and mental stress',
    'Interest in spirituality and foreign matters',
    'Losses through speculation or poor decisions',
  ],
  Peak: [
    'Maximum challenges and significant life changes',
    'Health issues and reduced vitality',
    'Career obstacles and reputation challenges',
    'Emotional turbulence and mood swings',
    'Relationship stress and misunderstandings',
    'Important decisions with lasting impact',
    'Mental pressure and anxiety',
  ],
  Setting: [
    'Financial pressure and family disputes',
    'Speech-related challenges and communication issues',
    'Strain in close relationships',
    'Concerns about wealth and assets',
    'Gradual recovery and learning discipline',
    'Building patience and resilience',
  ],
};

/**
 * Recommended remedies for each phase
 */
export const PHASE_REMEDIES: Record<SadeSatiPhase, string[]> = {
  Rising: [
    'Chant "Om Sham Shanicharaya Namah" 108 times daily',
    'Donate black items (sesame, black cloth, iron) on Saturdays',
    'Worship Lord Hanuman - recite Hanuman Chalisa',
    'Light a mustard oil lamp under Peepal tree on Saturdays',
    'Help elderly, disabled, and underprivileged people',
    'Avoid unnecessary expenses and legal disputes',
    'Practice meditation and spiritual activities',
  ],
  Peak: [
    'Perform Shani Shanti puja by a qualified priest',
    'Wear blue sapphire (Neelam) after astrological consultation',
    'Recite Shani Stotra and Dasharatha Shani Stotra',
    'Feed crows with cooked rice and chapati',
    'Donate to Saturn-related causes on Saturdays',
    'Maintain discipline in daily routine and work',
    'Seek blessings from parents and elders',
    'Practice patience and avoid impulsive decisions',
  ],
  Setting: [
    'Continue Saturn remedies with dedication',
    'Strengthen family relationships and communication',
    'Be careful with speech - speak truth with kindness',
    'Manage finances carefully and avoid debt',
    'Practice gratitude and positive thinking',
    'Prepare mentally for post-Sade Sati opportunities',
    'Donate food to the needy',
  ],
};

/**
 * Life areas affected by each phase
 */
export const PHASE_AFFECTED_AREAS: Record<SadeSatiPhase, string[]> = {
  Rising: [
    'Expenses & Losses',
    'Foreign Affairs',
    'Sleep & Rest',
    'Spirituality',
    'Hidden Enemies',
    'Isolation',
  ],
  Peak: [
    'Health & Vitality',
    'Self-Identity',
    'Mental State',
    'Career & Reputation',
    'Overall Life Direction',
    'Physical Appearance',
  ],
  Setting: [
    'Wealth & Assets',
    'Family Relations',
    'Speech & Communication',
    'Food & Nutrition',
    'Savings',
    'Self-Worth',
  ],
};

/**
 * Positive aspects (silver lining) of each phase
 */
export const PHASE_POSITIVE_ASPECTS: Record<SadeSatiPhase, string[]> = {
  Rising: [
    'Spiritual growth and inner development',
    'Opportunity for foreign travel or relocation',
    'Learning detachment and letting go',
    'Development of intuition and inner wisdom',
  ],
  Peak: [
    'Major life transformation and maturity',
    'Building resilience and inner strength',
    'Karmic lessons leading to wisdom',
    'Opportunity to reinvent yourself',
    'Clearing of past karmic debts',
  ],
  Setting: [
    'Learning financial discipline',
    'Strengthening family bonds through challenges',
    'Developing patience and diplomatic skills',
    'Preparing for prosperity post-Sade Sati',
  ],
};

/**
 * Get sign name from sign number (1-12)
 */
export function getSignName(signNumber: number): string {
  if (signNumber < 1 || signNumber > 12) {
    return 'Unknown';
  }
  return RASHI_NAMES[signNumber - 1];
}

/**
 * Get Sanskrit sign name from sign number (1-12)
 */
export function getSignSanskritName(signNumber: number): string {
  if (signNumber < 1 || signNumber > 12) {
    return 'Unknown';
  }
  return RASHI_SANSKRIT_NAMES[signNumber - 1];
}

/**
 * Calculate house position from Moon
 * @param planetSign - Planet's sign number (1-12)
 * @param moonSign - Moon's sign number (1-12)
 * @returns House number from Moon (1-12)
 */
export function getHouseFromMoon(planetSign: number, moonSign: number): number {
  let house = planetSign - moonSign + 1;
  
  // Normalize to 1-12 range
  while (house <= 0) house += 12;
  while (house > 12) house -= 12;
  
  return house;
}
