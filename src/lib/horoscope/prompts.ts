import type { RashiInfo } from './rashiMap'

export interface PlanetContext {
  name: string
  sign: string
  signNumber: number
  house: number
  isRetrograde: boolean
}

export interface PanchangContext {
  tithi: string
  nakshatra: string
  yoga: string
  vara: string
  moonSign: string
}

export type HoroscopeLang = 'en' | 'hi'
export type SignType = 'moon' | 'sun'

export interface BatchPromptData {
  type: 'daily' | 'weekly' | 'monthly'
  periodLabel: string
  rashiPlanets: Array<{ rashi: RashiInfo; planets: PlanetContext[] }>
  panchang: PanchangContext | null
  festivals: string[]
  signType: SignType
  lang: HoroscopeLang
}

/** Structured prompt parts — system is cacheable, dataBlock is cacheable, langBlock varies */
export interface PromptParts {
  system:    string   // static instructions per type (cacheable across EN+HI)
  dataBlock: string   // planet table + panchang + festivals (cacheable, same for EN+HI)
  langBlock: string   // language-specific instruction (not cached — differs per call)
}

// ── Aspect computation ────────────────────────────────────────────────────────

/** Additional aspect offsets beyond the universal 7th-house aspect */
function specialAspectOffsets(planet: string): number[] {
  switch (planet) {
    case 'Saturn':  return [3, 10]
    case 'Jupiter': return [5, 9]
    case 'Mars':    return [4, 8]
    case 'Rahu':
    case 'Ketu':    return [5, 9]
    default:        return []
  }
}

/** Returns comma-separated houses that this planet aspects from a given house */
function aspectedHouses(fromHouse: number, planet: string): string {
  const offsets = [7, ...specialAspectOffsets(planet)]
  return offsets.map(o => ((fromHouse - 1 + o - 1) % 12) + 1).join(',')
}

// ── Rashi ruler abbreviations ─────────────────────────────────────────────────

const RULER_ABBR: Record<string, string> = {
  Mars: 'Ma', Venus: 'Ve', Mercury: 'Me', Moon: 'Mo',
  Sun: 'Su', Jupiter: 'Ju', Saturn: 'Sa',
}

// ── Planet abbreviations ──────────────────────────────────────────────────────

const PLANET_ABBR: Record<string, string> = {
  Saturn: 'Sa', Jupiter: 'Ju', Mars: 'Ma', Venus: 'Ve',
  Mercury: 'Me', Sun: 'Su', Moon: 'Mo', Rahu: 'Ra', Ketu: 'Ke',
}

// ── Type-specific prompt config ───────────────────────────────────────────────

const RASHI_SLUGS_ORDERED = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces',
]

