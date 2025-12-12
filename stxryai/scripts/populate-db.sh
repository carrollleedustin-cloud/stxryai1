#!/bin/bash

# StxryAI Database Population Script
# This script populates the database with seed stories

echo "🚀 StxryAI Database Population"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing Supabase credentials in .env.local"
    echo "Required variables:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Run the TypeScript script
echo "📚 Populating database with seed stories..."
npx ts-node scripts/populate-stories.ts

echo ""
echo "✨ Done!"
