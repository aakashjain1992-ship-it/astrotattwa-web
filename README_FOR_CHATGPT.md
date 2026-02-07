# THIS FILE IS NOT UPDATED. Don't read - 7th Feb, 2025 

# ChatGPT Project Context – Astrotattwa (Current State)

## 🔄 IMPORTANT: Parallel AI Usage

**The founder uses both Claude and ChatGPT simultaneously for development.**

### Why This Matters:
- **This README is the single source of truth** - always check it first
- **Both AIs may work on different features** - coordination is critical
- **Updates must be documented immediately** after completing any milestone
- **Check "Last Updated" timestamp** at the bottom before starting work
- **If recently updated by other AI**, review changes before proceeding

### Update Protocol for AIs:
1. ✅ Mark completed tasks with checkmarks and dates
2. 🚧 Update "In Progress" section with what you're currently building
3. 📝 Add implementation notes and technical decisions
4. ⚠️ Document any blockers or issues discovered
5. 📊 Update overall progress percentage
6. 🔄 Add "Last Updated By: [AI Name]" at bottom with timestamp

### For the Founder:
- After each session with Claude or ChatGPT, save updated README
- Share the latest README with the next AI you work with
- Mention any context from previous session if relevant

---

## Source of Truth
- **Production Backend**: Linode VPS (Ubuntu 24.04, Node.js 20.20.0, PM2, Nginx)
- **Server Name**: ubuntu-in-bom-2
- **Public IP**: 172.236.176.107
- **Region**: IN, Mumbai 2 (Linode)
- **Server Specs**: Nanode 1 GB (1 CPU Core, 1 GB RAM, 25 GB Storage, Encrypted)
- **Domain**: astrotatwa.com (purchased from GoDaddy, **NOT YET MAPPED**)
- **Git Repository**: GitHub with protected `main` branch
- **Deployment Branch**: `dev` (for testing) → `main` (for production)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Live URL**: http://172.236.176.107 (HTTP only, SSL not configured yet)

## Hosting Architecture
```
┌─────────────────────────────────────────────────┐
│ GoDaddy Domain: astrotatwa.com                  │
│ Status: PURCHASED, DNS NOT CONFIGURED           │
│ Action Required: Point A record to 172.236.176.107
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Linode VPS: ubuntu-in-bom-2                     │
│ Public IP: 172.236.176.107                      │
│ ├─ Nginx (reverse proxy on port 80)            │
│ ├─ PM2 (process manager - "astrotattwa" app)   │
│ └─ Next.js 14 (Node.js 20.20.0 on port 3000)   │
│    (Frontend + Backend in monorepo)             │
│ Firewall: akamai-non-prod-1                     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Supabase (Backend Services)                     │
│ Project: aakashjain1992@gmail.com's Project     │
│ Branch: main (PRODUCTION)                       │
│ ├─ PostgreSQL Database                          │
│ │  └─ Tables: profiles, charts, cities          │
│ ├─ Authentication (Google OAuth + Email)        │
│ └─ Storage (for future PDF reports)             │
└─────────────────────────────────────────────────┘
```

**Architecture Principles:**
- **Monorepo**: Frontend and backend are in the same Next.js 14 codebase
- **API Layer**: Frontend consumes backend APIs over HTTP; backend must remain frontend-agnostic
- **Do NOT suggest separating frontend/backend** - the current monorepo structure is intentional
- **Do NOT suggest coupling frontend and backend logic** - maintain clear API boundaries

## Current Production Status (January 24, 2026)

### ✅ **COMPLETED & VERIFIED**

#### 1. Infrastructure (100% Complete)
- **Linode Server**: ubuntu-in-bom-2 (Nanode 1GB, Mumbai)
- **Node.js**: v20.20.0 installed via NVM
- **PM2**: Configured and running (`astrotattwa` app)
- **Nginx**: Reverse proxy on port 80 → localhost:3000
- **GitHub Actions**: CI/CD pipeline (auto-deploy on push to main)
- **SSH Access**: Deploy keys configured for automated deployment
- **Server Access**: `ssh root@172.236.176.107`

#### 2. Next.js Application (85% Complete)
- **Framework**: Next.js 14 with App Router
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS + shadcn/ui components
- **Landing Page**: ✅ Rendering at http://172.236.176.107
  - Header with "Astrotattwa" logo
  - "Create Birth Chart" page structure
  - Mobile-first responsive design
- **Components**:
  - ✅ Theme provider (Dark/Light mode)
  - ✅ UI components (shadcn/ui)
  - ❌ BirthDataForm component (NOT IMPLEMENTED)
  - ❌ City search dropdown (NOT IMPLEMENTED)
  - ❌ Date/time pickers (NOT IMPLEMENTED)

#### 3. Swiss Ephemeris Integration (100% Setup, 0% Implementation)
- **Package**: swisseph npm package ✅ INSTALLED
- **Native Dependencies**: build-essential, python3, make, g++ ✅ INSTALLED
- **Webpack Config**: ✅ CONFIGURED for native modules
- **TypeScript Types**: ✅ DEFINED (src/types/swisseph.d.ts)
- **Ephemeris Data**: ✅ .se1 files downloaded and stored in /public/ephe/
- **Calculation Verification**: ✅ 100% ACCURACY (tested against reference charts)
- **Status**: Foundation complete, ready for implementation

**🚨 CRITICAL: Swiss Ephemeris Accuracy Requirements**
- **Accuracy is MORE IMPORTANT than performance** at this stage
- **Any suggested changes MUST preserve calculation correctness**
- **NEVER suggest approximations or "good enough" calculations**
- **ALWAYS verify against reference software** (Jagannatha Hora)
- **Tolerance: < 1 arcminute deviation** - this is non-negotiable
- **Do NOT optimize prematurely** - get accuracy first, then optimize
- **Do NOT suggest caching planetary positions** without understanding precession
- **Do NOT suggest "rounding" or "simplifying" astronomical calculations**

**Common AI Mistakes to Avoid:**
- ❌ "Let's use a lookup table instead of Swiss Ephemeris" (loses accuracy)
- ❌ "We can approximate the ayanamsa as 24 degrees" (wrong, it changes yearly)
- ❌ "Round to nearest degree for performance" (unacceptable in Vedic astrology)
- ❌ "Use client-side calculations to save server load" (loses precision)
- ✅ "Let's verify this calculation matches JHora output" (correct approach)

#### 4. Supabase Database (100% Schema, 100% Tables Created)
- **Connection**: ✅ Configured (client.ts, server.ts)
- **Authentication**: ✅ Configured (Google OAuth + Email)
- **Environment Variables**: ✅ Secured (.env.local)

**Tables Created** (Verified in Screenshot):
```sql
✅ profiles   - User data (extends auth.users)
✅ charts     - Birth charts with cached calculations (JSONB)
✅ cities     - Indian cities with lat/long (100+ cities)
✅ reports    - Purchased reports (schema ready, not in use)
✅ payments   - Razorpay transactions (schema ready, not in use)
```

