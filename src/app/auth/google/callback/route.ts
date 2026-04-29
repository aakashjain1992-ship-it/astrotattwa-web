import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrotattwa.com'

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  if (oauthError) {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(oauthError)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login`)
  }

  // Validate CSRF state
  const stateCookie = req.cookies.get('google_oauth_state')?.value
  if (!stateCookie) {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent('OAuth state missing')}`)
  }

  let cookieData: { state: string; returnUrl: string }
  try {
    cookieData = JSON.parse(stateCookie)
  } catch {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent('OAuth state invalid')}`)
  }

  if (state !== cookieData.state) {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent('OAuth state mismatch')}`)
  }

  const safePath = cookieData.returnUrl?.startsWith('/') ? cookieData.returnUrl : '/chart'
  const response = NextResponse.redirect(`${siteUrl}${safePath}`)
  response.headers.set('Cache-Control', 'no-store')
  response.cookies.set('google_oauth_state', '', { maxAge: 0, path: '/' })

  // Exchange authorization code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${siteUrl}/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent('Google authentication failed')}`)
  }

  const tokens = await tokenRes.json()
  const idToken: string | undefined = tokens.id_token

  if (!idToken) {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent('Google authentication failed')}`)
  }

  // Create Supabase session from the Google ID token
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

  const { error: signInError } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  })

  if (signInError) {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(signInError.message)}`)
  }

  return response
}
