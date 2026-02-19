'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string | undefined
  fullName: string | null
  avatarUrl: string | null
  createdAt: string | undefined
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    createdAt: user.created_at,
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? toAuthUser(user) : null)
      setLoading(false)
    })

    // Listen for all auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        // Only redirect if on a protected page
        if (pathname.startsWith('/chart') || pathname.startsWith('/settings')) {
          router.push('/login?reason=signed_out')
        }
      } else if (event === 'TOKEN_REFRESHED' && !session) {
        // Refresh failed — session is dead
        setUser(null)
        router.push('/login?reason=session_expired')
      } else if (session?.user) {
        setUser(toAuthUser(session.user))
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [pathname, router, supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }, [supabase, router])

  const updateProfile = useCallback(
    async (updates: { fullName?: string }) => {
      const metadata: Record<string, string> = {}
      if (updates.fullName !== undefined) metadata.full_name = updates.fullName

      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      })

      if (!error && data.user) {
        setUser(toAuthUser(data.user))
      }
      return { error }
    },
    [supabase]
  )

  return { user, loading, signOut, updateProfile }
}
