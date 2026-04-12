export interface RashiInfo {
  slug: string
  signNumber: number   // 1–12 (Aries=1 … Pisces=12)
  nameEn: string
  nameHi: string
  symbol: string       // Unicode zodiac glyph — swap to custom SVG path here if needed
  element: 'Fire' | 'Earth' | 'Air' | 'Water'
  quality: 'cardinal' | 'fixed' | 'mutable'
  ruler: string
}

export const RASHI_MAP: RashiInfo[] = [
  { slug: 'aries',       signNumber: 1,  nameEn: 'Aries',       nameHi: 'मेष',      symbol: '♈', element: 'Fire',  quality: 'cardinal', ruler: 'Mars'    },
  { slug: 'taurus',      signNumber: 2,  nameEn: 'Taurus',      nameHi: 'वृषभ',     symbol: '♉', element: 'Earth', quality: 'fixed',    ruler: 'Venus'   },
  { slug: 'gemini',      signNumber: 3,  nameEn: 'Gemini',      nameHi: 'मिथुन',    symbol: '♊', element: 'Air',   quality: 'mutable',  ruler: 'Mercury' },
  { slug: 'cancer',      signNumber: 4,  nameEn: 'Cancer',      nameHi: 'कर्क',     symbol: '♋', element: 'Water', quality: 'cardinal', ruler: 'Moon'    },
  { slug: 'leo',         signNumber: 5,  nameEn: 'Leo',         nameHi: 'सिंह',     symbol: '♌', element: 'Fire',  quality: 'fixed',    ruler: 'Sun'     },
  { slug: 'virgo',       signNumber: 6,  nameEn: 'Virgo',       nameHi: 'कन्या',    symbol: '♍', element: 'Earth', quality: 'mutable',  ruler: 'Mercury' },
  { slug: 'libra',       signNumber: 7,  nameEn: 'Libra',       nameHi: 'तुला',     symbol: '♎', element: 'Air',   quality: 'cardinal', ruler: 'Venus'   },
  { slug: 'scorpio',     signNumber: 8,  nameEn: 'Scorpio',     nameHi: 'वृश्चिक',  symbol: '♏', element: 'Water', quality: 'fixed',    ruler: 'Mars'    },
  { slug: 'sagittarius', signNumber: 9,  nameEn: 'Sagittarius', nameHi: 'धनु',      symbol: '♐', element: 'Fire',  quality: 'mutable',  ruler: 'Jupiter' },
  { slug: 'capricorn',   signNumber: 10, nameEn: 'Capricorn',   nameHi: 'मकर',      symbol: '♑', element: 'Earth', quality: 'cardinal', ruler: 'Saturn'  },
  { slug: 'aquarius',    signNumber: 11, nameEn: 'Aquarius',    nameHi: 'कुंभ',     symbol: '♒', element: 'Air',   quality: 'fixed',    ruler: 'Saturn'  },
  { slug: 'pisces',      signNumber: 12, nameEn: 'Pisces',      nameHi: 'मीन',      symbol: '♓', element: 'Water', quality: 'mutable',  ruler: 'Jupiter' },
]

export const RASHI_SLUGS = RASHI_MAP.map(r => r.slug)

export function getRashiBySlug(slug: string): RashiInfo | undefined {
  return RASHI_MAP.find(r => r.slug === slug)
}

export function getRashiBySignNumber(n: number): RashiInfo | undefined {
  return RASHI_MAP.find(r => r.signNumber === n)
}

/** Which house does a transiting planet fall in for a given rashi? */
export function getHouseFromTransit(transitSignNumber: number, rashiSignNumber: number): number {
  return ((transitSignNumber - rashiSignNumber + 12) % 12) + 1
}
