# Setup Checklist - Astrotattwa

**Version:** 2.0  
**Last Updated:** February 7, 2026  
**For:** Local Development & Production Setup

---

## 📋 Table of Contents

- [Local Development Setup](#local-development-setup)
- [Production Server Setup](#production-server-setup)
- [Database Setup](#database-setup)
- [Deployment Configuration](#deployment-configuration)
- [Troubleshooting](#troubleshooting)

---

## 💻 Local Development Setup

### Prerequisites

#### Required Software
- [ ] **Node.js 20.20.0 or higher**
  ```bash
  node --version  # Should show v20.20.0+
  ```
  
- [ ] **npm 10.0.0 or higher**
  ```bash
  npm --version
  ```

- [ ] **Git**
  ```bash
  git --version
  ```

- [ ] **Code Editor** (VS Code recommended)
  - Extensions:
    - ESLint
    - Prettier
    - Tailwind CSS IntelliSense
    - TypeScript and JavaScript Language Features

---

### Step 1: Clone Repository

```bash
# Clone the repo
git clone https://github.com/aakashjain1992-ship-it/astrotattwa-web.git

# Navigate to directory
cd astrotattwa-web

# Checkout dev branch (for development)
git checkout dev
```

---

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - Next.js 14
# - React 18
# - TypeScript
# - Tailwind CSS
# - Swiss Ephemeris
# - Supabase client
# - shadcn/ui components
# - And 50+ other dependencies
```

**Expected Duration:** 2-3 minutes

---

### Step 3: Environment Variables

#### Create `.env.local` file

```bash
# Copy example (if exists) or create new
touch .env.local
```

#### Add Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Analytics (Future)
# NEXT_PUBLIC_POSTHOG_KEY=
# SENTRY_DSN=
```

#### Get Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project (or create new)
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

### Step 4: Database Setup

#### Option A: Use Existing Supabase Project
(Recommended for local development)

**The database is already set up in production Supabase. Just use those credentials in your `.env.local`**

---

#### Option B: Create New Supabase Project
(If you want your own test database)

1. Create project on Supabase
2. Run migration:
   ```sql
   -- In Supabase SQL Editor, run:
   -- File: /supabase/migrations/001_initial_schema.sql
   ```

3. Verify tables created:
   - profiles
   - charts
   - cities
   - test_cases
   - test_case_runs

---

### Step 5: Verify Swiss Ephemeris

Swiss Ephemeris should work out of the box (installed via npm).

**Test it:**
```bash
# Run test endpoint
npm run dev

# Then visit:
http://localhost:3000/api/test-calc
```

Expected response: Planet positions for a test date

---

### Step 6: Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Server will start on:
http://localhost:3000
```

**You should see:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

### Step 7: Verify Installation

#### Check Landing Page
- [ ] Visit http://localhost:3000
- [ ] Page loads without errors
- [ ] Birth data form visible
- [ ] City search works

#### Test Chart Calculation
- [ ] Fill in form:
  - Name: "Test User"
  - Date: 25/03/1992
  - Time: 11:55 AM
  - Location: New Delhi, India
- [ ] Click "Calculate Chart"
- [ ] Chart page loads
- [ ] Diamond chart displays
- [ ] Planetary table shows data

#### Check Dark Mode
- [ ] Toggle theme (moon/sun icon)
- [ ] Switches between dark and light

---

### Step 8: Development Workflow

#### Recommended Workflow

```bash
# Always work on dev branch
git checkout dev

# Pull latest changes
git pull origin dev

# Create feature branch (optional)
git checkout -b feature/my-feature

# Make changes, test locally
npm run dev

# Type check
npm run type-check

# Build production (test)
npm run build

# Commit changes
git add .
git commit -m "feat: description of changes"

# Push to GitHub
git push origin dev  # or feature branch
```

---

## 🖥️ Production Server Setup

### Prerequisites

#### Server Requirements
- [ ] Ubuntu 22.04 LTS or higher
- [ ] 4GB RAM minimum
- [ ] 80GB SSD minimum
- [ ] Root or sudo access
- [ ] Static IP address

---

### Step 1: Initial Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Create non-root user (recommended)
adduser deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

---

### Step 2: Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should show v20.x.x
npm --version
```

---

### Step 3: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify
pm2 --version
```

---

### Step 4: Install Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

### Step 5: Clone Repository

```bash
# Create directory
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www

# Clone repo
cd /var/www
git clone https://github.com/aakashjain1992-ship-it/astrotattwa-web.git
cd astrotattwa-web

# Checkout main branch
git checkout main
```

---

### Step 6: Install Dependencies

```bash
# Install npm packages
npm install

# Should complete without errors
```

---

### Step 7: Environment Variables

```bash
# Create production .env file
nano .env.local

# Add production values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NEXT_PUBLIC_SITE_URL=https://astrotattwa.com
```

**Important:** Use production Supabase credentials, not development ones!

---

### Step 8: Build Application

```bash
# Build for production
npm run build

# Should complete successfully
# Creates .next folder
```

---

### Step 9: Configure PM2

```bash
# Start with PM2
pm2 start npm --name "astrotattwa-web" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command it gives you (run with sudo)

# Verify
pm2 status
```

Expected output:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ mode    │ ↺       │ status   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ astrotattwa-web  │ fork    │ 0       │ online   │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

---

### Step 10: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/astrotattwa

# Add configuration:
```

```nginx
server {
    listen 80;
    server_name astrotattwa.com www.astrotattwa.com;

    # Redirect www to non-www
    if ($host = www.astrotattwa.com) {
        return 301 https://astrotattwa.com$request_uri;
    }

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name astrotattwa.com www.astrotattwa.com;

    # SSL certificates (managed by Cloudflare)
    ssl_certificate /etc/nginx/ssl/astrotattwa.crt;
    ssl_certificate_key /etc/nginx/ssl/astrotattwa.key;

    # Redirect www to non-www
    if ($host = www.astrotattwa.com) {
        return 301 https://astrotattwa.com$request_uri;
    }

    # Proxy to Next.js
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
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/astrotattwa /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### Step 11: SSL Configuration (Cloudflare)

Cloudflare handles SSL automatically. Just ensure:

1. **Cloudflare SSL Mode:** Full (Strict)
2. **DNS Records:**
   - A record: astrotattwa.com → Your server IP
   - A record: www.astrotattwa.com → Your server IP
3. **SSL/TLS Encryption Mode:** Full (Strict)

Cloudflare will provide the origin certificates to place in:
- `/etc/nginx/ssl/astrotattwa.crt`
- `/etc/nginx/ssl/astrotattwa.key`

---

### Step 12: Verify Production

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check logs
pm2 logs astrotattwa-web --lines 50

# Test locally
curl http://localhost:3000

# Test publicly
curl https://astrotattwa.com
```

---

## 🗄️ Database Setup

### Supabase Setup (Current)

#### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Choose region: Mumbai (closest to Linode)
4. Wait for project to provision

---

#### Step 2: Run Migrations

```sql
-- In Supabase SQL Editor

-- File: supabase/migrations/001_initial_schema.sql
-- Copy and paste entire contents

-- Execute

-- Verify tables created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected tables:
- profiles
- charts
- cities
- test_cases
- test_case_runs

---

#### Step 3: Import City Data (Optional)

```sql
-- Import cities.csv (if you have it)
-- OR use existing city data in production
```

---

#### Step 4: Configure RLS

Row Level Security policies are already in the migration script.

Verify:
```sql
-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

---

### Future: Linode PostgreSQL Setup (P4)

#### Step 1: Install PostgreSQL

```bash
# On Linode server
sudo apt install postgresql postgresql-contrib -y

# Start and enable
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Step 2: Create Database

```bash
sudo -u postgres psql

# In PostgreSQL:
CREATE DATABASE astrotattwa;
CREATE USER astro_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE astrotattwa TO astro_user;
\q
```

#### Step 3: Run Migrations

```bash
psql -U astro_user -d astrotattwa -f supabase/migrations/001_initial_schema.sql
```

#### Step 4: Update Environment Variables

```env
# Replace Supabase with PostgreSQL connection
DATABASE_URL=postgresql://astro_user:password@localhost:5432/astrotattwa
```

---

## 🚀 Deployment Configuration

### GitHub Actions (CI/CD)

#### Setup Secrets

In GitHub repository settings → Secrets → Actions:

- `LINODE_HOST`: Your server IP
- `LINODE_USER`: deploy
- `LINODE_SSH_KEY`: Private SSH key
- `SUPABASE_URL`: Production Supabase URL
- `SUPABASE_ANON_KEY`: Production anon key

#### Workflow File

Located at: `.github/workflows/deploy.yml`

Triggers:
- Push to `main` branch
- Manual workflow dispatch

Actions:
1. Checkout code
2. SSH to Linode
3. Pull latest code
4. Install dependencies
5. Build production
6. Restart PM2
7. Health check

---

## 🔧 Troubleshooting

### Local Development Issues

#### Issue: "Module not found"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Port 3000 already in use
```bash
# Solution: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Issue: Swiss Ephemeris errors
```bash
# Solution: Reinstall swisseph
npm uninstall swisseph
npm install swisseph
```

---

### Production Issues

#### Issue: PM2 process not starting
```bash
# Check logs
pm2 logs astrotattwa-web

# Restart
pm2 restart astrotattwa-web

# Or delete and recreate
pm2 delete astrotattwa-web
pm2 start npm --name "astrotattwa-web" -- start
```

#### Issue: Nginx 502 Bad Gateway
```bash
# Check if Next.js is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart both
pm2 restart astrotattwa-web
sudo systemctl restart nginx
```

#### Issue: SSL certificate errors
```bash
# Verify Cloudflare SSL settings
# Ensure Full (Strict) mode

# Check certificate files exist
ls -la /etc/nginx/ssl/

# Test Nginx config
sudo nginx -t
```

---

### Database Issues

#### Issue: Supabase connection timeout
```env
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Verify correct URL in .env.local
```

#### Issue: RLS blocking queries
```sql
-- Check RLS policies
SELECT * FROM pg_policies;

-- Temporarily disable RLS (testing only!)
ALTER TABLE charts DISABLE ROW LEVEL SECURITY;
```

---

## ✅ Post-Setup Checklist

### Local Development
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Development server starts
- [ ] Can calculate test chart
- [ ] Dark mode works
- [ ] No console errors

### Production
- [ ] Server provisioned
- [ ] Node.js, PM2, Nginx installed
- [ ] Repository cloned to /var/www
- [ ] Production build successful
- [ ] PM2 running and saved
- [ ] Nginx configured and running
- [ ] SSL working (HTTPS)
- [ ] Domain resolves correctly
- [ ] Can access https://astrotattwa.com
- [ ] Chart calculation works in production
- [ ] No errors in PM2 logs

---

## 📚 Additional Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- PM2: https://pm2.keymetrics.io/docs
- Nginx: https://nginx.org/en/docs

### Astrotattwa Docs
- README.md - Project overview
- PROJECT_OVERVIEW.md - Architecture
- DEVELOPMENT_ROADMAP.md - Features & priorities

---

**Last Updated:** February 7, 2026  
**Version:** 2.0  
**Maintainer:** Aakash + AI Assistants
