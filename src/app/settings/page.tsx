'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  Calendar,
  Lock,
  LogOut,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  ChevronRight,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { performLogout } from '@/lib/auth/logout'
import { useIdleLogout } from '@/hooks/useIdleLogout'


// ─── Avatar ──────────────────────────────────────────────────────────────────

function ProfileAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid var(--border2)',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'var(--blue)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border2)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border2)',
          background: 'var(--bg-subtle)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  )
}

// ─── Change Password Form ─────────────────────────────────────────────────────

function ChangePasswordForm() {
  const [open, setOpen] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 10) return 'Password must be at least 10 characters'
    if (!/[A-Z]/.test(pwd)) return 'Must contain at least one uppercase letter'
    if (!/[0-9]/.test(pwd)) return 'Must contain at least one number'
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Must contain at least one special character'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Re-authenticate with current password first
    const { data: userData } = await supabase.auth.getUser()
    const email = userData.user?.email
    if (!email) return

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPwd,
    })
    if (signInError) {
      setError('Current password is incorrect.')
      return
    }

    const pwdErr = validatePassword(newPwd)
    if (pwdErr) { setError(pwdErr); return }
    if (newPwd !== confirmPwd) { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPwd })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    setTimeout(() => {
      setSuccess(false)
      setOpen(false)
      performLogout()
    }, 2000)
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--text)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={16} color="var(--blue)" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
              Change password
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text3)' }}>
              Update your account password
            </p>
          </div>
        </div>
        <ChevronRight
          size={16}
          color="var(--text3)"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform .2s',
          }}
        />
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="currentPwd">Current password</Label>
            <div style={{ position: 'relative' }}>
              <Input
                id="currentPwd"
                type={showPwd ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••••"
                className="h-10 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text3)',
                }}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPwd">New password</Label>
            <Input
              id="newPwd"
              type={showPwd ? 'text' : 'password'}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="••••••••••"
              className="h-10"
              disabled={loading}
            />
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
              Min. 10 characters with uppercase, number, and special character
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPwd">Confirm new password</Label>
            <Input
              id="confirmPwd"
              type={showPwd ? 'text' : 'password'}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="••••••••••"
              className="h-10"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                color: '#DC2626',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle size={14} />
              Password updated. Redirecting you to sign in again…
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" className="h-9" disabled={loading || !currentPwd || !newPwd || !confirmPwd}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating…</> : 'Update password'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => {
                setOpen(false)
                setError('')
                setCurrentPwd('')
                setNewPwd('')
                setConfirmPwd('')
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  useIdleLogout()

  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState('')
  const [signOutLoading, setSignOutLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
    .then(r => r.json())
    .then(({ user }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user as any)
      setName(user.user_metadata?.full_name ?? user.user_metadata?.name ??'')
      setLoading(false)
    })
     .catch(() => router.push('/login'))

  }, [router])

  const handleSaveName = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim()) { setNameError('Name cannot be empty'); return }
      setNameLoading(true)
      setNameError('')
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
      setNameLoading(false)
      if (error) {
        setNameError(error.message)
        return
      }
      if (data.user) setUser(data.user)
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    },
    [name, supabase]
  )

  const handleSignOut = async () => {
    setSignOutLoading(true)
    await performLogout()
    router.push('/login')
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-subtle)',
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const displayName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? 'Your Account'

  const isGoogleUser = user?.app_metadata?.provider === 'google'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column' }}>
      {/* Watches for session expiry / sign-out from another tab */}

      <Header showNav={false} />

      <main
        style={{
          flex: 1,
          maxWidth: 640,
          margin: '0 auto',
          width: '100%',
          padding: '96px 16px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Page title */}
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
            Account Settings
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text3)' }}>
            Manage your profile and account preferences
          </p>
        </div>

        {/* Profile overview */}
        <SectionCard title="Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <ProfileAvatar name={displayName} avatarUrl={user?.user_metadata?.avatar_url} />
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
                {displayName}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text3)' }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Edit name */}
          <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  id="displayName"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError('') }}
                  placeholder="Your name"
                  className="h-10 flex-1"
                />
                <Button
                  type="submit"
                  className="h-10 gap-1.5"
                  disabled={nameLoading || name === (user?.user_metadata?.full_name ?? '')}
                >
                  {nameLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : nameSuccess ? (
                    <><CheckCircle className="h-4 w-4" />Saved</>
                  ) : (
                    <><Save className="h-4 w-4" />Save</>
                  )}
                </Button>
              </div>
              {nameError && (
                <p style={{ fontSize: 12, color: 'var(--error)', margin: 0 }}>{nameError}</p>
              )}
            </div>
          </form>
        </SectionCard>

        {/* Account details */}
        <SectionCard title="Account">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InfoRow
              icon={<Mail size={15} />}
              label="Email address"
              value={user?.email ?? '—'}
            />
            <InfoRow
              icon={<Calendar size={15} />}
              label="Member since"
              value={user?.created_at ? formatDate(user.created_at) : '—'}
            />
            <InfoRow
              icon={<Shield size={15} />}
              label="Sign-in method"
              value={isGoogleUser ? 'Google' : 'Email & Password'}
            />
          </div>
        </SectionCard>

        {/* Security */}
        {!isGoogleUser && (
          <SectionCard title="Security">
            <ChangePasswordForm />
          </SectionCard>
        )}

        {/* Sign out */}
        <SectionCard title="Session">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                Sign out
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text3)' }}>
                You&apos;ll need to sign in again to access your charts
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 h-9"
              style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
              onClick={handleSignOut}
              disabled={signOutLoading}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEF2F2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {signOutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign out
            </Button>
          </div>
        </SectionCard>
      </main>

      <Footer />
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text3)',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text3)' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 500, color: 'var(--text)', wordBreak: 'break-all' }}>
          {value}
        </p>
      </div>
    </div>
  )
}