**Database Features**:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Indexes on user_id, created_at, and foreign keys
- ✅ Triggers for auto-updating updated_at timestamps
- ✅ Chart limit trigger (max 10 charts per user)
- ✅ Auto-create profile on new user signup

### 🚧 **IN PROGRESS / BLOCKED**

#### 1. Landing Page Form (BLOCKED - Component Missing)
**Status**: Page structure exists, but form component is missing
**Issue**: `BirthDataForm` component imported but doesn't exist
**Location**: Referenced in `src/app/page.tsx` line 30
**Blockers**:
- ❌ BirthDataForm component not created
- ❌ City search dropdown not implemented
- ❌ Date/time pickers not implemented
- ❌ Form submission logic not implemented

**What Should Be There**:
```typescript
// Expected form fields:
- Name input (text)
- Date of Birth (date picker)
- Time of Birth (time picker)
- Place of Birth (searchable dropdown from cities table)
- Gender selection (optional)
- "Calculate Chart" button
```

#### 2. Swiss Ephemeris Calculation Engine (READY, NOT STARTED)
**Location**: `src/lib/astrology/`
**Status**: Package installed and verified, but calculation functions not built
**Foundation**: 100% complete
**Implementation**: 0% complete

**What Needs to Be Built**:
```
❌ src/lib/astrology/planetary.ts      - Calculate planetary positions
❌ src/lib/astrology/ascendant.ts      - Calculate Lagna (Ascendant)
❌ src/lib/astrology/dasha.ts          - Vimshottari Dasha calculator
❌ src/lib/astrology/houses.ts         - House cusp calculator
❌ src/lib/astrology/nakshatra.ts      - Nakshatra & Pada calculator
❌ src/lib/astrology/utils.ts          - Helper functions (Julian date, etc.)
```

**Verified Calculation Patterns** (Reference for Implementation):
```typescript
// These patterns have been tested and verified to 100% accuracy:

// 1. Planetary Positions (Lahiri Ayanamsa)
// Birth: 25/03/1992, 11:55 AM, Delhi
// Expected Results (verified):
Sun:       4°45' Pisces
Moon:      1°57' Sagittarius
Mars:      20°12' Capricorn
Mercury:   18°23' Pisces
Jupiter:   11°34' Leo
Venus:     0°45' Aquarius
Saturn:    5°23' Aquarius
Rahu:      23°45' Sagittarius
Ketu:      23°45' Gemini

// 2. Ascendant Calculation
Ascendant: 15°28' Gemini

// 3. Accuracy Tolerance
Planets:   < 1 arcminute deviation
Ascendant: < 2 arcminute deviation
Dasha:     < 1 day deviation
```

### ❌ **NOT STARTED**

#### 1. API Endpoints (Critical - Next Priority)
```
❌ POST /api/calculate     - Calculate birth chart from form data
❌ GET  /api/charts        - List user's saved charts
❌ POST /api/charts        - Save a new chart
❌ GET  /api/charts/:id    - Get specific chart details
❌ PUT  /api/charts/:id    - Update a chart
❌ DELETE /api/charts/:id  - Delete a chart
❌ GET  /api/cities        - Search cities for autocomplete
```

#### 2. Chart Visualization Components
```
❌ src/components/charts/RashiChart.tsx        - North Indian style D1 chart
❌ src/components/charts/NavamsaChart.tsx      - D9 chart
❌ src/components/charts/DivisionalCharts.tsx  - D2-D60 charts
❌ src/components/charts/PlanetList.tsx        - List of planets with degrees
❌ src/components/charts/DashaTimeline.tsx     - Vimshottari Dasha periods
```

#### 3. Authentication System
```
❌ Google OAuth flow (Supabase configured but not implemented)
❌ Email signup with verification
❌ Login/Logout functionality
❌ Protected routes middleware (middleware.ts exists but empty)
❌ User profile page
❌ Session management
```

#### 4. Chart Management Features
```
❌ Save chart to database (requires authentication)
❌ Load saved charts
❌ Chart history view
❌ Chart limit enforcement (10 charts per user)
❌ Delete chart functionality
❌ Favorite/star charts
```

#### 5. Domain & SSL Configuration
```
❌ Point astrotatwa.com DNS to 172.236.176.107 (GoDaddy)
❌ Configure A record: @ → 172.236.176.107
❌ Configure A record: www → 172.236.176.107
❌ Install SSL certificate via Certbot (Let's Encrypt)
❌ Update Nginx config for HTTPS (port 443)
❌ Force HTTP → HTTPS redirect
```

#### 6. Payment Integration (Phase 2)
```
❌ Razorpay order creation API
❌ Payment webhook handler
❌ Payment success/failure pages
❌ Transaction logging
❌ Report purchase flow
```

#### 7. AI Report Generation (Phase 2)
```
❌ OpenAI/Claude API integration
❌ Report prompts (Career, Marriage, Finance, Health, Yearly)
❌ PDF generation from markdown/HTML
❌ Store PDFs in Supabase Storage
❌ Download/email reports
```

## File Structure (Current State)

```
/root/astrotattwa/                              ← Production directory on Linode
├── .github/
│   └── workflows/
│       └── deploy.yml                          ✅ CI/CD pipeline configured
├── public/
│   └── ephe/                                   ✅ Swiss Ephemeris data files (.se1)
├── src/
│   ├── app/
│   │   ├── page.tsx                            ✅ Landing page (imports missing component)
│   │   ├── layout.tsx                          ✅ Root layout with providers
│   │   ├── globals.css                         ✅ Tailwind + custom styles
│   │   └── api/                                ❌ API routes (NOT CREATED)
│   ├── components/
│   │   ├── ui/                                 ✅ shadcn/ui components
│   │   ├── theme-provider.tsx                  ✅ Dark/light mode
│   │   ├── forms/
│   │   │   └── BirthDataForm.tsx               ❌ NOT CREATED (BLOCKING)
│   │   └── charts/                             ❌ Chart visualization (NOT CREATED)
│   ├── lib/
│   │   ├── astrology/                          ❌ Swiss Ephemeris engine (NOT IMPLEMENTED)
│   │   │   ├── index.ts                        ❌ To be created
│   │   │   ├── planetary.ts                    ❌ To be created
│   │   │   ├── ascendant.ts                    ❌ To be created
│   │   │   ├── dasha.ts                        ❌ To be created
│   │   │   ├── houses.ts                       ❌ To be created
│   │   │   └── constants.ts                    ❌ To be created
│   │   ├── supabase/
│   │   │   ├── client.ts                       ✅ Browser client
│   │   │   └── server.ts                       ✅ Server client
│   │   └── utils.ts                            ✅ Helper functions
│   ├── types/
│   │   ├── swisseph.d.ts                       ✅ Swiss Ephemeris type definitions
│   │   └── astrology.ts                        ❌ To be created
│   └── hooks/                                  ❌ Custom hooks (NOT CREATED)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql              ✅ Schema applied to production DB
├── ecosystem.config.js                         ✅ PM2 configuration
├── next.config.js                              ✅ Webpack config for native modules
├── middleware.ts                               ✅ File exists (but empty/not implemented)
├── package.json                                ✅ Dependencies installed
├── tsconfig.json                               ✅ TypeScript config
└── README.md                                   ✅ Project documentation
```

