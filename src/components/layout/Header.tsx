'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { LogOut, Settings, User, ChevronDown, Menu, X, Sun, Calendar, BookOpen } from 'lucide-react'
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

// ─── Horoscope Nav Dropdown ───────────────────────────────────────────────────

function HoroscopeDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = pathname.startsWith('/horoscope')

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const items = [
    { label: 'Daily', href: '/horoscope/daily/aries' },
    { label: 'Weekly', href: '/horoscope/weekly/aries' },
    { label: 'Monthly', href: '/horoscope/monthly/aries' },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13.5px',
          fontWeight: 500,
          color: isActive ? 'var(--blue)' : 'var(--text2)',
          padding: '6px 10px',
          borderRadius: 8,
          transition: 'color .15s',
        }}
        onMouseLeave={() => {/* keep open while hovering panel */}}
      >
        Horoscope
        <ChevronDown
          size={13}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform .2s',
          }}
        />
      </button>

      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: 160,
            background: '#fff',
            border: '1px solid var(--border2)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,.10)',
            overflow: 'hidden',
            zIndex: 300,
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '10px 16px',
                fontSize: 13,
                color: pathname.startsWith(item.href.replace('/aries', ''))
                  ? 'var(--blue)'
                  : 'var(--text2)',
                fontWeight: pathname.startsWith(item.href.replace('/aries', '')) ? 600 : 400,
                textDecoration: 'none',
                transition: 'background .12s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Simple Nav Link ──────────────────────────────────────────────────────────

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const isActive = pathname.startsWith(href)
  return (
    <Link
      href={href}
      style={{
        fontSize: '13.5px',
        fontWeight: 500,
        color: isActive ? 'var(--blue)' : 'var(--text2)',
        textDecoration: 'none',
        padding: '6px 10px',
        borderRadius: 8,
        transition: 'color .15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--blue)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? 'var(--blue)' : 'var(--text2)' }}
    >
      {label}
    </Link>
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
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
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
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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

      const [hStr, mStr] = (favorite.birth_time as string).split(':')
      const h24 = parseInt(hStr, 10)
      const period = h24 >= 12 ? 'PM' : 'AM'
      const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
      const birthTime12 = `${String(h12).padStart(2, '0')}:${mStr}`

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
    <>
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
            {/* Desktop nav links */}
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                marginRight: 8,
              }}
              className="header-desktop-nav"
            >
              <HoroscopeDropdown pathname={pathname} />
              <NavLink href="/panchang" label="Panchang" pathname={pathname} />
              <NavLink href="/festival" label="Festival" pathname={pathname} />
              <NavLink href="/book-consultancy" label="Book Consultancy" pathname={pathname} />
            </nav>
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
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--blue-dark)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--blue)' }}
                      >
                        Get started
                      </Link>
                    )}
                  </>
                )}
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="header-mobile-menu-btn"
              style={{
                display: 'none',
                background: 'transparent',
                border: '1px solid var(--border2)',
                borderRadius: 8,
                padding: '6px 8px',
                cursor: 'pointer',
                color: 'var(--text2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          className="header-mobile-drawer"
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            zIndex: 199,
            background: '#fff',
            borderBottom: '1px solid var(--border2)',
            boxShadow: '0 8px 24px rgba(0,0,0,.10)',
            padding: '12px 0 16px',
          }}
        >
          {/* Horoscope section */}
          <div style={{ padding: '4px 0' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 20px 4px' }}>
              Horoscope
            </p>
            {[
              { label: 'Daily', href: '/horoscope/daily/aries' },
              { label: 'Weekly', href: '/horoscope/weekly/aries' },
              { label: 'Monthly', href: '/horoscope/monthly/aries' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  fontSize: 15,
                  color: pathname.startsWith(item.href.replace('/aries', '')) ? 'var(--blue)' : 'var(--text2)',
                  fontWeight: pathname.startsWith(item.href.replace('/aries', '')) ? 600 : 400,
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border2)', margin: '8px 20px' }} />

          <Link
            href="/panchang"
            style={{
              display: 'block',
              padding: '10px 20px',
              fontSize: 15,
              color: pathname.startsWith('/panchang') ? 'var(--blue)' : 'var(--text2)',
              fontWeight: pathname.startsWith('/panchang') ? 600 : 400,
              textDecoration: 'none',
            }}
          >
            Panchang
          </Link>

          <Link
            href="/festival"
            style={{
              display: 'block',
              padding: '10px 20px',
              fontSize: 15,
              color: pathname.startsWith('/festival') ? 'var(--blue)' : 'var(--text2)',
              fontWeight: pathname.startsWith('/festival') ? 600 : 400,
              textDecoration: 'none',
            }}
          >
            Festival
          </Link>

          <Link
            href="/book-consultancy"
            style={{
              display: 'block',
              padding: '10px 20px',
              fontSize: 15,
              color: pathname.startsWith('/book-consultancy') ? 'var(--blue)' : 'var(--text2)',
              fontWeight: pathname.startsWith('/book-consultancy') ? 600 : 400,
              textDecoration: 'none',
            }}
          >
            Book Consultancy
          </Link>
        </div>
      )}
    </>
  )
}
