# Astrotattwa - Development Roadmap

**Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** Phase 1 Complete | Phase 2 Planning

---

## 📋 Overview

This document outlines the complete development roadmap for Astrotattwa, organized by priority and implementation phases. Each phase builds upon the previous one to ensure a stable, scalable application.

---

## 🎯 Priority Framework

### Priority Levels
- **P1:** Critical - Must be done first (blocks other work)
- **P2:** High - Important foundation (enables future work)
- **P3:** Medium - Core features (user-facing value)
- **P4:** Low - Enhancement (nice-to-have)
- **P5:** Future - Long-term (innovation)

### Estimated Timeline
- **Phase 1:** ✅ Complete (6 weeks - Done)
- **Phase 2:** 🚧 In Progress (4 weeks)
- **Phase 3:** 📋 Planned (6 weeks)
- **Phase 4:** 🔮 Future (8+ weeks)

---

## 📊 Current Status Summary

### ✅ Phase 1 - MVP Foundation (100% Complete)
- Core calculation engine
- 8 divisional charts (D1, D2, D3, D7, D9, D10, D12, Moon)
- North Indian diamond chart visualization
- Landing page + chart display page
- Responsive mobile-first design
- **Lighthouse:** 100/100 Performance

### 🚧 Phase 2 - Code Quality & Foundation (In Progress)
Focus: Optimization, security, and infrastructure before adding features

### 📋 Phase 3 - Feature Expansion (Planned)
Focus: AI analysis, advanced charts, user features

### 🔮 Phase 4 - Advanced Features (Future)
Focus: Predictions, compatibility, additional modules

---

## 🚀 Phase 2: Code Quality & Foundation (4 weeks)

**Focus:** Establish solid foundation before adding complex features

### **P1: Code Optimization & Refactoring** (Week 1-2)
**Priority:** Critical  
**Effort:** 2 weeks  
**Blocking:** All future development

#### Objectives
- Identify and eliminate redundant code
- Create reusable component patterns
- Optimize bundle size
- Improve code maintainability
- Document refactoring decisions

#### Tasks
1. **Code Audit** (3 days)
   - [ ] Analyze codebase for duplicate code
   - [ ] Identify optimization opportunities
   - [ ] Create refactoring task list
   - [ ] Prioritize refactoring items

2. **Component Refactoring** (4 days)
   - [ ] Extract common patterns into reusable components
   - [ ] Consolidate similar chart components
   - [ ] Create shared hooks for common logic
   - [ ] Optimize re-renders

3. **Bundle Optimization** (2 days)
   - [ ] Analyze bundle size with `next/bundle-analyzer`
   - [ ] Implement code splitting where needed
   - [ ] Lazy load heavy components
   - [ ] Remove unused dependencies

4. **Documentation** (1 day)
   - [ ] Document new patterns
   - [ ] Update component usage guides
   - [ ] Create refactoring guide

**Deliverables:**
- [ ] CODE_REFACTORING_GUIDE.md (complete)
- [ ] Reduced bundle size by 20%+
- [ ] Reusable component library
- [ ] Updated type definitions

**Success Metrics:**
- Bundle size < 300 KB (first load)
- Lighthouse Performance: 100/100 maintained
- Code duplication < 5%

---

### **P2: Component Library Documentation** (Week 2)
**Priority:** High  
**Effort:** 1 week  
**Enables:** Faster feature development, AI assistant handoff

#### Objectives
- Create comprehensive component catalog
- Document props, usage, and examples
- Establish component design patterns
- Enable easy handoff between AI assistants

#### Tasks
1. **Component Catalog** (2 days)
   - [ ] List all reusable components
   - [ ] Categorize by type (UI, Chart, Form, Layout)
   - [ ] Document props and TypeScript interfaces
   - [ ] Add usage examples

2. **Design Patterns** (2 days)
   - [ ] Document composition patterns
   - [ ] Create component best practices
   - [ ] Define naming conventions
   - [ ] Establish folder structure rules