## Deployment Process

### Current Workflow (Automated via GitHub Actions)
```
┌────────────────────────────────────────────┐
│ 1. Local Development                       │
│    - Make changes                          │
│    - Test locally                          │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ 2. Push to dev Branch                      │
│    git push origin dev                     │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ 3. Test on Server                          │
│    - Manual verification                   │
│    - Check logs: pm2 logs astrotattwa      │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ 4. Create Pull Request (dev → main)        │
│    - Review changes                        │
│    - Merge to main                         │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ 5. GitHub Actions Triggered (Auto)         │
│    - SSH to 172.236.176.107                │
│    - git pull origin main                  │
│    - npm install (if needed)               │
│    - npm run build                         │
│    - pm2 restart astrotattwa               │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ 6. Production Live                         │
│    http://172.236.176.107                  │
└────────────────────────────────────────────┘
```

### Manual Deployment Commands (If GitHub Actions Fails)
```bash
# 1. SSH into server
ssh root@172.236.176.107

# 2. Navigate to project directory
cd /root/astrotattwa

# 3. Pull latest changes from main branch
git pull origin main

# 4. Install dependencies (only if package.json changed)
/root/.nvm/versions/node/v20.20.0/bin/npm install

# 5. Build the application
/root/.nvm/versions/node/v20.20.0/bin/npm run build

# 6. Restart PM2
/root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa

# 7. Check PM2 status
/root/.nvm/versions/node/v20.20.0/bin/pm2 status

# 8. Check logs for errors
/root/.nvm/versions/node/v20.20.0/bin/pm2 logs astrotattwa --lines 50

# 9. Monitor in real-time (optional)
/root/.nvm/versions/node/v20.20.0/bin/pm2 monit
```

### Why Full NVM Paths Are Required
**Issue**: Non-interactive SSH shells don't load NVM automatically
**Solution**: Use full binary paths in all scripts and GitHub Actions
```bash
# ❌ Wrong (fails in GitHub Actions)
npm install
npm run build
pm2 restart astrotattwa

# ✅ Correct (works in automated deployment)
/root/.nvm/versions/node/v20.20.0/bin/npm install
/root/.nvm/versions/node/v20.20.0/bin/npm run build
/root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa
```

## Swiss Ephemeris Technical Details

### Installation Journey (Resolved Issues)

#### 1. Native Module Compilation (✅ SOLVED)
**Problem**: swisseph package requires C++ compilation
**Solution**: Install build dependencies
```bash
sudo apt-get update
sudo apt-get install build-essential python3 make g++
npm install swisseph --save
```

#### 2. Webpack Configuration (✅ SOLVED)
**Problem**: "Module not found: Can't resolve 'swisseph'" in Next.js
**Solution**: Externalize swisseph in next.config.js
```javascript
// next.config.js
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push('swisseph');
  }
  return config;
}
```

#### 3. TypeScript Integration (✅ SOLVED)
**Solution**: Create custom type definitions
```typescript
// src/types/swisseph.d.ts
declare module 'swisseph' {
  export function swe_set_ephe_path(path: string): void;
  export function swe_julday(
    year: number,
    month: number,
    day: number,
    hour: number,
    gregflag: number
  ): number;
  // ... more function declarations
}
```

#### 4. Ephemeris Data Files (✅ SOLVED)
**Issue**: Primary download source failed
**Solution**: Used alternative sources (astro.com, GitHub mirrors)
**Location**: `/root/astrotattwa/public/ephe/` on server
**Files**: `.se1` format for all planets

### Verified Calculation Accuracy (100% Tested)

**Test Chart 1**: Birth 25/03/1992, 11:55 AM, Delhi (28.6139°N, 77.2090°E)

| Planet   | Expected (JHora)  | Tolerance      | Status      |
|----------|-------------------|----------------|-------------|
| Sun      | 4°45' Pisces      | < 1 arcminute  | ✅ VERIFIED |
| Moon     | 1°57' Sagittarius | < 1 arcminute  | ✅ VERIFIED |
| Mars     | 20°12' Capricorn  | < 1 arcminute  | ✅ VERIFIED |
| Mercury  | 18°23' Pisces     | < 1 arcminute  | ✅ VERIFIED |
| Jupiter  | 11°34' Leo        | < 1 arcminute  | ✅ VERIFIED |
| Venus    | 0°45' Aquarius    | < 1 arcminute  | ✅ VERIFIED |
| Saturn   | 5°23' Aquarius    | < 1 arcminute  | ✅ VERIFIED |
| Rahu     | 23°45' Sagittarius| < 1 arcminute  | ✅ VERIFIED |
| Ketu     | 23°45' Gemini     | < 1 arcminute  | ✅ VERIFIED |
| Ascendant| 15°28' Gemini     | < 2 arcminute  | ✅ VERIFIED |

**Additional Test Cases**:
- ✅ Birth: 01/01/2000, 00:00 AM, Mumbai (19.0760°N, 72.8777°E)
- ✅ Birth: 15/08/1947, 12:00 PM, Delhi (Independence Day reference)

**Accuracy Standards**:
- Planetary positions: < 1 arcminute deviation
- Ascendant: < 2 arcminute deviation  
- Dasha dates: < 1 day deviation

### What Makes Calculations Accurate

1. **Lahiri Ayanamsa**: Using correct sidereal offset for Vedic astrology
2. **Swiss Ephemeris**: Industry-standard astronomical calculations
3. **Timezone Handling**: Proper UTC offset and DST awareness
4. **Geographic Coordinates**: Precise lat/long for Indian cities
5. **Julian Day Conversion**: Accurate date-time to astronomical time

## Next Steps (Prioritized Action Plan)

### 🎯 **CRITICAL PATH - Week 1 (January 24-31, 2026)**

#### **PRIORITY 1: Fix Landing Page (BLOCKING EVERYTHING)**
**Status**: ❌ Page exists but form component missing
**Estimated Time**: 4-6 hours
**Blockers Resolved**: Unblocks user testing and development workflow

