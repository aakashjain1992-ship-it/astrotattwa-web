'use client'

/**
 * SessionWatcher
 *
 * Mount this component on any protected page (e.g. chart, settings).
 * It listens for Supabase auth events and redirects to login when
 * the session expires or the user signs out from another tab.
 *
 * Usage:
 *   import { SessionWatcher } from '@/components/auth/SessionWatcher'
 *   // Inside your page or layout:
 *   <SessionWatcher />
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SessionWatcher() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login?reason=signed_out')
        return
      }

      // TOKEN_REFRESHED with no session means refresh token is dead
      if (event === 'TOKEN_REFRESHED' && !session) {
        router.push('/login?reason=session_expired')
        return
      }

      // USER_DELETED
      if (event === 'USER_DELETED' as typeof event) {
        router.push('/login?reason=account_deleted')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  // Renders nothing — purely a side-effect component
  return null
}
