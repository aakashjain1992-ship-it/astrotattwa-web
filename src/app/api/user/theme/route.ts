import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const VALID_THEMES = new Set(['light', 'dark', 'system'])

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

export async function GET(req: NextRequest) {
  const supabase = createSupabase(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ theme: null })

  const { data } = await supabase
    .from('profiles')
    .select('theme')
    .eq('id', user.id)
    .single()

  // Return null (not 'light') when no theme is explicitly stored so the caller
  // does not overwrite a localStorage preference with a default.
  return NextResponse.json({ theme: data?.theme ?? null })
}

export async function PATCH(req: NextRequest) {
  const supabase = createSupabase(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  const { error } = await supabase
    .from('profiles')
    .update({ theme })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
