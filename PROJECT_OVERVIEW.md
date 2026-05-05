# Project Overview - Astrotattwa

**Version:** 2.1
**Last Updated:** May 2, 2026
**Status:** Production (Phase 3 ~95% Complete)

---

## 📋 Table of Contents

- [Mission](#mission)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Data Flow](#data-flow)
- [Security](#security)
- [Performance](#performance)
- [Deployment](#deployment)

---

## 🎯 Mission

Astrotattwa provides **accurate, free Vedic astrology calculations** with AI-powered insights. Our mission is to make high-quality astrological analysis accessible to everyone.

### Core Principles
1. **Accuracy First** - Swiss Ephemeris calculations (arcminute precision)
2. **Free Core Features** - No login required for chart generation
3. **Mobile-First** - Optimized for phones and tablets
4. **Privacy Focused** - Minimal data collection
5. **Open & Transparent** - All calculations verifiable

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Cloudflare                           │
│                    (DNS, SSL, CDN, DDoS)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Linode VPS                              │
│                  (172.236.176.107)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Nginx (Reverse Proxy)                │   │
│  │            Port 80 → 443 (SSL redirect)               │   │
│  │            Port 443 → localhost:3000                  │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                     PM2 Process                       │   │
│  │               (astrotattwa-web)                       │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │           Next.js 16 Server                    │  │   │
│  │  │                                                │  │   │
│  │  │  ┌─────────────────┐  ┌──────────────────┐   │  │   │
│  │  │  │  Server Side    │  │  API Routes      │   │  │   │
│  │  │  │  Rendering      │  │  /api/*          │   │  │   │
│  │  │  └─────────────────┘  └──────────────────┘   │  │   │
│  │  │                                                │  │   │
│  │  │  ┌─────────────────────────────────────────┐  │  │   │
│  │  │  │      Swiss Ephemeris Engine             │  │  │   │
│  │  │  │  (Planetary Calculations)               │  │  │   │
│  │  │  └─────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         PostgreSQL (Future - Planned Migration)       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │      Supabase Cloud        │
              │  (PostgreSQL + Auth)       │
              │  - profiles table          │
              │  - charts table            │
              │  - cities table            │
              └────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend Layer

#### Core Framework
- **Next.js 16** (App Router)
  - Server Components (default)
  - Client Components ('use client' when needed)
  - API Routes
  - Automatic code splitting
  - Image optimization

#### Language
- **TypeScript 5.3** (strict mode)
  - All files typed
  - No implicit any
  - Strict null checks

#### Styling
- **Tailwind CSS 3.4**
  - Utility-first CSS
  - Custom design tokens
  - Dark/Light theme support
- **shadcn/ui**
  - 24+ reusable components
  - Radix UI primitives
  - Accessible by default

#### State Management
- **React Hooks** (useState + custom hooks — no global store; Zustand removed)
- **React Hook Form** (form state)
- **Server State:** Fetched directly in Server Components

#### UI Libraries
- **next-themes** - Theme management
- **framer-motion** - Animations
- **lucide-react** - Icons

---

### Backend Layer

#### Runtime & Server
- **Node.js 20.20.0**
- **Next.js API Routes** (serverless functions)

#### Database
**Current:** Supabase (PostgreSQL 15)
- Row Level Security (RLS)
- Real-time subscriptions (not used yet)
- Auth system (active — Google OAuth custom flow + One Tap, email/password)

**Future:** Linode PostgreSQL (planned migration)
- Better cost control
- Direct server access
- Custom configuration

#### Authentication (P7 Complete ✅)
- **Supabase Auth** (active)
- Google OAuth
- Email/password
- JWT tokens with session refresh middleware

#### Calculations Engine
- **Swiss Ephemeris 0.5.17**
  - Planetary ephemeris (JPL DE431)
  - High precision (arcminute accuracy)
  - Lahiri Ayanamsa
  - Node.js bindings via `swisseph` npm package

---

### Infrastructure

#### Hosting
- **Linode VPS**
  - Region: Mumbai
  - IP: 172.236.176.107
  - OS: Ubuntu 22.04 LTS
  - RAM: 4GB
  - Storage: 80GB SSD

#### Web Server
- **Nginx 1.18**
  - Reverse proxy
  - SSL termination
  - Gzip compression
  - Static file serving

#### Process Management
- **PM2**
  - Process: `astrotattwa-web`
  - Auto-restart on crash
  - Log management
  - Cluster mode ready

#### Domain & DNS
- **Cloudflare**
  - Domain registrar
  - DNS management
  - SSL/TLS (Full Strict)
  - CDN
  - DDoS protection
  - Web Application Firewall (WAF)

---

### Development Tools

#### Version Control
- **Git** + **GitHub**
  - Repository: aakashjain1992-ship-it/astrotattwa-web
  - Branches: main, dev, feature/*
  - Protected main branch

#### CI/CD
- **GitHub Actions**
  - Auto-deploy main → Linode
  - Build checks
  - Type checking

#### Code Quality
- **ESLint** - Linting
- **Prettier** - Formatting (planned)
- **TypeScript** - Type checking

#### Testing
- **Manual Testing** (current)
- **Unit Tests** (planned)
- **E2E Tests** (planned)

---

## 🔄 Data Flow

### Chart Calculation Flow

```
1. User Input
   ├── Name
   ├── Date (YYYY-MM-DD)
   ├── Time (HH:MM AM/PM)
   └── Location (City, State, Country)
           │
           ▼
2. Frontend Validation (Zod schema)
   ├── Required fields
   ├── Valid date/time
   └── Coordinates present
           │
           ▼
3. API Request
   POST /api/calculate
   {
     name, date, time, 
     lat, lng, timezone, utcOffset
   }
           │
           ▼
4. Server-Side Calculation
   ├── Convert to UTC
   ├── Calculate Julian Day
   ├── Swiss Ephemeris:
   │   ├── Planet longitudes
   │   ├── Ascendant
   │   ├── House cusps
   │   └── Nakshatras
   ├── KP System:
   │   ├── Sub-lords
   │   └── Cuspal positions
   ├── Vimshottari Dasha:
   │   └── 4-level hierarchy
   └── Divisional Charts:
       └── D1, D2, D3, D7, D9, D10, D12, Moon
           │
           ▼
5. Response (JSON)
   {
     planets: {...},
     houses: [...],
     dashas: {...},
     avakahada: {...}
   }
           │
           ▼
6. Frontend Rendering
   ├── DiamondChart (SVG)
   ├── PlanetaryTable
   ├── DashaNavigator
   └── Divisional Charts
```

---

### City Search Flow

```
1. User Types in CitySearch
   "New Del..."
           │
           ▼
2. Debounced Input (300ms)
           │
           ▼
3. API Request
   GET /api/cities/search?q=New+Del
           │
           ▼
4. Database Query
   SELECT city_name, state_name, country, 
          latitude, longitude, timezone
   FROM cities
   WHERE search_text ILIKE '%new del%'
   LIMIT 10
           │
           ▼
5. Response (JSON)
   [
     {
       city_name: "New Delhi",
       state_name: "Delhi",
       country: "India",
       latitude: 28.6139,
       longitude: 77.2090,
       timezone: "Asia/Kolkata"
     },
     ...
   ]
           │
           ▼
6. Autocomplete Dropdown
   Shows: "New Delhi, Delhi, India"
```

---

## 🔐 Security

### Current Measures

#### SSL/TLS
- **Cloudflare SSL** (Full Strict mode)
- HTTPS enforced (redirect HTTP → HTTPS)
- TLS 1.2+ only
- HSTS enabled

#### Database
- **Supabase RLS** (Row Level Security)
- No public access without auth
- Parameterized queries (SQL injection prevention)

#### Environment Variables
- Sensitive keys in `.env.local`
- Not committed to git
- Server-side only (not exposed to client)

#### CORS
- Restricted to own domain
- No wildcard origins

---

### Security Status (P3 Complete ✅)

#### API Authentication
- Supabase Auth active (Google OAuth custom flow, email/password)
- Protected routes via middleware (`/settings`, `/reports`)
- Rate limiting — local Redis, presets: strict (5/min), standard (20/min), lenient (60/min), auth (3/5min)

#### Input Validation
- Zod schemas on all API routes ✅
- XSS prevention via React's default encoding ✅

#### Security Headers (Applied ✅)
- CSP (Content Security Policy)
- HSTS (max-age=63072000; includeSubDomains; preload)
- X-Frame-Options (SAMEORIGIN)
- X-Content-Type-Options (nosniff)
- Referrer-Policy
- Permissions-Policy

---

## ⚡ Performance

### Current Performance (Feb 7, 2026)

#### Lighthouse Scores
- **Performance:** 💯 100/100
- **Accessibility:** 🟢 90/100
- **Best Practices:** 🟢 96/100
- **SEO:** 💯 100/100

#### Core Web Vitals
- **FCP:** 0.3s ⚡ (< 1.8s target)
- **LCP:** 0.6s ⚡ (< 2.5s target)
- **CLS:** 0.036 ✅ (< 0.1 target)
- **TBT:** 0ms ⚡
- **SI:** 0.3s ⚡

---

### Performance Strategies

#### 1. Server-Side Rendering (SSR)
- Landing page pre-rendered
- Fast initial load

#### 2. Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components

#### 3. Image Optimization
- Next.js Image component
- WebP format
- Lazy loading

#### 4. Bundle Optimization
- Tree shaking
- Minification
- Gzip compression

#### 5. Caching
- **Static Assets:** Cloudflare CDN (1 year)
- **API Responses:** Future (Redis planned)

---

### Current Bottlenecks

1. **Swiss Ephemeris Calculations** (~100-200ms)
   - Solution: Cache common dates
   
2. **Large Chart Data** (~50 KB JSON)
   - Solution: Progressive loading
   
3. **Multiple Divisional Charts** (8 charts × 50 KB)
   - Solution: Lazy load on tab switch

---

## 🚀 Deployment

### Deployment Architecture

```
Developer (Aakash)
    │
    ▼
Local Changes
    │
    ▼
Git Commit → Push to GitHub (dev branch)
    │
    ▼
Create PR: dev → main
    │
    ▼
GitHub Actions (CI)
    ├── Type check
    ├── Lint
    └── Build test
    │
    ▼
Merge to main (protected)
    │
    ▼
GitHub Actions (CD)
    ├── SSH to Linode
    ├── git pull origin main
    ├── npm install
    ├── npm run build
    ├── pm2 reload astrotattwa-web
    └── Health check
    │
    ▼
Production Live 🎉
```

---

### Manual Deployment (Current)

```bash
# On Linode server
cd /var/www/astrotattwa-web

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build production
npm run build

# Restart PM2
pm2 reload astrotattwa-web

# Check status
pm2 status
pm2 logs astrotattwa-web --lines 50
```

---

### Rollback Strategy

```bash
# View recent commits
git log --oneline -10

# Rollback to previous commit
git reset --hard HEAD~1

# Or to specific commit
git reset --hard <commit-hash>

# Rebuild and restart
npm run build
pm2 reload astrotattwa-web
```

---

## 📊 System Monitoring

### Current Monitoring

#### PM2 Monitoring
```bash
# Process status
pm2 status

# Live monitoring
pm2 monit

# Logs
pm2 logs astrotattwa-web --lines 100

# Metrics
pm2 describe astrotattwa-web
```

#### Server Resources
```bash
# CPU, Memory, Disk
htop

# Disk usage
df -h

# Network
netstat -tulpn
```

---

### Planned Monitoring (P15)

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **PostHog** - Analytics
- **UptimeRobot** - Uptime monitoring

---

## 🗂️ Database Schema

### Current Tables (Supabase)

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT false,
  charts_limit INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
-- Users can only read/update their own profile
```

#### charts
```sql
CREATE TABLE charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  timezone TEXT NOT NULL,
  utc_offset INTEGER NOT NULL,
  ayanamsa DECIMAL,
  ascendant_degree DECIMAL,
  ascendant_sign INTEGER,
  moon_sign INTEGER,
  sun_sign INTEGER,
  nakshatra TEXT,
  nakshatra_pada INTEGER,
  planets JSONB,  -- All planetary data
  houses JSONB,   -- House cusps
  dashas JSONB,   -- Vimshottari dasha
  yogas JSONB,    -- Classical yogas (not used)
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
-- Users can only access their own charts
```

#### cities
```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  state_name TEXT,
  country TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  timezone TEXT NOT NULL,
  population INTEGER,
  search_text TEXT,  -- For full-text search
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cities_search ON cities USING GIN(to_tsvector('english', search_text));
```

---

### Additional Tables (Created — not in migrations file)

The following tables exist in Supabase but were created directly (not via `supabase/migrations/`):

| Table | Purpose |
|-------|---------|
| `reports` | AI-generated report storage |
| `payments` | PhonePe payment transactions (not Razorpay) |
| `astronomical_events` | Astronomical event data |
| `auth_login_attempts_v2` | Rate limiting for auth endpoints |
| `auth_login_events` | Login event tracking |
| `planet_daily_positions` | Daily planetary positions for transit data |
| `planet_retrograde_periods` | Retrograde period tracking |
| `planet_sign_transits` | Planet sign transit data |
| `transit_generation_log` | Transit generation logs |
| `panchang_cache` | Panchang API cache (24h TTL, keyed by date+coords) |
| `festival_calendar` | Festival entries (fetched fresh on each request) |
| `horoscopes` | Generated horoscopes (daily/weekly/monthly, 12 rashis) |
| `horoscope_generation_log` | Per-run token usage, cost, duration |
| `numerology_readings` | Saved user numerology readings |
| `compatibility_readings` | Saved user compatibility readings |

> Total tables: 20 (profiles, charts, cities, test_cases, test_case_runs + 15 above)

---

## 🔮 Future Architecture

### Scalability Plans

#### 1. **Caching Layer** (Live ✅)
Local Redis (`ioredis`, localhost:6379) is live. Used for:
- Rate limiting (atomic Lua script, shared across 4 PM2 workers)
- Panchang API cache (3-tier: Redis hot → Supabase warm → compute cold)

Additional caching opportunities (scheduled calculations, transit data) still planned.

#### 2. **Load Balancing** (Partial ✅)
PM2 cluster mode with 4 workers is live. Rolling reload (`pm2 reload`) provides near-zero downtime.
Nginx reverse proxy routes all traffic to the cluster. External load balancer not needed at current scale.

#### 3. **Database Sharding** (When needed)
- Shard by user_id
- Read replicas for queries

---

## 📚 API Documentation

### Endpoints

#### POST /api/calculate
Calculate birth chart

**Request:**
```json
{
  "name": "John Doe",
  "birthDate": "1992-03-25",
  "birthTime": "11:55 AM",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timezone": "Asia/Kolkata",
  "utcOffset": 330
}
```

**Response:** ChartData (all calculations)

---

#### GET /api/cities/search?q={query}
Search cities

**Response:**
```json
[
  {
    "city_name": "New Delhi",
    "state_name": "Delhi",
    "country": "India",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": "Asia/Kolkata"
  }
]
```

---

#### GET /api/dasha/mahadashas, /antardasha, /pratyantar, /sookshma, /current
Dasha period queries (split by level to match UI tab navigation)

#### GET /api/avakahada
Calculate Avakahada Chakra

---

## 🎯 Success Metrics

### Technical Metrics
- **Uptime:** Target 99.9%
- **Response Time:** < 200ms (API)
- **Error Rate:** < 0.1%

### User Metrics
- **Charts Created:** Track growth
- **Return Rate:** Target 40%+
- **Mobile Users:** ~70% of traffic

---

**Last Updated:** May 2, 2026
**Version:** 2.1
**Next Review:** June 7, 2026
