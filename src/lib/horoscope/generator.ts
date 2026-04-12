import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase/server-admin'
import { computePanchang } from '@/lib/panchang/compute'
import { AI_CONFIG } from './config'
import { RASHI_MAP, getHouseFromTransit } from './rashiMap'
import { buildBatchPrompt, type PromptParts, type PlanetContext, type PanchangContext, type HoroscopeLang, type SignType } from './prompts'

export type HoroscopeType = 'daily' | 'weekly' | 'monthly'

export interface HoroscopeContent {
  overview:        string
  career:          string
  love:            string
  health:          string
  lucky_colour:    string
  lucky_number:    string
  favourable_time: string
  remedy:          string
}

const EMPTY_CONTENT: HoroscopeContent = {
  overview: '', career: '', love: '', health: '',
  lucky_colour: '', lucky_number: '', favourable_time: '', remedy: '',
}

interface PeriodInfo {
  period_start: string
  period_end:   string
  periodLabel:  string
}

export interface GenerateResult {
  type:         HoroscopeType
  period_start: string
  generated:    number
  skipped:      boolean
  errors:       string[]
  tokens?: {
    input:  number
    output: number
    cost:   number
  }
}

// ── Reference location for panchang (Delhi, IST) ─────────────────────────────
const PANCHANG_REF = { lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata', location: 'Delhi, India' }

// ── Period helpers ────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

function midpointDate(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00Z').getTime()
  const e = new Date(end   + 'T00:00:00Z').getTime()
  return toDateStr(new Date(Math.round((s + e) / 2)))
}

function computePeriod(type: HoroscopeType, date: string): PeriodInfo {
  const d = new Date(date + 'T00:00:00.000Z')

  if (type === 'daily') {
    return { period_start: date, period_end: date, periodLabel: formatDate(d) }
  }

  if (type === 'weekly') {
    const dayOfWeek = d.getUTCDay()
    const daysFromMonday = (dayOfWeek + 6) % 7
    const monday = new Date(d)
    monday.setUTCDate(d.getUTCDate() - daysFromMonday)
    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)
    return {
      period_start: toDateStr(monday),
      period_end:   toDateStr(sunday),
      periodLabel:  `${formatDate(monday)} – ${formatDate(sunday)}`,
    }
  }

  // monthly
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
  const end   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
  return {
    period_start: toDateStr(start),
    period_end:   toDateStr(end),
    periodLabel:  start.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', timeZone: 'UTC' }),
  }
}

// ── DB helpers ────────────────────────────────────────────────────────────────

interface TransitRow { planet: string; sign_name: string; sign: number }

async function fetchActivePlanets(start: string, end: string): Promise<TransitRow[]> {
  const { data, error } = await supabaseAdmin
    .from('planet_sign_transits').select('planet, sign_name, sign')
    .lte('entry_date', end).gte('exit_date', start)
  if (error) console.error('fetchActivePlanets:', error.message)
  return (data ?? []) as TransitRow[]
}

async function fetchRetrogradePlanets(start: string, end: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('planet_retrograde_periods').select('planet')
    .lte('retrograde_start', end).gte('direct_start', start)
  if (error) console.error('fetchRetrogradePlanets:', error.message)
  return (data ?? []).map((r: { planet: string }) => r.planet)
}

async function fetchFestivals(start: string, end: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('festival_calendar').select('name')
    .gte('date', start).lte('date', end).order('date').limit(10)
  if (error) console.error('fetchFestivals:', error.message)
  return (data ?? []).map((r: { name: string }) => r.name)
}

async function fetchPanchangContext(date: string): Promise<PanchangContext | null> {
  try {
    const p = await computePanchang({ date, ...PANCHANG_REF })
    return {
      tithi:     `${p.pancha.tithi.paksha} ${p.pancha.tithi.name}`,
      nakshatra:  p.pancha.nakshatra.name,
      yoga:       p.pancha.yoga.name,
      vara:       p.pancha.vara.name,
      moonSign:   p.moonPosition.rashi,
    }
  } catch {
    return null
  }
}

// ── Token usage tracking ──────────────────────────────────────────────────────

interface TokenUsage { inputTokens: number; outputTokens: number }

const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6':          { input: 3.00,  output: 15.00 },
  'claude-haiku-4-5-20251001':  { input: 0.80,  output: 4.00  },
  'claude-opus-4-6':            { input: 15.00, output: 75.00 },
}

function calcCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates = PRICING[model] ?? { input: 3.00, output: 15.00 }
  return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000
}

// ── AI caller (with prompt caching) ──────────────────────────────────────────

