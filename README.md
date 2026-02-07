# Astrotattwa - Vedic Astrology Web Application

**Version:** 0.2.0  
**Status:** Production (Phase 1 Complete)  
**Live URL:** https://astrotattwa.com  
**Last Updated:** February 7, 2026

---

## 📋 Table of Contents

- [Overview](#overview)
- [Current Status](#current-status)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features](#features)
- [Development Workflow](#development-workflow)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Astrotattwa is a **mobile-first Progressive Web App** that provides accurate Vedic astrology calculations using Swiss Ephemeris. The platform follows a freemium model where all chart data is free, with detailed AI-powered reports available as paid features in future phases.

### Key Differentiators
- ✅ **100% Free Chart Data** - No login required to calculate
- ✅ **Swiss Ephemeris Precision** - Accurate to arcminutes
- ✅ **Mobile-First Design** - Optimized for touch and small screens
- ✅ **8 Divisional Charts** - D1, D2, D3, D7, D9, D10, D12, Moon Chart
- ✅ **4-Level Dasha System** - Mahadasha → Antardasha → Pratyantardasha → Sookshma
- ✅ **Lightning Fast** - 100/100 Lighthouse Performance Score

---

## 🚀 Current Status

### Production Environment
- **Live:** https://astrotattwa.com (SSL enabled via Cloudflare)
- **Server:** Linode VPS (Ubuntu, IP: 172.236.176.107)
- **Deployment:** Automated via GitHub Actions
- **Process Manager:** PM2 (`astrotattwa-web`)
- **Server Path:** `/var/www/astrotattwa-web`

### Completion Summary
- **Phase 1 (MVP):** ✅ **100% Complete**
- **Total Code:** ~6,222 lines (TypeScript/TSX)
- **Components:** 45+ reusable components
- **API Routes:** 10+ endpoints
- **Database Tables:** 5 (Supabase PostgreSQL)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3 (strict mode)
- **Styling:** Tailwind CSS 3.4
- **UI Library:** shadcn/ui (Radix UI primitives)
- **State Management:** Zustand 4.5
- **Theme:** next-themes (dark/light mode)
- **Animations:** Framer Motion 11.18

### Backend
- **Runtime:** Node.js 20.20.0
- **API:** Next.js API Routes
- **Database:** Supabase (PostgreSQL 15)
- **Auth:** Supabase Auth (configured, not active)
- **Calculations:** Swiss Ephemeris 0.5.17

### Deployment
- **Hosting:** Linode VPS (Mumbai region)
- **Web Server:** Nginx (reverse proxy)
- **Process Manager:** PM2
- **CI/CD:** GitHub Actions
- **SSL:** Cloudflare
- **Domain:** Cloudflare Registrar

### Development
- **Version Control:** Git + GitHub
- **Linting:** ESLint
- **Formatting:** Prettier
- **Package Manager:** npm

---

## 📁 Project Structure

```
astrotattwa-web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes (login, signup)
│   │   ├── chart/                    # Chart display page
│   │   ├── admin/                    # Admin/test pages
│   │   ├── api/                      # API routes
│   │   │   ├── calculate/            # Main calculation
│   │   │   ├── dasha/                # Dasha calculations
│   │   │   ├── avakahada/            # Avakahada data
│   │   │   └── cities/               # City search
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── forms/                    # Form components
│   │   │   ├── BirthDataForm.tsx
│   │   │   ├── DateTimeField.tsx
│   │   │   └── CitySearch.tsx
│   │   ├── chart/                    # Chart visualization
│   │   │   ├── diamond/              # Diamond chart (North Indian)
│   │   │   │   ├── DiamondChart.tsx
│   │   │   │   ├── DiamondGrid.tsx
│   │   │   │   ├── HouseBlock.tsx
│   │   │   │   └── constants.ts
│   │   │   ├── divisional/           # Divisional charts
│   │   │   │   ├── DivisionalChartsTab.tsx
│   │   │   │   ├── ChartSelector.tsx
│   │   │   │   ├── ChartEducation.tsx
│   │   │   │   ├── ChartInsights.tsx
│   │   │   │   └── DivisionalChartConfig.ts
│   │   │   ├── DashaNavigator.tsx
│   │   │   ├── PlanetaryTable.tsx
│   │   │   ├── AvakhadaTable.tsx
│   │   │   └── ChartFocusMode.tsx
│   │   └── layout/                   # Header, Footer
│   │
│   ├── lib/
│   │   ├── astrology/                # Calculation engine
│   │   │   ├── swissEph.ts           # Swiss Ephemeris wrapper
│   │   │   ├── time.ts               # Time conversions
│   │   │   └── kp/                   # KP System
│   │   │       ├── calculate.ts
│   │   │       ├── dasa.ts
│   │   │       ├── avakahada.ts
│   │   │       └── kpLords.ts
│   │   ├── utils/                    # Helper functions
│   │   │   ├── chartHelpers.ts       # Chart building
│   │   │   ├── divisional/           # Divisional calculations
│   │   │   │   ├── index.ts
│   │   │   │   ├── d2-hora.ts
│   │   │   │   ├── d3-drekkana.ts
│   │   │   │   ├── d7-saptamsa.ts
│   │   │   │   └── d12-dwadasamsa.ts
│   │   │   └── generateChartInsights.ts
│   │   └── validation/               # Zod schemas
│   │
│   ├── types/                        # TypeScript definitions
│   ├── stores/                       # Zustand stores
│   └── hooks/                        # Custom React hooks
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Database schema
│
├── public/                           # Static assets
├── .github/
│   └── workflows/                    # GitHub Actions
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎯 Getting Started

### Prerequisites
- Node.js 20.20.0 or higher
- npm or yarn
- Supabase account (for database)
- Swiss Ephemeris ephemeris files

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aakashjain1992-ship-it/astrotattwa-web.git
   cd astrotattwa-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # App
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run database migrations**
   ```bash
   # In Supabase SQL Editor, run:
   supabase/migrations/001_initial_schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

---

## ✅ Features

### Phase 1 (Complete) ✅

#### Core Calculations
- ✅ **9 Planets + Ascendant** - Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- ✅ **Lahiri Ayanamsa** - Standard Vedic ayanamsa
- ✅ **Nakshatra & Pada** - 27 nakshatras with pada calculations
- ✅ **KP System** - Sub-lords, cuspal positions
- ✅ **Planet Dignity** - Exaltation, Debilitation, Combustion, Retrograde
- ✅ **Vimshottari Dasha** - 4-level hierarchy (Maha → Antar → Pratyantar → Sookshma)
- ✅ **Avakahada Chakra** - 21 birth attributes

#### Divisional Charts (Vargas)
- ✅ **D1** - Lagna/Rashi (Main birth chart)
- ✅ **D2** - Hora (Wealth, financial status)
- ✅ **D3** - Drekkana (Siblings, courage)
- ✅ **D7** - Saptamsa (Children, progeny)
- ✅ **D9** - Navamsa (Marriage, dharma)
- ✅ **D10** - Dasamsa (Career, profession)
- ✅ **D12** - Dwadasamsa (Parents, ancestors)
- ✅ **Moon Chart** - Chandra Lagna (Mind, emotions)

#### Chart Visualization
- ✅ **North Indian Diamond Chart** - Interactive SVG
- ✅ **Multi-chart Focus Mode** - Swipeable comparison
- ✅ **Planet Stacking** - Multiple planets per house
- ✅ **Status Flags** - R (Retrograde), C (Combustion), D (Debilitation), S (Sub-lord)
- ✅ **Responsive Design** - Mobile, tablet, desktop
- ✅ **Dark/Light Mode** - Theme toggle

#### User Interface
- ✅ **Landing Page** - Hero, features, chart creation form
- ✅ **Birth Data Form** - Name, date, time, location
- ✅ **City Search** - Autocomplete with coordinates
- ✅ **Chart Display** - Tabbed interface (Overview, Dasha, Divisional)
- ✅ **Editable Details** - Modify birth data and recalculate
- ✅ **Planetary Table** - Sortable, filterable
- ✅ **Dasha Timeline** - Interactive navigation
- ✅ **Avakahada Table** - All 21 attributes

#### Technical Features
- ✅ **No Login Required** - Calculate charts without account
- ✅ **Type Safety** - TypeScript strict mode
- ✅ **Server Components** - Optimized React rendering
- ✅ **API Routes** - Modular calculation endpoints
- ✅ **Error Handling** - Graceful fallbacks
- ✅ **Loading States** - Smooth UX

### Phase 2 (Planned) 🚧

See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for detailed roadmap.

---

## 🔄 Development Workflow

### Branches
- **`main`** - Production branch (protected)
- **`dev`** - Development branch
- **Feature branches** - `feature/feature-name`

### Deployment Process
1. Make changes on Linode server (`/var/www/astrotattwa-web`)
2. Test locally
3. Commit and push to `dev` branch
4. Create PR: `dev` → `main`
5. GitHub Actions auto-deploys to Linode on merge

### PM2 Commands
```bash
# On Linode server
pm2 status                  # Check status
pm2 restart astrotattwa-web # Restart app
pm2 logs astrotattwa-web    # View logs
pm2 monit                   # Monitor resources
```

### Build Commands
```bash
npm run dev         # Development server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # TypeScript checking
```

---

## ⚡ Performance

### Lighthouse Scores (Feb 7, 2026)
- **Performance:** 💯 100/100
- **Accessibility:** 🟢 90/100
- **Best Practices:** 🟢 96/100
- **SEO:** 💯 100/100

### Core Web Vitals
- **First Contentful Paint (FCP):** 0.3s ⚡
- **Largest Contentful Paint (LCP):** 0.6s ⚡
- **Total Blocking Time (TBT):** 0ms ⚡
- **Cumulative Layout Shift (CLS):** 0.036 ✅
- **Speed Index (SI):** 0.3s ⚡

### Optimization Techniques
- Server-side rendering (SSR)
- Static generation where possible
- Image optimization (Next.js Image)
- Code splitting
- Tree shaking
- Lazy loading components
- Cloudflare CDN
- Gzip compression

---

## 🗄️ Database Schema

### Current Tables (Supabase)

#### `profiles`
```sql
- id (uuid, PK, references auth.users)
- email (text, not null)
- full_name (text)
- avatar_url (text)
- phone (text)
- phone_verified (boolean, default false)
- charts_limit (integer, default 10)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `charts`
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- name (text, not null)
- birth_date (date, not null)
- birth_time (time, not null)
- birth_place (text, not null)
- latitude (decimal)
- longitude (decimal)
- timezone (text)
- utc_offset (integer)
- ayanamsa (decimal)
- ascendant_degree (decimal)
- ascendant_sign (integer)
- moon_sign (integer)
- sun_sign (integer)
- nakshatra (text)
- nakshatra_pada (integer)
- planets (jsonb)         # All planetary data
- houses (jsonb)          # House cusps
- dashas (jsonb)          # Vimshottari dasha
- yogas (jsonb)           # Classical yogas
- is_favorite (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `cities`
```sql
- id (integer, PK)
- city_name (text, not null)
- state_name (text)
- country (text, not null)
- latitude (numeric)
- longitude (numeric)
- timezone (text)
- population (integer)
- search_text (text)      # For full-text search
- created_at (timestamptz)
```

#### `test_cases` & `test_case_runs`
Used for calculation verification and accuracy testing.

### Future Tables (Not Created Yet)
- `reports` - AI-generated reports (planned)
- `payments` - Razorpay transactions (planned)

### Migration Plan
Considering migration from Supabase to Linode-hosted PostgreSQL for better control and cost optimization. See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for details.

---

## 🔐 Security

### Current State
- ✅ HTTPS enabled (Cloudflare SSL)
- ✅ Environment variables for secrets
- ✅ Supabase Row Level Security (RLS) configured
- ✅ CORS configured
- ⏳ API authentication (planned for P3)
- ⏳ Rate limiting (planned)
- ⏳ Input sanitization (planned)

### Planned Improvements
- Add API authentication
- Implement rate limiting
- Add CSRF protection
- Implement input validation middleware
- Add security headers

---

## 🤝 Contributing

This is currently a solo project by Aakash with assistance from Claude and ChatGPT AI assistants.

### For AI Assistants
See [AI_HANDOFF_GUIDE.md](./AI_HANDOFF_GUIDE.md) for collaboration guidelines between Claude and ChatGPT.

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Server Components by default
- 'use client' only when needed
- Tailwind CSS for styling
- Mobile-first responsive design

---

## 📚 Documentation

- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Architecture and design decisions
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step setup guide
- **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** - Feature roadmap and priorities
- **[PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)** - Current completion status
- **[CODE_REFACTORING_GUIDE.md](./CODE_REFACTORING_GUIDE.md)** - Optimization opportunities
- **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** - Reusable components catalog
- **[AI_HANDOFF_GUIDE.md](./AI_HANDOFF_GUIDE.md)** - AI collaboration guide
- **[DIAMONDCHART_IMPROVEMENTS_TASK.md](./DIAMONDCHART_IMPROVEMENTS_TASK.md)** - Pending chart improvements

---

## 📊 Project Metrics

- **Lines of Code:** ~6,222
- **Components:** 45+
- **API Endpoints:** 10+
- **Database Tables:** 5
- **Lighthouse Score:** 100/100 (Performance)
- **TypeScript Coverage:** 100%
- **Mobile Responsive:** ✅ Yes
- **PWA Ready:** ⏳ Planned

---

## 📄 License

Proprietary - All rights reserved by Aakash Jain

---

## 🔗 Links

- **Live Site:** https://astrotattwa.com
- **Repository:** https://github.com/aakashjain1992-ship-it/astrotattwa-web
- **Documentation:** [docs/](./docs/)

---

## 📞 Support

For issues and questions, please create an issue on GitHub or contact the development team.

---

**Last Updated:** February 7, 2026  
**Version:** 0.2.0  
**Status:** Production (Phase 1 Complete)