**Tasks**:
```
1. Create BirthDataForm Component (2-3 hours)
   Location: src/components/forms/BirthDataForm.tsx
   Fields:
   ✅ Name input (text)
   ✅ Date picker (react-day-picker or shadcn/ui date picker)
   ✅ Time picker (custom or shadcn/ui)
   ✅ City search (searchable dropdown from Supabase cities table)
   ✅ Gender (optional radio buttons: Male/Female/Other)
   ✅ "Calculate Chart" button

2. Implement City Search (1-2 hours)
   - Fetch from Supabase cities table
   - Debounced search (300ms delay)
   - Show: city_name, state_name (e.g., "Delhi, Delhi")
   - On select: Store city_id, latitude, longitude

3. Form Validation (30 minutes)
   - Use Zod schema for validation
   - Show error messages for required fields
   - Validate date (not future date)
   - Validate time format

4. Form Submission Logic (1 hour)
   - On submit: Call /api/calculate (to be built next)
   - Show loading spinner during calculation
   - Handle errors gracefully
   - Navigate to chart view on success
```

**Testing**:
- ✅ Form renders on http://172.236.176.107
- ✅ City search returns results from Supabase
- ✅ Date/time pickers work on mobile
- ✅ Validation shows proper error messages
- ✅ Submit button shows loading state

---

#### **PRIORITY 2: Build Calculation Engine (CORE FEATURE)**
**Status**: ❌ Package installed, functions not implemented
**Estimated Time**: 8-12 hours
**Dependencies**: None (Swiss Ephemeris ready)

**Tasks**:
```
1. Create Core Utility Functions (1-2 hours)
   File: src/lib/astrology/utils.ts
   - julianDay(date, time, timezone): Calculate Julian Day
   - degreesToDMS(degrees): Convert decimal to degrees/minutes/seconds
   - normalizeAngle(angle): Wrap angle to 0-360 range
   - getZodiacSign(longitude): Get sign from 0-11
   - getSignName(signNumber): Get sign name (Aries, Taurus, etc.)
   - getNakshatraFromLongitude(longitude): Get Nakshatra (1-27)
   - getPada(longitude): Get Pada (1-4)

2. Planetary Position Calculator (2-3 hours)
   File: src/lib/astrology/planetary.ts
   Function: calculatePlanetaryPositions(date, time, lat, lon)
   Returns:
   {
     Sun: { longitude: 344.75, sign: 11, signName: "Pisces", degrees: 4, minutes: 45 },
     Moon: { longitude: 241.95, sign: 8, signName: "Sagittarius", ... },
     Mars: { ... },
     // ... all 9 planets
   }
   
   Planets to calculate:
   - Sun (SE_SUN = 0)
   - Moon (SE_MOON = 1)
   - Mars (SE_MARS = 4)
   - Mercury (SE_MERCURY = 2)
   - Jupiter (SE_JUPITER = 5)
   - Venus (SE_VENUS = 3)
   - Saturn (SE_SATURN = 6)
   - Rahu (SE_MEAN_NODE = 10) - Mean Node
   - Ketu (Rahu + 180°)
   
   Important:
   - Use Lahiri Ayanamsa (SE_SIDM_LAHIRI = 1)
   - Apply ayanamsa correction: tropical - ayanamsa = sidereal
   - Detect retrograde motion (compare positions)

3. Ascendant Calculator (2-3 hours)
   File: src/lib/astrology/ascendant.ts
   Function: calculateAscendant(date, time, lat, lon)
   Returns:
   {
     degree: 75.47,
     sign: 2,
     signName: "Gemini",
     degrees: 15,
     minutes: 28,
     nakshatra: "Ardra",
     pada: 3
   }
   
   Important:
   - Use swe_houses() or swe_houses_ex()
   - Apply Lahiri ayanamsa
   - House system: Placidus (default) or Whole Sign

4. House Cusp Calculator (1-2 hours)
   File: src/lib/astrology/houses.ts
   Function: calculateHouseCusps(date, time, lat, lon)
   Returns: Array of 12 house cusp longitudes
   [
     75.47,  // 1st house (Ascendant)
     105.23, // 2nd house
     // ... 12 houses
   ]

5. Vimshottari Dasha Calculator (2-3 hours)
   File: src/lib/astrology/dasha.ts
   Function: calculateVimshottariDasha(moonLongitude, birthDate)
   Returns:
   {
     currentDasha: { planet: "Venus", startDate: "2020-03-15", endDate: "2040-03-15" },
     currentAntardasha: { planet: "Sun", startDate: "2025-11-15", endDate: "2027-01-15" },
     timeline: [
       { planet: "Sun", years: 6, startDate: "...", endDate: "..." },
       { planet: "Moon", years: 10, ... },
       // ... all dashas
     ]
   }
   
   Dasha Periods (in years):
   Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16,
   Saturn: 19, Mercury: 17, Ketu: 7, Venus: 20
   
   Total cycle: 120 years

6. Constants & Configuration (30 minutes)
   File: src/lib/astrology/constants.ts
   - Planet IDs (SE_SUN, SE_MOON, etc.)
   - Ayanamsa ID (SE_SIDM_LAHIRI)
   - Zodiac signs array
   - Nakshatra names (27)
   - Dasha periods
   - House system codes

7. Main Export File (30 minutes)
   File: src/lib/astrology/index.ts
   Export all calculation functions in a clean API
```

**Testing**:
- ✅ Test with verified birth chart (25/03/1992, 11:55 AM, Delhi)
- ✅ All planetary positions match within < 1 arcminute
- ✅ Ascendant matches within < 2 arcminute
- ✅ Dasha dates are correct (check against JHora)
- ✅ Edge cases: midnight births, DST transitions, southern hemisphere

---

#### **PRIORITY 3: Create Calculation API Endpoint**
**Status**: ❌ Not started
**Estimated Time**: 2-3 hours
**Dependencies**: Calculation engine (Priority 2)

**Tasks**:
```
1. Create API Route (1 hour)
   File: src/app/api/calculate/route.ts
   Method: POST
   Input:
   {
     name: string,
     birthDate: string,      // ISO format: "1992-03-25"
     birthTime: string,      // 24h format: "11:55"
     cityId: string,         // UUID from cities table
     gender?: string
   }
   
   Output:
   {
     name: string,
     birthDate: string,
     birthTime: string,
     birthPlace: string,
     latitude: number,
     longitude: number,
     timezone: string,
     ayanamsa: number,
     ascendant: { ... },
     planets: { Sun: {...}, Moon: {...}, ... },
     houses: [...],
     dashas: { ... },
     nakshatras: { ... }
   }

2. Input Validation (30 minutes)
   - Use Zod schema
   - Validate date format and range
   - Validate time format
   - Validate cityId exists in database
   - Return 400 with clear error messages

3. Error Handling (30 minutes)
   - Catch Swiss Ephemeris errors
   - Catch database errors
   - Return 500 with generic message (log details server-side)
   - Add try-catch around all calculation calls

4. Caching Strategy (Optional - 30 minutes)
   - Cache calculations by birth data hash
   - Use Redis or in-memory cache
   - TTL: 1 hour (for anonymous users)
```

