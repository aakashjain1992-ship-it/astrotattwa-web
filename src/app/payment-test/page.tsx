import { Metadata } from 'next'
import { Suspense } from 'react'
import PaymentTestClient from './PaymentTestClient'

export const metadata: Metadata = {
  title: 'Payment Test | Astrotattwa',
  robots: { index: false, follow: false },
}

export default function PaymentTestPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: 64, textAlign: 'center', padding: '80px 16px' }}>Loading…</div>}>
      <PaymentTestClient />
    </Suspense>
  )
}
