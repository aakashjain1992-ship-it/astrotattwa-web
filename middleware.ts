import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PATHS = ['/chart', '/reports', '/settings']

// Auth routes to redirect away from if already logged in
const AUTH_REDIRECT_PATHS = ['/login', '/signup', '/forgot-password']

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
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  // Attach user info to headers for API routes
   if (user) {
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-email', user.email ?? '')
      response.headers.set('x-user-name', user.user_metadata?.full_name ?? user.user_metadata?.name ?? '')
      response.headers.set('x-user-avatar', user.user_metadata?.avatar_url ?? '')	
}


  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login/signup pages
  const isAuthRedirect = AUTH_REDIRECT_PATHS.some(path => pathname.startsWith(path))
  if (isAuthRedirect && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/chart'
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
