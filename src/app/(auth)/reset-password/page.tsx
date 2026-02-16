import type { Metadata } from 'next'
import { ResetPasswordForm } from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set New Password — Astrotattwa',
  description: 'Choose a new password for your Astrotattwa account.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