interface AIResult { text: string; usage: TokenUsage }

async function callAI(parts: PromptParts, model?: string, maxTokens?: number): Promise<AIResult> {
  if (AI_CONFIG.provider === 'openai') {
    throw new Error('OpenAI provider not configured.')
  }
  const resolvedModel = model ?? AI_CONFIG.anthropicModels['daily']
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model:       resolvedModel,
    max_tokens:  maxTokens ?? AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature,
    // System prompt is static per type — marked cacheable
    system: [
      { type: 'text', text: parts.system, cache_control: { type: 'ephemeral' } },
    ],
    messages: [{
      role: 'user',
      content: [
        // Data block (planet table + panchang) is same for EN and HI — cacheable
        { type: 'text', text: parts.dataBlock, cache_control: { type: 'ephemeral' } },
        // Language instruction varies between EN and HI — not cached
        { type: 'text', text: parts.langBlock },
      ],
    }],
  })
  const block = msg.content.find(b => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error('No text in AI response')
  return {
    text: block.text,
    usage: {
      inputTokens:  msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    },
  }
}

// ── Output quality validation ─────────────────────────────────────────────────

function validateBatch(batch: Record<string, HoroscopeContent>): string[] {
  const issues: string[] = []
  const mainFields    = ['overview', 'career', 'love', 'health']     as const
  const snippetFields = ['lucky_colour', 'lucky_number', 'favourable_time', 'remedy'] as const

  for (const [rashi, content] of Object.entries(batch)) {
    if (!content) { issues.push(`${rashi}: missing`); continue }
    for (const f of mainFields) {
      const words = (content[f] ?? '').trim().split(/\s+/).filter(Boolean).length
      if (words < 15) issues.push(`${rashi}.${f}: ${words}w (min 15)`)
    }
    for (const f of snippetFields) {
      if (!(content[f] ?? '').trim()) issues.push(`${rashi}.${f}: empty`)
    }
  }
  return issues
}

function parseBatchResponse(text: string): Record<string, HoroscopeContent> {
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON object in AI response')
  return JSON.parse(jsonMatch[0]) as Record<string, HoroscopeContent>
}

// ── Main generator ────────────────────────────────────────────────────────────

