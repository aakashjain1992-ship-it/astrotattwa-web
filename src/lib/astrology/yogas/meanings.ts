/**
 * Per-yoga / per-dosha display copy.
 *
 * Soft, non-fear-based language only (per spec UX rules).
 * Words avoided: dangerous, fatal, destroyed, poverty, curse, doomed, guaranteed.
 *
 * `whatItMeans`  — what the yoga supports/shows
 * `whyItForms`   — short rule statement (filled with chart specifics by detector)
 * `strengthens`  — generic factors that boost it
 * `weakens`      — generic factors that reduce it
 * `whenItGivesResults` — dasha activation hint
 */

import type { YogaCategory, YogaNature, LifeArea } from './types'

export interface YogaMeaning {
  id: string
  name: string
  category: YogaCategory
  nature: YogaNature
  defaultLifeAreas: LifeArea[]
  whatItMeans: string
  whyItForms: string
  strengthens: string
  weakens: string
  whenItGivesResults: string
  shortMeaning: string
}

export const YOGA_MEANINGS: Record<string, YogaMeaning> = {
  // ---------- Pancha Mahapurusha ----------
  ruchaka: {
    id: 'ruchaka',
    name: 'Ruchaka Yoga',
    category: 'mahapurusha',
    nature: 'positive',
    defaultLifeAreas: ['career', 'health'],
    whatItMeans:
      'Indicates courage, leadership ability, physical vitality and a commanding presence.',
    whyItForms: 'Mars is in a Kendra house and in its own or exalted sign.',
    strengthens: 'Mars unafflicted by Rahu, Ketu or Saturn.',
    weakens: 'Mars combust, debilitated, or heavily afflicted by malefics.',
    whenItGivesResults: 'More noticeable during Mars periods.',
    shortMeaning: 'Supports courage, leadership and vitality.',
  },
  bhadra: {
    id: 'bhadra',
    name: 'Bhadra Yoga',
    category: 'mahapurusha',
    nature: 'positive',
    defaultLifeAreas: ['education', 'career'],
    whatItMeans:
      'Indicates sharp intellect, analytical thinking, communication skill and learning ability.',
    whyItForms: 'Mercury is in a Kendra house and in its own or exalted sign.',
    strengthens: 'Mercury unafflicted and not deeply combust.',
    weakens: 'Mercury combust by Sun, debilitated or afflicted by malefics.',
    whenItGivesResults: 'More noticeable during Mercury periods.',
    shortMeaning: 'Supports intellect, learning and communication.',
  },
  hamsa: {
    id: 'hamsa',
    name: 'Hamsa Yoga',
    category: 'mahapurusha',
    nature: 'positive',
    defaultLifeAreas: ['spirituality', 'wealth', 'family'],
    whatItMeans:
      'Indicates wisdom, ethical conduct, generosity and a refined nature.',
    whyItForms: 'Jupiter is in a Kendra house and in its own or exalted sign.',
    strengthens: 'Jupiter unafflicted, not retrograde in difficult sign.',
    weakens: 'Jupiter debilitated or afflicted by Rahu/Ketu (Guru Chandal).',
    whenItGivesResults: 'More noticeable during Jupiter periods.',
    shortMeaning: 'Supports wisdom, ethics and refined character.',
  },
  malavya: {
    id: 'malavya',
    name: 'Malavya Yoga',
    category: 'mahapurusha',
    nature: 'positive',
    defaultLifeAreas: ['marriage', 'wealth', 'health'],
    whatItMeans:
      'Indicates beauty, comforts, harmony in relationships and creative talents.',
    whyItForms: 'Venus is in a Kendra house and in its own or exalted sign.',
    strengthens: 'Venus unafflicted, not combust by Sun.',
    weakens: 'Venus debilitated or afflicted by malefics.',
    whenItGivesResults: 'More noticeable during Venus periods.',
    shortMeaning: 'Supports comfort, beauty and harmonious relationships.',
  },
  shasha: {
    id: 'shasha',
    name: 'Shasha Yoga',
    category: 'mahapurusha',
    nature: 'positive',
    defaultLifeAreas: ['career', 'wealth'],
    whatItMeans:
      'Indicates discipline, endurance, leadership through effort and authority over time.',
    whyItForms: 'Saturn is in a Kendra house and in its own or exalted sign.',
    strengthens: 'Saturn unafflicted, supported by benefic aspects.',
    weakens: 'Saturn debilitated or with Sun/Mars conjunction.',
    whenItGivesResults: 'More noticeable during Saturn periods.',
    shortMeaning: 'Supports discipline, endurance and lasting authority.',
  },

  // ---------- Moon yogas ----------
  gajaKesari: {
    id: 'gajaKesari',
    name: 'Gaja-Kesari Yoga',
    category: 'moon',
    nature: 'positive',
    defaultLifeAreas: ['education', 'career', 'emotional_life', 'spirituality'],
    whatItMeans:
      'Supports wisdom, emotional maturity, guidance and social respect.',
    whyItForms: 'Jupiter is placed in a Kendra from the Moon.',
    strengthens: 'Jupiter and Moon are both strong and unafflicted.',
    weakens: 'Either is debilitated or with Rahu/Ketu.',
    whenItGivesResults: 'More noticeable during Jupiter or Moon periods.',
    shortMeaning: 'Supports wisdom, guidance and public respect.',
  },
  sunapha: {
    id: 'sunapha',
    name: 'Sunapha Yoga',
    category: 'moon',
    nature: 'positive',
    defaultLifeAreas: ['wealth', 'career'],
    whatItMeans:
      'Indicates self-earned prosperity, intelligence and resourcefulness.',
    whyItForms: 'A planet other than the Sun occupies the 2nd from the Moon.',
    strengthens: 'Multiple benefics in 2nd from Moon.',
    weakens: 'Only malefics in 2nd from Moon.',
    whenItGivesResults: 'More noticeable during Moon periods or those of the planet involved.',
    shortMeaning: 'Supports earned prosperity and resourcefulness.',
  },
  anapha: {
    id: 'anapha',
    name: 'Anapha Yoga',
    category: 'moon',
    nature: 'positive',
    defaultLifeAreas: ['wealth', 'health', 'emotional_life'],
    whatItMeans:
      'Indicates good health, comfortable nature and reputation through relationships.',
    whyItForms: 'A planet other than the Sun occupies the 12th from the Moon.',
    strengthens: 'Benefic planets in 12th from Moon.',
    weakens: 'Only malefics in 12th from Moon.',
    whenItGivesResults: 'More noticeable during Moon periods or those of the planet involved.',
    shortMeaning: 'Supports comfort, health and good reputation.',
  },
  durudhura: {
    id: 'durudhura',
    name: 'Durudhura Yoga',
    category: 'moon',
    nature: 'positive',
    defaultLifeAreas: ['wealth', 'family', 'emotional_life'],
    whatItMeans:
      'Indicates strong support around the Moon — comfort, resources and good companions.',
    whyItForms:
      'Planets other than the Sun occupy both the 2nd and the 12th from the Moon.',
    strengthens: 'Benefics surrounding the Moon on both sides.',
    weakens: 'Only malefics surrounding the Moon.',
    whenItGivesResults: 'More noticeable during Moon periods.',
    shortMeaning: 'Supports overall support around the mind and resources.',
  },
  kemadruma: {
    id: 'kemadruma',
    name: 'Kemadruma Yoga',
    category: 'moon',
    nature: 'challenging',
    defaultLifeAreas: ['emotional_life', 'family'],
    whatItMeans:
      'May show emotional independence and periods of inner pressure, but the effect is reduced when the Moon receives support.',
    whyItForms:
      'No planets (other than the Sun and nodes) occupy the 2nd or 12th from the Moon.',
    strengthens: 'Moon weak and unsupported.',
    weakens: 'Moon in Kendra from Lagna, aspected by Jupiter, or strong by sign.',
    whenItGivesResults: 'More noticeable during Moon periods.',
    shortMeaning: 'May show emotional self-reliance and inner pressure.',
  },

  // ---------- Conjunction yogas ----------
  budhaditya: {
    id: 'budhaditya',
    name: 'Budhaditya Yoga',
    category: 'general',
    nature: 'positive',
    defaultLifeAreas: ['education', 'career', 'emotional_life'],
    whatItMeans:
      'Supports intelligence, communication, decision-making and confidence.',
    whyItForms: 'Sun and Mercury are in the same sign.',
    strengthens: 'Mercury not deeply combust; Sun and Mercury in a strong house.',
    weakens: 'Mercury deeply combust by Sun.',
    whenItGivesResults: 'More noticeable during Sun or Mercury periods.',
    shortMeaning: 'Supports intelligence, communication and confidence.',
  },
  guruChandal: {
    id: 'guruChandal',
    name: 'Guru Chandal Yoga',
    category: 'general',
    nature: 'challenging',
    defaultLifeAreas: ['spirituality', 'education', 'family'],
    whatItMeans:
      'May show unconventional beliefs, questioning of tradition, or the need to find one\'s own path in matters of wisdom.',
    whyItForms: 'Jupiter is in the same sign as Rahu or Ketu.',
    strengthens: 'Tighter orb between Jupiter and the node.',
    weakens: 'Wider orb; benefic support to Jupiter.',
    whenItGivesResults: 'More noticeable during Jupiter or node periods.',
    shortMeaning: 'May indicate non-traditional thinking around wisdom.',
  },

  // ---------- Vipreet Raj ----------
  harsha: {
    id: 'harsha',
    name: 'Harsha Vipreet Raj Yoga',
    category: 'vipreet_raja',
    nature: 'positive',
    defaultLifeAreas: ['health', 'career'],
    whatItMeans:
      'Supports rise after struggles, victory over enemies and resilience.',
    whyItForms: 'The 6th-house lord is placed in the 6th, 8th or 12th house.',
    strengthens: '6th lord strong, well-placed by sign.',
    weakens: '6th lord deeply afflicted.',
    whenItGivesResults: 'More noticeable during periods of the 6th lord.',
    shortMeaning: 'Supports resilience and rise after challenge.',
  },
  sarala: {
    id: 'sarala',
    name: 'Sarala Vipreet Raj Yoga',
    category: 'vipreet_raja',
    nature: 'positive',
    defaultLifeAreas: ['health', 'career', 'spirituality'],
    whatItMeans:
      'Supports longevity, transformation through difficulty and uncommon depth.',
    whyItForms: 'The 8th-house lord is placed in the 6th, 8th or 12th house.',
    strengthens: '8th lord strong, supported by Jupiter.',
    weakens: '8th lord deeply afflicted.',
    whenItGivesResults: 'More noticeable during periods of the 8th lord.',
    shortMeaning: 'Supports transformation and uncommon depth.',
  },
  vimala: {
    id: 'vimala',
    name: 'Vimala Vipreet Raj Yoga',
    category: 'vipreet_raja',
    nature: 'positive',
    defaultLifeAreas: ['wealth', 'spirituality'],
    whatItMeans:
      'Supports financial wisdom, simple living and inner contentment.',
    whyItForms: 'The 12th-house lord is placed in the 6th, 8th or 12th house.',
    strengthens: '12th lord strong, supported by benefics.',
    weakens: '12th lord deeply afflicted.',
    whenItGivesResults: 'More noticeable during periods of the 12th lord.',
    shortMeaning: 'Supports financial wisdom and contentment.',
  },

  // ---------- Raj / wealth ----------
  rajYoga9_10: {
    id: 'rajYoga9_10',
    name: 'Raj Yoga (9th-10th Lord)',
    category: 'raja',
    nature: 'positive',
    defaultLifeAreas: ['career', 'wealth', 'family'],
    whatItMeans:
      'Supports authority, recognition and the alignment of dharma with action.',
    whyItForms:
      'The lords of the 9th and 10th houses are connected by conjunction, aspect, exchange or placement.',
    strengthens: 'Both lords strong, in good houses.',
    weakens: 'Either lord debilitated or in a difficult house.',
    whenItGivesResults:
      'More noticeable during periods of the 9th or 10th lord.',
    shortMeaning: 'Supports career success aligned with purpose.',
  },
  kendraTrikona: {
    id: 'kendraTrikona',
    name: 'Kendra-Trikona Raj Yoga',
    category: 'raja',
    nature: 'positive',
    defaultLifeAreas: ['career', 'wealth'],
    whatItMeans:
      'Supports overall success — combines effort (Kendra) with grace (Trikona).',
    whyItForms:
      'A Kendra-house lord (4/7/10) is connected with a Trikona-house lord (5/9).',
    strengthens: 'Both lords strong and well-placed.',
    weakens: 'Either lord weak or afflicted.',
    whenItGivesResults:
      'More noticeable during periods of the involved lords.',
    shortMeaning: 'Combines effort and grace for success.',
  },
  dharmaKarmadhipati: {
    id: 'dharmaKarmadhipati',
    name: 'Dharma-Karmadhipati Yoga',
    category: 'raja',
    nature: 'positive',
    defaultLifeAreas: ['career', 'wealth', 'spirituality'],
    whatItMeans:
      'A powerful raja yoga supporting authority, recognition and meaningful work.',
    whyItForms:
      'The 9th-house lord (dharma) and 10th-house lord (karma) are directly connected.',
    strengthens: 'Both lords strong, conjunct in a Kendra or Trikona.',
    weakens: 'Either lord debilitated or in a difficult house.',
    whenItGivesResults:
      'More noticeable during periods of the 9th or 10th lord.',
    shortMeaning: 'Supports purposeful authority and recognition.',
  },
  lakshmi: {
    id: 'lakshmi',
    name: 'Lakshmi Yoga',
    category: 'dhana',
    nature: 'positive',
    defaultLifeAreas: ['wealth', 'family', 'marriage'],
    whatItMeans:
      'Supports prosperity, comfortable living and fortunate opportunities.',
    whyItForms:
      'The 9th-house lord and the Lagna lord are both strong and well-placed.',
    strengthens: '9th lord in own/exalted/Mooltrikona; Lagna lord in Kendra.',
    weakens: 'Either lord weak or afflicted.',
    whenItGivesResults:
      'More noticeable during periods of the 9th or Lagna lord.',
    shortMeaning: 'Supports prosperity and good fortune.',
  },
  amala: {
    id: 'amala',
    name: 'Amala Yoga',
    category: 'raja',
    nature: 'positive',
    defaultLifeAreas: ['career'],
    whatItMeans:
      'Supports a clean reputation and lasting good name in one\'s field.',
    whyItForms:
      'A natural benefic is placed in the 10th house from the Lagna or Moon.',
    strengthens: 'Strong, unafflicted benefic in the 10th.',
    weakens: 'Benefic afflicted or weak.',
    whenItGivesResults: 'More noticeable during the benefic\'s period.',
    shortMeaning: 'Supports a clean reputation and good name.',
  },
  vasumati: {
    id: 'vasumati',
    name: 'Vasumati Yoga',
    category: 'dhana',
    nature: 'positive',
    defaultLifeAreas: ['wealth'],
    whatItMeans: 'Supports financial security and material resources.',
    whyItForms:
      'Two or more natural benefics are placed in upachaya houses (3, 6, 10, 11) from Lagna or Moon.',
    strengthens: 'Three or more benefics in upachayas.',
    weakens: 'Benefics weak or combust.',
    whenItGivesResults:
      'More noticeable during periods of the benefics involved.',
    shortMeaning: 'Supports financial security.',
  },

  // ---------- Special ----------
  neechaBhanga: {
    id: 'neechaBhanga',
    name: 'Neecha Bhanga Raja Yoga',
    category: 'raja',
    nature: 'positive',
    defaultLifeAreas: ['career', 'spirituality'],
    whatItMeans:
      'Supports rise after early difficulty — a debilitation that turns into strength.',
    whyItForms: 'A debilitated planet meets a cancellation condition.',
    strengthens: 'Cancellation lord in Kendra from Lagna or Moon.',
    weakens: 'Weak cancellation context.',
    whenItGivesResults:
      'More noticeable during the debilitated planet\'s period.',
    shortMeaning: 'Supports rise after early difficulty.',
  },
  parivartana: {
    id: 'parivartana',
    name: 'Parivartana Yoga',
    category: 'raja',
    nature: 'positive',
    defaultLifeAreas: ['career', 'wealth'],
    whatItMeans:
      'Supports a strong link between the two life areas of the exchanging houses.',
    whyItForms: 'Two planets each occupy the sign owned by the other.',
    strengthens: 'Exchange between Kendra/Trikona/wealth houses.',
    weakens: 'Exchange involving difficult houses.',
    whenItGivesResults:
      'More noticeable during periods of either planet involved.',
    shortMeaning: 'Links two life areas through sign exchange.',
  },
  dhana: {
    id: 'dhana',
    name: 'Dhana Yoga',
    category: 'dhana',
    nature: 'positive',
    defaultLifeAreas: ['wealth'],
    whatItMeans: 'Supports the building of wealth through effort and timing.',
    whyItForms:
      'The lords of wealth-related houses (2, 5, 9, 11) are connected.',
    strengthens: '2nd and 11th lords directly connected.',
    weakens: 'Wealth lords weak or afflicted.',
    whenItGivesResults:
      'More noticeable during periods of the wealth-house lords.',
    shortMeaning: 'Supports the building of wealth.',
  },
  shubhaKartari: {
    id: 'shubhaKartari',
    name: 'Shubha Kartari Yoga',
    category: 'general',
    nature: 'positive',
    defaultLifeAreas: ['emotional_life', 'health'],
    whatItMeans:
      'Supports protection — the Lagna is hemmed between benefic influences.',
    whyItForms: 'Benefic planets occupy both the 12th and 2nd from the Lagna.',
    strengthens: 'Strong benefics on both sides.',
    weakens: 'Benefics weak or combust.',
    whenItGivesResults: 'Sustained, supportive background influence.',
    shortMeaning: 'Supports protection around the self.',
  },
  paapKartari: {
    id: 'paapKartari',
    name: 'Paap Kartari Yoga',
    category: 'general',
    nature: 'challenging',
    defaultLifeAreas: ['emotional_life', 'health'],
    whatItMeans:
      'May show pressure around self-expression or life direction; benefits from conscious patience.',
    whyItForms: 'Malefic planets occupy both the 12th and 2nd from the Lagna.',
    strengthens: 'Strong malefics on both sides.',
    weakens: 'Malefic influences mitigated by benefic aspects.',
    whenItGivesResults: 'Sustained, background pressure.',
    shortMeaning: 'May show pressure around self-expression.',
  },
}