3. **Interactive Examples** (1 day)
   - [ ] Create Storybook (optional)
   - [ ] Add live code examples
   - [ ] Document edge cases

4. **Maintenance Guide** (1 day)
   - [ ] How to add new components
   - [ ] How to modify existing components
   - [ ] Testing requirements
   - [ ] Deprecation process

**Deliverables:**
- [ ] COMPONENT_LIBRARY.md (complete)
- [ ] Component usage examples
- [ ] Design pattern guide
- [ ] TypeScript interface documentation

**Success Metrics:**
- All components documented
- Clear usage examples for each
- AI assistants can use docs to implement features

---

### **P3: API Authentication & Security** (Week 3)
**Priority:** Medium  
**Effort:** 1 week  
**Critical for:** User data protection, chart saving

#### Objectives
- Implement JWT-based API authentication
- Secure all calculation endpoints
- Add rate limiting
- Implement CORS properly
- Add request validation

#### Tasks
1. **Authentication Setup** (2 days)
   - [ ] Implement JWT token generation
   - [ ] Create authentication middleware
   - [ ] Add protected route wrapper
   - [ ] Implement token refresh logic

2. **API Security** (2 days)
   - [ ] Add authentication to all `/api/*` routes
   - [ ] Implement rate limiting (100 req/min per IP)
   - [ ] Add request validation middleware
   - [ ] Implement CORS properly

3. **Public vs Protected Routes** (1 day)
   - [ ] `/api/calculate` - Allow public (with rate limit)
   - [ ] `/api/chart` CRUD - Require auth
   - [ ] `/api/dasha/*` - Allow public
   - [ ] `/api/cities/*` - Allow public

4. **Security Headers** (1 day)
   - [ ] Add CSP (Content Security Policy)
   - [ ] Implement HSTS
   - [ ] Add XSS protection headers
   - [ ] Configure secure cookies

**Deliverables:**
- [ ] JWT authentication system
- [ ] Protected API routes
- [ ] Rate limiting middleware
- [ ] Security headers configured
- [ ] API security documentation

**Success Metrics:**
- All API routes have appropriate auth
- Rate limiting prevents abuse
- Security score: 100/100 (Lighthouse)
- Zero unauthorized access vulnerabilities

---

### **P4: Database Migration Planning** (Week 3-4)
**Priority:** Medium  
**Effort:** 1 week  
**Before:** Authentication, Chart Saving  
**After:** City Search API

#### Objectives
- Evaluate Supabase vs Linode PostgreSQL
- Create migration plan
- Design data migration strategy
- Prepare infrastructure

#### Tasks
1. **Cost-Benefit Analysis** (2 days)
   - [ ] Compare Supabase vs Linode costs
   - [ ] Evaluate performance differences
   - [ ] Assess maintenance overhead
   - [ ] Make recommendation

2. **Migration Plan** (2 days)
   - [ ] Design PostgreSQL setup on Linode
   - [ ] Create data migration scripts
   - [ ] Plan zero-downtime migration
   - [ ] Prepare rollback strategy

3. **Infrastructure Preparation** (2 days)
   - [ ] Set up PostgreSQL on Linode
   - [ ] Configure backups
   - [ ] Set up connection pooling
   - [ ] Test migrations on staging

4. **Documentation** (1 day)
   - [ ] Migration guide
   - [ ] Rollback procedures
   - [ ] Performance benchmarks

**Deliverables:**
- [ ] DATABASE_MIGRATION_PLAN.md
- [ ] Cost comparison analysis
- [ ] Migration scripts ready
- [ ] Linode PostgreSQL configured (if proceeding)

**Decision Point:**
- ✅ Proceed with migration → Execute in Phase 3
- ❌ Stay with Supabase → Document decision rationale

---

## 🎨 Phase 3: Feature Expansion (6 weeks)

### **P4: Divisional Charts D16-D60 + AI Insights** (Week 1-3)
**Priority:** Medium  
**Effort:** 3 weeks  
**High user value**

