-- Panchang feature tables
-- Run these in Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ── panchang_cache ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS panchang_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key       TEXT UNIQUE NOT NULL,  -- "{date}_{lat}_{lng}" e.g. "2026-04-02_28.61_77.21"
  date            DATE NOT NULL,
  lat             DECIMAL(9,6) NOT NULL,
  lng             DECIMAL(9,6) NOT NULL,
  location_name   TEXT,                  -- "Delhi, India"
  timezone        TEXT NOT NULL,         -- "Asia/Kolkata"
  data            JSONB NOT NULL,        -- full computed PanchangData JSON
  computed_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_panchang_cache_key ON panchang_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_panchang_date ON panchang_cache(date);

-- RLS: public read (panchang is public data), write via service_role only
ALTER TABLE panchang_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panchang_cache_public_read" ON panchang_cache FOR SELECT USING (true);

-- ── festival_calendar ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS festival_calendar (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT CHECK (type IN ('major', 'minor', 'fast', 'auspicious')),
  description   TEXT,
  image_url     TEXT
);

CREATE INDEX IF NOT EXISTS idx_festival_date ON festival_calendar(date);

-- RLS: public read
ALTER TABLE festival_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "festival_calendar_public_read" ON festival_calendar FOR SELECT USING (true);
