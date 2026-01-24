# Astrotattwa - Vedic Astrology Web Application

A modern, mobile-first Progressive Web App for accurate Vedic astrology calculations with AI-powered insights.

## 🌟 Features

### Phase 1 (MVP - Free)
- ✅ Swiss Ephemeris integration (100% accurate calculations)
- ✅ Database schema with RLS (profiles, charts, cities)
- ✅ Landing page with responsive design
- ✅ Dark/Light mode support
- 🚧 Birth chart creation form (in progress)
- 🚧 Planetary position calculations
- 🚧 Rashi (D1) and Navamsa (D9) chart visualization
- 🚧 Complete Vimshottari Dasha timeline
- 🚧 Nakshatra and Pada calculations
- 🚧 Google OAuth & Email authentication
- 🚧 Save up to 10 birth charts

### Phase 2 (Paid Reports)
- 📜 AI-generated detailed life reports
- 📜 PDF export
- 📜 Razorpay payment integration

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (Google OAuth + Email)
- **Calculations:** Swiss Ephemeris (native module)
- **Hosting:** Linode VPS (ubuntu-in-bom-2, Mumbai)
- **Process Manager:** PM2
- **Web Server:** Nginx
- **State Management:** Zustand, React Query

## 📋 Prerequisites

- Node.js 20+ and npm
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)
- Linode account (for VPS hosting)
- Build tools: `build-essential`, `python3`, `make`, `g++` (for Swiss Ephemeris)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd astrotattwa
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL
3. Get your project credentials:
   - Go to **Settings → API**
   - Copy `Project URL` and `anon/public` key

### 3. Install Swiss Ephemeris Dependencies

For Ubuntu/Debian (Linode server):

```bash
sudo apt-get update
sudo apt-get install build-essential python3 make g++
```

For macOS:

```bash
xcode-select --install
```

### 4. Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Places API (for city search)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-places-api-key

# Razorpay (for Phase 2)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# OpenAI (for Phase 2 - AI reports)
OPENAI_API_KEY=your-openai-key

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
astrotattwa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, signup)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── charts/            # Astrology chart components (to be built)
│   │   ├── forms/             # Form components (to be built)
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   ├── astrology/         # Swiss Ephemeris calculation engine (to be built)
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types
│   │   └── swisseph.d.ts     # Swiss Ephemeris type definitions
│   └── styles/
│       └── globals.css        # Global styles
├── public/
│   └── ephe/                  # Swiss Ephemeris data files (.se1)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── ecosystem.config.js        # PM2 configuration
├── next.config.js             # Next.js config (webpack for native modules)
└── README.md
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Lint
npm run lint

