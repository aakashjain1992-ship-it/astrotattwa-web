'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme
}

/** Apply / remove 'dark' class on <html>. Guards against no-op to avoid triggering
 *  MutationObserver when the class is already in the correct state. */
function applyClass(theme: Theme) {
  const shouldBeDark = resolveTheme(theme) === 'dark'
  const isDark = document.documentElement.classList.contains('dark')
  if (shouldBeDark !== isDark) {
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme) || 'light'
    setThemeState(stored)
    applyClass(stored)
    setMounted(true)

    // MutationObserver: whenever React's reconciliation strips 'dark' from <html>,
    // this fires as a microtask — before the next paint — and immediately re-adds it.
    // No visible flash is possible because the browser never gets to paint the
    // intermediate state.
    const observer = new MutationObserver(() => {
      const current = (localStorage.getItem('theme') as Theme) || 'light'
      applyClass(current)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Re-apply when OS preference changes (only matters when theme === 'system')
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      const current = (localStorage.getItem('theme') as Theme) || 'light'
      if (current === 'system') applyClass('system')
    }
    mq.addEventListener('change', onSystemChange)

    return () => {
      observer.disconnect()
      mq.removeEventListener('change', onSystemChange)
    }
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    applyClass(t)
  }, [])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      resolvedTheme: mounted ? resolveTheme(theme) : 'light',
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
