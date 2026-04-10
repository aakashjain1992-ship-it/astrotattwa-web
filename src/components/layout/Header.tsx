'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { LogOut, Settings, User, ChevronDown } from 'lucide-react'
import type { AuthUser } from '@/hooks/useAuth'
import { performLogout } from '@/lib/auth/logout'
import { useToast } from '@/hooks/use-toast'


// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ user }: { user: AuthUser }) {
  const initials = (user.fullName ?? user.email ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName ?? 'User avatar'}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--border2)',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--blue)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

// ─── User Dropdown ────────────────────────────────────────────────────────────

function UserDropdown({
  user,
  onSignOut,
  onMyChartClick,
}: {
  user: AuthUser
  onSignOut: () => void
  onMyChartClick: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: '1px solid var(--border2)',
          borderRadius: 8,
          padding: '4px 10px 4px 6px',
          cursor: 'pointer',
          transition: 'all .15s',
          color: 'var(--text)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--blue)'
          e.currentTarget.style.background = 'var(--blue-light)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border2)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <Avatar user={user} />
        <ChevronDown
          size={14}
          style={{
            color: 'var(--text3)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform .2s',
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 220,
            background: '#fff',
            border: '1px solid var(--border2)',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,.12)',
            overflow: 'hidden',
            zIndex: 999,
          }}
        >
          {/* User info */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid var(--border2)',
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {user.fullName ?? 'My Account'}
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text3)',
                margin: '2px 0 0',
                lineHeight: 1.3,
              }}
            >
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <nav style={{ padding: '4px 0' }}>
            <DropdownItem
              icon={<User size={14} />}
              label="My Chart"
              onClick={() => { setOpen(false); onMyChartClick(); }}
            />
            <DropdownItem
              href="/settings"
              icon={<Settings size={14} />}
              label="Account Settings"
              onClick={() => setOpen(false)}
            />
          </nav>

          {/* Sign out */}
          <div style={{ padding: '4px 0', borderTop: '1px solid var(--border2)' }}>
            <button
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '9px 14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: '#DC2626',
                textAlign: 'left',
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEF2F2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DropdownItem({
  href,
  icon,
  label,
  onClick,
}: {
  href?: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  const sharedStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 14px',
    fontSize: 13,
    color: 'var(--text2)',
    textDecoration: 'none',
    transition: 'background .12s',
    width: '100%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
  }

  if (!href) {
    return (
      <button
        onClick={onClick}
        style={sharedStyle}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ color: 'var(--text3)' }}>{icon}</span>
        {label}
      </button>
    )
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      style={sharedStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-subtle)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <span style={{ color: 'var(--text3)' }}>{icon}</span>
      {label}
    </Link>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

interface HeaderProps {
  /** Hide nav links (used on chart/settings pages) */
  showNav?: boolean
}

export function Header({ showNav = true }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Auth state — use getSession() (reads cookie, no network) for instant display
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user
        setUser({
          id: u.id,
          email: u.email ?? undefined,
          fullName: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
          avatarUrl: u.user_metadata?.avatar_url ?? null,
          createdAt: u.created_at,
        })
      }
      setAuthLoading(false)
    })

    // Keep in sync when session changes in another tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        setUser({
          id: u.id,
          email: u.email ?? undefined,
          fullName: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
          avatarUrl: u.user_metadata?.avatar_url ?? null,
          createdAt: u.created_at,
        })
      } else {
        setUser(null)
      }
      setAuthLoading(false)
    })

    // Multi-tab logout sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'astrotattwa:logout') {
        window.location.href = '/login'
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorage)
    }
  }, [supabase])


  const handleSignOut = async () => {
    await performLogout()
    router.push('/login')
    router.refresh()
  }

  const handleMyChartClick = async () => {
    try {
      // Fetch the user's saved charts and find the default (is_favorite)
      const res = await fetch('/api/save-chart', { credentials: 'include' })
      if (!res.ok) throw new Error('fetch failed')
      const { charts } = await res.json()
      const favorite = (charts ?? []).find((c: any) => c.is_favorite)

      if (!favorite) {
        toast({
          title: '✨ No default chart set',
          description: 'Open a chart, save it, and check "Set as My Chart" to use this shortcut.',
          variant: 'dark',
        })
        return
      }

      // Convert DB 24h time → 12h + period for the calculate API
      const [hStr, mStr] = (favorite.birth_time as string).split(':')
      const h24 = parseInt(hStr, 10)
      const period = h24 >= 12 ? 'PM' : 'AM'
      const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
      const birthTime12 = `${String(h12).padStart(2, '0')}:${mStr}`

      // Calculate the chart from saved birth data
      const calcRes = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       favorite.name,
          gender:     favorite.gender,
          birthDate:  favorite.birth_date,
          birthTime:  birthTime12,
          timePeriod: period,
          birthPlace: favorite.birth_place,
          latitude:   favorite.latitude,
          longitude:  favorite.longitude,
          timezone:   favorite.timezone,
        }),
      })
      if (!calcRes.ok) throw new Error('calculation failed')
      const calcData = await calcRes.json()

      localStorage.setItem('lastChart', JSON.stringify({
        ...calcData.data,
        birthPlace: favorite.birth_place,
      }))
      // Use full navigation so ChartClient always remounts and re-reads localStorage,
      // even when the user is already on /chart (router.push would be a no-op there).
      window.location.href = '/chart'
    } catch {
      toast({
        title: 'Could not load chart',
        description: 'Please try again in a moment.',
        variant: 'dark',
      })
    }
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 64,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        transition: 'box-shadow .25s',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,.06)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          height: '100%',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Logo variant="header" />

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!authLoading && (
            <>
              {user ? (
                <UserDropdown user={user} onSignOut={handleSignOut} onMyChartClick={handleMyChartClick} />
              ) : (
                <>
                  <Link
                    href="/login"
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 500,
                      color: 'var(--text2)',
                      background: 'transparent',
                      border: '1px solid var(--border2)',
                      padding: '7px 18px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      transition: 'all .18s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--blue)'
                      el.style.color = 'var(--blue)'
                      el.style.background = 'var(--blue-light)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--border2)'
                      el.style.color = 'var(--text2)'
                      el.style.background = 'transparent'
                    }}
                  >
                    Sign in
                  </Link>
                  {showNav && (
                    <Link
                      href="/signup"
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 500,
                        color: '#fff',
                        background: 'var(--blue)',
                        border: '1px solid var(--blue)',
                        padding: '7px 18px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        transition: 'background .18s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--blue-dark)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--blue)'
                      }}
                    >
                      Get started
                    </Link>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