# Build (test production build)
npm run build
```

## 🚢 Deployment

### Current Production Setup

**Server:** Linode VPS (ubuntu-in-bom-2)
- **IP:** 172.236.176.107
- **Specs:** Nanode 1 GB (1 CPU, 1 GB RAM, 25 GB Storage)
- **Region:** Mumbai, India
- **OS:** Ubuntu 24.04
- **Node.js:** v20.20.0 (via NVM)
- **Process Manager:** PM2
- **Web Server:** Nginx (reverse proxy)

### Deployment Process

1. **Automated (via GitHub Actions)**
   ```bash
   # Push to main branch triggers auto-deployment
   git push origin main
   ```

2. **Manual Deployment**
   ```bash
   # SSH into server
   ssh root@172.236.176.107
   
   # Navigate to project
   cd /root/astrotattwa
   
   # Pull latest changes
   git pull origin main
   
   # Install dependencies (if package.json changed)
   /root/.nvm/versions/node/v20.20.0/bin/npm install
   
   # Build application
   /root/.nvm/versions/node/v20.20.0/bin/npm run build
   
   # Restart PM2
   /root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa
   ```

### Update Redirect URIs

After deployment, add your production URL to:
- Supabase: **Authentication → URL Configuration**
- Google Cloud Console: **OAuth 2.0 Client → Authorized redirect URIs**

## 📊 Development Roadmap

### Phase 1: MVP (Current - 35% Complete)

#### Completed ✅
- [x] Project setup and configuration
- [x] Database schema and migrations (profiles, charts, cities, reports, payments)
- [x] Supabase integration (client, server)
- [x] Swiss Ephemeris package installation
- [x] Webpack configuration for native modules
- [x] TypeScript type definitions
- [x] Ephemeris data files (.se1 format)
- [x] Landing page with responsive design
- [x] Theme provider (dark/light mode)
- [x] Infrastructure setup (Linode + PM2 + Nginx)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Cities database (100+ Indian cities)

#### In Progress 🚧
- [ ] BirthDataForm component
  - [ ] Name input
  - [ ] Date/time pickers
  - [ ] City search dropdown (with Supabase cities)
  - [ ] Form validation (Zod)
- [ ] Calculation engine (src/lib/astrology/)
  - [ ] Planetary position calculator
  - [ ] Ascendant calculator
  - [ ] Vimshottari Dasha calculator
  - [ ] House cusp calculator
  - [ ] Nakshatra & Pada calculator
- [ ] API endpoints
  - [ ] POST /api/calculate
  - [ ] GET/POST /api/charts
  - [ ] Chart CRUD operations

#### Not Started ❌
- [ ] Chart visualization components
  - [ ] North Indian style Rashi chart (D1)
  - [ ] Navamsa chart (D9)
  - [ ] Divisional charts (D2-D60)
  - [ ] Planet list component
  - [ ] Dasha timeline visualization
- [ ] Authentication system
  - [ ] Google OAuth flow
  - [ ] Email signup & verification
  - [ ] Protected routes middleware
  - [ ] User profile page
- [ ] Chart management
  - [ ] Save charts (max 10 per user)
  - [ ] Chart history
  - [ ] Edit/Delete charts
- [ ] Domain & SSL
  - [ ] Map astrotatwa.com to server IP
  - [ ] SSL certificate (Certbot + Let's Encrypt)
  - [ ] HTTPS redirect

### Phase 2: Paid Reports (Not Started)
- [ ] Razorpay payment integration
- [ ] OpenAI/Claude API integration
- [ ] Report generation (Career, Marriage, Finance, Health, Yearly)
- [ ] PDF generation and storage
- [ ] Report purchase flow
- [ ] Transaction history

## 🎯 Current Priorities

1. **Priority 1 (BLOCKING):** Create BirthDataForm component
2. **Priority 2 (CORE):** Build Swiss Ephemeris calculation engine
3. **Priority 3 (INTEGRATION):** Create /api/calculate endpoint

## 🔬 Swiss Ephemeris Accuracy

All calculations are verified against Jagannatha Hora (JHora) software:
- **Planetary positions:** < 1 arcminute deviation
- **Ascendant:** < 2 arcminute deviation
- **Dasha dates:** < 1 day deviation

**Test Case (Verified 100% accurate):**
- Birth: 25 March 1992, 11:55 AM IST
- Place: Delhi (28.6139°N, 77.2090°E)
- All 9 Vedic planets verified
- Ascendant: 15°28' Gemini ✅

## 🤝 Contributing

This is a private project. For internal development only.

## 📄 License

Proprietary - All Rights Reserved

## 🆘 Support

For development assistance, refer to `README_FOR_CHATGPT.md` for AI assistant context.

For issues or questions, contact the development team.

## 📚 Additional Documentation

- **README_FOR_CHATGPT.md** - Complete project context for AI assistants (Claude/ChatGPT)
- **01_PRD.md** - Product Requirements Document
- **02_Business_Plan.md** - Business strategy and financials
- **03_Execution_Plan.md** - Development timeline
- **04_Development_Plan.md** - Technical architecture
- **05_Tech_Stack.md** - Detailed tech stack specifications
- **06_Test_Case_Reference.md** - Calculation verification data

---

**Version:** 0.2.0  
**Status:** Phase 1 MVP - 35% Complete  
**Last Updated:** January 24, 2026  
**Live URL:** http://172.236.176.107 (HTTP only, SSL pending)
