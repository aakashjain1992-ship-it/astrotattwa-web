'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { LogOut, Settings, User, ChevronDown } from 'lucide-react'
import type { AuthUser } from '@/hooks/useAuth'
import { performLogout } from '@/lib/auth/logout'


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
}: {
  user: AuthUser
  onSignOut: () => void
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
              href="/chart"
              icon={<User size={14} />}
              label="My Chart"
              onClick={() => setOpen(false)}
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
  href: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 14px',
        fontSize: 13,
        color: 'var(--text2)',
        textDecoration: 'none',
        transition: 'background .12s',
      }}
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

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Auth state
  useEffect(() => {
    fetch('/api/auth/me')
    .then(r => {
    if (r.status === 401) return { user: null }
    return r.json()
  })
    .then(({user}) => {
      setUser(user)
      setAuthLoading(false)
    })
    .catch(() => setAuthLoading(false))

    // Multi-tab logout sync

   const handleStorage = (e: StorageEvent) => {
    if (e.key === 'astrotattwa:logout') {
      window.location.href = '/login'
    }
  }
  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}, [])


  const handleSignOut = async () => {
    await performLogout()
    router.push('/login')
    router.refresh()
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
                <UserDropdown user={user} onSignOut={handleSignOut} />
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
