import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import ConsultClient from './ConsultClient'

export const metadata: Metadata = {
  title: 'Book a Consultation | Astrotattwa',
  description:
    'Get clarity on career, relationships, money, and more. Ask your questions and receive a personalized, expert Vedic astrology answer based on your birth chart — delivered within 48 hours.',
}

export default function BookConsultancyPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <ConsultClient />
      </main>
      <Footer />
    </div>
  )
}
