/** Varna rank by Moon sign (1-12 → Aries=1 … Pisces=12) */
export const VARNA_BY_SIGN: Record<number, { name: string; rank: number }> = {
  1:  { name: 'Kshatriya', rank: 3 }, // Aries
  2:  { name: 'Vaishya',   rank: 2 }, // Taurus
  3:  { name: 'Shudra',    rank: 1 }, // Gemini
  4:  { name: 'Brahmin',   rank: 4 }, // Cancer
  5:  { name: 'Kshatriya', rank: 3 }, // Leo
  6:  { name: 'Vaishya',   rank: 2 }, // Virgo
  7:  { name: 'Shudra',    rank: 1 }, // Libra
  8:  { name: 'Brahmin',   rank: 4 }, // Scorpio
  9:  { name: 'Kshatriya', rank: 3 }, // Sagittarius
  10: { name: 'Vaishya',   rank: 2 }, // Capricorn
  11: { name: 'Shudra',    rank: 1 }, // Aquarius
  12: { name: 'Brahmin',   rank: 4 }, // Pisces
}

/**
 * Yoni sex by nakshatra index (0-26).
 * 'M' = male yoni, 'F' = female yoni.
 * Same animal + opposite sex = natural pair (4 pts).
 */
export const YONI_SEX: ('M' | 'F')[] = [
  'M', // 0  Ashwini      — Horse (M)
  'M', // 1  Bharani      — Elephant (M)
  'F', // 2  Krittika     — Goat (F)
  'M', // 3  Rohini       — Serpent (M)
  'F', // 4  Mrigashira   — Serpent (F)
  'F', // 5  Ardra        — Dog (F)
  'F', // 6  Punarvasu    — Cat (F)
  'M', // 7  Pushya       — Goat (M)
  'M', // 8  Ashlesha     — Cat (M)
  'M', // 9  Magha        — Rat (M)
  'F', // 10 Purva Phalguni  — Rat (F)
  'M', // 11 Uttara Phalguni — Cow (M / Bull)
  'M', // 12 Hasta        — Buffalo (M)
  'F', // 13 Chitra       — Tiger (F)
  'F', // 14 Swati        — Buffalo (F)
  'M', // 15 Vishakha     — Tiger (M)
  'F', // 16 Anuradha     — Deer (F)
  'M', // 17 Jyeshtha     — Deer (M)
  'M', // 18 Mula         — Dog (M)
  'F', // 19 Purva Ashadha  — Monkey (F)
  'M', // 20 Uttara Ashadha — Mongoose (M)
  'M', // 21 Shravana     — Monkey (M)
  'F', // 22 Dhanishta    — Lion (F)
  'F', // 23 Shatabhisha  — Horse (F)
  'M', // 24 Purva Bhadrapada — Lion (M)
  'F', // 25 Uttara Bhadrapada — Cow (F)
  'F', // 26 Revati       — Elephant (F)
]

/** Enemy yoni animal pairs — order doesn't matter */
export const YONI_ENEMIES = new Set([
  'Horse-Buffalo',
  'Buffalo-Horse',
  'Elephant-Lion',
  'Lion-Elephant',
  'Goat-Monkey',
  'Monkey-Goat',
  'Serpent-Mongoose',
  'Mongoose-Serpent',
  'Dog-Deer',
  'Deer-Dog',
  'Cat-Rat',
  'Rat-Cat',
  'Cow-Tiger',
  'Tiger-Cow',
])

export type PlanetRelation = 'friend' | 'neutral' | 'enemy'

/** Natural planetary friendships (permanent/naisargika).
 *  Index: planet name → map of planet name → relation from that planet's perspective.
 */
export const PLANET_RELATIONS: Record<string, Record<string, PlanetRelation>> = {
  Sun: {
    Moon: 'friend', Mars: 'friend', Jupiter: 'friend',
    Mercury: 'neutral',
    Venus: 'enemy', Saturn: 'enemy',
  },
  Moon: {
    Sun: 'friend', Mercury: 'friend',
    Mars: 'neutral', Jupiter: 'neutral', Venus: 'neutral', Saturn: 'neutral',
  },
  Mars: {
    Sun: 'friend', Moon: 'friend', Jupiter: 'friend',
    Venus: 'neutral', Saturn: 'neutral',
    Mercury: 'enemy',
  },
  Mercury: {
    Sun: 'friend', Venus: 'friend',
    Mars: 'neutral', Jupiter: 'neutral', Saturn: 'neutral',
    Moon: 'enemy',
  },
  Jupiter: {
    Sun: 'friend', Moon: 'friend', Mars: 'friend',
    Saturn: 'neutral',
    Mercury: 'enemy', Venus: 'enemy',
  },
  Venus: {
    Mercury: 'friend', Saturn: 'friend',
    Mars: 'neutral', Jupiter: 'neutral',
    Sun: 'enemy', Moon: 'enemy',
  },
  Saturn: {
    Mercury: 'friend', Venus: 'friend',
    Jupiter: 'neutral',
    Sun: 'enemy', Moon: 'enemy', Mars: 'enemy',
  },
}

/** Sign lords (Moon sign → ruling planet) */
export const SIGN_LORD: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury',
  Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
  Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter',
  Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
}
