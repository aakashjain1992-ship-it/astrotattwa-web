import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import BirthDataFormWrapper from '@/components/forms/BirthDataFormWrapper'

export const metadata: Metadata = {
  title: 'Free Kundli Online — Janam Kundali Calculator | Astrotattwa',
  description:
    'Generate your free Kundli (Janam Kundali) online instantly. Accurate Vedic astrology with 9 planets, 12 houses, nakshatras, yogas, Vimshottari Dasha and 16 divisional charts. No sign-up required.',
  alternates: { canonical: '/kundli' },
  openGraph: {
    title: 'Free Kundli Online — Janam Kundali Calculator | Astrotattwa',
    description:
      'Generate your free Kundli (Janam Kundali) online instantly. Accurate Vedic astrology with 9 planets, 12 houses, nakshatras, yogas, Vimshottari Dasha and 16 divisional charts.',
    url: 'https://astrotattwa.com/kundli',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Free Kundli Online — Janam Kundali Calculator',
    description:
      'Generate your free Kundli instantly. Accurate Vedic astrology calculations using Swiss Ephemeris.',
  },
}

const FEATURES = [
  {
    title: 'Planetary Positions',
    desc: 'Exact degrees of all 9 planets in their signs and houses, with nakshatra, pada, and KP sub-lord details.',
  },
  {
    title: 'Lagna & House Charts',
    desc: 'Whole Sign house system (classical Parashari), with Lagna, Moon chart and Navamsa D9 displayed visually.',
  },
  {
    title: 'Yogas & Doshas',
    desc: '26 yogas and 5 doshas detected — Raj Yoga, Gaja-Kesari, Pancha Mahapurusha, Mangal Dosha and more.',
  },
  {
    title: 'Vimshottari Dasha',
    desc: '4-level Dasha timeline: Mahadasha, Antardasha, Pratyantar and Sookshma — from birth to 120 years.',
  },
  {
    title: 'Divisional Charts',
    desc: '16 divisional charts (Vargas) from D1 to D60 for career, marriage, children and spirituality readings.',
  },
  {
    title: 'Shadbala Strength',
    desc: 'Planetary strength analysis using the classical Shadbala and Ashtakavarga systems for accurate predictions.',
  },
]

const FAQS = [
  {
    q: 'What is a Kundli?',
    a: 'A Kundli (also known as Janam Kundali, Janam Patrika, or Vedic birth chart) is a celestial snapshot of the sky at the exact time, date, and place of your birth. It maps the 9 planets (Navagraha) across 12 houses and 12 zodiac signs, forming the foundation of Vedic astrology readings.',
  },
  {
    q: 'Is this Kundli calculator free?',
    a: 'Yes, completely free. You can generate your full Kundli instantly — including planetary positions, nakshatra details, Vimshottari Dasha timeline, yogas, and 16 divisional charts — with no account required.',
  },
  {
    q: 'How accurate are the calculations?',
    a: 'We use the Swiss Ephemeris — the same engine used by professional astrologers worldwide — with Lahiri ayanamsa and the Whole Sign house system as prescribed by classical Parashari Vedic astrology.',
  },
  {
    q: 'What information do I need to generate my Kundli?',
    a: 'You need your date of birth, exact time of birth (as precise as possible), and place of birth. Birth time matters most — even a few minutes can shift your Lagna (ascendant) and change house placements significantly.',
  },
  {
    q: 'What is the difference between Kundli and horoscope?',
    a: 'A Kundli is your unique birth chart, calculated from your exact birth data. A horoscope is a generalised prediction for a sun sign or moon sign group. Your Kundli gives far more precise and personalised insights than any generic horoscope.',
  },
  {
    q: 'Can I save my Kundli?',
    a: 'Yes. After generating your Kundli, you can create a free account to save multiple charts, set a default "My Chart", and access your reading anytime without re-entering birth details.',
  },
]

export default function KundliPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Free Kundli Calculator — Astrotattwa',
        url: 'https://astrotattwa.com/kundli',
        description:
          'Free online Kundli (Vedic birth chart) calculator using Swiss Ephemeris with Lahiri ayanamsa.',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        publisher: {
          '@type': 'Organization',
          name: 'Astrotattwa',
          url: 'https://astrotattwa.com',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://astrotattwa.com' },
          { '@type': 'ListItem', position: 2, name: 'Kundli', item: 'https://astrotattwa.com/kundli' },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main style={{ paddingTop: 64 }}>

        {/* ── Hero + Form ── */}
        <section style={{ padding: '56px 24px 48px', textAlign: 'center' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 14 }}>
              Vedic Astrology
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16, color: 'var(--text)' }}>
              Free Kundli Online{' '}
              <span style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', color: 'var(--blue)' }}>
                Janam Kundali Calculator
              </span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.65, maxWidth: 580, margin: '0 auto 40px' }}>
              Generate your complete Vedic birth chart instantly — 9 planets, 12 houses, nakshatras,
              yogas, Vimshottari Dasha and 16 divisional charts. Free, no sign-up required.
            </p>
            <BirthDataFormWrapper />
          </div>
        </section>

        {/* ── What you get ── */}
        <section style={{ padding: '56px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: 'var(--text)' }}>
              What your Kundli includes
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: 36, fontSize: 15 }}>
              A complete Vedic birth chart analysis — not just sun signs.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {FEATURES.map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: '20px 22px',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    background: 'hsl(var(--card))',
                  }}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 7, color: 'var(--text)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--text2)', margin: 0, lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What is Kundli ── */}
        <section style={{ padding: '56px 24px', borderTop: '1px solid var(--border)', background: 'hsl(var(--muted)/0.4)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 18, color: 'var(--text)' }}>
              What is a Kundli?
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 16 }}>
              A <strong>Kundli</strong> (also spelled Kundali or Janam Patrika) is a celestial map drawn
              at the exact moment and place of your birth. In Vedic astrology, it is the primary tool for
              understanding a person&apos;s character, life path, strengths, challenges, and karmic tendencies.
            </p>
            <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 16 }}>
              The Kundli divides the sky into 12 houses (Bhavas), each governing a specific area of life —
              from personality and finances to relationships, career, and spirituality. The 9 planets
              (Navagraha) are placed in these houses based on their positions at birth, and their interactions
              create the unique blueprint of your life.
            </p>
            <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.75 }}>
              Unlike Western astrology, Vedic astrology uses the sidereal zodiac — corrected for the
              precession of the equinoxes via the Lahiri ayanamsa — placing greater emphasis on your Moon
              sign and Ascendant (Lagna) rather than the Sun sign.
            </p>
          </div>
        </section>

        {/* ── Kundli Milan cross-link ── */}
        <section style={{ padding: '56px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
              Check Kundli compatibility
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 28 }}>
              Match two birth charts using the traditional 36-point Ashtkoot system — the most widely used
              method for marriage compatibility in Vedic astrology.
            </p>
            <Link
              href="/kundli-milan"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 26px',
                background: 'var(--blue)',
                color: '#fff',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Try Kundli Milan →
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: '56px 24px 72px', borderTop: '1px solid var(--border)', background: 'hsl(var(--muted)/0.4)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 36, color: 'var(--text)' }}>
              Frequently asked questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FAQS.map((f, i) => (
                <div
                  key={f.q}
                  style={{
                    padding: '22px 0',
                    borderBottom: i < FAQS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                    {f.q}
                  </h3>
                  <p style={{ fontSize: 14.5, color: 'var(--text2)', margin: 0, lineHeight: 1.7 }}>
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