#### Part A: Remaining Divisional Charts (Week 1-2)

**Phase 2 Charts:**
- [ ] **D16** - Shodasamsa (Vehicles, comforts)
- [ ] **D20** - Vimshamsa (Spiritual progress)
- [ ] **D24** - Chaturvimshamsa (Education)
- [ ] **D27** - Nakshatramsa (Strengths/weaknesses)
- [ ] **D30** - Trimshamsa (Evils, misfortunes)

**Phase 3 Charts:**
- [ ] **D40** - Khavedamsa (Auspicious effects)
- [ ] **D45** - Akshavedamsa (General indications)
- [ ] **D60** - Shashtyamsa (Past life, most detailed)

**Tasks:**
1. **Calculation Functions** (5 days)
   - Create `/src/lib/utils/divisional/d16-shodasamsa.ts`
   - Create `/src/lib/utils/divisional/d20-vimshamsa.ts`
   - Create `/src/lib/utils/divisional/d24-chaturvimshamsa.ts`
   - Create `/src/lib/utils/divisional/d27-nakshatramsa.ts`
   - Create `/src/lib/utils/divisional/d30-trimshamsa.ts`
   - Create `/src/lib/utils/divisional/d40-khavedamsa.ts`
   - Create `/src/lib/utils/divisional/d45-akshavedamsa.ts`
   - Create `/src/lib/utils/divisional/d60-shashtyamsa.ts`

2. **Educational Content** (3 days)
   - Update `DivisionalChartConfig.ts` with all 8 charts
   - Write interpretation guides
   - Add key houses/planets for each
   - Create examples

3. **Integration** (2 days)
   - Add to `ChartSelector` dropdown
   - Update type definitions
   - Test all calculations
   - Verify accuracy

#### Part B: AI-Powered Insights (Week 3)

**Free AI Insights:**
- [ ] Planet-in-house interpretations
- [ ] Aspect explanations
- [ ] Basic strength analysis
- [ ] Nakshatra meanings

**Tasks:**
1. **AI Integration** (3 days)
   - [ ] Research AI provider (OpenAI GPT-4 vs Claude vs open-source)
   - [ ] Create `/api/insights` endpoint
   - [ ] Design prompt templates
   - [ ] Implement caching for common insights

2. **Insight Types** (2 days)
   - [ ] Planet placement insights
   - [ ] Dasha period guidance
   - [ ] Divisional chart interpretations
   - [ ] Yoga explanations

3. **UI Integration** (2 days)
   - [ ] Add insight cards to chart page
   - [ ] Create expandable sections
   - [ ] Add loading states
   - [ ] Implement error handling

**Deliverables:**
- [ ] All 16 divisional charts working
- [ ] Educational content complete
- [ ] AI insights on chart page
- [ ] Caching system for insights

**Success Metrics:**
- All charts accurate
- AI insights load < 2s
- User engagement with insights > 60%

---

### **P5: Diamond Chart Improvements** (Week 3)
**Priority:** Medium  
**Effort:** 3-4 days  
**Reference:** DIAMONDCHART_IMPROVEMENTS_TASK.md

#### Tasks
1. **Multi-Planet Layout** (2 days)
   - [ ] Implement smart positioning for 2-5 planets
   - [ ] Fix overcrowding in triangular houses
   - [ ] Adjust font sizes dynamically
   - [ ] Improve status symbol placement

2. **Visual Polish** (1 day)
   - [ ] Better planet stacking
   - [ ] Improved degree display
   - [ ] Enhanced status flags
   - [ ] Responsive font sizing

3. **Testing** (1 day)
   - [ ] Test with heavy charts (6+ planets/house)
   - [ ] Verify mobile rendering
   - [ ] Check all chart types

**Deliverables:**
- [ ] Improved planet positioning algorithm
- [ ] Better readability in crowded houses
- [ ] Updated DIAMONDCHART_IMPROVEMENTS_TASK.md

---

