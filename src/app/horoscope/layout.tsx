import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Astrotattwa',
    default: 'Horoscope — Vedic Astrology | Astrotattwa',
  },
  description: 'Free daily, weekly and monthly Vedic horoscopes for all 12 rashis. Moon sign and Sun sign predictions based on planetary transits.',
}

export default function HoroscopeLayout({ children }: { children: React.ReactNode }) {
  return children
}