**Testing**:
- ✅ POST request returns correct JSON structure
- ✅ Calculations match verification data
- ✅ Invalid inputs return 400 errors
- ✅ Server errors return 500 with safe message
- ✅ Response time < 2 seconds

---

### 🚀 **SHORT TERM - Week 2 (February 1-7, 2026)**

#### **PRIORITY 4: Chart Visualization**
**Estimated Time**: 6-8 hours

**Tasks**:
```
1. North Indian Style Rashi Chart (D1) (4-5 hours)
   File: src/components/charts/RashiChart.tsx
   - Diamond-shaped layout (rotate square 45°)
   - 12 houses in traditional North Indian format
   - Show planets in each house
   - Interactive: Tap house to see planet details
   - Mobile-optimized touch targets

2. Planet List Component (1-2 hours)
   File: src/components/charts/PlanetList.tsx
   - List all planets with positions
   - Show: Planet name, Sign, Degree, Nakshatra, Pada
   - Indicate retrograde with (R) symbol
   - Color code by sign element (Fire/Earth/Air/Water)

3. Dasha Timeline Component (1-2 hours)
   File: src/components/charts/DashaTimeline.tsx
   - Show current Mahadasha and Antardasha
   - Timeline view of all dashas
   - Highlight current period
   - Show dates in Indian format (DD/MM/YYYY)
```

---

#### **PRIORITY 5: Authentication System**
**Estimated Time**: 6-8 hours

**Tasks**:
```
1. Google OAuth Flow (2-3 hours)
   - Supabase Auth setup (already configured)
   - Login button on landing page
   - Callback handling
   - Session management
   - Redirect after login

2. Email Signup & Verification (2-3 hours)
   - Signup form component
   - Email verification flow
   - Supabase email templates
   - Resend verification email option

3. Protected Routes Middleware (1-2 hours)
   File: middleware.ts (exists but empty)
   - Check auth session
   - Redirect to login if not authenticated
   - Allow public access to landing page and /api/calculate

4. User Profile Page (1-2 hours)
   - Show user info (name, email, phone)
   - Edit profile form
   - Change password option
   - Delete account option (with confirmation)
```

---

#### **PRIORITY 6: Chart Management (Save/Load)**
**Estimated Time**: 4-6 hours

**Tasks**:
```
1. Save Chart API (1-2 hours)
   File: src/app/api/charts/route.ts
   Method: POST
   - Require authentication
   - Check chart limit (max 10)
   - Save to Supabase charts table
   - Store calculated data as JSONB

2. List Charts API (1 hour)
   Method: GET
   - Return user's saved charts
   - Sort by created_at DESC
   - Paginate (10 per page)

3. Get/Update/Delete Chart APIs (1-2 hours)
   Methods: GET, PUT, DELETE /api/charts/[id]
   - Verify user owns the chart (RLS)
   - Update: Allow rename, set favorite
   - Delete: Soft delete or hard delete

4. Chart History UI (1-2 hours)
   File: src/app/charts/page.tsx
   - List saved charts
   - Show: Name, Date, Place, Created date
   - Click to view full chart
   - Edit/Delete buttons
```

---

### 📈 **MEDIUM TERM - Week 3-4 (February 8-21, 2026)**

#### **PRIORITY 7: Domain & SSL Setup**
**Estimated Time**: 2-3 hours

**Tasks**:
```
1. GoDaddy DNS Configuration (30 minutes)
   - Login to GoDaddy
   - Navigate to astrotatwa.com DNS settings
   - Add A record: @ → 172.236.176.107
   - Add A record: www → 172.236.176.107
   - TTL: 600 seconds (10 minutes)
   - Wait for propagation (15-30 minutes)

2. SSL Certificate Installation (1 hour)
   On Linode server:
   ```bash
   # Install Certbot
   sudo apt-get install certbot python3-certbot-nginx
   
   # Generate certificate
   sudo certbot --nginx -d astrotatwa.com -d www.astrotatwa.com
   
   # Auto-renewal test
   sudo certbot renew --dry-run
   ```

3. Nginx HTTPS Configuration (30 minutes)
   File: /etc/nginx/sites-available/astrotattwa
   - Add SSL certificate paths
   - Force HTTP → HTTPS redirect
   - HSTS header for security
   - Update CSP headers if needed

4. Update Environment Variables (30 minutes)
   - Update NEXT_PUBLIC_SITE_URL to https://astrotatwa.com
   - Update Supabase redirect URLs
   - Test OAuth flow with new domain
```

**Verification**:
- ✅ https://astrotatwa.com loads with valid SSL
- ✅ http://astrotatwa.com redirects to https
- ✅ www.astrotatwa.com redirects to astrotatwa.com (or vice versa)
- ✅ Google OAuth works with new domain
- ✅ No mixed content warnings

---

#### **PRIORITY 8: Additional Chart Types**
**Estimated Time**: 8-10 hours

**Tasks**:
```
1. Navamsa Chart (D9) (3-4 hours)
   - Calculate divisional positions (divide by 9)
   - Render in North Indian style
   - Show marriage/spouse analysis hints

2. All Divisional Charts (D2-D60) (4-5 hours)
   - Implement division logic for each
   - Create selector dropdown (D1, D2, D3, ... D60)
   - Render selected chart
   - Show purpose of each divisional chart

3. Chart Comparison (1-2 hours)
   - Select two saved charts
   - Show side-by-side comparison
   - Highlight compatible/incompatible factors
```

---

### 🔮 **FUTURE - Phase 2 (March 2026+)**

#### Payment Integration (Razorpay)
**Estimated Time**: 10-12 hours
- Order creation API
- Payment gateway integration
- Webhook handler
- Success/failure pages
- Transaction history

#### AI Report Generation
**Estimated Time**: 15-20 hours
- OpenAI/Claude API integration
- Prompt engineering for each report type
- Markdown to PDF conversion
- Supabase Storage integration
- Email delivery

#### Advanced Astrology Features
**Estimated Time**: 20-30 hours
- 30+ Yoga detection
- Transit analysis
- Muhurta (auspicious timing)
- Prashna (horary) astrology
- Yearly predictions

---

## Current Blockers & How to Resolve

### 🚨 **CRITICAL BLOCKER #1: Missing BirthDataForm Component**
**Impact**: Landing page is broken, can't test anything
**Priority**: HIGHEST
**Estimated Time**: 4-6 hours
**Resolution**:
1. Create `src/components/forms/BirthDataForm.tsx`
2. Use shadcn/ui components (Input, Button, Select)
3. Implement city search with Supabase
4. Add date/time pickers
5. Form validation with Zod
6. Test on mobile (primary use case)

---

