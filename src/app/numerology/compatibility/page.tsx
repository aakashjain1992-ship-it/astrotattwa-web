import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CompatibilityClient } from './CompatibilityClient'

export const metadata: Metadata = {
  title: 'Partner Compatibility — Lo Shu Numerology | Astrotattwa',
  description: 'Compare Lo Shu Grids for two people to reveal numerological compatibility — life path harmony, shared strengths, complementary energies, and growth areas.',
}

export default function CompatibilityPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, paddingTop: '64px' }}>
        <CompatibilityClient />
      </main>
      <Footer />
    </div>
  )
}
