export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { convert12to24 } from '@/lib/astrology/time'
import { calculateBirthChart } from '@/lib/astrology/core/calculate'
import { getCurrentPeriods } from '@/lib/astrology/core/dasa'

export const runtime = 'nodejs'

function getChunkedCookie(req: NextRequest, baseName: string) {
  const direct = req.cookies.get(baseName)?.value
  if (direct) return direct

  const parts: string[] = []
  for (let i = 0; i < 50; i++) {
    const part = req.cookies.get(`${baseName}.${i}`)?.value
    if (!part) break
    parts.push(part)
  }
  return parts.length ? parts.join('') : undefined
}

function createSupabase(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getChunkedCookie(req, name)
        },
        set() {},
        remove() {},
      },
    }
  )
}

function normalizeGender(g?: string | null): string {
  const v = (g ?? '').trim().toLowerCase()
  if (v === 'male' || v === 'm') return 'male'
  if (v === 'female' || v === 'f') return 'female'
  return v || 'male'
}

function getUtcOffsetMinutes(tz: string, birthDate: string, birthTime24: string): number {
  const [y, m, d] = birthDate.split('-').map(Number)
  const [hh, mm] = birthTime24.split(':').map(Number)

  const utcDate = new Date(Date.UTC(y, m - 1, d, hh, mm, 0))

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = dtf.formatToParts(utcDate)
  const get = (type: string) => parts.find((p) => p.type === type)?.value

  const tzYear = Number(get('year'))
  const tzMonth = Number(get('month'))
  const tzDay = Number(get('day'))
  const tzHour = Number(get('hour'))
  const tzMinute = Number(get('minute'))
  const tzSecond = Number(get('second'))

  const tzAsUTC = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond)
  return Math.round((tzAsUTC - utcDate.getTime()) / 60000)
}

/**
 * Returns the Western tropical sun sign number (1=Aries … 12=Pisces)
 * based on birth date ranges. This is the familiar "star sign" by birthday.
 */
function sunSignFromBirthDate(birthDate: string): number {
  const [, mStr, dStr] = birthDate.split('-')
  const m = Number(mStr)
  const d = Number(dStr)
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 1   // Aries
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 2   // Taurus
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 3   // Gemini
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 4   // Cancer
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 5   // Leo
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 6   // Virgo
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 7  // Libra
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 8 // Scorpio
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 9 // Sagittarius
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 10 // Capricorn
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 11  // Aquarius
  return 12                                                      // Pisces (Feb 19 – Mar 20)
}

const PLANET_KEYS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const

async function buildChartSnapshot(
  birthDate: string,
  birthTime24: string,
  birthPlace: string,
  latitude: number,
  longitude: number,
  timezone: string,
  gender: string,
) {
  try {
    const chart = await calculateBirthChart({ birthDate, birthTime: birthTime24, birthPlace, latitude, longitude, timezone, gender })

    const asc = chart.planets.Ascendant
    const ascSignNum = asc.signNumber

    const planetsSnap: Record<string, { sign: string; degree: number; house: number; retrograde: boolean; exhausted: boolean; combust: boolean }> = {}
    for (const key of PLANET_KEYS) {
      const p = chart.planets[key]
      if (!p) continue
      planetsSnap[key] = {
        sign:       p.sign.toLowerCase(),
        degree:     Math.round(p.degreeInSign * 100) / 100,
        house:      ((p.signNumber - ascSignNum + 12) % 12) + 1,
        retrograde: p.retrograde,
        exhausted:  p.exhausted,
        combust:    p.combust,
      }
    }

    let dashas = null
    try {
      const birthUtc = new Date(chart.calculated.utcDateTime)
      const nakLord  = chart.planets.Moon.kp.nakshatraLord as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const balance  = (chart.dasa.balance as any)?.classical360?.remainingYearsFloat ?? 0
      const periods  = getCurrentPeriods(birthUtc, nakLord, balance)
      if (periods) {
        dashas = {
          computed_at: new Date().toISOString(),
          mahadasha:  { planet: periods.mahadasha.lord,  start: periods.mahadasha.startUtc,  end: periods.mahadasha.endUtc  },
          antardasha: { planet: periods.antardasha.lord, start: periods.antardasha.startUtc, end: periods.antardasha.endUtc },
          pratyantar: { planet: periods.pratyantar.lord, start: periods.pratyantar.startUtc, end: periods.pratyantar.endUtc },
        }
      }
    } catch { /* dashas stay null */ }

    return {
      moon_sign:        chart.planets.Moon.signNumber,  // INTEGER 1-12 (KP sidereal)
      sun_sign:         sunSignFromBirthDate(birthDate), // INTEGER 1-12 (Western tropical date range)
      ascendant_sign:   asc.signNumber,                 // INTEGER 1-12
      ascendant_degree: Math.round(asc.degreeInSign * 100) / 100,
      nakshatra:        chart.planets.Moon.kp.nakshatraName,
      nakshatra_pada:   chart.planets.Moon.kp.nakshatraPada,
      planets:          planetsSnap,
      dashas,
    }
  } catch (err) {
    console.error('[save-chart/id] chart snapshot failed:', err)
    return null
  }
}