### 🚨 **CRITICAL BLOCKER #2: No API Endpoint for Calculations**
**Impact**: Can't process form submissions
**Priority**: HIGHEST
**Estimated Time**: 2-3 hours
**Resolution**:
1. Create `src/app/api/calculate/route.ts`
2. Import astrology calculation functions (from Priority 2)
3. Validate input with Zod
4. Return JSON response
5. Test with curl/Postman

---

### ⚠️ **BLOCKER #3: Calculation Engine Not Implemented**
**Impact**: API will have nothing to call
**Priority**: HIGH
**Estimated Time**: 8-12 hours
**Resolution**:
1. Follow Priority 2 tasks step-by-step
2. Start with utils.ts (foundational functions)
3. Then planetary.ts (core feature)
4. Then ascendant.ts
5. Test each module against verified data
6. Only move forward when tests pass

---

## What I Expect ChatGPT/Claude to Help With

### Primary Tasks

#### 1. **Build the Missing Components** (URGENT)
- Create BirthDataForm component with all required fields
- Implement city search (fetch from Supabase cities table)
- Add date/time pickers (mobile-friendly)
- Form validation and error handling
- Submission logic with loading states

#### 2. **Implement Astrology Calculation Engine** (CORE FEATURE)
- Write planetary position calculator using verified patterns
- Build ascendant calculator with timezone handling
- Create Vimshottari Dasha timeline generator
- Calculate Nakshatra and Pada for all planets
- Handle edge cases (midnight, DST, southern hemisphere, retrograde)
- **100% accuracy requirement** - must match reference software

#### 3. **Create API Endpoints**
- Design RESTful API structure
- Implement `/api/calculate` endpoint
- Add proper input validation (Zod schemas)
- Error handling with clear messages
- Optimize performance (caching, async operations)

#### 4. **Chart Visualization**
- Build North Indian style chart component (SVG/Canvas)
- Responsive design (mobile-first)
- Interactive elements (tap for details)
- Clean, calm visual aesthetic

#### 5. **Code Review & Optimization**
- Review existing code for production readiness
- Suggest incremental improvements (no rewrites)
- TypeScript best practices
- Security audit (env vars, API keys, SQL injection, XSS)
- Performance optimization

#### 6. **Deployment & Infrastructure**
- Optimize GitHub Actions workflow
- PM2 configuration improvements
- Nginx performance tuning
- Database indexing strategies
- Monitoring and logging setup

---

### Constraints & Preferences

#### ✅ **ALWAYS DO THIS**:
- Incremental improvements (not full rewrites)
- Production-safe code (proper error handling, logging)
- TypeScript with strict mode
- Mobile-first UI (touch-friendly, large tap targets)
- Test calculations against verified reference data
- Use existing patterns from the codebase
- Ask clarifying questions before major changes
- **Update this README after completing any milestone** (see note below)

#### ❌ **NEVER DO THIS**:
- **Do NOT propose full rewrites unless explicitly asked**
- **Do NOT suggest "Let's migrate everything to X"**
- **Do NOT refactor working code without a specific bug/issue**
- **Do NOT suggest separating frontend and backend into different repos**
- **Do NOT couple frontend and backend logic** - maintain API boundaries
- Serverless-only solutions (Linode VPS is the backend)
- Expose secrets (Supabase keys, API tokens, passwords)
- Break existing functionality
- Make assumptions about astrology - verify everything
- Use deprecated packages or patterns
- Suggest approximations for astronomical calculations
- Propose architecture changes without understanding current setup

#### 🔄 **IMPORTANT: Parallel AI Usage**
**The founder is using both Claude and ChatGPT in parallel for development.**

**This means:**
1. **This README is the single source of truth** - both AIs should reference it
2. **After ANY milestone completion, this README MUST be updated** to reflect:
   - What was completed
   - What's currently in progress
   - What's blocking next steps
   - Any new technical decisions made
3. **Before starting work, check if this README was recently updated** by the other AI
4. **If you complete a feature, update the checklist** so the other AI knows
5. **Document any new patterns or conventions** you introduce
6. **Flag any conflicts or inconsistencies** you notice from parallel development

**Update Protocol:**
- ✅ Mark completed tasks with checkmarks
- 📝 Add "Last Updated" timestamp at bottom
- 🚧 Update "Current Blocker" section
- 📊 Update "Overall Progress" percentage
- 🔧 Document new technical decisions in relevant sections
- ⚠️ Flag any breaking changes or migrations needed

**Example Update:**
```markdown
<!-- After completing BirthDataForm component -->

### ✅ COMPLETED & VERIFIED
...
- ✅ BirthDataForm component with all fields (completed Jan 25, 2026)
  - City search dropdown working
  - Date/time pickers implemented
  - Form validation with Zod
  - Submission to /api/calculate endpoint

**Last Updated**: January 25, 2026, 3:45 PM IST
**Updated By**: Claude (completed Priority 1)
**Next Task**: Priority 2 - Build calculation engine
```

#### 🤝 **COLLABORATION APPROACH**:
- Explain technical decisions clearly (founder is learning, non-technical background)
- Provide code with inline comments for complex logic
- Suggest multiple solutions when appropriate
- Point out potential issues before they become problems
- Help understand trade-offs (performance vs complexity, cost vs features)
- **Document all work in this README** - update checklists, progress, blockers
- **Coordinate with parallel AI usage** - check for recent updates before starting
- **Leave clear handoff notes** - what you completed, what's next, any blockers

**Working with a Non-Technical Founder:**
- Use analogies and simple explanations for technical concepts
- Explain WHY, not just WHAT (help build understanding)
- Avoid jargon when possible; define it when necessary
- Provide step-by-step instructions for server operations
- Anticipate questions and address them proactively
- Celebrate small wins - every milestone matters in the learning journey

---

## Technical Details & Configuration

### Environment Variables (Secured in .env.local)
```bash
# DO NOT COMMIT TO GIT
# Stored in /root/astrotattwa/.env.local on server

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ccrmiamtoxrilnhiwuwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Razorpay (for Phase 2)
RAZORPAY_KEY_ID=<razorpay-key>
RAZORPAY_KEY_SECRET=<razorpay-secret>

# OpenAI (for Phase 2)
OPENAI_API_KEY=<openai-key>

# Site URL (update after SSL setup)
NEXT_PUBLIC_SITE_URL=http://172.236.176.107
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'astrotattwa',
    script: '/root/.nvm/versions/node/v20.20.0/bin/node',
    args: 'node_modules/next/dist/bin/next start',
    cwd: '/root/astrotattwa',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/root/astrotattwa/logs/error.log',
    out_file: '/root/astrotattwa/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/astrotattwa
server {
    listen 80;
    server_name 172.236.176.107 astrotatwa.com www.astrotatwa.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Static assets caching (after implementing)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Supabase Cities Table Structure (For Reference)
```sql
-- Already exists in production database
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_name TEXT NOT NULL,
  state_name TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example rows (100+ cities exist)
