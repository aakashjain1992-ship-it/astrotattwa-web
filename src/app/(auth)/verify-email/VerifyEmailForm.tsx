'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setError('')
    setResent(false)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message) } else { setResent(true) }
    setResending(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo + App Name */}
        <div className="flex flex-col items-center gap-1">
          <Logo />
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground">We sent a verification link to</p>
            {email && <p className="text-sm font-medium">{email}</p>}
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to verify your account and start exploring your chart. The link expires in 24 hours.
          </p>
          {resent && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />Email sent! Check your inbox.
            </div>
          )}
          {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          <div className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground">Didn&apos;t receive it? Check your spam folder or</p>
            <Button variant="outline" className="w-full" onClick={handleResend} disabled={resending || !email}>
              {resending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Resend verification email'}
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Wrong email?{' '}
            <Link href="/signup" className="text-primary hover:underline">Sign up again</Link>
          </p>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">← Back to sign in</Link>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          {' · '}
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
        </p>
      </div>
    </div>
  )
}
