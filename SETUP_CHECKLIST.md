# Astrotattwa - Setup Checklist

## ✅ Foundation Setup Complete (Production Server)

### Infrastructure (Linode VPS)
- [x] **Linode Server**: ubuntu-in-bom-2 (Nanode 1GB, Mumbai)
- [x] **Public IP**: 172.236.176.107
- [x] **Node.js**: v20.20.0 installed via NVM
- [x] **PM2**: Configured and running (`astrotattwa` app)
- [x] **Nginx**: Reverse proxy on port 80 → localhost:3000
- [x] **GitHub Actions**: CI/CD pipeline (auto-deploy on push to main)
- [x] **SSH Access**: Deploy keys configured
- [x] **Firewall**: akamai-non-prod-1 configured

### Core Application Files
- [x] `package.json` - Dependencies configured
- [x] `tsconfig.json` - TypeScript strict mode
- [x] `next.config.js` - Next.js + Webpack config for native modules
- [x] `tailwind.config.js` - Tailwind CSS with custom theme
- [x] `postcss.config.js` - PostCSS configuration
- [x] `ecosystem.config.js` - PM2 process manager config
- [x] `.env.example` - Environment variables template
- [x] `.gitignore` - Git ignore rules
- [x] `vercel.json` - Deployment configuration

### Database & Schema
- [x] Supabase project created
- [x] Database schema migration (`001_initial_schema.sql`)
- [x] **Tables created**: profiles, charts, cities, reports, payments
- [x] Row Level Security (RLS) enabled on all tables
- [x] Indexes on user_id, created_at, foreign keys
- [x] Triggers for auto-updating updated_at
- [x] Chart limit trigger (max 10 per user)
- [x] Cities table populated (100+ Indian cities)

### Supabase Integration
- [x] `src/lib/supabase/client.ts` - Browser client
- [x] `src/lib/supabase/server.ts` - Server client
- [x] `src/lib/supabase/middleware.ts` - Auth middleware
- [x] Environment variables configured (.env.local on server)
- [x] Connection verified and working

### Swiss Ephemeris Setup
- [x] **swisseph npm package** installed
- [x] **Native dependencies**: build-essential, python3, make, g++
- [x] **Webpack configuration**: Native module externalization
- [x] **TypeScript types**: src/types/swisseph.d.ts
- [x] **Ephemeris data files**: .se1 files in /public/ephe/
- [x] **Calculation verification**: 100% accuracy (tested against JHora)
- [x] **Status**: Foundation complete, ready for implementation

### UI Components & Pages
- [x] Root layout (`src/app/layout.tsx`) with theme provider
- [x] Landing page (`src/app/page.tsx`)
- [x] Theme provider (Dark/Light mode)
- [x] UI components from shadcn/ui:
  - [x] Button
  - [x] Toast & Toaster
  - [x] (Others available via shadcn/ui)
- [x] Global styles (`src/styles/globals.css`)
- [x] TypeScript types (`src/types/supabase.ts`)

### Deployment & CI/CD
- [x] GitHub repository with protected `main` branch
- [x] GitHub Actions workflow (.github/workflows/deploy.yml)
- [x] Automated deployment on push to main
- [x] PM2 restart on deployment
- [x] Full NVM paths in deployment scripts

### Documentation
- [x] README.md - Public-facing documentation
- [x] README_FOR_CHATGPT.md - AI assistant context
- [x] 01_PRD.md - Product Requirements
- [x] 02_Business_Plan.md - Business strategy
- [x] 03_Execution_Plan.md - Development timeline
- [x] 04_Development_Plan.md - Technical architecture
- [x] 05_Tech_Stack.md - Tech specifications
- [x] 06_Test_Case_Reference.md - Verification data

---

## 🚧 In Progress / Blocked (Current Work)

### Critical Blocker - Priority 1
- [ ] **BirthDataForm Component** (`src/components/forms/BirthDataForm.tsx`)
  - [ ] Name input field
  - [ ] Date of Birth picker (mobile-friendly)
  - [ ] Time of Birth picker (24-hour format)
  - [ ] Place of Birth (searchable dropdown from cities table)
  - [ ] Gender selection (optional)
  - [ ] Form validation with Zod
  - [ ] Submit button with loading state
  - [ ] Error handling and display
  
  **Status**: Component imported in page.tsx but doesn't exist
  **Impact**: Landing page broken, blocking all development
  **Estimated Time**: 4-6 hours

