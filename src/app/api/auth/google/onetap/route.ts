import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const credential: string | undefined = body?.credential
  const nonce: string | undefined = body?.nonce

  if (!credential) {
    return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
  }

  const response = NextResponse.json({ success: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) { response.cookies.set({ name, value, ...options, path: '/' }) },
        remove(name, options) { response.cookies.set({ name, value: '', ...options, path: '/' }) },
      },
    }
  )

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: credential,
    ...(nonce ? { nonce } : {}),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return response
}
