import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/server-admin'

export const runtime = 'nodejs'

// =======================
// CONFIG (tunable)
// =======================

// email+ip combo: strict (stops targeted brute force)
const EMAIL_IP_FAIL_LIMIT = 5
const EMAIL_IP_WINDOW_MIN = 10
const EMAIL_IP_LOCK_MIN = 15

// email-only: catches distributed attacks across many IPs
const EMAIL_FAIL_LIMIT = 10
const EMAIL_WINDOW_MIN = 30
const EMAIL_LOCK_MIN = 30

// ip-only: stops IP spraying many accounts
const IP_FAIL_LIMIT = 30
const IP_WINDOW_MIN = 10
const IP_LOCK_MIN = 15

// =======================
// Helpers
// =======================

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function hashIP(ip: string) {
  return crypto.createHash('sha256').update(ip).digest('hex')
}

function getClientIP(req: NextRequest) {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

function minutesFromNow(min: number) {
  return new Date(Date.now() + min * 60 * 1000).toISOString()
}

function minutesAgo(min: number) {
  return new Date(Date.now() - min * 60 * 1000).toISOString()
}

// =======================
// Main Handler
// =======================

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email
  const password = body?.password

  if (!email || !password) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const country = req.headers.get('cf-ipcountry') || null
  const cfRay = req.headers.get('cf-ray') || null

  const emailNorm = normalizeEmail(email)
  const ip = getClientIP(req)
  const ipHash = hashIP(ip)
  const userAgent = req.headers.get('user-agent') || ''

  // ----- Define scope keys -----
  const emailIpKey = `${emailNorm}|${ipHash}`
  const emailKey = emailNorm
  const ipKey = ipHash

  // ----- Check existing locks -----
  const { data: locks } = await supabaseAdmin
    .from('auth_login_attempts_v2')
    .select('scope, scope_key, locked_until')
    .in('scope', ['email_ip', 'email', 'ip'])
    .in('scope_key', [emailIpKey, emailKey, ipKey])

  const now = new Date()

  for (const row of locks || []) {
    if (row.locked_until && new Date(row.locked_until) > now) {
      await logEvent(emailNorm, ipHash, userAgent, 'locked', 'account_locked', country, cfRay)
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // IMPORTANT:
  // We must return the SAME response object that receives cookies from Supabase.
  const response = NextResponse.json({ success: true }, { status: 200 })
  response.headers.set('Cache-Control', 'no-store')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options, path: '/' })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options, path: '/' })
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({
    email: emailNorm,
    password,
  })

  if (error) {
    await handleFailure(emailNorm, ipHash, userAgent, country, cfRay)

    // don’t leak whether email exists
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  // Success: clear fail counters + log
  await handleSuccess(emailNorm, ipHash)
  await logEvent(emailNorm, ipHash, userAgent, 'success', null, country, cfRay)

  return response
}

// =======================
// Failure Handler
// =======================

async function handleFailure(
  emailNorm: string,
  ipHash: string,
  userAgent: string,
  country: string | null,
  cfRay: string | null
) {
  await incrementScope(
    'email_ip',
    `${emailNorm}|${ipHash}`,
    emailNorm,
    ipHash,
    EMAIL_IP_FAIL_LIMIT,
    EMAIL_IP_WINDOW_MIN,
    EMAIL_IP_LOCK_MIN
  )

  await incrementScope(
    'email',
    emailNorm,
    emailNorm,
    ipHash,
    EMAIL_FAIL_LIMIT,
    EMAIL_WINDOW_MIN,
    EMAIL_LOCK_MIN
  )

  await incrementScope(
    'ip',
    ipHash,
    emailNorm,
    ipHash,
    IP_FAIL_LIMIT,
    IP_WINDOW_MIN,
    IP_LOCK_MIN
  )

  await logEvent(emailNorm, ipHash, userAgent, 'failure', 'invalid_credentials', country, cfRay)
}

// =======================
// Success Handler
// =======================

async function handleSuccess(emailNorm: string, ipHash: string) {
  const now = new Date().toISOString()

  // reset email_ip + email scopes on success
  await supabaseAdmin
    .from('auth_login_attempts_v2')
    .update({
      fail_count: 0,
      locked_until: null,
      lock_level: 0,
      last_success_at: now,
      updated_at: now,
    })
    .in('scope', ['email_ip', 'email', 'ip'])
    .in('scope_key', [`${emailNorm}|${ipHash}`, emailNorm, ipHash])
}

// =======================
// Increment Logic
// =======================

async function incrementScope(
  scope: 'email_ip' | 'email' | 'ip',
  scopeKey: string,
  emailNorm: string,
  ipHash: string,
  failLimit: number,
  windowMin: number,
  lockMin: number
) {
  const windowStartIso = minutesAgo(windowMin)

  const { data } = await supabaseAdmin
    .from('auth_login_attempts_v2')
    .select('*')
    .eq('scope', scope)
    .eq('scope_key', scopeKey)
    .maybeSingle()

  // If no row exists, create one and stop
  if (!data) {
    await supabaseAdmin.from('auth_login_attempts_v2').insert({
      scope,
      scope_key: scopeKey,
      email_norm: emailNorm,
      ip_hash: ipHash,
      fail_count: 1,
      lock_level: 0,
      locked_until: null,
      first_fail_at: new Date().toISOString(),
      last_fail_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    return
  }

  const windowStart = new Date(windowStartIso)
  const firstFailAt = data.first_fail_at ? new Date(data.first_fail_at) : null

  // rolling window reset
  let failCount = data.fail_count ?? 0
  const windowExpired = !!(firstFailAt && firstFailAt < windowStart)
  failCount = windowExpired ? 1 : failCount + 1

  const updateData: any = {
    fail_count: failCount,
    last_fail_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (windowExpired) {
    updateData.first_fail_at = new Date().toISOString()
    // optionally reset lock level when window resets
    updateData.lock_level = data.lock_level ?? 0
  }

  if (failCount >= failLimit) {
    const newLevel = (data.lock_level || 0) + 1

    const adaptiveLockMinutes = Math.min(
      lockMin * Math.pow(2, newLevel - 1),
      1440 // cap at 24h
    )

    updateData.locked_until = minutesFromNow(adaptiveLockMinutes)
    updateData.lock_level = newLevel
  }

  await supabaseAdmin
    .from('auth_login_attempts_v2')
    .update(updateData)
    .eq('id', data.id)
}

// =======================
// Audit Logging
// =======================

async function logEvent(
  emailNorm: string,
  ipHash: string,
  userAgent: string,
  result: 'success' | 'failure' | 'locked',
  failureReason: string | null,
  country?: string | null,
  cfRay?: string | null
) {
  await supabaseAdmin.from('auth_login_events').insert({
    email_norm: emailNorm,
    ip_hash: ipHash,
    user_agent: userAgent,
    result,
    failure_reason: failureReason,
    country: country ?? null,
    cf_ray: cfRay ?? null,
  })
}