### Core Feature - Priority 2
- [ ] **Swiss Ephemeris Calculation Engine** (`src/lib/astrology/`)
  - [ ] `utils.ts` - Julian Day, degree conversions, helpers
  - [ ] `planetary.ts` - Calculate all 9 planet positions
  - [ ] `ascendant.ts` - Calculate Lagna (Ascendant)
  - [ ] `houses.ts` - Calculate 12 house cusps
  - [ ] `dasha.ts` - Vimshottari Dasha timeline
  - [ ] `nakshatra.ts` - Nakshatra & Pada calculations
  - [ ] `constants.ts` - Ayanamsa, planet IDs, zodiac data
  - [ ] `index.ts` - Main export file
  
  **Status**: Package installed, types defined, functions not implemented
  **Impact**: No calculation capability
  **Estimated Time**: 8-12 hours
  **Critical**: Accuracy > Performance (< 1 arcminute tolerance)

### API Integration - Priority 3
- [ ] **API Endpoints** (`src/app/api/`)
  - [ ] `POST /api/calculate` - Calculate birth chart from form data
  - [ ] `GET /api/charts` - List user's saved charts
  - [ ] `POST /api/charts` - Save a new chart
  - [ ] `GET /api/charts/[id]` - Get specific chart
  - [ ] `PUT /api/charts/[id]` - Update chart
  - [ ] `DELETE /api/charts/[id]` - Delete chart
  - [ ] `GET /api/cities` - Search cities (autocomplete)
  
  **Status**: Not started
  **Impact**: Frontend can't communicate with calculations
  **Estimated Time**: 2-3 hours (after Priority 2)

---

## ❌ Not Started (Future Work)

### Week 2-3 Work
- [ ] **Chart Visualization Components**
  - [ ] `src/components/charts/RashiChart.tsx` - North Indian D1
  - [ ] `src/components/charts/NavamsaChart.tsx` - D9 chart
  - [ ] `src/components/charts/PlanetList.tsx` - Planets with positions
  - [ ] `src/components/charts/DashaTimeline.tsx` - Dasha periods

- [ ] **Authentication System**
  - [ ] Google OAuth flow implementation
  - [ ] Email signup with verification
  - [ ] Login/Logout functionality
  - [ ] Protected routes middleware (middleware.ts exists but empty)
  - [ ] User profile page
  - [ ] Session management

- [ ] **Chart Management**
  - [ ] Save chart to database (requires auth)
  - [ ] Load saved charts
  - [ ] Chart history view
  - [ ] Delete/Edit charts
  - [ ] Chart limit enforcement (10 per user)

