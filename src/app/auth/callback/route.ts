import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const returnUrl = searchParams.get('returnUrl') || '/chart'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Always use the configured site URL — never trust request origin (Nginx proxy issue)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrotattwa.com'

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (code) {
    const supabase = await createClient()

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    // Password reset flow → go to reset-password page
    if (type === 'recovery') {
      return NextResponse.redirect(`${siteUrl}/reset-password`)
    }

    // Email confirmation or Google OAuth → go to intended destination
    const decodedReturnUrl = decodeURIComponent(returnUrl)
    const redirectTo = decodedReturnUrl.startsWith('/') ? decodedReturnUrl : '/chart'
    return NextResponse.redirect(`${siteUrl}${redirectTo}`)
  }

  // No code - redirect to login
  return NextResponse.redirect(`${siteUrl}/login`)
}