export async function generateHoroscopes(type: HoroscopeType, targetDate: string): Promise<GenerateResult> {
  const genStart = Date.now()
  const { period_start, period_end, periodLabel } = computePeriod(type, targetDate)

  // Check how many moon sign rows exist (sun sign disabled — don't count those)
  const { count: existingCount } = await supabaseAdmin
    .from('horoscopes').select('*', { count: 'exact', head: true })
    .eq('type', type).eq('period_start', period_start).eq('sign_type', 'moon')

  if ((existingCount ?? 0) >= 12) {
    return { type, period_start, generated: 0, skipped: true, errors: [] }
  }

  // For panchang: daily = exact date, weekly = midpoint (Wed), monthly = skip (moon cycles fully)
  const panchangDate = type === 'daily'  ? period_start
                     : type === 'weekly' ? midpointDate(period_start, period_end)
                     : null

  const [rawPlanets, retrogradePlanets, festivals, panchang] = await Promise.all([
    fetchActivePlanets(period_start, period_end),
    fetchRetrogradePlanets(period_start, period_end),
    fetchFestivals(period_start, period_end),
    panchangDate ? fetchPanchangContext(panchangDate) : Promise.resolve(null),
  ])

  const retrogradeSet = new Set(retrogradePlanets)

  const rashiPlanets = RASHI_MAP.map(rashi => ({
    rashi,
    planets: rawPlanets.map((p): PlanetContext => ({
      name:         p.planet,
      sign:         p.sign_name,
      signNumber:   p.sign,
      house:        getHouseFromTransit(p.sign, rashi.signNumber),
      isRetrograde: retrogradeSet.has(p.planet),
    })),
  }))

  const basePromptData = { type, periodLabel, panchang, festivals }

  const model = AI_CONFIG.anthropicModels[type] ?? AI_CONFIG.anthropicModels['daily']

  // Step 1: Generate English content in two parallel batches of 6 rashis
  const half        = Math.ceil(rashiPlanets.length / 2)
  const enBatch1    = buildBatchPrompt({ ...basePromptData, rashiPlanets: rashiPlanets.slice(0, half), signType: 'moon', lang: 'en' })
  const enBatch2    = buildBatchPrompt({ ...basePromptData, rashiPlanets: rashiPlanets.slice(half),    signType: 'moon', lang: 'en' })
  const promptParts = enBatch1  // used for prompt_preview in log

  const errors: string[] = []
  let totalInput = 0, totalOutput = 0

  let moonEn: Record<string, HoroscopeContent> = {}
  try {
    const [en1, en2] = await Promise.all([
      callAI(enBatch1, model),
      callAI(enBatch2, model),
    ])
    totalInput  += en1.usage.inputTokens  + en2.usage.inputTokens
    totalOutput += en1.usage.outputTokens + en2.usage.outputTokens
    moonEn = { ...parseBatchResponse(en1.text), ...parseBatchResponse(en2.text) }
    const issues = validateBatch(moonEn)
    issues.forEach(iss => errors.push(`quality_en: ${iss}`))
  } catch (e) {
    errors.push(`batch_en: ${e instanceof Error ? e.message : String(e)}`)
    return { type, period_start, generated: 0, skipped: false, errors, tokens: { input: totalInput, output: totalOutput, cost: calcCost(model, totalInput, totalOutput) } }
  }

  // Step 2: Translate English → Hindi in two parallel batches of 6 rashis each
  let moonHi: Record<string, HoroscopeContent> = {}
  try {
    const slugs   = RASHI_MAP.map(r => r.slug)
    const half    = Math.ceil(slugs.length / 2)
    const batch1  = Object.fromEntries(slugs.slice(0, half).map(s => [s, moonEn[s]]).filter(([, v]) => v))
    const batch2  = Object.fromEntries(slugs.slice(half).map(s => [s, moonEn[s]]).filter(([, v]) => v))

    const TRANSLATE_SYSTEM = 'Translate all string values in this JSON to natural Hindi (Devanagari). Keep all JSON keys in English exactly as-is. Return only valid JSON, no explanation.'
    const [r1, r2] = await Promise.all([
      callAI({ system: TRANSLATE_SYSTEM, dataBlock: JSON.stringify(batch1), langBlock: 'Translate now.' }, model),
      callAI({ system: TRANSLATE_SYSTEM, dataBlock: JSON.stringify(batch2), langBlock: 'Translate now.' }, model),
    ])

    totalInput  += r1.usage.inputTokens + r2.usage.inputTokens
    totalOutput += r1.usage.outputTokens + r2.usage.outputTokens
    moonHi = { ...parseBatchResponse(r1.text), ...parseBatchResponse(r2.text) }
  } catch (e) {
    errors.push(`translate_hi: ${e instanceof Error ? e.message : String(e)}`)
  }

  const parseErrors = errors.filter(e => e.startsWith('batch_'))
  if (parseErrors.length > 0) {
    return { type, period_start, generated: 0, skipped: false, errors, tokens: { input: totalInput, output: totalOutput, cost: calcCost(model, totalInput, totalOutput) } }
  }

  const planetContextSnapshot = { planets: rashiPlanets[0]?.planets, panchang, festivals, generatedAt: new Date().toISOString() }
  const rows = RASHI_MAP.map(rashi => ({
    rashi: rashi.slug, type, sign_type: 'moon',
    period_start, period_end,
    content_en:     moonEn[rashi.slug] ?? EMPTY_CONTENT,
    content_hi:     moonHi[rashi.slug] ?? EMPTY_CONTENT,
    planet_context: planetContextSnapshot,
    published_at:   new Date().toISOString(),
  }))

  const { error: upsertError } = await supabaseAdmin
    .from('horoscopes')
    .upsert(rows, { onConflict: 'rashi,type,sign_type,period_start' })

  if (upsertError) {
    errors.push(`upsert: ${upsertError.message}`)
    return { type, period_start, generated: 0, skipped: false, errors, tokens: { input: totalInput, output: totalOutput, cost: calcCost(AI_CONFIG.anthropicModel, totalInput, totalOutput) } }
  }

  const generated  = RASHI_MAP.filter(r => moonEn[r.slug]?.overview).length
  const totalCost  = calcCost(model, totalInput, totalOutput)

  // Fire-and-forget log
  supabaseAdmin.from('horoscope_generation_log').insert({
    type,
    period_start,
    model,
    input_tokens:     totalInput,
    output_tokens:    totalOutput,
    cost_usd:         totalCost,
    rashis_generated: generated,
    errors,
    duration_sec:     parseFloat(((Date.now() - genStart) / 1000).toFixed(2)),
    prompt_preview:   promptParts.dataBlock.slice(0, 500),
  }).then(({ error: logErr }) => {
    if (logErr) console.error('horoscope_generation_log insert:', logErr.message)
  })

  return { type, period_start, generated, skipped: false, errors, tokens: { input: totalInput, output: totalOutput, cost: totalCost } }
}
