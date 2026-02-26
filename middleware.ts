import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
// IMPORTANT: /chart is PUBLIC per your requirement
const PROTECTED_PATHS = ['/reports', '/settings']

// Auth routes to redirect away from if already logged in
const AUTH_REDIRECT_PATHS = ['/login', '/signup', '/forgot-password']

function safeReturnUrl(value: string | null): string {
  if (!value) return '/'
  const v = value.trim()

  // allow only internal paths
  if (!v.startsWith('/')) return '/'
  if (v.startsWith('//')) return '/'
  if (v.includes('://')) return '/'
  if (v.length > 2048) return '/'

  return v
}

function isAuthPage(pathname: string): boolean {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/auth/callback')
  )
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Try exact name first
          const exact = request.cookies.get(name)?.value
          if (exact) return exact

          // Reconstruct chunked cookies (auth-token.0, auth-token.1, etc.)
          let chunks = ''
          let i = 0
          while (true) {
            const chunk = request.cookies.get(`${name}.${i}`)?.value
            if (!chunk) break
            chunks += chunk
            i++
          }
          return chunks || undefined
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options, path: '/' })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options, path: '/' })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Attach user info to headers for API/routes that may need it
  if (user) {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-email', user.email ?? '')
    response.headers.set(
      'x-user-name',
      (user.user_metadata?.full_name ?? user.user_metadata?.name ?? '') as string
    )
    response.headers.set('x-user-avatar', (user.user_metadata?.avatar_url ?? '') as string)
  }

  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'

    // Preserve full path + query (important for tabs / filters)
    const requested = `${pathname}${request.nextUrl.search || ''}`

    // Never allow auth pages as returnUrl targets
    const returnUrl = isAuthPage(pathname) ? '/' : safeReturnUrl(requested)

    url.searchParams.set('returnUrl', returnUrl)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login/signup pages
  const isAuthRedirect = AUTH_REDIRECT_PATHS.some((path) => pathname.startsWith(path))
  if (isAuthRedirect && user) {
    const url = request.nextUrl.clone()
    // Don't force /chart (since chart requires birth info in localStorage)
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
