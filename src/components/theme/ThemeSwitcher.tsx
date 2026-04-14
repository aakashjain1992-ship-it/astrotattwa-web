'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ThemeSwitcherProps {
  /** 'icon' = single cycling icon button (desktop header, non-logged-in)
   *  'menu' = 3-button row (user dropdown / mobile drawer) */
  variant?: 'icon' | 'menu'
  /** If provided, persists theme to DB via PATCH /api/user/theme */
  userId?: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const THEMES = [
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

const ICON_ORDER = ['light', 'dark', 'system'] as const

async function persistTheme(userId: string, theme: string) {
  try {
    await fetch('/api/user/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
      credentials: 'include',
    })
  } catch {
    // best-effort; localStorage is already updated by next-themes
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ThemeSwitcher({ variant = 'icon', userId }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Avoid hydration mismatch — render nothing until client mounts
  if (!mounted) {
    if (variant === 'icon') return <div style={{ width: 34, height: 34, flexShrink: 0 }} />
    return null
  }

  const handleChange = (value: string) => {
    setTheme(value)
    if (userId) persistTheme(userId, value)
  }

  // ── Icon variant (cycling button) ──────────────────────────────────────────
  if (variant === 'icon') {
    const current = (theme ?? 'light') as string
    const idx = ICON_ORDER.indexOf(current as typeof ICON_ORDER[number])
    const nextTheme = ICON_ORDER[(idx < 0 ? 0 : idx + 1) % ICON_ORDER.length]
    const Icon = current === 'dark' ? Moon : current === 'system' ? Monitor : Sun

    return (
      <button
        onClick={() => handleChange(nextTheme)}
        title={`Theme: ${current} — click to switch`}
        className="theme-switcher-icon-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          borderRadius: 8,
          background: 'transparent',
          border: '1px solid var(--border2)',
          cursor: 'pointer',
          color: 'var(--text2)',
          transition: 'all .15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--blue)'
          e.currentTarget.style.color = 'var(--blue)'
          e.currentTarget.style.background = 'var(--blue-light)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border2)'
          e.currentTarget.style.color = 'var(--text2)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <Icon size={15} />
      </button>
    )
  }

  // ── Menu variant (3-button row) ────────────────────────────────────────────
  return (
    <div style={{ padding: '6px 8px' }}>
      <p style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 6px 4px',
      }}>
        Appearance
      </p>
      <div style={{ display: 'flex', gap: 4 }}>
        {THEMES.map(({ value, label, icon: Icon }) => {
          const isActive = theme === value
          return (
            <button
              key={value}
              onClick={() => handleChange(value)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '6px 4px',
                borderRadius: 7,
                border: `1px solid ${isActive ? 'var(--blue)' : 'var(--border2)'}`,
                background: isActive ? 'var(--blue-light)' : 'transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--blue)' : 'var(--text3)',
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                transition: 'all .12s',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
