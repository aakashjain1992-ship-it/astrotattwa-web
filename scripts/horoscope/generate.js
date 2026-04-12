#!/usr/bin/env node
/**
 * Astrotattwa — Horoscope Generation Script
 *
 * Manually trigger horoscope generation for any type/date.
 *
 * Usage:
 *   node scripts/horoscope/generate.js daily
 *   node scripts/horoscope/generate.js weekly
 *   node scripts/horoscope/generate.js monthly
 *   node scripts/horoscope/generate.js daily 2026-04-15
 *
 * Requires the Next.js app to be running on APP_INTERNAL_URL (default http://localhost:3000).
 */

'use strict'

const path = require('path')
const fs   = require('fs')

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

const APP_URL    = process.env.APP_INTERNAL_URL ?? 'http://localhost:3000'
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN

if (!ADMIN_TOKEN) {
  console.error('ERROR: ADMIN_SECRET_TOKEN not set in .env.local')
  process.exit(1)
}

const VALID_TYPES = ['daily', 'weekly', 'monthly']

async function generate(type, date) {
  if (!VALID_TYPES.includes(type)) {
    console.error(`ERROR: type must be one of: ${VALID_TYPES.join(', ')}`)
    process.exit(1)
  }

  const body = JSON.stringify({ type, date })
  console.log(`[generate] Triggering ${type} horoscope generation${date ? ` for ${date}` : ''}`)

  const res = await fetch(`${APP_URL}/api/horoscope/generate`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'x-admin-token': ADMIN_TOKEN,
    },
    body,
  })

  const json = await res.json().catch(() => ({ error: 'non-JSON response' }))

  if (!res.ok) {
    console.error(`[generate] HTTP ${res.status}:`, json)
    process.exit(1)
  }

  if (json.skipped) {
    console.log(`[generate] Skipped — already generated for period ${json.period_start}`)
    return
  }

  console.log(`[generate] ✅ Generated: ${json.generated}/12 rashis in ${json.elapsedSec}s`)

  if (json.errors && json.errors.length > 0) {
    console.warn('[generate] Errors:')
    for (const e of json.errors) console.warn(' •', e)
    process.exit(json.generated === 0 ? 1 : 0) // partial success is ok
  }
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const [,, type = 'daily', date] = process.argv
generate(type, date).catch(err => {
  console.error('[generate] Fatal:', err.message)
  process.exit(1)
})
