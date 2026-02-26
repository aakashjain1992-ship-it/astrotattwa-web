import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/server-admin'

export const runtime = 'nodejs'

// =======================
// CONFIG (tunable)
// =======================
const EMAIL_IP_FAIL_LIMIT = 5
const EMAIL_IP_WINDOW_MIN = 10
const EMAIL_IP_LOCK_MIN = 15

const EMAIL_FAIL_LIMIT = 10
const EMAIL_WINDOW_MIN = 30
const EMAIL_LOCK_MIN = 30

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
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

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
    .select('*')
    .in('scope', ['email_ip', 'email', 'ip'])
    .in('scope_key', [emailIpKey, emailKey, ipKey])

  const now = new Date()

  for (const row of locks || []) {
    if (row.locked_until && new Date(row.locked_until) > now) {
      await logEvent(emailNorm, ipHash, userAgent, 'locked', 'account_locked')
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // ----- Attempt Supabase Login -----
  const response = NextResponse.next()
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
    await handleFailure(emailNorm, ipHash, userAgent)
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  // Success
  await handleSuccess(emailNorm, ipHash)
  await logEvent(emailNorm, ipHash, userAgent, 'success', null)

  return NextResponse.json({ success: true })
}

// =======================
// Failure Handler
// =======================

async function handleFailure(emailNorm: string, ipHash: string, userAgent: string) {
  const now = new Date().toISOString()

  await incrementScope('email_ip', `${emailNorm}|${ipHash}`, emailNorm, ipHash, EMAIL_IP_FAIL_LIMIT, EMAIL_IP_WINDOW_MIN, EMAIL_IP_LOCK_MIN)
  await incrementScope('email', emailNorm, emailNorm, ipHash, EMAIL_FAIL_LIMIT, EMAIL_WINDOW_MIN, EMAIL_LOCK_MIN)
  await incrementScope('ip', ipHash, emailNorm, ipHash, IP_FAIL_LIMIT, IP_WINDOW_MIN, IP_LOCK_MIN)

  await logEvent(emailNorm, ipHash, userAgent, 'failure', 'invalid_credentials')
}

// =======================
// Success Handler
// =======================

async function handleSuccess(emailNorm: string, ipHash: string) {
  await supabaseAdmin
    .from('auth_login_attempts_v2')
    .update({
      fail_count: 0,
      locked_until: null,
      last_success_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in('scope', ['email_ip', 'email'])
    .in('scope_key', [`${emailNorm}|${ipHash}`, emailNorm])
}

// =======================
// Increment Logic
// =======================

async function incrementScope(
  scope: string,
  scopeKey: string,
  emailNorm: string,
  ipHash: string,
  failLimit: number,
  windowMin: number,
  lockMin: number
) {
  const windowStart = minutesAgo(windowMin)

  const { data } = await supabaseAdmin
    .from('auth_login_attempts_v2')
    .select('*')
    .eq('scope', scope)
    .eq('scope_key', scopeKey)
    .maybeSingle()

  if (!data) {
    await supabaseAdmin.from('auth_login_attempts_v2').insert({
      scope,
      scope_key: scopeKey,
      email_norm: emailNorm,
      ip_hash: ipHash,
      fail_count: 1,
      first_fail_at: new Date().toISOString(),
      last_fail_at: new Date().toISOString(),
    })
    return
  }

  let failCount = data.fail_count

  if (data.first_fail_at && new Date(data.first_fail_at) < new Date(windowStart)) {
    failCount = 1
  } else {
    failCount += 1
  }

  const updateData: any = {
    fail_count: failCount,
    last_fail_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (failCount >= failLimit) {
    updateData.locked_until = minutesFromNow(lockMin)
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
  failureReason: string | null
) {
  await supabaseAdmin.from('auth_login_events').insert({
    email_norm: emailNorm,
    ip_hash: ipHash,
    user_agent: userAgent,
    result,
    failure_reason: failureReason,
  })
}
