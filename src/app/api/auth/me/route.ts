export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

function getProvider(user: any): string | null {
  // Most common
  const p1 = user?.app_metadata?.provider
  if (typeof p1 === 'string' && p1) return p1

  // Some setups
  const p2 = user?.identities?.[0]?.provider
  if (typeof p2 === 'string' && p2) return p2

  // Fallback
  return null
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
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const authUser = data.user
  const provider = getProvider(authUser)
  const signInMethod = provider === 'google' ? 'Google' : 'Email & Password'

  // Pull profile row (RLS should allow select where id = auth.uid())
  let profile: { full_name: string | null; avatar_url: string | null ; isadmin: boolean | null} | null = null
  try {
    const { data: p } = await supabase
      .from('profiles')
      .select('full_name,avatar_url,isadmin')
      .eq('id', authUser.id)
      .maybeSingle()

    profile = p ?? null
  } catch {
    profile = null
  }

  const fullName =
    profile?.full_name ??
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    null

  const avatarUrl =
    profile?.avatar_url ??
    (authUser.user_metadata?.avatar_url as string | undefined) ??
    null

  return NextResponse.json({
    user: {
      id: authUser.id,
      email: authUser.email ?? '',
      fullName,
      avatarUrl,
      createdAt: authUser.created_at, // ✅ Member since source
      provider, // ✅ raw provider
      signInMethod,// ✅ display value
      isAdmin: !!profile?.isadmin,
    },
  })
}
