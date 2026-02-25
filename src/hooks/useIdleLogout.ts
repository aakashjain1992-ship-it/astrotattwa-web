'use client'

import { useEffect, useRef } from 'react'
import { performLogout } from '@/lib/auth/logout'

const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useIdleLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        performLogout()
      }, IDLE_TIMEOUT_MS)
    }

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))

    // Start timer on mount
    reset()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [])
}
