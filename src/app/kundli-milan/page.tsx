import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import MilanClient from '@/components/kundliMilan/MilanClient'

export const metadata: Metadata = {
  title: 'Kundli Milan Online | Free Marriage Compatibility Calculator | Astrotattwa',
  description:
    'Check Kundli Milan online on Astrotattwa using the 36-point Ashtakoot Guna Milan system. Match birth charts by date, time and place of birth for marriage compatibility, dosha analysis and relationship insights.',
  alternates: { canonical: '/kundli-milan' },
  openGraph: {
    title: 'Kundli Milan Online | Free Marriage Compatibility Calculator | Astrotattwa',
    description:
      'Check Kundli Milan online on Astrotattwa using the 36-point Ashtakoot Guna Milan system. Match birth charts by date, time and place of birth for marriage compatibility, dosha analysis and relationship insights.',
    url: 'https://astrotattwa.com/kundli-milan',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Kundli Milan Online | Free Marriage Compatibility Calculator | Astrotattwa',
    description: 'Check Kundli Milan online on Astrotattwa using the 36-point Ashtakoot Guna Milan system. Match birth charts by date, time and place of birth for marriage compatibility, dosha analysis and relationship insights.',
  },
}

const KUTAS = [
  { name: 'Nadi', pts: 8, desc: 'Health, progeny, and physical compatibility.' },
  { name: 'Bhakoot', pts: 7, desc: 'Emotional and financial compatibility.' },
  { name: 'Gana', pts: 6, desc: 'Temperament and nature — Deva, Manushya, or Rakshasa.' },
  { name: 'Graha Maitri', pts: 5, desc: 'Mental compatibility through Moon sign lords.' },
  { name: 'Yoni', pts: 4, desc: 'Physical and intimate compatibility via birth nakshatra.' },
  { name: 'Tara', pts: 3, desc: 'Destiny compatibility based on nakshatra distance.' },
  { name: 'Vashya', pts: 2, desc: 'Dominance and control dynamic between partners.' },
  { name: 'Varna', pts: 1, desc: 'Spiritual compatibility via Moon sign varna.' },
]

const DEEPER_QUESTIONS = [
  {
    icon: '💍',
    title: 'When & how will your marriage be?',
    desc: 'Your 7th house, its lord, and current Dasha period paint a detailed picture of when marriage will happen and what the quality of married life will be — something no compatibility score can tell you.',
  },
  {
    icon: '👤',
    title: 'What will your partner be like?',
    desc: 'The 7th house cusp, its nakshatra, Venus and Mars placements all describe the physical appearance, nature, and background of your future spouse — years before you meet them.',
  },
  {
    icon: '💔',
    title: 'Divorce or separation — any risk?',
    desc: 'Afflictions to the 7th and 8th house, the role of Rahu or Saturn in your marriage house, and Mangal Dosha severity in your personal chart determine actual separation risk.',
  },
  {
    icon: '👶',
    title: 'Children — will there be any issues?',
    desc: 'Your 5th house, Jupiter\'s strength and position, and Putra Karaka all reveal whether there will be any challenges with conception, pregnancy, or raising children.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'In-laws & family harmony',
    desc: 'The 4th and 8th houses in your personal chart govern the relationship with the partner\'s family. Challenging placements here can signal friction that a compatibility score alone will not reveal.',
  },
  {
    icon: '💰',
    title: 'Finances after marriage',
    desc: 'Your 2nd house (accumulated wealth), 11th house (income), and Dhana yogas show whether marriage will bring financial growth or strain — independent of whether the match scores well.',
  },
  {
    icon: '🏥',
    title: 'Health concerns',
    desc: 'The 6th house (illness), 8th house (chronic conditions), and 12th house (hospitalisation) in your personal chart reveal health vulnerabilities that affect your life regardless of compatibility.',
  },
]

const FAQS = [
  {
    q: 'What is Kundli Milan?',
    a: 'Kundli Milan (also called Guna Milan or Ashtkoot Milan) is the traditional Vedic astrology method for assessing marriage compatibility. It compares two birth charts across 8 dimensions — called Kutas — and assigns a score out of 36. A score above 18 is generally considered acceptable for marriage.',
  },
  {
    q: 'How many points are needed for a good match?',
    a: 'Traditional guidelines: 0–17 is considered low and generally not recommended; 18–24 is acceptable; 25–32 is good; and 32+ is excellent. However, these thresholds are guidelines, not rigid rules. The presence or absence of the three major doshas — Nadi, Bhakoot, and Gana — matters as much as the total score.',
  },
  {
    q: 'What are the three major doshas in Kundli Milan?',
    a: 'The three most serious doshas are: Nadi Dosha (same Nadi channel — affects health and progeny, carrying the most weight at 8 points), Bhakoot Dosha (2-12 or 6-8 Moon sign relationship — affects finances and longevity, 7 points), and Gana Dosha (incompatible temperaments — affects daily harmony, 6 points). Couples with even one of these score 0 on that kuta.',
  },
  {
    q: 'Can a marriage work with a low Ashtkoot score?',
    a: 'Yes. Many couples with scores below 18 have long, happy marriages — and some high-scoring matches struggle. Kundli Milan is one input, not a verdict. Individual birth chart strength, planetary periods (Dasha), and the actual compatibility of values and communication matter far more in practice.',
  },
  {
    q: 'Is Nadi Dosha as serious as people say?',
    a: 'Nadi Dosha carries the most weight (8 points) and traditional texts consider it a significant concern, particularly for health and children. However, astrologers also recognise several conditions that cancel or reduce it — called Nadi Dosha Nivaran — such as both partners having the same nakshatra or Moon sign. Its real-world impact varies widely across couples.',
  },
  {
    q: 'What is the difference between Kundli Milan and Guna Milan?',
    a: 'They are the same system — just different names. Guna Milan refers to the matching of "gunas" (qualities) across the 8 Kutas. Kundli Milan is the broader term for matching two birth charts. Ashtkoot Milan is yet another name for the same 8-kuta framework. All three are used interchangeably in Vedic astrology.',
  },
  {
    q: 'Can Kundli Milan be done without birth time?',
    a: 'The 8-kuta Ashtkoot system primarily uses the Moon\'s nakshatra and sign, which requires the full birth chart and thus accurate birth time. Without birth time, the Moon\'s position can be estimated if it didn\'t change signs that day — but the result is less reliable. For the most accurate reading, use exact birth time.',
  },
  {
    q: 'Does a high score guarantee a happy marriage?',
    a: 'No. A high Ashtkoot score is a positive sign, but it assesses compatibility between two charts — not the quality of each individual\'s chart. Two people with afflicted 7th houses can still score 30+. Your personal Kundli — especially the 7th house, Navamsa chart, and current Dasha — is equally important for understanding your actual marriage destiny.',
  },
]