### **P6: Global City Search API** (Week 4)
**Priority:** Medium  
**Effort:** 1 week  
**Critical for:** Better UX, international users

#### Objectives
- Integrate global city database
- Support multiple countries
- Fast autocomplete search
- Accurate timezone data

#### Tasks
1. **API Research** (1 day)
   - [ ] Evaluate GeoNames API
   - [ ] Evaluate OpenCage Geocoding
   - [ ] Evaluate Mapbox Geocoding
   - [ ] Compare pricing and limits
   - [ ] Choose provider

2. **Integration** (2 days)
   - [ ] Create `/api/cities/search-global` endpoint
   - [ ] Implement caching layer
   - [ ] Add rate limiting
   - [ ] Handle API failures gracefully

3. **UI Updates** (1 day)
   - [ ] Update CitySearch component
   - [ ] Add country filter
   - [ ] Improve autocomplete UX
   - [ ] Add location suggestions

4. **Data Migration** (1 day)
   - [ ] Update existing city data
   - [ ] Add timezone validation
   - [ ] Test accuracy

**Deliverables:**
- [ ] Global city search working
- [ ] Fast autocomplete (< 200ms)
- [ ] Accurate timezone data
- [ ] Fallback to local DB if API fails

**Success Metrics:**
- Search results < 200ms
- 100+ countries supported
- Timezone accuracy: 100%

---

### **P7: Authentication Implementation** (Week 5)
**Priority:** Medium  
**Effort:** 1 week  
**Enables:** Chart saving, user dashboard

#### Objectives
- Google OAuth login
- Email/password signup
- Session management
- Protected routes

#### Tasks
1. **Supabase Auth Setup** (2 days)
   - [ ] Configure Google OAuth
   - [ ] Set up email auth
   - [ ] Implement email verification
   - [ ] Add password reset flow

2. **Frontend Integration** (2 days)
   - [ ] Create auth context
   - [ ] Implement login page logic
   - [ ] Implement signup page logic
   - [ ] Add protected route middleware

3. **Session Management** (1 day)
   - [ ] Implement JWT refresh
   - [ ] Add session persistence
   - [ ] Handle logout
   - [ ] Add session timeout

4. **User Profile** (2 days)
   - [ ] Create profile page
   - [ ] Add avatar upload
   - [ ] Implement profile editing
   - [ ] Add account settings

**Deliverables:**
- [ ] Working Google OAuth
- [ ] Email signup/login
- [ ] Protected routes
- [ ] User profile page

**Success Metrics:**
- OAuth success rate > 95%
- Session persistence working
- Zero security vulnerabilities

---

### **P8: Chart Saving & Dashboard** (Week 5-6)
**Priority:** Medium  
**Effort:** 1 week  
**User feature**

#### Objectives
- Save charts to database
- User dashboard with saved charts
- Chart CRUD operations
- 10-chart limit per user

#### Tasks
1. **Backend API** (2 days)
   - [ ] Implement `/api/chart` POST (create)
   - [ ] Implement `/api/chart` GET (list)
   - [ ] Implement `/api/chart/:id` GET (read)
   - [ ] Implement `/api/chart/:id` PUT (update)
   - [ ] Implement `/api/chart/:id` DELETE (delete)

2. **Dashboard Page** (2 days)
   - [ ] Create `/dashboard` page
   - [ ] List saved charts
   - [ ] Add search/filter
   - [ ] Implement favorites

3. **Chart Management** (2 days)
   - [ ] "Save Chart" button on chart page
   - [ ] Edit saved chart
   - [ ] Delete confirmation
   - [ ] Chart limit enforcement (10 max)

4. **UX Enhancements** (1 day)
   - [ ] Empty state design
   - [ ] Loading skeletons
   - [ ] Success/error toasts
   - [ ] Keyboard shortcuts

**Deliverables:**
- [ ] Chart saving working
- [ ] User dashboard
- [ ] CRUD operations
- [ ] 10-chart limit enforced

