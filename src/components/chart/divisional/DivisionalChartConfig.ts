/**
 * Divisional Charts Configuration
 * Metadata for all 16 major divisional charts used in Vedic astrology
 */

export type ChartImportance = 'essential' | 'important' | 'advanced';

export interface DivisionalChartInfo {
  id: string;
  label: string;
  name: string;
  division: number;
  primarySignifies: string;
  alsoSignifies: string[];
  interpretation: string;
  importance: ChartImportance;
  isPopular: boolean;
  examples: string[];
  keyHouses: {
    house: number;
    meaning: string;
  }[];
}

export const DIVISIONAL_CHARTS: DivisionalChartInfo[] = [
  {
    id: 'd1',
    label: 'D1',
    name: 'Lagna / Rashi',
    division: 1,
    primarySignifies: 'Overall life, personality, and physical body',
    alsoSignifies: [
      'Basic nature and temperament',
      'Physical health and appearance',
      'General life path and destiny',
      'Foundation for all other divisional charts'
    ],
    interpretation: `The D1 chart is the main birth chart (Rashi chart). It shows your overall personality, life path, and general predictions. All other divisional charts are derived from D1 and show specific areas of life in more detail.`,
    importance: 'essential',
    isPopular: true,
    examples: [
      'Sun in 10th house: Natural leadership, career-focused personality',
      'Moon in 4th house: Emotional, nurturing, attached to home and mother'
    ],
    keyHouses: [
      { house: 1, meaning: 'Self, personality, physical body' },
      { house: 10, meaning: 'Career, status, public image' },
      { house: 7, meaning: 'Partnerships, marriage, business relationships' }
    ]
  },
  {
    id: 'd2',
    label: 'D2',
    name: 'Hora',
    division: 2,
    primarySignifies: 'Wealth, financial status, and prosperity',
    alsoSignifies: [
      'Earning capacity and income potential',
      'Attitude towards money and possessions',
      'Financial ups and downs in life',
      'Inheritance and family wealth'
    ],
    interpretation: `Hora chart divides each sign into two equal parts of 15° each. Odd signs (Aries, Gemini, Leo, etc.): First half = Leo (Sun), Second half = Cancer (Moon). Even signs (Taurus, Cancer, Virgo, etc.): First half = Cancer (Moon), Second half = Leo (Sun). Sun-ruled sections show earned wealth; Moon-ruled sections show inherited wealth.`,
    importance: 'important',
    isPopular: false,
    examples: [
      'Jupiter in 2nd house of D2: Multiple income streams, generous with money',
      'Saturn in 11th house of D2: Slow but steady accumulation of wealth over time'
    ],
    keyHouses: [
      { house: 2, meaning: 'Accumulated wealth, savings, family resources' },
      { house: 11, meaning: 'Income, gains, fulfillment of desires' },
      { house: 5, meaning: 'Speculative gains, investments, luck' }
    ]
  },
  {
    id: 'd3',
    label: 'D3',
    name: 'Drekkana',
    division: 3,
    primarySignifies: 'Siblings, courage, and inner strength',
    alsoSignifies: [
      'Relationship with brothers and sisters',
      'Courage and valor in facing challenges',
      'Co-workers and colleagues',
      'Mental strength and resilience'
    ],
    interpretation: `Drekkana divides each sign into three equal parts of 10° each. The 3rd house and its lord in D3 show sibling relationships. Mars position indicates courage level. A strong D3 chart gives mental fortitude to face life's challenges.`,
    importance: 'important',
    isPopular: false,
    examples: [
      'Mars in 3rd house of D3: Very courageous, protective of siblings',
      'Mercury in D3: Good communication with siblings and younger colleagues'
    ],
    keyHouses: [
      { house: 3, meaning: 'Siblings, courage, short journeys, communication' },
      { house: 11, meaning: 'Elder siblings, gains through siblings' },
      { house: 6, meaning: 'Enemies of siblings, competition' }
    ]
  },
  {
    id: 'd4',
    label: 'D4',
    name: 'Chaturthamsa',
    division: 4,
    primarySignifies: 'Property, assets, and fixed resources',
    alsoSignifies: [
      'Real estate and land ownership',
      'Vehicles and conveyances',
      'General fortune and luck',
      'Home and domestic happiness'
    ],
    interpretation: `Chaturthamsa divides each sign into 4 equal parts of 7°30' each. The 4th house represents property and assets. A strong D4 chart indicates property ownership, vehicles, and general material fortune in life.`,
    importance: 'important',
    isPopular: false,
    examples: [
      'Venus in 4th house of D4: Beautiful home, luxury vehicles',
      'Saturn in D4: Property acquired through hard work, delayed gains'
    ],
    keyHouses: [
      { house: 4, meaning: 'Property, assets, home, domestic happiness' },
      { house: 2, meaning: 'Accumulated wealth, family property' },
      { house: 11, meaning: 'Gains from property, fulfillment of material desires' }
    ]
  },
  {
    id: 'd5',
    label: 'D5',
    name: 'Panchamamsa',
    division: 5,
    primarySignifies: 'Fame, power, authority, and influence',
    alsoSignifies: [
      'Recognition and public reputation',
      'Leadership abilities and command',
      'Political power and influence',
      'Honor and respect in society'
    ],
    interpretation: `Panchamamsa divides each sign into 5 equal parts of 6° each. This chart shows your potential for fame, power, and authority. The 5th house is key for analyzing creative power and leadership. Strong planets here indicate recognition and influence.`,
    importance: 'important',
    isPopular: false,
    examples: [
      'Sun in 10th house of D5: Natural authority, recognition for leadership',
      'Jupiter in 5th of D5: Fame through wisdom, teaching, or advisory roles'
    ],
    keyHouses: [
      { house: 5, meaning: 'Creative power, influence, children' },
      { house: 10, meaning: 'Authority, status, public recognition' },
      { house: 1, meaning: 'Personal power, charisma, leadership' }
    ]
  },
  {
    id: 'd6',
    label: 'D6',
    name: 'Shashtamsa',
    division: 6,
    primarySignifies: 'Diseases, debts, enemies, and obstacles',
    alsoSignifies: [
      'Health vulnerabilities and chronic issues',
      'Financial debts and obligations',
      'Competitors and adversaries',
      'Day-to-day struggles and challenges'
    ],
    interpretation: `Shashtamsa divides each sign into 6 equal parts of 5° each. This chart reveals health weak points, potential debts, and enemies. The 6th house and malefic planets show areas of difficulty. Benefic planets here provide protection and resilience.`,
    importance: 'important',
    isPopular: false,
    examples: [
      'Mars in 6th of D6: Victory over enemies, competitive strength',
      'Saturn in D6: Chronic health issues, persistent obstacles, slow recovery'
    ],
    keyHouses: [
      { house: 6, meaning: 'Diseases, debts, enemies, daily struggles' },
      { house: 8, meaning: 'Chronic issues, transformations, hidden enemies' },
      { house: 12, meaning: 'Losses, hospitalization, hidden obstacles' }
    ]
  },
  {
    id: 'd7',
    label: 'D7',
    name: 'Saptamsa',
    division: 7,
    primarySignifies: 'Children, progeny, and grandchildren',
    alsoSignifies: [
      'Fertility and ability to conceive',
      'Relationship with children',
      'Number and nature of children',
      'Children\'s success and well-being'
    ],
    interpretation: `Saptamsa divides each sign into 7 equal parts. The 5th house and Jupiter (for sons) and Venus (for daughters) are key indicators. A strong 5th lord in D7 indicates healthy, successful children. The 9th house shows grandchildren.`,
    importance: 'essential',
    isPopular: true,
    examples: [
      'Jupiter in 5th house of D7: Multiple children, wise and successful',
      'Venus exalted in D7: Beautiful daughters, artistic and talented children'
    ],
    keyHouses: [
      { house: 5, meaning: 'Children, creativity, progeny' },
      { house: 9, meaning: 'Grandchildren, luck through children' },
      { house: 11, meaning: 'Gains through children, elder child' }
    ]
  },
  {
    id: 'd8',
    label: 'D8',
    name: 'Ashtamsa',
    division: 8,
    primarySignifies: 'Sudden events, accidents, longevity, and transformations',
    alsoSignifies: [
      'Unexpected changes and upheavals',
      'Inheritance and legacies',
      'Occult knowledge and mysteries',
      'Chronic diseases and longevity'
    ],
    interpretation: `Ashtamsa divides each sign into 8 equal parts of 3°45' each. This chart shows potential for sudden events, accidents, and major life transformations. The 8th house reveals hidden matters and longevity factors. Strong benefics provide protection.`,
    importance: 'advanced',
    isPopular: false,
    examples: [
      'Jupiter in 8th of D8: Long life, gains from inheritance, spiritual transformation',
      'Mars in D8: Risk of accidents, need for caution in dangerous situations'
    ],
    keyHouses: [
      { house: 8, meaning: 'Sudden events, longevity, inheritance, transformations' },
      { house: 3, meaning: 'Courage in crisis, accidents during travel' },
      { house: 12, meaning: 'Losses, hospitalization, hidden dangers' }
    ]
  },
  {
    id: 'd9',
    label: 'D9',
    name: 'Navamsa',
    division: 9,
    primarySignifies: 'Marriage, spouse, and dharma (life purpose)',
    alsoSignifies: [
      'Inner strength of planets (vargottama)',
      'Second half of life (post-35 years)',
      'Spiritual evolution and growth',
      'Fortune in marriage and relationships'
    ],
    interpretation: `Navamsa is THE most important divisional chart after D1. Each sign is divided into 9 equal parts of 3°20' each. A planet strong in BOTH D1 and D9 (especially if in same sign = vargottama) gives exceptional results. The 7th house and Venus are crucial for marriage analysis.`,
    importance: 'essential',
    isPopular: true,
    examples: [
      'Venus in 7th house of D9: Loving, harmonious, and long-lasting marriage',
      'Mars in 7th house of D9: Passionate but argumentative spouse, practice patience'
    ],
    keyHouses: [
      { house: 1, meaning: 'Soul\'s dharma, inner self, spiritual path' },
      { house: 7, meaning: 'Spouse\'s nature, marriage quality' },
      { house: 9, meaning: 'Luck in marriage, spiritual growth, dharma' }
    ]
  },
  {
    id: 'd10',
    label: 'D10',
    name: 'Dasamsa',
    division: 10,
    primarySignifies: 'Career, profession, and achievements',
    alsoSignifies: [
      'Professional success and status',
      'Work environment and colleagues',
      'Authority and power in career',
      'Public recognition and fame'
    ],
    interpretation: `Dasamsa divides each sign into 10 equal parts of 3° each. The 10th house and its lord show career direction. Sun indicates government/authority jobs, Mercury shows business/communication careers. A strong D10 chart is essential for career success.`,
    importance: 'essential',
    isPopular: true,
    examples: [
      'Sun in 10th house of D10: Leadership role, government position, authority',
      'Mercury in D10: Success in business, communication, writing, teaching'
    ],
    keyHouses: [
      { house: 10, meaning: 'Career, profession, social status, fame' },
      { house: 6, meaning: 'Service, daily work, workplace enemies' },
      { house: 2, meaning: 'Earnings from career, financial rewards' }
    ]
  },
  {
    id: 'd11',
    label: 'D11',
    name: 'Ekadasamsa',
    division: 11,
    primarySignifies: 'Gains, honors, achievements, and fulfillment',
    alsoSignifies: [
      'Income from various sources',
      'Awards and recognition',
      'Fulfillment of desires and ambitions',
      'Social connections and networks'
    ],
    interpretation: `Ekadasamsa divides each sign into 11 equal parts of ~2°44' each. This chart shows your capacity for gains, both material and immaterial. The 11th house is key for analyzing income, achievements, and wish fulfillment. Strong planets indicate abundant gains.`,
    importance: 'important',
    isPopular: false,
    examples: [
      'Jupiter in 11th of D11: Large gains, fulfillment of wishes, good income',
      'Venus in D11: Gains through luxury items, arts, or relationships'
    ],
    keyHouses: [
      { house: 11, meaning: 'Gains, income, fulfillment of desires' },
      { house: 2, meaning: 'Accumulated wealth, resources' },
      { house: 10, meaning: 'Achievements, recognition, professional gains' }
    ]
  },
  {
    id: 'd12',
    label: 'D12',
    name: 'Dwadasamsa',
    division: 12,
    primarySignifies: 'Parents, ancestors, and past life karma',
    alsoSignifies: [
      'Relationship with parents (especially mother and father)',
      'Ancestral blessings or curses',
      'Inherited traits and karmic patterns',
      'Karmic debts from past lives'
    ],
    interpretation: `Dwadasamsa divides each sign into 12 equal parts of 2°30' each. The 4th house represents mother, 9th house represents father. A strong D12 shows good parental support and ancestral blessings.`,
    importance: 'important',
    isPopular: false,
    examples: [
      'Moon in 4th house of D12: Strong maternal bond, nurturing mother',
      'Sun in 9th house of D12: Respected father, good paternal lineage and blessings'
    ],
    keyHouses: [
      { house: 4, meaning: 'Mother, maternal lineage, emotional foundation' },
      { house: 9, meaning: 'Father, paternal lineage, dharma' },
      { house: 12, meaning: 'Past life karma, ancestors, spiritual debts' }
    ]
  },
  {
    id: 'd16',
    label: 'D16',
    name: 'Shodasamsa',
    division: 16,
    primarySignifies: 'Vehicles, conveyances, luxuries, and material comforts',
    alsoSignifies: [
      'Transportation and travel comforts',
      'Luxury items and possessions',
      'Material happiness and comforts',
      'Overall sense of well-being'
    ],
    interpretation: `Shodasamsa divides each sign into 16 equal parts of 1°52.5' each. This chart reveals your access to vehicles, luxuries, and material comforts. The 4th house shows vehicles, while Venus indicates luxury. Strong benefics bring comfort and ease.`,
    importance: 'advanced',
    isPopular: false,
    examples: [
      'Venus in 4th of D16: Luxury vehicles, beautiful home, material comforts',
      'Jupiter in D16: Multiple vehicles, comfortable travels, generous provisions'
    ],
    keyHouses: [
      { house: 4, meaning: 'Vehicles, conveyances, material comforts' },
      { house: 2, meaning: 'Resources for luxuries, family wealth' },
      { house: 11, meaning: 'Gains of vehicles, fulfillment of material desires' }
    ]
  },
  {
    id: 'd20',
    label: 'D20',
    name: 'Vimshamsa',
    division: 20,
    primarySignifies: 'Spiritual progress, religious devotion, and worship practices',
    alsoSignifies: [
      'Religious inclinations and faith',
      'Spiritual practices and disciplines',
      'Meditation and contemplation',
      'Connection with divine and higher powers'
    ],
    interpretation: `Vimshamsa divides each sign into 20 equal parts of 1°30' each. This chart shows your spiritual path and religious devotion. The 9th house indicates dharma and spiritual practices. Jupiter and 12th house reveal meditation and moksha.`,
    importance: 'advanced',
    isPopular: false,
    examples: [
      'Jupiter in 9th of D20: Deep spiritual inclination, religious devotion',
      'Ketu strong in D20: Interest in mysticism, meditation, renunciation'
    ],
    keyHouses: [
      { house: 9, meaning: 'Dharma, religious practices, spiritual teachers' },
      { house: 12, meaning: 'Moksha, meditation, isolation for spiritual practice' },
      { house: 5, meaning: 'Devotion, mantra practice, spiritual creativity' }
    ]
  },
  {
    id: 'd24',
    label: 'D24',
    name: 'Siddhamsa',
    division: 24,
    primarySignifies: 'Education, learning, knowledge, and academic success',
    alsoSignifies: [
      'Formal education and degrees',
      'Learning abilities and intelligence',
      'Academic achievements and honors',
      'Teaching and sharing knowledge'
    ],
    interpretation: `Siddhamsa (also called Chaturvimshamsa) divides each sign into 24 equal parts of 1°15' each. This chart shows educational success and learning abilities. The 5th house indicates intelligence, Mercury shows communication, and 4th house reveals formal education.`,
    importance: 'important',
    isPopular: false,
    examples: [
      'Mercury in 5th of D24: Sharp intellect, success in studies, multiple degrees',
      'Jupiter in D24: Higher education, teaching, philosophical knowledge'
    ],
    keyHouses: [
      { house: 5, meaning: 'Intelligence, learning, academic success' },
      { house: 4, meaning: 'Formal education, schools, educational foundation' },
      { house: 9, meaning: 'Higher education, university, philosophical learning' }
    ]
  },
  {
    id: 'd27',
    label: 'D27',
    name: 'Bhamsa',
    division: 27,
    primarySignifies: 'Strengths, weaknesses, vitality, and overall health',
    alsoSignifies: [
      'Physical and mental strength',
      'Energy levels and vitality',
      'Areas of weakness and vulnerability',
      'Overall constitution and resilience'
    ],
    interpretation: `Bhamsa (also called Nakshatramsa) divides each sign into 27 equal parts of 1°06.67' each. This chart reveals your inherent strengths and weaknesses. The ascendant shows overall vitality, while the 6th and 8th houses indicate vulnerabilities.`,
    importance: 'advanced',
    isPopular: false,
    examples: [
      'Mars strong in D27: Physical strength, courage, athletic abilities',
      'Saturn weak in D27: Areas of chronic weakness, need for discipline'
    ],
    keyHouses: [
      { house: 1, meaning: 'Overall vitality, physical constitution' },
      { house: 6, meaning: 'Weaknesses, health vulnerabilities' },
      { house: 10, meaning: 'Professional strength, work capacity' }
    ]
  },
  {
    id: 'd30',
    label: 'D30',
    name: 'Trimsamsa',
    division: 30,
    primarySignifies: 'Misfortunes, evils, and hidden weaknesses',
    alsoSignifies: [
      'Health vulnerabilities and chronic issues',
      'Hidden enemies and obstacles',
      'Moral character and ethical challenges',
      'Troubles and adversities in life'
    ],
    interpretation: `Trimsamsa divides each sign into 5 unequal parts based on planetary rulership. This chart reveals hidden weaknesses, potential misfortunes, and areas of life prone to difficulties. It's especially important for analyzing health issues and moral character.`,
    importance: 'advanced',
    isPopular: false,
    examples: [
      'Malefics in 6th house of D30: Health issues, enemies causing trouble',
      'Benefics strong in D30: Protection from evils, good moral character'
    ],
    keyHouses: [
      { house: 6, meaning: 'Diseases, enemies, obstacles' },
      { house: 8, meaning: 'Hidden troubles, chronic issues, transformations' },
      { house: 12, meaning: 'Losses, hidden enemies, self-undoing' }
    ]
  },
  {
    id: 'd40',
    label: 'D40',
    name: 'Khavedamsa',
    division: 40,
    primarySignifies: 'Auspicious and inauspicious effects, maternal lineage',
    alsoSignifies: [
      'Overall well-being and fortune',
      'Maternal family influences',
      'General auspiciousness in life events',
      'Hidden blessings and curses'
    ],
    interpretation: `Khavedamsa divides each sign into 40 equal parts of 45' each. This chart shows the general auspicious and inauspicious effects in life. It reveals influences from the maternal lineage and overall fortune. Strong benefics here indicate general well-being and positive outcomes.`,
    importance: 'advanced',
    isPopular: false,
    examples: [
      'Jupiter in 1st of D40: Overall auspiciousness, blessed life',
      'Malefics in 12th of D40: Hidden obstacles, inauspicious patterns'
    ],
    keyHouses: [
      { house: 1, meaning: 'Overall fortune, general well-being' },
      { house: 4, meaning: 'Maternal influences, domestic auspiciousness' },
      { house: 9, meaning: 'Fortune, blessings, dharma' }
    ]
  },
  {
    id: 'd45',
    label: 'D45',
    name: 'Akshavedamsa',
    division: 45,
    primarySignifies: 'Character, conduct, moral values, and ethical disposition',
    alsoSignifies: [
      'Moral character and integrity',
      'Ethical behavior and values',
      'Righteousness and virtue',
      'Inner moral compass and conscience'
    ],
    interpretation: `Akshavedamsa divides each sign into 45 equal parts of ~40' each. This chart reveals the native's character, moral values, and ethical conduct. It shows how one behaves in moral dilemmas and the strength of ethical principles. The 9th house and Jupiter are key indicators of dharma and righteousness.`,
    importance: 'advanced',
    isPopular: false,
    examples: [
      'Jupiter strong in D45: High moral character, ethical conduct, virtuous nature',
      'Malefics afflicting 9th house in D45: Moral challenges, ethical dilemmas'
    ],
    keyHouses: [
      { house: 9, meaning: 'Dharma, righteousness, moral values' },
      { house: 1, meaning: 'Overall character and personality' },
      { house: 10, meaning: 'Professional ethics, integrity in career' }
    ]
  },
  {
    id: 'd60',
    label: 'D60',
    name: 'Shashtiamsa',
    division: 60,
    primarySignifies: 'Past life karma, subtle karmic influences, and hidden destiny',
    alsoSignifies: [
      'Karmic debts from previous lives',
      'Subtle effects from past actions',
      'Hidden blessings and curses',
      'Deep karmic patterns'
    ],
    interpretation: `Shashtiamsa is the most subtle divisional chart, dividing each sign into 60 equal parts of 30' each. It reveals deep karmic patterns and influences from past lives. This chart shows the most refined effects of planetary positions and can indicate hidden blessings or challenges. Used for very detailed predictive work.`,
    importance: 'advanced',
    isPopular: false,
    examples: [
      'Benefics exalted in D60: Past life good karma, hidden blessings manifest',
      'Malefics in 6th/8th/12th of D60: Karmic debts, hidden obstacles to overcome'
    ],
    keyHouses: [
      { house: 12, meaning: 'Past life karma, spiritual debts, moksha' },
      { house: 9, meaning: 'Fortune from past lives, dharma' },
      { house: 8, meaning: 'Hidden karmic transformations, mysteries' }
    ]
  },
   {
    id: 'moon',
    label: 'Moon',
    name: 'Chandra Lagna',
    division: 1,
    primarySignifies: 'Mind, emotions, and mental state',
    alsoSignifies: [
      'Emotional nature and responses',
      'Mental peace and happiness',
      'Relationship with mother',
      'Public perception and popularity'
    ],
    interpretation: `Moon Chart (Chandra Lagna) uses Moon's position as the ascendant instead of the actual rising sign. It shows your mental and emotional nature, how you process feelings, and your inner world. This chart is read alongside the D1 chart for complete analysis.`,
    importance: 'essential',
    isPopular: true,
    examples: [
      'Jupiter in 1st from Moon: Optimistic mind, philosophical thinking',
      'Saturn in 1st from Moon: Serious mind, tendency towards melancholy'
    ],
    keyHouses: [
      { house: 1, meaning: 'Mind, mental state, emotional foundation' },
      { house: 4, meaning: 'Inner peace, emotional security' },
      { house: 7, meaning: 'Emotional relationships, how you connect with others' }
    ]
  }
];

export const getChartById = (id: string): DivisionalChartInfo | undefined => {
  return DIVISIONAL_CHARTS.find(chart => chart.id === id);
};

export const getEssentialCharts = (): DivisionalChartInfo[] => {
  return DIVISIONAL_CHARTS.filter(chart => chart.importance === 'essential');
};

export const getPopularCharts = (): DivisionalChartInfo[] => {
  return DIVISIONAL_CHARTS.filter(chart => chart.isPopular);
};

export const getChartsByImportance = (importance: ChartImportance): DivisionalChartInfo[] => {
  return DIVISIONAL_CHARTS.filter(chart => chart.importance === importance);
};

export const getPhase1Charts = (): DivisionalChartInfo[] => {
  // Updated to include all 18 charts (16 divisional + D1 + Moon)
  const phase1Ids = [
    'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8',
    'd9', 'd10', 'd11', 'd12', 'd16', 'd20', 'd24', 'd27',
    'd30', 'moon', 'd40', 'd45', 'd60'
  ];
  return DIVISIONAL_CHARTS.filter(chart => phase1Ids.includes(chart.id));
};