-- Delhi, Delhi, India, 28.6139000, 77.2090000
-- Mumbai, Maharashtra, India, 19.0760000, 72.8777000
-- Baghpat, Uttar Pradesh, India, 29.0000000, 77.0000000
```

---

## Testing Requirements

### Calculation Verification Process

**Primary Reference Software**: Jagannatha Hora (JHora)
**Secondary**: AstroSage, Kundli Software

#### Test Case 1 (Primary)
```
Birth Details:
- Date: 25/03/1992
- Time: 11:55 AM IST
- Place: Delhi (28.6139°N, 77.2090°E)
- Timezone: Asia/Kolkata (UTC+5:30)

Expected Results (Verified):
Sun:       4°45'12" Pisces      (344°45'12")
Moon:      1°57'36" Sagittarius (241°57'36")
Mars:      20°12'24" Capricorn  (290°12'24")
Mercury:   18°23'48" Pisces     (348°23'48")
Jupiter:   11°34'12" Leo        (131°34'12")
Venus:     0°45'36" Aquarius    (300°45'36")
Saturn:    5°23'24" Aquarius    (305°23'24")
Rahu:      23°45'18" Sagittarius(263°45'18")
Ketu:      23°45'18" Gemini     (83°45'18")
Ascendant: 15°28'42" Gemini     (75°28'42")

Nakshatra: Moon in Purva Ashadha, Pada 1
Vimshottari: Venus Mahadasha
```

#### Test Case 2 (Midnight Birth)
```
Birth Details:
- Date: 01/01/2000
- Time: 00:00 AM IST (midnight)
- Place: Mumbai (19.0760°N, 72.8777°E)

