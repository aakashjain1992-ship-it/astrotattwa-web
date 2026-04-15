import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { NumerologyClient } from './NumerologyClient'

export const metadata: Metadata = {
  title: 'Free Numerology Reading — Lo Shu Grid Calculator | Astrotattwa',
  description:
    'Get your personalized Lo Shu Grid numerology reading. Discover your Life Path number, Destiny number, Raj Yogas, karmic lessons, and Chaldean name number based on your date of birth.',
  keywords: [
    'lo shu grid numerology',
    'numerology calculator',
    'life path number',
    'destiny number',
    'raj yoga numerology',
    'chaldean numerology',
    'karmic lessons numerology',
    'lo shu grid calculator india',
    'vedic numerology',
  ],
  openGraph: {
    title: 'Lo Shu Grid Numerology Reading | Astrotattwa',
    description: 'Discover your life blueprint through the Lo Shu Grid — planes, arrows, Raj Yogas, and karmic lessons from your date of birth.',
    url: 'https://astrotattwa.com/numerology',
    type: 'website',
  },
}

export default function NumerologyPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, paddingTop: '64px' }}>
        <NumerologyClient />
      </main>
      <Footer />
    </div>
  )
}
