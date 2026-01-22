# Astrotattwa - Vedic Astrology Web Application

A modern, mobile-first Progressive Web App for accurate Vedic astrology calculations with AI-powered insights.

## 🌟 Features

### Phase 1 (MVP - Free)
- ✅ Google OAuth & Email authentication
- ✅ Create and save up to 10 birth charts
- ✅ Accurate planetary positions (Swiss Ephemeris)
- ✅ Rashi (D1) and Navamsa (D9) chart visualization
- ✅ Complete Vimshottari Dasha timeline
- ✅ Nakshatra and Pada calculations
- ✅ Interactive, mobile-first UI
- ✅ Dark/Light mode support

### Phase 2 (Paid Reports)
- 🔜 AI-generated detailed life reports
- 🔜 PDF export
- 🔜 Razorpay payment integration

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (Google OAuth + Email)
- **Calculations:** Swiss Ephemeris
- **Hosting:** Vercel
- **State Management:** Zustand, React Query

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)
- Vercel account (for deployment)

## 🚀 Getting Started

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd astrotattwa-web
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL
3. Get your project credentials:
   - Go to **Settings → API**
   - Copy `Project URL` and `anon/public` key

### 3. Configure Google OAuth (Optional for Phase 1)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID** credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret

### 4. Configure Environment Variables

Create `.env.local` file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your credentials:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Places API (for location search)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-places-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 5. Enable Google OAuth in Supabase

1. Go to **Authentication → Providers** in Supabase
2. Enable **Google** provider
3. Enter your Google Client ID and Secret
4. Save

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── charts/            # Astrology chart components
│   └── forms/             # Form components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── astrology/         # Calculation engine
│   └── utils/             # Utility functions
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── styles/                # Global styles
\`\`\`

## 🧪 Testing

\`\`\`bash
# Type checking
npm run type-check

# Lint
npm run lint

# Run tests (when added)
npm test
\`\`\`

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel
4. Deploy!

Vercel will automatically:
- Build the Next.js app
- Set up serverless functions
- Provide a production URL

### Update Redirect URIs

After deployment, add your production URL to:
- Supabase: **Authentication → URL Configuration**
- Google Cloud Console: **OAuth 2.0 Client → Authorized redirect URIs**

## 📝 Development Roadmap

- [x] Project setup and configuration
- [x] Database schema and migrations
- [x] Authentication system
- [ ] Swiss Ephemeris integration
- [ ] Chart calculation engine
- [ ] Chart visualization components
- [ ] Dashboard and UI
- [ ] Report generation (Phase 2)
- [ ] Payment integration (Phase 2)

## 🤝 Contributing

This is a private project. For internal development only.

## 📄 License

Proprietary - All Rights Reserved

## 🆘 Support

For issues or questions, contact the development team.

---

**Version:** 0.1.0  
**Last Updated:** January 2026
