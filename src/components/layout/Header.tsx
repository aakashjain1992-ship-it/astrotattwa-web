'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 200,
        height: '64px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        transition: 'box-shadow .25s',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,.06)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.08)',

      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          height: '100%',
          padding: '0 32px 0 64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Logo variant="header" />

        <Link
          href="/login"
          style={{
            fontSize: '13.5px',
            fontWeight: 500,
            color: 'var(--text2)',
            background: 'transparent',
            border: '1px solid var(--border2)',
            padding: '7px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'all .18s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--blue)'
            el.style.color = 'var(--blue)'
            el.style.background = 'var(--blue-light)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--border2)'
            el.style.color = 'var(--text2)'
            el.style.background = 'transparent'
          }}
        >
          Login
        </Link>
      </div>
    </header>
  )
}
