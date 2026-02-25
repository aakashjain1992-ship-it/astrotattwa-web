export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = new Map<string, string>()
  request.cookies.getAll().forEach(c => cookieStore.set(c.name, c.value))

  const response = NextResponse.json({ success: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (cookieStore.has(name)) return cookieStore.get(name)
          let chunks = ''
          let i = 0
          while (cookieStore.has(`${name}.${i}`)) {
            chunks += cookieStore.get(`${name}.${i}`)
            i++
          }
          return chunks || undefined
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    }
  )

  await supabase.auth.signOut({ scope: 'global' })
  return response
}
