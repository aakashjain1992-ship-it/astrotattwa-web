export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

function getChunkedCookie(req: NextRequest, baseName: string) {
  // Non-chunked cookie
  const direct = req.cookies.get(baseName)?.value
  if (direct) return direct

  // Chunked cookies: name.0, name.1, ...
  const parts: string[] = []
  for (let i = 0; i < 50; i++) {
    const part = req.cookies.get(`${baseName}.${i}`)?.value
    if (!part) break
    parts.push(part)
  }
  return parts.length ? parts.join('') : undefined
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient(
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

  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ user: null })
  }

  // Return minimal safe user shape for header
  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      fullName:
        (data.user.user_metadata?.full_name as string | undefined) ??
        (data.user.user_metadata?.name as string | undefined) ??
        null,
      avatarUrl: (data.user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
  })
}