const SNAPSHOT_SELECT = 'moon_sign,sun_sign,ascendant_sign,ascendant_degree,nakshatra,nakshatra_pada,planets,dashas'
const BASE_SELECT = 'id,user_id,name,label,gender,birth_date,birth_time,birth_place,latitude,longitude,timezone,utc_offset,created_at,updated_at,is_favorite'
const FULL_SELECT = `${BASE_SELECT},${SNAPSHOT_SELECT}`

function mapDbErrorToHttp(err: any): { status: number; message: string } {
  if (err?.code === '23505') {
    return { status: 409, message: 'This birth chart is already saved.' }
  }
  const msg = String(err?.message ?? '')
  if (err?.code === 'P0001' || /Chart limit exceeded/i.test(msg)) {
    return { status: 403, message: 'You have reached your saved charts limit.' }
  }
  return { status: 400, message: msg || 'Request failed.' }
}

/**
 * PATCH /api/SaveChart/:id
 * Updates saved birth details (everything) + label.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const supabase = createSupabase(req)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = data.user.id
  const body = await req.json()

  const name = String(body?.name ?? '').trim()
  const label = body?.label != null ? String(body.label).trim() : null
  const gender = normalizeGender(body?.gender)

  const birthDate = String(body?.birthDate ?? '').trim()
  const birthTime = String(body?.birthTime ?? '').trim()
  const timePeriod = String(body?.timePeriod ?? '').trim()

  const birthPlace = String(body?.birthPlace ?? '').trim()
  const latitude = Number(body?.latitude)
  const longitude = Number(body?.longitude)
  const timezone = String(body?.timezone ?? '').trim()
  // is_favorite: undefined means "don't change", true/false means "set explicitly"
  const isFavorite: boolean | undefined =
    body?.is_favorite === true ? true : body?.is_favorite === false ? false : undefined

  if (!name || !birthDate || !birthTime || !timePeriod || !birthPlace || !timezone) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates.' }, { status: 400 })
  }

  const birthTime24 = convert12to24(birthTime, timePeriod)
  const utc_offset = getUtcOffsetMinutes(timezone, birthDate, birthTime24)

  // Calculate chart snapshot (non-blocking on failure)
  const snapshot = await buildChartSnapshot(birthDate, birthTime24, birthPlace, latitude, longitude, timezone, gender)

  // If setting as favorite, clear any existing favorite for this user first
  if (isFavorite === true) {
    await supabase
      .from('charts')
      .update({ is_favorite: false })
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .neq('id', id)
  }

  const updateRow: Record<string, any> = {
    name,
    label,
    gender,
    birth_date: birthDate,
    birth_time: birthTime24,
    birth_place: birthPlace,
    latitude,
    longitude,
    timezone,
    utc_offset,

    // Computed snapshot
    ayanamsa:         null,
    moon_sign:        snapshot?.moon_sign        ?? null,
    sun_sign:         snapshot?.sun_sign         ?? null,
    ascendant_sign:   snapshot?.ascendant_sign   ?? null,
    ascendant_degree: snapshot?.ascendant_degree ?? null,
    nakshatra:        snapshot?.nakshatra        ?? null,
    nakshatra_pada:   snapshot?.nakshatra_pada   ?? null,
    planets:          snapshot?.planets          ?? null,
    dashas:           snapshot?.dashas           ?? null,
    houses:           null,
    yogas:            null,
  }

  if (isFavorite !== undefined) {
    updateRow.is_favorite = isFavorite
  }

  const { data: updated, error: e } = await supabase
    .from('charts')
    .update(updateRow)
    .eq('id', id)
    .eq('user_id', userId)
    .select(FULL_SELECT)
    .single()

  if (e) {
    const mapped = mapDbErrorToHttp(e)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }

  return NextResponse.json({ chart: updated })
}

/**
 * DELETE /api/SaveChart/:id
 * Deletes a saved chart (only if owned by current user).
 */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const supabase = createSupabase(req)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = data.user.id

  const { error: e } = await supabase
    .from('charts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (e) {
    const mapped = mapDbErrorToHttp(e)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }

  return NextResponse.json({ success: true })
}
