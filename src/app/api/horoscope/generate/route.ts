// POST /api/horoscope/generate
// Protected by ADMIN_SECRET_TOKEN header. Generates horoscopes for all 12 rashis.
// Body: { type: 'daily' | 'weekly' | 'monthly', date?: 'YYYY-MM-DD' }
export const runtime = 'nodejs'
export const maxDuration = 300 // 5-min timeout for 12 AI calls

import { NextRequest, NextResponse } from 'next/server'
import { generateHoroscopes, type HoroscopeType } from '@/lib/horoscope/generator'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token') ?? req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { type?: string; date?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const type = (body.type ?? 'daily') as HoroscopeType
  if (!['daily', 'weekly', 'monthly'].includes(type)) {
    return NextResponse.json({ error: 'type must be daily, weekly, or monthly' }, { status: 400 })
  }

  const date = body.date ?? new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 })
  }

  console.log(`[horoscope/generate] Starting ${type} generation for ${date}`)
  const startMs = Date.now()

  const result = await generateHoroscopes(type, date)

  const elapsedSec = ((Date.now() - startMs) / 1000).toFixed(1)
  console.log(`[horoscope/generate] Done in ${elapsedSec}s — generated: ${result.generated}, errors: ${result.errors.length}`)

  const status = result.errors.length > 0 && result.generated === 0 ? 500 : 200
  return NextResponse.json({ ...result, elapsedSec }, { status })
}
