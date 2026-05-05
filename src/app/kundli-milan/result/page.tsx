import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import MilanResultClient from '@/components/kundliMilan/MilanResultClient'

export const metadata: Metadata = {
  title: 'Kundli Milan Result | Marriage Compatibility Score | Astrotattwa',
  description: 'View your Kundli Milan compatibility result — 36-point Ashtkoot score, 8 kuta breakdown, dosha analysis and personalised interpretation.',
  robots: { index: false },
}

export default function MilanResultPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 64 }}>
        <Suspense fallback={<div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text3)' }}>Loading…</div>}>
          <MilanResultClient />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
