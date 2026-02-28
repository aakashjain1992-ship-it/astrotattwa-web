export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { convert12to24 } from '@/lib/astrology/time'

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

  if (!name || !birthDate || !birthTime || !timePeriod || !birthPlace || !timezone) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates.' }, { status: 400 })
  }

  const birthTime24 = convert12to24(birthTime, timePeriod)
  const utc_offset = getUtcOffsetMinutes(timezone, birthDate, birthTime24)

  const updateRow = {
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

    // Ensure "chart output" remains NOT stored
    ayanamsa: null,
    ascendant_degree: null,
    ascendant_sign: null,
    moon_sign: null,
    sun_sign: null,
    nakshatra: null,
    nakshatra_pada: null,
    planets: null,
    houses: null,
    dashas: null,
    yogas: null,
  }

  const { data: updated, error: e } = await supabase
    .from('charts')
    .update(updateRow)
    .eq('id', id)
    .eq('user_id', userId)
    .select(
      'id,user_id,name,label,gender,birth_date,birth_time,birth_place,latitude,longitude,timezone,utc_offset,created_at,updated_at,is_favorite'
    )
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
