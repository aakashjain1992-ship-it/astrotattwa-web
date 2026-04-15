export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CompatibilityResult } from '@/types/numerology'

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
 * GET /api/numerology/compatibility
 * Returns saved compatibility readings for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const supabase = createSupabase(req)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ readings: [] }, { status: 401 })
  }

  const { data: readings, error: e } = await supabase
    .from('compatibility_readings')
    .select('id, user_id, name1, dob1, name2, dob2, result_json, created_at')
    .eq('user_id', data.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (e) {
    return NextResponse.json({ readings: [], error: e.message }, { status: 400 })
  }

  return NextResponse.json({ readings: readings ?? [] })
}

/**
 * POST /api/numerology/compatibility
 * Body: { name1, dob1, name2, dob2, result_json }
 * Saves a compatibility reading for the authenticated user.
 */
export async function POST(req: NextRequest) {
  const supabase = createSupabase(req)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const name1 = String(body?.name1 ?? '').trim()
  const dob1 = String(body?.dob1 ?? '').trim()
  const name2 = String(body?.name2 ?? '').trim()
  const dob2 = String(body?.dob2 ?? '').trim()
  const result_json = body?.result_json as CompatibilityResult

  if (!name1 || !dob1 || !name2 || !dob2 || !result_json) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const dobPattern = /^\d{2}-\d{2}-\d{4}$/
  if (!dobPattern.test(dob1) || !dobPattern.test(dob2)) {
    return NextResponse.json({ error: 'Invalid DOB format. Expected DD-MM-YYYY.' }, { status: 400 })
  }

  const { data: created, error: e } = await supabase
    .from('compatibility_readings')
    .insert({ user_id: data.user.id, name1, dob1, name2, dob2, result_json })
    .select('id, user_id, name1, dob1, name2, dob2, result_json, created_at')
    .single()

  if (e) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  return NextResponse.json({ reading: created }, { status: 201 })
}