export default function KundliMilanPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Free Kundli Milan Calculator — Astrotattwa',
        url: 'https://astrotattwa.com/kundli-milan',
        description: 'Free marriage compatibility calculator using the traditional 36-point Ashtkoot system.',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        publisher: { '@type': 'Organization', name: 'Astrotattwa', url: 'https://astrotattwa.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://astrotattwa.com' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://astrotattwa.com/kundli' },
          { '@type': 'ListItem', position: 3, name: 'Kundli Milan', item: 'https://astrotattwa.com/kundli-milan' },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main style={{ paddingTop: 64 }}>

        {/* ── Hero ── */}
        <section style={{ padding: '64px 24px 52px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>

            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 18 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
              Vedic Astrology
            </div>

            {/* H1 */}
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.5px', marginBottom: 16, color: 'var(--text)' }}>
              Kundli Milan{' '}
              <span style={{ display: 'block', fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--blue)' }}>
                Marriage Compatibility
              </span>
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 32px' }}>
              Enter birth details for both persons below. We match across all 8 Kutas using the traditional <strong>36-point Ashtkoot system</strong> — results are instant.
            </p>

            {/* Kuta chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {KUTAS.map(k => (
                <span key={k.name} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 12px', borderRadius: 99,
                  background: 'hsl(var(--muted)/0.6)',
                  border: '1px solid var(--border)',
                  fontSize: 12.5, color: 'var(--text2)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)' }}>{k.pts}pt</span>
                  {k.name}
                </span>
              ))}
            </div>

          </div>
        </section>

        {/* ── Form + Results (client) ── */}
        <MilanClient />

        {/* ── What is Ashtkoot ── */}
        <section style={{ padding: '56px 24px', borderTop: '1px solid var(--border)', background: 'hsl(var(--muted)/0.4)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
              The 8 Kutas — how matching works
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28, maxWidth: 700 }}>
              Ashtkoot Milan evaluates 8 areas of compatibility, each carrying a different weight. A score of 18 or above (out of 36) is traditionally considered acceptable for marriage.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {KUTAS.map(k => (
                <div key={k.name} style={{ padding: '16px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'hsl(var(--card))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'var(--blue-light, #eff6ff)', color: 'var(--blue)' }}>
                      {k.pts} pts
                    </span>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{k.name}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0, lineHeight: 1.5 }}>{k.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kundli Milan is not enough ── */}
        <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ maxWidth: 680, marginBottom: 40 }}>
              <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 10 }}>
                Beyond compatibility
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 14, color: 'var(--text)' }}>
                Kundli Milan tells you if you match.{' '}
                <span style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', color: 'var(--blue)' }}>
                  Your individual Kundli tells you everything else.
                </span>
              </h2>
              <p style={{ fontSize: 15.5, color: 'var(--text2)', lineHeight: 1.7 }}>
                Compatibility scoring compares two charts against each other — but it says nothing about your personal marriage destiny. These questions can only be answered by your own birth chart.
              </p>
            </div>

            {/* Question cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16, marginBottom: 36 }}>
              {DEEPER_QUESTIONS.map(q => (
                <div
                  key={q.title}
                  style={{
                    padding: '20px 22px',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    background: 'hsl(var(--card))',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>{q.icon}</div>
                  <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8, lineHeight: 1.35 }}>
                    {q.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0, lineHeight: 1.6 }}>
                    {q.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <a
                href="/kundli"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '12px 24px', background: 'var(--blue)', color: '#fff',
                  borderRadius: 10, fontSize: 14.5, fontWeight: 600, textDecoration: 'none',
                }}
              >
                Generate your free Kundli →
              </a>
              <a
                href="/book-consultancy"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '12px 24px',
                  background: 'hsl(var(--background))',
                  color: 'var(--text)',
                  border: '1px solid var(--border2)',
                  borderRadius: 10, fontSize: 14.5, fontWeight: 600, textDecoration: 'none',
                }}
              >
                Talk to an astrologer
              </a>
            </div>
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
