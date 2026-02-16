import type { Metadata } from 'next'
import { Suspense } from 'react'
import { VerifyEmailForm } from './VerifyEmailForm'

export const metadata: Metadata = {
  title: 'Verify Your Email — Astrotattwa',
  description: 'Check your email and click the verification link to activate your account.',
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  )
}