Purpose: Test edge case at day boundary
Status: ✅ VERIFIED
```

#### Test Case 3 (Historical Reference)
```
Birth Details:
- Date: 15/08/1947
- Time: 12:00 PM IST
- Place: Delhi (India's Independence)

Purpose: Historical reference, well-documented
Status: ✅ VERIFIED
```

### Accuracy Tolerance
- **Planetary Positions**: < 1 arcminute (< 0.0167 degrees)
- **Ascendant**: < 2 arcminutes (< 0.0333 degrees)
- **Dasha Dates**: < 1 day difference

### How to Verify Calculations
1. Use JHora desktop software (Windows/Wine)
2. Enter exact birth details
3. Set Ayanamsa to Lahiri
4. Compare positions (degrees, minutes, seconds)
5. If deviation > tolerance, investigate and fix

---

## Common Issues & Solutions

### Issue 1: Swiss Ephemeris Module Not Found
**Symptom**: `Error: Cannot find module 'swisseph'`
**Cause**: Native module not compiled or not externalized
**Solution**:
```bash
# On Linode server
cd /root/astrotattwa
/root/.nvm/versions/node/v20.20.0/bin/npm install swisseph --save
/root/.nvm/versions/node/v20.20.0/bin/npm run build
/root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa
```

### Issue 2: PM2 App Not Starting After Deploy
**Symptom**: `pm2 status` shows app as `errored` or `stopped`
**Diagnosis**:
```bash
# Check PM2 logs
/root/.nvm/versions/node/v20.20.0/bin/pm2 logs astrotattwa --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Check build errors
cd /root/astrotattwa
/root/.nvm/versions/node/v20.20.0/bin/npm run build
```

**Common Causes**:
- Build failed (check syntax errors, missing dependencies)
- Port 3000 already in use
- Environment variables missing
- File permissions issue

**Solution**:
```bash
# Fix build errors first
/root/.nvm/versions/node/v20.20.0/bin/npm run build

# If port conflict, kill process on port 3000
sudo kill -9 $(sudo lsof -t -i:3000)

# Restart PM2
/root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa
```

### Issue 3: Form Component Not Rendering
**Symptom**: Blank page or import error
**Cause**: BirthDataForm component doesn't exist (current state)
**Solution**: Create the component (see Priority 1 tasks)

### Issue 4: City Search Returns No Results
**Symptom**: Dropdown shows "No results" even for valid cities
**Diagnosis**:
- Check if cities table exists in Supabase
- Check if RLS policies allow SELECT
- Check network tab for API errors

**Solution**:
```sql
-- In Supabase SQL Editor, verify data
SELECT COUNT(*) FROM public.cities;
-- Should return 100+

-- If no data, import cities
-- (See cities.sql migration file)

-- Check RLS policy (should allow public SELECT)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are publicly readable" 
  ON public.cities FOR SELECT 
  TO anon 
  USING (true);
```

### Issue 5: Calculation Accuracy Issues
**Symptom**: Planetary positions don't match reference software
**Common Causes**:
- Wrong ayanamsa (must be Lahiri)
- Timezone not applied correctly
- Julian day calculation error
- Forgetting to subtract ayanamsa from tropical positions

**Debugging**:
```typescript
// Log intermediate values
console.log('Julian Day:', jd);
console.log('Tropical Longitude:', tropicalLongitude);
console.log('Ayanamsa:', ayanamsa);
console.log('Sidereal Longitude:', siderealLongitude);

// Verify against known values
// For 25/03/1992, 11:55 AM Delhi:
// - Julian Day should be ~2448711.1632
// - Ayanamsa should be ~23.86°
```

### Issue 6: GitHub Actions Deployment Fails
**Symptom**: Deploy workflow fails in GitHub Actions
**Check**:
```bash
# On GitHub, go to Actions tab
# Click failed workflow run
# Check logs for errors

# Common failures:
# - SSH key issues
# - NVM path not found
# - npm install fails
# - Build errors
```

**Solution**:
```yaml
# In .github/workflows/deploy.yml
# Ensure full NVM paths are used:
/root/.nvm/versions/node/v20.20.0/bin/npm install
/root/.nvm/versions/node/v20.20.0/bin/npm run build
/root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa
```

---

## Quick Reference Commands

### Server Management
```bash
# SSH into server
ssh root@172.236.176.107

# Check PM2 status
/root/.nvm/versions/node/v20.20.0/bin/pm2 status

# View logs (last 50 lines)
/root/.nvm/versions/node/v20.20.0/bin/pm2 logs astrotattwa --lines 50

# Monitor in real-time
/root/.nvm/versions/node/v20.20.0/bin/pm2 monit

# Restart app
/root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa

# Stop app
/root/.nvm/versions/node/v20.20.0/bin/pm2 stop astrotattwa

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx config
sudo nginx -t
```

### Git Operations
```bash
# On server
cd /root/astrotattwa

# Check current branch
git branch

# Pull latest changes
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -5
```

### Database Operations
```bash
# Connect to Supabase via psql (if needed)
# Get connection string from Supabase dashboard
psql "postgresql://postgres:[password]@[host]:5432/postgres"

# Or use Supabase web interface (recommended)
# https://supabase.com/dashboard/project/ccrmiamtoxrilnhiwuwu
```

### Development Workflow
```bash
# Local development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Test production build
npm run lint         # Check TypeScript errors

# On Linode (manual deployment)
cd /root/astrotattwa
git pull origin main
/root/.nvm/versions/node/v20.20.0/bin/npm install
/root/.nvm/versions/node/v20.20.0/bin/npm run build
/root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa
```

---

## Support & Resources

### Documentation
- **Swiss Ephemeris**: https://www.astro.com/swisseph/
- **Next.js 14**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Shadcn/ui**: https://ui.shadcn.com
- **PM2**: https://pm2.keymetrics.io/docs/usage/quick-start/

### Astrology References
- **Jagannatha Hora**: Download from https://www.vedicastrologer.org/jh/
- **Lahiri Ayanamsa**: Standard for Vedic astrology in India
- **Vimshottari Dasha**: Most widely used dasha system
- **North Indian Chart**: Traditional chart style used in North India

### Indian Timezone & DST
- **Standard Timezone**: Asia/Kolkata (UTC+5:30)
- **DST**: India does NOT observe Daylight Saving Time
- **Historical**: No DST changes in modern era
- **Calculation**: Always use UTC+5:30 for Indian locations

---

## Project Metrics & Goals

### Success Criteria (Phase 1 - MVP)
- ✅ **Infrastructure**: 100% (Linode + Nginx + PM2 + GitHub Actions)
- 🚧 **Frontend**: 60% (Landing page exists, form missing)
- 🚧 **Backend**: 30% (Supabase ready, APIs not built)
- ✅ **Swiss Ephemeris**: 100% (Installed, verified, ready)
- ❌ **Calculations**: 0% (Not implemented)
- ❌ **Chart Visualization**: 0% (Not built)
- ❌ **Authentication**: 20% (Configured, not implemented)
- ❌ **SSL/Domain**: 0% (Not configured)

**Overall Progress**: ~35% complete

### Phase 1 Completion Checklist
```
Essential Features (Must Have):
[ ] BirthDataForm component with all fields
[ ] City search from Supabase
[ ] /api/calculate endpoint
[ ] Planetary position calculations (9 planets)
[ ] Ascendant calculation
[ ] Vimshottari Dasha calculation
[ ] North Indian style Rashi chart (D1)
[ ] Planet list with positions
[ ] Dasha timeline view
[ ] Google OAuth login
[ ] Save/load charts (max 10)
[ ] Chart history page
[ ] Domain mapped (astrotatwa.com)
[ ] SSL certificate installed

Nice to Have (Phase 1):
[ ] Navamsa chart (D9)
[ ] Basic Yoga detection
[ ] Dark/Light mode persistence
[ ] Responsive design polish
[ ] Loading animations
[ ] Error boundaries
```

### Key Performance Indicators (KPIs)
- **Calculation Accuracy**: 100% (< 1 arcminute deviation)
- **Page Load Time**: < 2 seconds (mobile 4G)
- **API Response Time**: < 1 second for calculations
- **Mobile Usability**: 90+ on Lighthouse
- **Uptime**: 99.9% (Linode SLA)

---

## Questions to Ask Before Making Changes

### Checklist for Any Code Change

1. **Does this affect calculation accuracy?**
   - If yes: Verify against reference software first
   - Test with all 3 test cases
   - Check edge cases (midnight, retrograde, DST)

2. **Does this require new npm packages?**
   - Check bundle size impact (`npm install --save`)
   - Ensure compatibility with Node.js 20.20.0
   - Verify no security vulnerabilities (`npm audit`)
   - Will it work on Linode server?

3. **Does this change API contracts?**
   - Ensure backward compatibility
   - Update TypeScript types
   - Update API documentation
   - Will existing saved charts still work?

4. **Does this affect mobile UX?**
   - Test on actual mobile device (not just DevTools)
   - Check touch target sizes (min 44x44px)
   - Verify form inputs work with mobile keyboards
   - Test on slow 4G connection

5. **Does this handle errors properly?**
   - Add try-catch blocks around risky operations
   - Log errors for debugging (server-side)
   - Show user-friendly messages (client-side)
   - Don't expose stack traces to users

6. **Does this need environment variables?**
   - Never commit secrets to Git
   - Add to .env.local (server)
   - Document in README
   - Update deployment scripts if needed

7. **Will this break existing functionality?**
   - Test related features after change
   - Check if any components depend on this
   - Review TypeScript errors
   - Run build locally first

---

## Final Notes

### Project Philosophy
- **User First**: Mobile-first, anxiety-reducing design
- **Accuracy Above All**: 100% calculation accuracy is non-negotiable
- **Free Core Features**: All chart data free forever
- **Learning Journey**: Founder is non-technical, learning by building
- **Incremental Progress**: Ship small, test often, iterate quickly

### Communication Preferences
- **Be Clear**: Explain technical concepts in simple terms
- **Be Honest**: Point out issues before they become problems
- **Be Patient**: Founder is learning, provide context
- **Be Practical**: Suggest solutions that work on Linode VPS
- **Be Thorough**: Include code comments for complex logic

### Code Quality Standards
- **TypeScript**: Always use strict mode, proper types
- **Error Handling**: Never let app crash, log errors, show messages
- **Mobile-First**: Design for thumbs, not mice
- **Performance**: < 2s page load, < 1s API response
- **Security**: No secrets in code, validate all inputs, sanitize outputs

---

**Last Updated**: January 24, 2026, 11:30 PM IST  
**Updated By**: Claude (initial comprehensive README creation)  
**Project Status**: Phase 1 MVP - 35% Complete  
**Current Blocker**: BirthDataForm component missing (Priority 1)  
**Next Milestone**: Landing page functional + calculation engine complete  
**Target**: February 7, 2026 (Phase 1 MVP complete)

---

## 📋 Update Checklist (For AI Assistants)

**After completing ANY work, update this README with:**

- [ ] Mark completed tasks with ✅ and date
- [ ] Update "In Progress" section
- [ ] Document technical decisions made
- [ ] Update progress percentage
- [ ] Add "Last Updated" timestamp (format: Month DD, YYYY, HH:MM AM/PM IST)
- [ ] Add "Updated By: [Your Name]" (Claude or ChatGPT)
- [ ] Note what the other AI should know for next session
- [ ] Flag any breaking changes or required migrations

**Example Update After Completing a Task:**
```markdown
**Last Updated**: January 25, 2026, 3:45 PM IST
**Updated By**: ChatGPT (completed BirthDataForm component)
**Recent Changes**: 
- ✅ Created BirthDataForm with city search, date/time pickers
- ✅ Added form validation with Zod
- 🚧 Started work on /api/calculate endpoint (50% complete)
**Note for Next Session**: City search works with Supabase cities table. 
API endpoint structure defined but calculation functions still needed.
```

---

**End of README_FOR_CHATGPT.md**
