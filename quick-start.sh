#!/bin/bash

# Astrotattwa Quick Start Script
# This script helps you get started quickly

echo "🌟 Astrotattwa - Quick Start Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "📝 IMPORTANT: Edit .env.local with your credentials:"
    echo "   - Supabase URL and keys"
    echo "   - Google OAuth credentials (optional)"
    echo "   - Google Places API key"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Run type check
echo "🔍 Checking TypeScript..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript errors found (this is okay for now)"
else
    echo "✅ TypeScript check passed"
fi

echo ""
echo "=================================="
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Set up Supabase project at https://supabase.com"
echo "2. Run the SQL migration from supabase/migrations/001_initial_schema.sql"
echo "3. Update .env.local with your Supabase credentials"
echo "4. Run: npm run dev"
echo "5. Visit: http://localhost:3000"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - README.md"
echo "   - SETUP_CHECKLIST.md"
echo "   - PROJECT_OVERVIEW.md"
echo ""
echo "🚀 Ready to start development!"