**Success Metrics:**
- Charts save < 1s
- Dashboard loads < 500ms
- Zero data loss bugs

---

### **P9: UX Enhancements** (Week 6)
**Priority:** Low  
**Effort:** 1 week  
**Polish**

#### Part A: Loaders & Animations (3 days)

**Tasks:**
- [ ] Design loading spinner components
- [ ] Add skeleton loaders for tables
- [ ] Implement smooth page transitions
- [ ] Add micro-interactions
- [ ] Create progress indicators

#### Part B: Landing Page Copy (2 days)

**Tasks:**
- [ ] Rewrite hero headline (more compelling)
- [ ] Add social proof section
- [ ] Create better feature descriptions
- [ ] Add FAQ section
- [ ] Optimize CTAs

#### Part C: Design Brief (2 days)

**Tasks:**
- [ ] Create logo design brief
- [ ] Define brand colors (3-5 colors)
- [ ] Choose typography system
- [ ] Create mood board
- [ ] Document design system

**Deliverables:**
- [ ] Loading components library
- [ ] Smooth animations
- [ ] Improved landing copy
- [ ] Design brief document

---

## 🔮 Phase 4: Advanced Features (8+ weeks)

### **P10: Advanced Astrology Features** (Week 1-4)
**Priority:** Low  
**Effort:** 4 weeks

#### Transit Charts (Week 1)
- [ ] Current planet positions
- [ ] Transit overlay on birth chart
- [ ] Transit-to-natal aspects
- [ ] Transit timeline

#### Predictions (Week 2)
- [ ] Dasha period predictions
- [ ] Transit-based predictions
- [ ] Yearly predictions
- [ ] Monthly predictions

#### Recommendations (Week 3)
- [ ] Rudraksha recommendations
- [ ] Gemstone recommendations
- [ ] Mantra suggestions
- [ ] Remedial measures

#### Compatibility (Week 4)
- [ ] Kundli Milan (Ashtakoot matching)
- [ ] Gun Milan scoring
- [ ] Compatibility analysis
- [ ] Synastry chart

**Deliverables:**
- [ ] Transit chart working
- [ ] Prediction engine
- [ ] Recommendation system
- [ ] Kundli Milan calculator

---

### **P11: Additional Modules** (Week 5-6)

#### Panchang Module (Week 5)
- [ ] Tithi, Nakshatra, Yoga, Karana
- [ ] Daily panchang
- [ ] Auspicious times (Muhurta)
- [ ] Festival calendar

#### Numerology Module (Week 6)
- [ ] Name number calculation
- [ ] Birth number calculation
- [ ] Life path number
- [ ] Compatibility numbers

**Deliverables:**
- [ ] Panchang calculator
- [ ] Numerology calculator
- [ ] Integration with main app

---

### **P12: AI Reports (Paid Feature)** (Week 7-8)
**Priority:** Future  
**Effort:** 2 weeks

#### Report Types
- [ ] Career Report (₹299)
- [ ] Marriage Report (₹299)
- [ ] Finance Report (₹249)
- [ ] Health Report (₹249)
- [ ] Yearly Report (₹399)

#### Tasks
1. **AI Integration** (3 days)
   - [ ] Choose AI provider
   - [ ] Design prompts for each report
   - [ ] Implement generation pipeline
   - [ ] Add quality checks

2. **PDF Generation** (2 days)
   - [ ] Choose PDF library (puppeteer/react-pdf)
   - [ ] Design report templates
   - [ ] Add charts to PDF
   - [ ] Implement download

3. **Payment Integration** (3 days)
   - [ ] Razorpay setup
   - [ ] Create payment flow
   - [ ] Add webhook handler
   - [ ] Implement refunds

4. **Report Management** (2 days)
   - [ ] Report history page
   - [ ] Re-download reports
   - [ ] Email delivery
   - [ ] Report expiry (optional)

**Deliverables:**
- [ ] 5 report types
- [ ] PDF generation
- [ ] Payment gateway
- [ ] Report dashboard

