import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')
  const returnUrl = searchParams.get('returnUrl') || '/chart'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrotattwa.com'

  // If no code, send to login
  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login`)
  }

  // Decide final redirect first
  const decodedReturnUrl = decodeURIComponent(returnUrl)
  const safePath = decodedReturnUrl.startsWith('/') ? decodedReturnUrl : '/chart'
  const response = NextResponse.redirect(`${siteUrl}${safePath}`)
  response.headers.set('Cache-Control', 'no-store')

  // Exchange code -> session and WRITE cookies on this response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options, path: '/' })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options, path: '/' })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  return response
}
