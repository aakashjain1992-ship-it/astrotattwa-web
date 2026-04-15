export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { NumerologyResult } from '@/types/numerology'

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
        get(name: string) { return getChunkedCookie(req, name) },
        set() {},
        remove() {},
      },
    }
  )
}

/**
 * GET /api/numerology
 * Returns all saved numerology readings for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const supabase = createSupabase(req)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ readings: [] }, { status: 401 })
  }

  const { data: readings, error: e } = await supabase
    .from('numerology_readings')
    .select('id, user_id, name, dob, result_json, created_at')
    .eq('user_id', data.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (e) {
    return NextResponse.json({ readings: [], error: e.message }, { status: 400 })
  }

  return NextResponse.json({ readings: readings ?? [] })
}

/**
 * POST /api/numerology
 * Body: { name: string, dob: string, result_json: NumerologyResult }
 * Saves a numerology reading for the authenticated user.
 */
export async function POST(req: NextRequest) {
  const supabase = createSupabase(req)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const name = String(body?.name ?? '').trim()
  const dob = String(body?.dob ?? '').trim()
  const result_json = body?.result_json as NumerologyResult

  if (!name || !dob || !result_json) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Validate DOB format DD-MM-YYYY
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
    return NextResponse.json({ error: 'Invalid DOB format. Expected DD-MM-YYYY.' }, { status: 400 })
  }

  const { data: created, error: e } = await supabase
    .from('numerology_readings')
    .insert({
      user_id: data.user.id,
      name,
      dob,
      result_json,
    })
    .select('id, user_id, name, dob, result_json, created_at')
    .single()

  if (e) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  return NextResponse.json({ reading: created }, { status: 201 })
}
