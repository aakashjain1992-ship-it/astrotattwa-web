'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stars, CheckCircle, Loader2 } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const supabase = createClient()

  const validateEmail = (val: string): string | null => {
    if (!val) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    const emailErr = validateEmail(email)
    if (emailErr) { setEmailError(emailErr); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Stars className="h-7 w-7 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">Astrotattwa</span>
            </Link>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground">If an account exists for</p>
              <p className="text-sm font-medium">{email}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              you will receive a password reset link shortly. The link expires in 1 hour.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder or make sure you used the correct email.
            </p>
          </div>
          <div className="text-center">
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo + App Name */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <Stars className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Astrotattwa</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError('') }} onBlur={(e) => setEmailError(validateEmail(e.target.value) || '')} disabled={loading} autoComplete="email" autoFocus className="h-11" />
              {emailError && <p className="text-xs text-destructive">{emailError}</p>}
            </div>
            {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending reset link...</> : 'Send reset link'}
            </Button>
          </form>
        </div>

        <div className="text-center">
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
