'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/chart'
  const resetSuccess = searchParams.get('reset') === 'success'
  const oauthError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const supabase = createClient()

  const validateEmail = (val: string): string | null => {
    if (!val) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address'
    return null
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }
    router.push(returnUrl)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo + App Name */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo />
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your charts</p>
        </div>

        {resetSuccess && (
          <div className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400 text-center">
            Password updated successfully. Sign in with your new password.
          </div>
        )}
        {oauthError && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
            {oauthError}
          </div>
        )}

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <Button variant="outline" className="w-full gap-3 h-11" onClick={handleGoogleLogin} disabled={googleLoading || loading}>
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError('') }} onBlur={(e) => setEmailError(validateEmail(e.target.value) || '')} disabled={loading} autoComplete="email" className="h-11" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••••" value={password} onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError('') }} disabled={loading} autoComplete="current-password" className="h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full h-11" disabled={loading || googleLoading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">Create account</Link>
        </p>
        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
