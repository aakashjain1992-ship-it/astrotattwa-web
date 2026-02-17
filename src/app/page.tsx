import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { NavagrahaSection } from '@/components/landing/NavagrahaSection'
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
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="container py-16 md:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_460px] lg:gap-16 items-start">

            {/* Left: Hero Text */}
            <div className="flex flex-col justify-center">

              {/* Eyebrow */}
              <div className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-medium tracking-[2.8px] uppercase text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Vedic Astrology
              </div>

              {/* Headline */}
              <h1 className="font-serif mb-5 tracking-tight leading-[1.04]">
                <span className="block italic font-normal text-muted-foreground"
                  style={{ fontSize: 'clamp(28px, 3.6vw, 48px)' }}>
                  the map
                </span>
                <span className="block font-normal leading-none"
                  style={{ fontSize: 'clamp(50px, 6vw, 80px)' }}>
                  you were<br />
                  <span className="text-primary">born with</span>
                </span>
              </h1>

              {/* Sub */}
              <p className="mb-7 max-w-[420px] text-[15.5px] leading-relaxed text-muted-foreground">
                Your birth chart is a precise record of the sky at the moment
                you arrived — the timing of life&apos;s chapters, the pattern of your
                relationships, the shape of your path.
              </p>

              {/* Feature bullets */}
              <ul className="mb-8 space-y-2.5">
                {HERO_BULLETS.map(text => (
                  <li key={text} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                        <path d="M1 4l3 3 5-6" stroke="hsl(var(--primary))" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              {/* Stats row */}
              <div className="flex items-center gap-0 border-t border-border pt-6">
                {HERO_STATS.map((s, i) => (
                  <div key={s.num} className="flex items-center">
                    {i > 0 && <div className="mx-4 h-8 w-px bg-border" />}
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{s.icon}</span>
                      <div>
                        <div className="font-serif text-[15px] font-normal leading-tight text-foreground">
                          {s.num}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{s.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-md lg:sticky lg:top-20 lg:p-8">
              <div className="font-serif text-[22px] font-normal text-foreground mb-1">
                Check your Kundli
              </div>
              <p className="text-[13px] text-muted-foreground mb-6">
                Enter your birth details to see your chart
              </p>
              <BirthDataFormWrapper />
            </div>

          </div>
        </section>

        {/* ── NAVAGRAHA ── */}
        <NavagrahaSection />

      </main>

      <Footer />
    </div>
  )
}

