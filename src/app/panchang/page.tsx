import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import PanchangClient from './PanchangClient'

export const metadata: Metadata = {
  title: 'Panchang — Vedic Daily Calendar | Astrotattwa',
  description:
    'Free daily Vedic Panchang — Tithi, Nakshatra, Yoga, Karana, Vara, sunrise/sunset, muhurtas, and more. Accurate Lahiri ayanamsha calculations for any location.',
}

export default function PanchangPage() {
  return (
    <>
      <Header />
      <main>
        <PanchangClient />
      </main>
      <Footer />
    </>
  )
}
