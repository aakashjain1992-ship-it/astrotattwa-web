'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [sessionMissing, setSessionMissing] = useState(false)

  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  useEffect(() => {
    let cancelled = false

    const checkSession = async () => {
      try {
        const { data, error: sessionErr } = await supabase.auth.getSession()

        if (cancelled) return

        if (sessionErr) {
          setSessionMissing(true)
          setError('This reset link is invalid or expired. Please request a new one.')
        } else if (!data.session) {
          setSessionMissing(true)
          setError('This reset link is invalid or expired. Please request a new one.')
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    checkSession()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 10) return 'Password must be at least 10 characters'
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain at least one special character'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If the reset link is invalid/expired, do not attempt update
    if (sessionMissing) return

    // Clear field-level errors
    setPasswordError('')
    setConfirmError('')

    if (!password) {
      setPasswordError('Password is required')
      return
    }

    const pwdErr = validatePassword(password)
    if (pwdErr) {
      setPasswordError(pwdErr)
      return
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password')
      return
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password })
      if (updateErr) {
        setError(updateErr.message)
        return
      }

      // Optional but good hygiene: sign out after password change
      await supabase.auth.signOut()

      router.push('/login?reset=success')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (passwordError) setPasswordError('')
    if (error) setError('')
  }

  const handleConfirmChange = (value: string) => {
    setConfirmPassword(value)
    if (confirmError) setConfirmError('')
    if (error) setError('')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo + App Name */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo />
          <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="text-sm text-muted-foreground">Choose a strong password for your account</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  disabled={loading || sessionMissing}
                  autoFocus
                  autoComplete="new-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              <p className="text-xs text-muted-foreground">
                Min. 10 characters with uppercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => handleConfirmChange(e.target.value)}
                disabled={loading || sessionMissing}
                autoComplete="new-password"
                className="h-11"
              />
              {confirmError && <p className="text-xs text-destructive">{confirmError}</p>}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading || !ready || sessionMissing}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Update password'
              )}
            </Button>

            {sessionMissing && (
              <p className="text-center text-xs text-muted-foreground">
                <Link href="/forgot-password" className="hover:underline">
                  Request a new reset link
                </Link>
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          {' · '}
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  )
}
