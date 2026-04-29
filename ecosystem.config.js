const fs   = require('fs')
const path = require('path')

// Read ALL secrets from .env.local into PM2's stored process definition.
// This ensures that any form of pm2 restart/reload always has the correct
// values — immune to shell env contamination from CI runners or Claude Code
// sessions that may have these vars set to empty or incorrect values.
function readEnvLocal() {
  try {
    const content = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8')
    const env = {}
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m) env[m[1]] = m[2].trim()
    }
    return env
  } catch {
    return {}
  }
}

const local = readEnvLocal()

module.exports = {
  apps: [
    {
      name: "astrotattwa-web",
      cwd: "/var/www/astrotattwa-web",
      script: "node_modules/.bin/next",
      args: "start",
      exec_mode: "cluster",
      instances: 4,
      env: {
        NODE_ENV: "production",
        // All secrets from .env.local — explicitly listed so PM2 always wins
        // over any contaminated parent environment.
        NEXT_PUBLIC_SUPABASE_URL:      local.NEXT_PUBLIC_SUPABASE_URL      || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: local.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        SUPABASE_SERVICE_ROLE_KEY:     local.SUPABASE_SERVICE_ROLE_KEY     || '',
        NEXT_PUBLIC_SITE_URL:          local.NEXT_PUBLIC_SITE_URL          || '',
        HERE_MAPS_API_KEY:             local.HERE_MAPS_API_KEY             || '',
        ADMIN_SECRET_TOKEN:            local.ADMIN_SECRET_TOKEN            || '',
        RESEND_API_KEY:                local.RESEND_API_KEY                || '',
        ANTHROPIC_API_KEY:             local.ANTHROPIC_API_KEY             || '',
        PHONEPE_CLIENT_ID:             local.PHONEPE_CLIENT_ID             || '',
        PHONEPE_CLIENT_SECRET:         local.PHONEPE_CLIENT_SECRET         || '',
        PHONEPE_CLIENT_VERSION:        local.PHONEPE_CLIENT_VERSION        || '',
        PHONEPE_ENV:                   local.PHONEPE_ENV                   || '',
        PHONEPE_WEBHOOK_USERNAME:      local.PHONEPE_WEBHOOK_USERNAME      || '',
        PHONEPE_WEBHOOK_PASSWORD:      local.PHONEPE_WEBHOOK_PASSWORD      || '',
        GOOGLE_CLIENT_ID:              local.GOOGLE_CLIENT_ID              || '',
        GOOGLE_CLIENT_SECRET:          local.GOOGLE_CLIENT_SECRET          || '',
        NEXT_PUBLIC_GOOGLE_CLIENT_ID:  local.NEXT_PUBLIC_GOOGLE_CLIENT_ID  || '',
        // Optional vars — only set if present in .env.local
        ...(local.NEXT_PUBLIC_APP_URL          && { NEXT_PUBLIC_APP_URL:          local.NEXT_PUBLIC_APP_URL }),
        ...(local.UPSTASH_REDIS_REST_URL       && { UPSTASH_REDIS_REST_URL:       local.UPSTASH_REDIS_REST_URL }),
        ...(local.UPSTASH_REDIS_REST_TOKEN     && { UPSTASH_REDIS_REST_TOKEN:     local.UPSTASH_REDIS_REST_TOKEN }),
        ...(local.APP_INTERNAL_URL             && { APP_INTERNAL_URL:             local.APP_INTERNAL_URL }),
      }
    }
  ]
};
