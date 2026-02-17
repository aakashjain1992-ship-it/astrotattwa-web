import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { NavagrahaSection } from '@/components/landing/NavagrahaSection'
import { Yantra } from '@/components/landing/Yantra'
import { Particles } from '@/components/landing/Particles'
import { Glyphs } from '@/components/landing/Glyphs'
import BirthDataFormWrapper from '@/components/forms/BirthDataFormWrapper'

const HERO_BULLETS = [
  'Your Dashas — the planetary periods timing every chapter of your life',
  'All 9 planets across 12 houses, with nakshatras and padas',
  'Divisional charts, yogas, and the complete traditional system',
]

const HERO_STATS = [
  { icon: '⚡', num: 'Instant',     label: 'Chart in seconds' },
  { icon: '✦', num: 'Complete',    label: 'All 9 planets · 16 charts' },
  { icon: '◐', num: 'Traditional', label: 'Authentic Vedic system' },
]

export default function HomePage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1 }}>

        {/* ── HERO ── */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 500px',
            alignItems: 'start',
            padding: '96px 64px 80px 64px',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <Particles />
          <Glyphs />
          <Yantra />

          {/* Left: Copy */}
          <div style={{ padding: '20px 32px 24px 0', position: 'relative', zIndex: 2 }}>

            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              fontSize: '11px', fontWeight: 500, letterSpacing: '2.8px',
              textTransform: 'uppercase', color: 'var(--blue)',
              marginBottom: '18px',
              animation: 'up .6s ease .15s forwards',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: 'var(--blue)', flexShrink: 0,
              }} />
              Vedic Astrology
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              letterSpacing: '-1.2px', lineHeight: 1.04,
              marginBottom: '20px',
            }}>
              <span style={{
                display: 'block', fontStyle: 'italic', fontWeight: 400,
                fontSize: 'clamp(30px,3.8vw,52px)',
                color: 'var(--text3)',
                animation: 'up .75s ease .3s forwards',
              }}>
                the map
              </span>
              <span style={{
                display: 'block', fontWeight: 400,
                fontSize: 'clamp(52px,6.2vw,84px)',
                color: 'var(--text)', lineHeight: 1,
                animation: 'up .75s ease .45s forwards',
              }}>
                you were<br />
                <span style={{ color: 'var(--blue)' }}>born with</span>
              </span>
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: '15.5px', lineHeight: 1.72,
              color: 'var(--text2)', maxWidth: '420px',
              marginBottom: '28px',
              animation: 'up .65s ease .65s forwards',
            }}>
              Your birth chart is a precise record of the sky at the moment
              you arrived — the timing of life&apos;s chapters, the pattern of your
              relationships, the shape of your path.
            </p>

            {/* Feature bullets */}
            <ul style={{
              listStyle: 'none', display: 'flex', flexDirection: 'column',
              gap: '10px', marginBottom: '0',
              animation: 'up .65s ease .82s forwards',
            }}>
              {HERO_BULLETS.map(text => (
                <li key={text} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  fontSize: '14px', color: 'var(--text2)', lineHeight: 1.55,
                }}>
                  <span style={{
                    flexShrink: 0, marginTop: '7px',
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: 'var(--blue)',
                  }} />
                  {text}
                </li>
              ))}
            </ul>

            {/* Stats bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              marginTop: '24px',
              padding: '14px 20px',
              background: 'rgba(37,99,235,.04)',
              border: '1px solid rgba(37,99,235,.1)',
              borderRadius: '12px',
              animation: 'up .65s ease 1.05s forwards',
            }}>
              {HERO_STATS.map((s, i) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  {i > 0 && (
                    <div style={{
                      width: '1px', height: '36px',
                      background: 'rgba(37,99,235,.15)',
                      flexShrink: 0, margin: '0 4px',
                    }} />
                  )}
                  <div style={{
                    flex: 1, textAlign: 'center',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '4px',
                  }}>
                    <span style={{ fontSize: '16px', lineHeight: 1, color: 'var(--blue)', opacity: .7, marginBottom: '2px' }}>
                      {s.icon}
                    </span>
                    <span style={{ fontSize: '15px', lineHeight: 1.2, color: 'var(--text1)', fontWeight: 600, letterSpacing: '.1px' }}>
                      {s.num}
                    </span>
                    <span style={{ fontSize: '10.5px', letterSpacing: '.3px', color: 'rgba(15,23,42,.38)', marginTop: '2px' }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right: Form card */}
          <div style={{
            position: 'relative', zIndex: 2,
            padding: '20px 0 24px 16px',
            display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start',
          }}>
            <div style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '32px 32px 28px',
              width: '100%', maxWidth: '480px',
              boxShadow: 'var(--shadow-md)',
              animation: 'cardIn .85s cubic-bezier(.16,1,.3,1) .3s forwards',
            }}>
              <BirthDataFormWrapper />
            </div>
          </div>

        </section>

        {/* ── NAVAGRAHA ── */}
        <NavagrahaSection />

      </main>

      <Footer />

      <style>{`
        @keyframes yRotate { to { transform: rotate(360deg); } }
        @keyframes pTwinkle {
          0%, 100% { opacity: .04; }
          50% { opacity: .18; }
        }
        @keyframes gFloat {
          0%   { opacity: 0; transform: translateY(0) rotate(0deg); }
          15%  { opacity: .28; }
          85%  { opacity: .15; }
          100% { opacity: 0; transform: translateY(-70px) rotate(8deg); }
        }
        @keyframes up {
          from { opacity: 1; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 1; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1100px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding: 88px 40px 64px 40px !important;
          }
        }
      `}</style>
    </div>
  )
}
