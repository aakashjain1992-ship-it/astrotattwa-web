'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { LogOut, Settings, User, ChevronDown, Menu, X, Sun, Calendar, BookOpen, Star, Hash } from 'lucide-react'
import type { AuthUser } from '@/hooks/useAuth'
import { performLogout } from '@/lib/auth/logout'
import { useToast } from '@/hooks/use-toast'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'


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

// ─── Numerology Nav Dropdown ──────────────────────────────────────────────────

function NumerologyDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = pathname.startsWith('/numerology')

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
    { label: 'Reading', href: '/numerology' },
    { label: 'Compatibility', href: '/numerology/compatibility' },
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
        Numerology
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
                color: pathname === item.href || (item.href === '/numerology' && pathname === '/numerology')
                  ? 'var(--blue)'
                  : pathname.startsWith(item.href) && item.href !== '/numerology'
                  ? 'var(--blue)'
                  : 'var(--text2)',
                fontWeight: (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/numerology')) ? 600 : 400,
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
  // userId is read from user.id inside
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
            <div style={{ height: 1, background: 'var(--border2)', margin: '2px 0' }} />
            <ThemeSwitcher variant="menu" userId={user.id} />
            <div style={{ height: 1, background: 'var(--border2)', margin: '2px 0' }} />
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

// ─── Mobile Drawer ───────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  pathname,
  user,
  onSignOut,
  onMyChartClick,
}: {
  open: boolean
  onClose: () => void
  pathname: string
  user: AuthUser | null
  onSignOut: () => void
  onMyChartClick: () => void
}) {
  const [horoscopeOpen, setHoroscopeOpen] = useState(false)
  const [numerologyOpen, setNumerologyOpen] = useState(false)

  useEffect(() => {
    if (!open) { setHoroscopeOpen(false); setNumerologyOpen(false) }
  }, [open])

  if (!open) return null

  // Shared styles
  const mainRow = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 14,
    width: '100%', padding: '13px 24px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 16, fontWeight: 500, textAlign: 'left' as const,
    color: active ? 'var(--blue)' : 'var(--text)',
    textDecoration: 'none',
    borderRadius: 0,
  })

  const iconColor = (active: boolean) => active ? 'var(--blue)' : 'var(--text3)'

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, top: 64, background: 'rgba(0,0,0,0.45)', zIndex: 198 }} />

      {/* Slide panel */}
      <div
        className="header-mobile-drawer"
        style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
          zIndex: 199,
          background: 'hsl(var(--background))',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* ── Nav ── */}
        <nav style={{ flex: 1, paddingTop: 8 }}>

          {/* Horoscope accordion */}
          <button onClick={() => setHoroscopeOpen(o => !o)} style={mainRow(pathname.startsWith('/horoscope'))}>
            <Sun size={19} style={{ color: iconColor(pathname.startsWith('/horoscope')), flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Horoscope</span>
            <ChevronDown size={15} style={{ color: 'var(--text3)', flexShrink: 0, transform: horoscopeOpen ? 'rotate(180deg)' : 'none', transition: 'transform .22s' }} />
          </button>
          {horoscopeOpen && (
            <div style={{ paddingBottom: 4 }}>
              {[
                { label: 'Daily',   href: '/horoscope/daily/aries' },
                { label: 'Weekly',  href: '/horoscope/weekly/aries' },
                { label: 'Monthly', href: '/horoscope/monthly/aries' },
              ].map(item => {
                const active = pathname.startsWith(item.href.replace('/aries', ''))
                return (
                  <Link key={item.href} href={item.href} onClick={onClose} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 24px 10px 57px',
                    fontSize: 14.5, fontWeight: active ? 500 : 400,
                    color: active ? 'var(--blue)' : 'var(--text2)',
                    textDecoration: 'none',
                  }}>
                    {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginLeft: -13 }} />}
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 24px' }} />

          {/* Panchang */}
          <Link href="/panchang" onClick={onClose} style={mainRow(pathname.startsWith('/panchang'))}>
            <Calendar size={19} style={{ color: iconColor(pathname.startsWith('/panchang')), flexShrink: 0 }} />
            Panchang
          </Link>

          {/* Festival */}
          <Link href="/festival" onClick={onClose} style={mainRow(pathname.startsWith('/festival'))}>
            <Star size={19} style={{ color: iconColor(pathname.startsWith('/festival')), flexShrink: 0 }} />
            Festival
          </Link>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 24px' }} />

          {/* Numerology accordion */}
          <button onClick={() => setNumerologyOpen(o => !o)} style={mainRow(pathname.startsWith('/numerology'))}>
            <Hash size={19} style={{ color: iconColor(pathname.startsWith('/numerology')), flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Numerology</span>
            <ChevronDown size={15} style={{ color: 'var(--text3)', flexShrink: 0, transform: numerologyOpen ? 'rotate(180deg)' : 'none', transition: 'transform .22s' }} />
          </button>
          {numerologyOpen && (
            <div style={{ paddingBottom: 4 }}>
              {[
                { label: 'Reading',       href: '/numerology' },
                { label: 'Compatibility', href: '/numerology/compatibility' },
              ].map(item => {
                const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/numerology')
                return (
                  <Link key={item.href} href={item.href} onClick={onClose} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 24px 10px 57px',
                    fontSize: 14.5, fontWeight: active ? 500 : 400,
                    color: active ? 'var(--blue)' : 'var(--text2)',
                    textDecoration: 'none',
                  }}>
                    {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginLeft: -13 }} />}
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 24px' }} />

          {/* Book Consultancy */}
          <Link href="/book-consultancy" onClick={onClose} style={mainRow(pathname.startsWith('/book-consultancy'))}>
            <BookOpen size={19} style={{ color: iconColor(pathname.startsWith('/book-consultancy')), flexShrink: 0 }} />
            Book Consultancy
          </Link>

        </nav>

        {/* ── Bottom section ── */}
        <div style={{ padding: '20px 24px 44px', borderTop: '1px solid var(--border)' }}>

          <ThemeSwitcher variant="menu" userId={user?.id ?? null} />

          {/* Guest buttons */}
          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
              <Link href="/login" onClick={onClose} style={{
                display: 'block', padding: '13px', borderRadius: 12,
                fontSize: 15, fontWeight: 500, color: 'var(--text)',
                textDecoration: 'none', textAlign: 'center',
                border: '1px solid var(--border2)',
              }}>
                Sign in
              </Link>
              <Link href="/signup" onClick={onClose} style={{
                display: 'block', padding: '13px', borderRadius: 12,
                fontSize: 15, fontWeight: 600, color: '#fff',
                background: 'var(--blue)', textDecoration: 'none', textAlign: 'center',
              }}>
                Get started
              </Link>
            </div>
          )}

          {/* Logged-in user */}
          {user && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 0 14px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                <Avatar user={user} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.fullName ?? 'My Account'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <button onClick={() => { onClose(); onMyChartClick() }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14.5, color: 'var(--text2)' }}>
                <User size={15} style={{ color: 'var(--text3)' }} /> My Chart
              </button>
              <Link href="/settings" onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', fontSize: 14.5, color: 'var(--text2)', textDecoration: 'none' }}>
                <Settings size={15} style={{ color: 'var(--text3)' }} /> Account Settings
              </Link>
              <button onClick={() => { onClose(); onSignOut() }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14.5, color: '#DC2626', marginTop: 4 }}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </>
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
  const { setTheme } = useTheme()

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
        // Sync theme preference from DB on initial load
        fetch('/api/user/theme', { credentials: 'include' })
          .then(r => r.json())
          .then(d => { if (d.theme) setTheme(d.theme) })
          .catch(() => { /* best-effort */ })
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
        // Sync theme from DB on explicit sign-in
        if (_event === 'SIGNED_IN') {
          fetch('/api/user/theme', { credentials: 'include' })
            .then(r => r.json())
            .then(d => { if (d.theme) setTheme(d.theme) })
            .catch(() => { /* best-effort */ })
        }
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
              <NumerologyDropdown pathname={pathname} />
              <NavLink href="/book-consultancy" label="Book Consultancy" pathname={pathname} />
            </nav>
            {/* Desktop-only auth (hidden on mobile — lives in the drawer instead) */}
            {!authLoading && (
              <div className="header-auth-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {user ? (
                  <UserDropdown user={user} onSignOut={handleSignOut} onMyChartClick={handleMyChartClick} />
                ) : (
                  <>
                    <ThemeSwitcher variant="icon" />
                    <Link
                      href="/login"
                      style={{
                        fontSize: '13.5px', fontWeight: 500, color: '#fff',
                        background: 'var(--blue)', border: '1px solid var(--blue)',
                        padding: '7px 18px', borderRadius: 8, textDecoration: 'none', transition: 'all .18s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--blue-dark)'; e.currentTarget.style.borderColor = 'var(--blue-dark)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.borderColor = 'var(--blue)' }}
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
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

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
        user={user}
        onSignOut={handleSignOut}
        onMyChartClick={handleMyChartClick}
      />
    </>
  )
}