const TYPE_CONFIG = {
  daily: {
    intent: 'Write a DAILY horoscope. Focus on today\'s energy — specific, grounded, actionable. Include lucky elements.',
    fieldGuide: [
      'overview: Today\'s overall energy and what it means for this sign. 40–55 words.',
      'career: Specific guidance for work/money today. 35–50 words.',
      'love: Specific guidance for relationships/emotions today. 35–50 words.',
      'health: Specific tip for wellbeing today. 35–50 words.',
      'lucky_colour: One colour and a brief reason. 8–12 words.',
      'lucky_number: One or two numbers and a brief reason. 8–12 words.',
      'favourable_time: Best time window today. 8–12 words.',
      'remedy: A simple practical remedy or affirmation for today. 10–15 words.',
    ],
  },
  weekly: {
    intent: 'Write a WEEKLY horoscope. No day-by-day breakdown. No fluff. Focus on the dominant theme of the week — one clear insight per area, actionable guidance only.',
    fieldGuide: [
      'overview: The week\'s dominant theme or turning point for this sign. 40–55 words.',
      'career: One key focus or opportunity to act on this week. 35–50 words.',
      'love: One key dynamic or shift in relationships this week. 35–50 words.',
      'health: One clear wellbeing priority for the week. 35–50 words.',
      'lucky_colour: Colour that supports the week\'s energy. 8–12 words.',
      'lucky_number: Significant number this week. 8–12 words.',
      'favourable_time: Best day or time window this week. 8–12 words.',
      'remedy: A simple ritual or habit to anchor the week\'s energy. 10–15 words.',
    ],
  },
  monthly: {
    intent: 'Write a MONTHLY horoscope. Think in terms of strategy and trends — what planetary forces are shaping this month, what to build toward, what to release. No day-to-day details.',
    fieldGuide: [
      'overview: The month\'s overarching planetary theme and what it means for this sign\'s growth. 50–65 words.',
      'career: Strategic career/financial trend and the best window to act. 40–55 words.',
      'love: Relational trend or emotional theme evolving through the month. 40–55 words.',
      'health: Wellness pattern or area needing sustained attention this month. 40–55 words.',
      'lucky_colour: Power colour for the month. 8–12 words.',
      'lucky_number: Significant number this month. 8–12 words.',
      'favourable_time: Best phase or week within the month. 8–12 words.',
      'remedy: A monthly ritual or intention-setting practice. 10–15 words.',
    ],
  },
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildBatchPrompt(data: BatchPromptData): PromptParts {
  const { type, periodLabel, rashiPlanets, panchang, festivals, signType, lang } = data

  const config    = TYPE_CONFIG[type]
  const signLabel = signType === 'moon' ? 'Moon Sign (Chandra Lagna)' : 'Sun Sign (Surya Lagna)'

  // ── System prompt (static per type — cacheable) ──────────────────────────
  const jsonTemplate = RASHI_SLUGS_ORDERED
    .map(s => `  "${s}":{"overview":"","career":"","love":"","health":"","lucky_colour":"","lucky_number":"","favourable_time":"","remedy":""}`)
    .join(',\n')

  const system = `${config.intent}
${signLabel} horoscope for ALL 12 rashis.
No jargon. No fear. No newlines inside any string value.

Field guidance:
${config.fieldGuide.join('\n')}

Return ONLY valid JSON — no text, no markdown, no explanation outside it:
{
${jsonTemplate}
}`

  // ── Data block (planet table + panchang + festivals — cacheable) ─────────
  const planetTable = rashiPlanets.map(({ rashi, planets }) => {
    const rulerAbbr = RULER_ABBR[rashi.ruler] ?? rashi.ruler.slice(0, 2)
    const label = `${rashi.slug}[${rashi.element.toLowerCase()}/${rulerAbbr}]`

    if (planets.length === 0) return `${label}: -`

    const pl = planets.map(p => {
      const abbr    = PLANET_ABBR[p.name] ?? p.name.slice(0, 2)
      const aspects = aspectedHouses(p.house, p.name)
      const retro   = p.isRetrograde ? 'R' : ''
      return `${abbr}${p.house}[${aspects}]${retro}`
    }).join(' ')

    return `${label}: ${pl}`
  }).join('\n')

  const panchangPrefix = type === 'weekly' ? 'Midweek panchang (ref only)' : 'Panchang'
  const panchangLine   = panchang
    ? `${panchangPrefix}: Tithi ${panchang.tithi} | Nakshatra ${panchang.nakshatra} | Yoga ${panchang.yoga} | Moon in ${panchang.moonSign}`
    : ''
  const festivalLine = festivals.length > 0 ? `Festivals: ${festivals.slice(0, 5).join(', ')}` : ''

  const dataBlock = `Period: ${periodLabel}
${panchangLine}
${festivalLine}

Planet positions (H=house, [..]=houses aspected, R=retrograde):
${planetTable}`

  // ── Language block (varies per call — not cached) ────────────────────────
  const langBlock = lang === 'hi'
    ? 'Write ALL content in natural conversational Hindi (Devanagari). Not a translation — write fresh Hindi.'
    : 'Write in warm, plain English.'

  return { system, dataBlock, langBlock }
}
