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
  const phase1Ids = ['d1', 'd2', 'd3', 'd4', 'd7', 'd9', 'd10', 'd12', 'd30', 'moon'];
  return DIVISIONAL_CHARTS.filter(chart => phase1Ids.includes(chart.id));
};
