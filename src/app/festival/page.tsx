'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FestivalCalendarPage } from '@/components/festival/FestivalCalendarPage'

export default function FestivalPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, paddingTop: '64px' }}>
        <FestivalCalendarPage />
      </main>
      <Footer />
    </div>
  )
}
