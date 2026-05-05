import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const returnUrl = searchParams.get('returnUrl') || '/chart'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrotattwa.com'

  const state = crypto.randomBytes(32).toString('hex')

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
  googleAuthUrl.searchParams.set('redirect_uri', `${siteUrl}/auth/google/callback`)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('state', state)
  googleAuthUrl.searchParams.set('prompt', 'select_account')

  const response = NextResponse.redirect(googleAuthUrl.toString())
  response.cookies.set('google_oauth_state', JSON.stringify({ state, returnUrl }), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
