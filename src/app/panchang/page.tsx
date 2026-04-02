import type { Metadata } from 'next'
import PanchangClient from './PanchangClient'

export const metadata: Metadata = {
  title: 'Panchang — Vedic Daily Calendar | Astrotattwa',
  description:
    'Free daily Vedic Panchang — Tithi, Nakshatra, Yoga, Karana, Vara, sunrise/sunset, muhurtas, and more. Accurate Lahiri ayanamsha calculations for any location.',
}

export default function PanchangPage() {
  return (
    <main>
      <PanchangClient />
    </main>
  )
}
