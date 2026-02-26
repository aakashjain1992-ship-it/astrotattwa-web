'use client'

import Link from 'next/link'

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={className}
      style={{
        borderTop: '1px solid rgba(0,0,0,0.08)',
        padding: '24px 0',
      }}
    >
      <div className="footer-inner"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
          © {new Date().getFullYear()} Astrotattwa. All rights reserved.
        </p>

        <div style={{ display: 'flex', gap: '22px' }}>
          <Link
            href="https://astrotattwa.com/privacy"
            style={{
              fontSize: '13px',
              color: 'var(--text3)',
              textDecoration: 'none',
              transition: 'color .18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
          >
            Privacy Policy
          </Link>
          <Link
            href="https://astrotattwa.com/terms"
            style={{
              fontSize: '13px',
              color: 'var(--text3)',
              textDecoration: 'none',
              transition: 'color .18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
          >
            Terms of Service
          </Link>
        </div>
      </div>

     <style>{`
        @media (max-width: 600px) {
          .footer-inner { padding: 0 20px !important; }
        }
      `}</style>

    </footer>
  )
}

