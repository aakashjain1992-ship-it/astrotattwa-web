'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { generateNonce } from '@/lib/auth/googleOneTap'

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email']

export function GoogleOneTap({ clientId }: { clientId: string }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const initialized = useRef(false)

  useEffect(() => {
    if (loading || user || AUTH_PATHS.some(p => pathname.startsWith(p))) return
    if (initialized.current) return
    initialized.current = true

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = async () => {
      const nonce = await generateNonce()

      window.google?.accounts.id.initialize({
        client_id: clientId,
        nonce: nonce.hashed,
        callback: async (res: { credential: string }) => {
          try {
            const r = await fetch('/api/auth/google/onetap', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: res.credential, nonce: nonce.raw }),
            })
            if (r.ok) window.location.reload()
          } catch {}
        },
      })
      setTimeout(() => window.google?.accounts.id.prompt(), 1000)
    }
    document.head.appendChild(script)

    return () => { window.google?.accounts.id.cancel() }
  }, [loading, user, pathname, clientId])

  return null
}
