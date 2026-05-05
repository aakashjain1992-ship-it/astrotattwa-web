import type { Metadata } from 'next'
import { Suspense } from 'react'
import MuhurtaClient from './MuhurtaClient'

export const metadata: Metadata = {
  title: 'Marriage Muhurta | Auspicious Wedding Dates | Astrotattwa',
  description:
    'Find the most auspicious dates for your wedding using Vedic astrology. Full-level analysis: tithi, nakshatra, vara, lagna, Jupiter/Venus conditions, and personal compatibility.',
  alternates: { canonical: '/muhurta/marriage' },
  openGraph: {
    title: 'Marriage Muhurta | Astrotattwa',
    description:
      'Find the most auspicious dates for your wedding using Vedic astrology. Full-level analysis: tithi, nakshatra, vara, lagna, Jupiter/Venus conditions, and personal compatibility.',
    url: 'https://astrotattwa.com/muhurta/marriage',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Marriage Muhurta | Auspicious Wedding Dates | Astrotattwa',
    description:
      'Find the most auspicious dates for your wedding using Vedic astrology. Tithi, nakshatra, vara, lagna windows and personal compatibility.',
  },
}

export default function Page() {
  return (
    <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <Suspense fallback={<div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text3)' }}>Loading…</div>}>
        <MuhurtaClient />
      </Suspense>
    </main>
  )
}
