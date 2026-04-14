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

/** Apply / remove 'dark' class on <html>. Called directly — no React reconciler involved. */
function applyClass(theme: Theme) {
  const resolved = resolveTheme(theme)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
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

    // Re-apply when OS preference changes (only matters when theme === 'system')
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      const current = (localStorage.getItem('theme') as Theme) || 'light'
      if (current === 'system') applyClass('system')
    }
    mq.addEventListener('change', onSystemChange)
    return () => mq.removeEventListener('change', onSystemChange)
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
