import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VALID_THEMES = new Set(['light', 'dark', 'system'])

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ theme: 'light' })

  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('theme')
    .eq('id', userId)
    .single()

  return NextResponse.json({ theme: data?.theme ?? 'light' })
}

export async function PATCH(req: Request) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { theme?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const theme = body.theme
  if (typeof theme !== 'string' || !VALID_THEMES.has(theme)) {
    return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ theme })
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
