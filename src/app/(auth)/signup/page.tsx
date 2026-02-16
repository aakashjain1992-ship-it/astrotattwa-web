import type { Metadata } from 'next'
import { SignupForm } from './SignupForm'

export const metadata: Metadata = {
  title: 'Create Account — Astrotattwa',
  description: 'Create your free Astrotattwa account to save and explore your Vedic birth chart.',
}

export default function SignupPage() {
  return <SignupForm />
}
