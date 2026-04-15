export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
 * DELETE /api/numerology/compatibility/[id]
 * Deletes a saved compatibility reading. Only the owner can delete.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createSupabase(req)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { error: e } = await supabase
    .from('compatibility_readings')
    .delete()
    .eq('id', id)
    .eq('user_id', data.user.id)

  if (e) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
