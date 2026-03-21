/**
 * House Meanings — Full 12-house reference
 * Used by the planet story beats in PlanetsTab for rulership descriptions.
 *
 * Each entry has:
 *   shortLabel        — 3-5 word summary shown in the UI strip
 *   coreAreas         — what this house governs
 *   psychMeaning      — the inner/psychological theme
 *   rulerTheme        — what it means when a planet RULES this house (used in beat text)
 *   placementTheme    — what it means when a planet is PLACED in this house
 *   houseTypes        — kendra | trikona | dusthana | upachaya (can be multiple)
 *   advancedNote      — classical significance note
 */

export type HouseType = 'kendra' | 'trikona' | 'dusthana' | 'upachaya' | 'maraka' | 'neutral';

export interface HouseMeaning {
  number: number;
  shortLabel: string;
  coreAreas: string;
  psychMeaning: string;
  rulerTheme: string;
  placementTheme: string;
  houseTypes: HouseType[];
  advancedNote: string;
}

export const HOUSE_MEANINGS: Record<number, HouseMeaning> = {
  1: {
    number: 1,
    shortLabel: 'Self, body and identity',
    coreAreas: 'self, body, personality, vitality, appearance, temperament, personal initiative, general life direction',
    psychMeaning: 'your instinctive response to life, your natural style, how you project yourself',
    rulerTheme: 'the ruler of your entire chart — your body, identity, and the quality of your whole life are coloured by how this planet is doing',
    placementTheme: 'very visible in your personality — what you project and how others first meet you',
    houseTypes: ['kendra', 'trikona'],
    advancedNote: 'Both kendra and trikona — extraordinarily important in chart judgment. Anchors health, direction, and the power to carry the rest of the chart.',
  },
  2: {
    number: 2,
    shortLabel: 'Wealth, speech and family',
    coreAreas: 'money, accumulated wealth, savings, possessions, food, family of origin, speech, voice, stored resources',
    psychMeaning: 'what makes you feel secure, what you believe is yours, how you use speech to build or destroy',
    rulerTheme: 'wealth accumulation, family culture, and the quality of speech — these areas are shaped by where and how this planet operates',
    placementTheme: 'speech, family dynamics, and financial accumulation are directly activated',
    houseTypes: ['maraka', 'neutral'],
    advancedNote: 'A maraka house in classical astrology — tied to sustenance and life support. Critical for wealth, speech, and family culture.',
  },
  3: {
    number: 3,
    shortLabel: 'Effort, courage and communication',
    coreAreas: 'courage, self-effort, communication, writing, siblings, short travel, hands-on skill, media, everyday movement',
    psychMeaning: 'effort over fate, boldness, the willingness to try again, nerve and performance through repetition',
    rulerTheme: 'effort and courage are its domain — the planet ruling this house shapes how hard you work, how boldly you communicate, and the sibling dynamic',
    placementTheme: 'effort, communication, and courage are activated — short travels and skill-building come through this house',
    houseTypes: ['upachaya'],
    advancedNote: 'Upachaya house — communication ability, confidence, and skill often improve with time if actively cultivated.',
  },
  4: {
    number: 4,
    shortLabel: 'Home, mother and inner peace',
    coreAreas: 'home, mother, land, property, vehicles, domestic life, emotional foundation, ancestry, private self, inner peace',
    psychMeaning: 'your emotional basement, your need for belonging, your memory field, what makes you feel safe',
    rulerTheme: 'home, mother, and emotional roots — where and how you feel settled inside is governed by this house\'s ruler',
    placementTheme: 'domestic life, property, and the inner sense of being rooted are activated',
    houseTypes: ['kendra'],
    advancedNote: 'Kendra — strongly shapes emotional grounding and domestic stability. Also indicates real estate and fixed assets.',
  },
  5: {
    number: 5,
    shortLabel: 'Children, creativity and merit',
    coreAreas: 'children, creativity, romance, pleasure, love affairs, self-expression, performance, speculation, arts, intelligence, inspiration, joy',
    psychMeaning: 'what flows out of you naturally, how you create, your emotional radiance, your appetite for joy and recognition',
    rulerTheme: 'creativity, children, and the capacity for joy and romance — this planet\'s condition shapes how freely these areas express',
    placementTheme: 'creativity, romance, and speculative intelligence are directly activated here',
    houseTypes: ['trikona'],
    advancedNote: 'Trikona — one of the most auspicious houses for intelligence, grace, talent, and blessings. Also connected to purva punya (past-life merit).',
  },
  6: {
    number: 6,
    shortLabel: 'Health, service and obstacles',
    coreAreas: 'disease, debts, enemies, service, labour, routine work, employees, daily grind, struggle, discipline, healing',
    psychMeaning: 'what you must fix, your friction points, habits that weaken or strengthen you, where life makes you humble',
    rulerTheme: 'struggle, service, and health challenges — a planet ruling the 6th activates friction, but also the discipline to overcome it',
    placementTheme: 'health, daily routine, and service themes are activated — the 6th house is where effort and discipline show their results',
    houseTypes: ['dusthana', 'upachaya'],
    advancedNote: 'Both dusthana and upachaya — gives struggle, but also the power to conquer through discipline, skill, and consistency.',
  },
  7: {
    number: 7,
    shortLabel: 'Marriage and partnerships',
    coreAreas: 'spouse, marriage, committed relationship, business partnership, contracts, alliances, public dealing, negotiations, open opponents',
    psychMeaning: 'what you seek in others, what you project onto others, how you relate, negotiate, bond, and confront',
    rulerTheme: 'marriage, partnership, and one-to-one relationships — its ruler\'s quality shapes the kind of partnerships you attract and how they unfold',
    placementTheme: 'partnership and relationship themes are directly activated — this is one of the most visible houses in the chart',
    houseTypes: ['kendra', 'maraka'],
    advancedNote: 'Kendra and also the direct opposite of the 1st — always speaks to the tension between self and other. Also a maraka house.',
  },
  8: {
    number: 8,
    shortLabel: 'Transformation, depth and hidden matters',
    coreAreas: 'longevity, crisis, sudden upheaval, vulnerability, inheritance, joint resources, hidden matters, secrets, taboo, deep transformation',
    psychMeaning: 'what breaks your control, where you must surrender, trauma, secrecy, taboo, intimacy, and profound psychological change',
    rulerTheme: 'depth, transformation, and hidden matters — its ruler governs the quality of life\'s most intense upheavals and hidden resources',
    placementTheme: 'hidden, suppressed, and transformative themes are activated — the 8th house gives depth but conceals direct expression',
    houseTypes: ['dusthana'],
    advancedNote: 'Major dusthana — does not mean literal death; signals crisis, rupture, hidden karma, and transformation that remakes identity.',
  },
  9: {
    number: 9,
    shortLabel: 'Fortune, dharma and higher wisdom',
    coreAreas: 'religion, philosophy, ethics, higher education, long-distance travel, gurus, blessings, fortune, law, scripture, devotion, meaning and purpose',
    psychMeaning: 'your search for truth, what gives life meaning, how you organise faith, morality, ideals, and higher understanding',
    rulerTheme: 'fortune, dharma, and higher wisdom — when this planet is active, it shapes how blessed and purposeful your life feels',
    placementTheme: 'fortune, guru, and higher wisdom themes are activated — a planet here tends to bring philosophical depth and long-range luck',
    houseTypes: ['trikona'],
    advancedNote: 'Trikona — one of the strongest houses for fortune, blessings, teachings, ethics, and divine support.',
  },
  10: {
    number: 10,
    shortLabel: 'Career, status and public life',
    coreAreas: 'profession, career, status, recognition, public role, work in the world, ambition, authority, leadership, achievement, reputation',
    psychMeaning: 'what you must do publicly, how you pursue significance, your relationship with achievement, power, duty, and visible output',
    rulerTheme: 'career, authority, and your visible role in the world — this planet\'s condition shapes how prominently and successfully you act in public life',
    placementTheme: 'career and public life are directly activated — planets here are among the most visible in the chart',
    houseTypes: ['kendra', 'upachaya'],
    advancedNote: 'Kendra — one of the strongest houses for public manifestation. Shows not just a job, but your visible karma.',
  },
  11: {
    number: 11,
    shortLabel: 'Gains, networks and fulfilment',
    coreAreas: 'gains, profits, fulfilment of desires, social circles, friends, networks, patrons, supporters, elder siblings, future plans',
    psychMeaning: 'what you want to achieve, your appetite for results, how communities help or hinder you',
    rulerTheme: 'gains, networks, and the fulfilment of ambitions — a planet ruling the 11th shapes how income, friendships, and long-range goals unfold',
    placementTheme: 'income, gains, and social networks are activated — the 11th house tends to bring results from sustained effort',
    houseTypes: ['upachaya'],
    advancedNote: 'Upachaya — gains, influence, and networks often strengthen with age, effort, and social maturity.',
  },
  12: {
    number: 12,
    shortLabel: 'Loss, retreat and liberation',
    coreAreas: 'loss, expenditure, isolation, retreat, sleep, dreams, foreign residence, seclusion, surrender, spiritual release, hidden enemies',
    psychMeaning: 'what dissolves you, where you escape, where you withdraw, what must be released rather than controlled',
    rulerTheme: 'loss, foreign matters, and spiritual withdrawal — a planet ruling the 12th often creates expenditure and hidden dynamics, but can also channel liberation',
    placementTheme: 'retreat, foreign themes, and what lies beneath the surface are activated — this house hides and dissolves whatever enters it',
    houseTypes: ['dusthana'],
    advancedNote: 'Major dusthana and one of the deepest spiritual houses — can show both suffering and liberation depending on the chart.',
  },
};

/** Get the house type label for a given house number */
export function getHouseTypeLabel(house: number): string {
  const types = HOUSE_MEANINGS[house]?.houseTypes ?? [];
  if (types.includes('kendra') && types.includes('trikona')) return 'kendra + trikona';
  if (types.includes('kendra'))   return 'kendra';
  if (types.includes('trikona'))  return 'trikona';
  if (types.includes('dusthana')) return 'dusthana';
  if (types.includes('upachaya')) return 'upachaya';
  if (types.includes('maraka'))   return 'maraka';
  return '';
}

/** Short house label e.g. "4th — home & family" */
export function houseShortLabel(house: number): string {
  const h = HOUSE_MEANINGS[house];
  if (!h) return `${house}${ord(house)} house`;
  return `${house}${ord(house)} house — ${h.shortLabel}`;
}

function ord(n: number): string {
  return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
}