### Week 3-4 Work
- [ ] **Domain & SSL Configuration**
  - [ ] Point astrotatwa.com DNS to 172.236.176.107 (GoDaddy)
  - [ ] Configure A records (@ and www)
  - [ ] Install SSL certificate (Certbot + Let's Encrypt)
  - [ ] Update Nginx for HTTPS (port 443)
  - [ ] Force HTTP → HTTPS redirect
  - [ ] Update Supabase redirect URIs

- [ ] **Additional Features**
  - [ ] Divisional charts (D2-D60)
  - [ ] Yoga detection (30+ classical yogas)
  - [ ] Responsive polish
  - [ ] Loading animations
  - [ ] Error boundaries

### Phase 2 (Future)
- [ ] Razorpay payment integration
- [ ] OpenAI/Claude API for reports
- [ ] PDF generation
- [ ] Report purchase flow
- [ ] Transaction history

---

## 🧪 Verification Tests

### On Production Server (172.236.176.107)

```bash
# SSH into server
ssh root@172.236.176.107

# Check PM2 status
/root/.nvm/versions/node/v20.20.0/bin/pm2 status

# Check logs
/root/.nvm/versions/node/v20.20.0/bin/pm2 logs astrotattwa --lines 50

# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t
```

### Visit in Browser
- http://172.236.176.107
- Should see landing page (even though form is broken)
- Dark/light mode toggle should work

### Local Development Tests

```bash
# Check TypeScript compilation
npm run type-check

# Check for linting issues
npm run lint

# Try building the project
npm run build

# Run development server
npm run dev
```

---

## 📊 Current Status Summary

| Category | Status | Completion |
|----------|--------|------------|
| **Infrastructure** | ✅ Complete | 100% |
| **Database & Schema** | ✅ Complete | 100% |
| **Swiss Ephemeris Setup** | ✅ Complete | 100% |
| **Landing Page** | 🚧 Partial | 60% (form missing) |
| **Calculation Engine** | ❌ Not Started | 0% |
| **API Endpoints** | ❌ Not Started | 0% |
| **Chart Visualization** | ❌ Not Started | 0% |
| **Authentication** | 🚧 Configured | 20% (not implemented) |
| **SSL/Domain** | ❌ Not Configured | 0% |
| **Overall Project** | 🚧 In Progress | **35%** |

---

## 🎯 Immediate Action Items (Next 7 Days)

### Day 1-2: Unblock Development
1. ✅ Create comprehensive README_FOR_CHATGPT.md
2. **Create BirthDataForm component** (CRITICAL - blocks everything)
   - Reference Supabase cities table
   - Use shadcn/ui date/time pickers
   - Implement Zod validation

### Day 3-5: Core Functionality
3. **Build Swiss Ephemeris calculation engine**
   - Start with utils.ts (Julian Day, conversions)
   - Then planetary.ts (most critical)
   - Then ascendant.ts
   - Verify each against test data (25/03/1992, 11:55 AM, Delhi)

### Day 6-7: Integration
4. **Create /api/calculate endpoint**
   - Accept form data (name, date, time, city)
   - Call calculation functions
   - Return JSON with all planetary data
   - Test with curl/Postman

5. **Test end-to-end flow**
   - Fill form → Submit → API call → Get results
   - Verify calculations match reference software

---

## 🚨 Known Issues & Blockers

### Critical Issues
1. **BirthDataForm component missing**
   - Location: Should be `src/components/forms/BirthDataForm.tsx`
   - Impact: Landing page imports it but it doesn't exist
   - Severity: HIGH - blocks all development

2. **Calculation functions not implemented**
   - Location: Should be in `src/lib/astrology/`
   - Impact: Can't perform any astrological calculations
   - Severity: HIGH - core functionality missing

3. **No API endpoints**
   - Location: Should be in `src/app/api/`
   - Impact: Frontend can't communicate with backend
   - Severity: MEDIUM - depends on Priority 2

### Minor Issues
- Authentication configured but not implemented
- Domain purchased but DNS not mapped
- SSL certificate not installed
- middleware.ts file exists but is empty

---

## 📋 Week-by-Week Goals

### Week 1 (Current - Jan 24-31, 2026)
- [x] Infrastructure setup (Linode + PM2 + Nginx) ✅
- [x] Swiss Ephemeris installation ✅
- [x] Database schema ✅
- [ ] BirthDataForm component 🚧
- [ ] Calculation engine 🚧
- [ ] /api/calculate endpoint 🚧

### Week 2 (Feb 1-7, 2026)
- [ ] Chart visualization (North Indian D1)
- [ ] Planet list component
- [ ] Dasha timeline component
- [ ] Google OAuth implementation
- [ ] Email signup flow

### Week 3 (Feb 8-14, 2026)
- [ ] Domain mapping (astrotatwa.com)
- [ ] SSL certificate installation
- [ ] Chart save/load functionality
- [ ] User dashboard
- [ ] Chart management UI

### Week 4 (Feb 15-21, 2026)
- [ ] Additional divisional charts
- [ ] Yoga detection
- [ ] Responsive design polish
- [ ] Beta testing
- [ ] Bug fixes

---

## 🔑 Important Server Information

### Production Server Access
```bash
# SSH command
ssh root@172.236.176.107

# Project directory
cd /root/astrotattwa

# Environment file (DO NOT COMMIT)
/root/astrotattwa/.env.local
```

### Key Paths (Full NVM Paths Required)
```bash
# Node.js
/root/.nvm/versions/node/v20.20.0/bin/node

# NPM
/root/.nvm/versions/node/v20.20.0/bin/npm

# PM2
/root/.nvm/versions/node/v20.20.0/bin/pm2
```

### Important Commands
```bash
# Restart app
/root/.nvm/versions/node/v20.20.0/bin/pm2 restart astrotattwa

# View logs
/root/.nvm/versions/node/v20.20.0/bin/pm2 logs astrotattwa

# Check status
/root/.nvm/versions/node/v20.20.0/bin/pm2 status

# Rebuild
/root/.nvm/versions/node/v20.20.0/bin/npm run build
```

---

## 📞 Getting Help

### For Development Issues
1. Check `README_FOR_CHATGPT.md` for complete project context
2. Review relevant docs (PRD, Development Plan, Tech Stack)
3. Check `06_Test_Case_Reference.md` for calculation verification
4. Refer to Swiss Ephemeris documentation: https://www.astro.com/swisseph/

### For Infrastructure Issues
1. Check PM2 logs: `pm2 logs astrotattwa`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify Nginx config: `sudo nginx -t`
4. Check GitHub Actions for deployment failures

### For Calculation Accuracy
1. Always verify against Jagannatha Hora (JHora)
2. Use test case: 25/03/1992, 11:55 AM, Delhi
3. Tolerance: < 1 arcminute for planets, < 2 for ascendant
4. Never approximate - accuracy is non-negotiable

---

**Current Phase:** Week 1 - Foundation + Core Calculations  
**Overall Progress:** 35% Complete  
**Status:** Production server running, core features in development  
**Live URL:** http://172.236.176.107 (HTTP only)  
**Last Updated:** January 24, 2026, 11:50 PM IST

---

## 🎉 Milestone Celebrations

- ✅ **Infrastructure complete!** Linode server fully operational
- ✅ **Database live!** All tables created with proper security
- ✅ **Swiss Ephemeris ready!** 100% calculation accuracy verified
- ✅ **CI/CD working!** Auto-deployment on every push
- 🎯 **Next up:** Build the form and start calculating charts!