// ---------- Doshas ----------

export interface DoshaMeaning {
  id: string
  name: string
  defaultLifeAreas: LifeArea[]
  whatItMeans: string
  whyItForms: string
  whatReducesIt: string
  guidance: string
  shortMeaning: string
}

export const DOSHA_MEANINGS: Record<string, DoshaMeaning> = {
  kaalSarp: {
    id: 'kaalSarp',
    name: 'Kaal Sarp Dosha',
    defaultLifeAreas: ['emotional_life', 'spirituality', 'family'],
    whatItMeans:
      'Indicates a karmic concentration pattern. It does not mean life is fated against you — it suggests that effort brings results in waves and that important matters benefit from patience.',
    whyItForms:
      'All seven visible planets are placed on one side of the Rahu-Ketu axis.',
    whatReducesIt:
      'A planet placed outside the axis, strong Lagna lord, or strong Jupiter aspect on Lagna/Moon.',
    guidance:
      'This is best read with the full chart, not judged in isolation.',
    shortMeaning: 'Suggests a karmic concentration pattern.',
  },
  mangal: {
    id: 'mangal',
    name: 'Mangal Dosha',
    defaultLifeAreas: ['marriage', 'emotional_life'],
    whatItMeans:
      'Shows strong Mars influence on relationship matters. May create intensity, impatience, or strong expectations in partnership.',
    whyItForms:
      'Mars is placed in the 1st, 4th, 7th, 8th or 12th house — checked from the Lagna, the Moon and from Venus.',
    whatReducesIt:
      'Mars in own sign or exalted, aspected by Jupiter, or matching Mangal in a partner\'s chart.',
    guidance:
      'This should be read with the full marriage chart and not judged alone.',
    shortMeaning: 'May indicate intensity in partnership matters.',
  },
  grahan: {
    id: 'grahan',
    name: 'Grahan Dosha',
    defaultLifeAreas: ['emotional_life', 'family'],
    whatItMeans:
      'Indicates a Sun or Moon eclipse-like influence by Rahu/Ketu — may show periods of inner shadow that resolve with awareness.',
    whyItForms: 'The Sun or the Moon is in the same sign as Rahu or Ketu.',
    whatReducesIt:
      'Wider orb between the luminary and the node, or strong Jupiter aspect.',
    guidance:
      'Practices that bring clarity and emotional steadiness help during related periods.',
    shortMeaning: 'May show periods of inner shadow that resolve with awareness.',
  },
  angarak: {
    id: 'angarak',
    name: 'Angarak Dosha',
    defaultLifeAreas: ['emotional_life', 'wealth'],
    whatItMeans:
      'Indicates a Mars-Rahu combination — may show sudden energy, impulsiveness or pressure in financial matters.',
    whyItForms: 'Mars is in the same sign as Rahu (or within tight orb).',
    whatReducesIt: 'Wider orb, or supportive aspect from Jupiter.',
    guidance:
      'Patience with major financial decisions is helpful during related periods.',
    shortMeaning: 'May show impulsiveness or pressure in finances.',
  },
  vish: {
    id: 'vish',
    name: 'Vish Yoga',
    defaultLifeAreas: ['emotional_life', 'health'],
    whatItMeans:
      'Indicates a Moon-Saturn link — may show periods of low mood or emotional heaviness that lift with conscious self-care.',
    whyItForms:
      'The Moon is in the same sign as Saturn, or Saturn aspects the Moon.',
    whatReducesIt: 'Wider orb, or strong Jupiter aspect on the Moon.',
    guidance:
      'Routines that support emotional steadiness are especially helpful.',
    shortMeaning: 'May show periods of emotional heaviness.',
  },
}
