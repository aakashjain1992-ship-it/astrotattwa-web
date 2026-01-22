#!/bin/bash

echo "🌟 Setting up Astrotattwa project structure..."

# Create all directories
mkdir -p src/app/{api,\(auth\)/{login,signup},\(dashboard\)}
mkdir -p src/components/ui
mkdir -p src/lib/{supabase,utils}
mkdir -p src/hooks
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/styles
mkdir -p supabase/migrations
mkdir -p public

echo "✅ Directory structure created"
echo "📝 Files ready to be created"
echo ""
echo "Next: I'll provide you the content for each file"