**Success Metrics:**
- Report generation < 30s
- Payment success rate > 95%
- PDF quality excellent

---

## 📈 Phase 5: Growth & Optimization (Ongoing)

### **P13: SEO Optimization** (2 weeks)
**Priority:** Low  
**Effort:** 2 weeks

#### Tasks
1. **On-Page SEO** (1 week)
   - [ ] Optimize meta tags
   - [ ] Add structured data (JSON-LD)
   - [ ] Improve heading structure
   - [ ] Add alt text to images
   - [ ] Optimize URLs
   - [ ] Create XML sitemap
   - [ ] Add robots.txt

2. **Content SEO** (1 week)
   - [ ] Keyword research
   - [ ] Add educational content pages
   - [ ] Create blog posts
   - [ ] Internal linking strategy
   - [ ] Add schema markup

**Deliverables:**
- [ ] SEO audit complete
- [ ] Meta tags optimized
- [ ] Structured data added
- [ ] Content plan created

**Success Metrics:**
- Lighthouse SEO: 100/100 maintained
- Indexed pages: 50+
- Organic traffic growth

---

### **P14: Blog Section** (4 weeks)
**Priority:** Future  
**Effort:** 4 weeks

#### Features
- [ ] MDX-based blog
- [ ] Categories & tags
- [ ] Search functionality
- [ ] Social sharing
- [ ] Comments (optional)

#### Content Topics
- Vedic astrology basics
- How to read charts
- Divisional chart guides
- Nakshatra meanings
- Dasha period explanations

**Deliverables:**
- [ ] Blog infrastructure
- [ ] 20+ educational posts
- [ ] SEO optimized content

---

### **P15: Scaling & Infrastructure** (Ongoing)
**Priority:** Future  
**Effort:** Ongoing

#### Tasks
- [ ] Implement Redis caching
- [ ] Add CDN for static assets
- [ ] Optimize database queries
- [ ] Implement database sharding (if needed)
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Set up analytics (PostHog)
- [ ] Implement A/B testing
- [ ] Add performance monitoring

---

## 📊 Success Metrics

### Technical Metrics
- **Performance:** Lighthouse 100/100 maintained
- **Uptime:** 99.9%+
- **API Response Time:** < 200ms (p95)
- **Page Load Time:** < 1s (FCP)
- **Bundle Size:** < 300 KB (first load)

### User Metrics
- **User Satisfaction:** > 4.5/5
- **Charts Created:** Track growth
- **Return Users:** > 40%
- **Time on Site:** > 5 min average
- **Bounce Rate:** < 30%

### Business Metrics
- **Conversion Rate:** > 2% (free → paid)
- **Monthly Active Users:** Track growth
- **Revenue:** Track monthly
- **Customer Acquisition Cost:** Optimize

---

## 🔄 Review & Iteration

### Weekly Reviews
- Check progress against roadmap
- Adjust priorities if needed
- Document learnings
- Update estimates

### Monthly Reviews
- Analyze metrics
- User feedback review
- Technical debt assessment
- Roadmap refinement

### Quarterly Reviews
- Major feature decisions
- Tech stack evaluation
- Market analysis
- Strategic planning

---

## 📞 Stakeholder Communication

### For Aakash
- Weekly progress updates
- Monthly roadmap reviews
- Feature approval process
- Budget discussions

### For AI Assistants (Claude/ChatGPT)
- Refer to AI_HANDOFF_GUIDE.md
- Update PROGRESS_TRACKER.md daily
- Document all decisions
- Maintain clear TODO lists

---

## ✅ Definition of Done

A feature is considered "done" when:
- [ ] Code written and tested
- [ ] TypeScript types complete
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Documentation updated
- [ ] Performance tested
- [ ] Code reviewed
- [ ] Deployed to production
- [ ] Metrics tracking added
- [ ] User tested (if applicable)

---

**Last Updated:** February 7, 2026  
**Next Review:** February 14, 2026  
**Version:** 1.0
