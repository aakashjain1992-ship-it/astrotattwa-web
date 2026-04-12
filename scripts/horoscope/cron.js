#!/usr/bin/env node
/**
 * Astrotattwa — Horoscope Cron Scheduler
 *
 * Runs as a persistent PM2 process. Triggers horoscope generation
 * on a schedule (all times IST / Asia/Kolkata):
 *
 *   Daily   → every day at midnight IST     (18:30 UTC)
 *   Weekly  → every Sunday at noon IST      (06:30 UTC Sunday)
 *   Monthly → 25th of each month at midnight IST (generates for next month)
 *
 * PM2 setup:
 *   pm2 start scripts/horoscope/cron.js --name horoscope-cron
 *   pm2 save
 *
 * Logs: pm2 logs horoscope-cron
 */

'use strict'

const path  = require('path')
const fs    = require('fs')
const cron  = require('node-cron')

// ── Env loader ───────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const APP_URL     = process.env.APP_INTERNAL_URL ?? 'http://localhost:3000'
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN
const RESEND_KEY  = process.env.RESEND_API_KEY
const ALERT_TO    = 'aakashjain1992@gmail.com'
const ALERT_FROM  = 'noreply@astrotattwa.com'

if (!ADMIN_TOKEN) {
  console.error('[horoscope-cron] ERROR: ADMIN_SECRET_TOKEN not set')
  process.exit(1)
}

// ── Email alert ───────────────────────────────────────────────────────────────
async function sendAlert(subject, body) {
  if (!RESEND_KEY) { console.warn('[horoscope-cron] No RESEND_API_KEY — skipping email'); return }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: ALERT_FROM, to: [ALERT_TO], subject, html: body }),
    })
    if (!res.ok) console.warn('[horoscope-cron] Email send failed:', res.status)
  } catch (e) {
    console.warn('[horoscope-cron] Email error:', e.message)
  }
}

// ── Generator with retry ──────────────────────────────────────────────────────
async function triggerGeneration(type, date, attempt = 1) {
  const MAX_ATTEMPTS = 3
  const RETRY_DELAY  = 10 * 60 * 1000 // 10 minutes

  try {
    const body = JSON.stringify({ type, ...(date && { date }) })
    console.log(`[horoscope-cron] [${new Date().toISOString()}] Generating ${type} (attempt ${attempt}/${MAX_ATTEMPTS})`)

    const res  = await fetch(`${APP_URL}/api/horoscope/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
      body,
    })

    const json = await res.json().catch(() => ({ error: 'non-JSON response' }))

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`)

    if (json.skipped) {
      console.log(`[horoscope-cron] Skipped — already done for ${json.period_start}`)
      return
    }

    if (json.errors && json.errors.length > 0) {
      console.warn(`[horoscope-cron] Partial errors (${json.errors.length}):`, json.errors.join('; '))
    }

    console.log(`[horoscope-cron] ✅ ${type} done — ${json.generated}/12 rashis in ${json.elapsedSec}s`)

    // Alert on partial failure
    if (json.generated < 12) {
      await sendAlert(
        `[Astrotattwa] Horoscope generation partial failure — ${type} ${json.period_start}`,
        `<h2>Partial horoscope generation</h2>
         <p><strong>Type:</strong> ${type}<br>
         <strong>Period:</strong> ${json.period_start}<br>
         <strong>Generated:</strong> ${json.generated}/12 rashis<br>
         <strong>Errors:</strong></p>
         <pre>${(json.errors ?? []).join('\n')}</pre>`
      )
    }

  } catch (err) {
    console.error(`[horoscope-cron] Attempt ${attempt} failed: ${err.message}`)

    if (attempt < MAX_ATTEMPTS) {
      console.log(`[horoscope-cron] Retrying in 10 minutes...`)
      setTimeout(() => triggerGeneration(type, date, attempt + 1), RETRY_DELAY)
    } else {
      console.error(`[horoscope-cron] All ${MAX_ATTEMPTS} attempts failed for ${type}. Sending alert.`)
      await sendAlert(
        `[ACTION REQUIRED] Horoscope generation failed — ${type} ${date ?? 'today'}`,
        `<h2 style="color:red">⚠ Horoscope Cron Hard Failure</h2>
         <p><strong>Type:</strong> ${type}<br>
         <strong>Date:</strong> ${date ?? 'today'}<br>
         <strong>Attempts:</strong> ${MAX_ATTEMPTS}<br>
         <strong>Last error:</strong> ${err.message}</p>
         <h3>Manual fix</h3>
         <code>node scripts/horoscope/generate.js ${type} ${date ?? ''}</code>
         <p>Check PM2 logs: <code>pm2 logs horoscope-cron</code></p>`
      )
    }
  }
}

// ── IST-aware date helpers ────────────────────────────────────────────────────

// At 18:30 UTC, IST (UTC+5:30) has already crossed midnight into the next day.
// Always compute dates in IST so the generated content matches what the user sees.
function istDateString(offsetDays = 0) {
  const now = new Date()
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000
  const d = new Date(istMs + offsetDays * 86400000)
  return d.toISOString().slice(0, 10)
}

// Next Monday in IST — called on Sunday noon IST so offsetDays=1 gives Monday
function nextMondayIST() {
  return istDateString(1)
}

// First day of next month in IST
function nextMonthFirstDay() {
  const now = new Date()
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000
  const ist = new Date(istMs)
  const next = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() + 1, 1))
  return next.toISOString().slice(0, 10)
}

// ── Cron schedules (UTC — IST is UTC+5:30) ───────────────────────────────────

// Daily: midnight IST = 18:30 UTC → pass IST date (the day that just started in IST)
cron.schedule('30 18 * * *', () => {
  triggerGeneration('daily', istDateString())
}, { timezone: 'UTC' })

// Weekly: Sunday noon IST = 06:30 UTC Sunday → generate for NEXT week (Mon–Sun)
cron.schedule('30 6 * * 0', () => {
  triggerGeneration('weekly', nextMondayIST())
}, { timezone: 'UTC' })

// Monthly: 25th midnight IST = 18:30 UTC 24th → generate for NEXT month
cron.schedule('30 18 24 * *', () => {
  triggerGeneration('monthly', nextMonthFirstDay())
}, { timezone: 'UTC' })

console.log('[horoscope-cron] Scheduler started.')
console.log('  Daily:   every day at midnight IST (18:30 UTC)')
console.log('  Weekly:  every Sunday at noon IST  (06:30 UTC)')
console.log('  Monthly: 25th at midnight IST      (18:30 UTC on 24th → next month)')
