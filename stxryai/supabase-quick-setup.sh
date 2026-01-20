#!/bin/bash

# ============================================================================
# StxryAI Supabase Quick Setup Script
# ============================================================================
# This script helps you quickly set up Supabase for the StxryAI platform
# ============================================================================

set -e  # Exit on error

echo "🚀 StxryAI Supabase Quick Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local file not found!${NC}"
    echo ""
    echo "Please create .env.local with your Supabase credentials:"
    echo "  cp .env.local.example .env.local"
    echo ""
    echo "Then add your Supabase URL and keys from:"
    echo "  https://app.supabase.com → Your Project → Settings → API"
    exit 1
fi

echo -e "${GREEN}✅ Found .env.local${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Test connection
echo -e "${BLUE}🔍 Testing Supabase connection...${NC}"
echo ""

node test-supabase-connection.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✨ Supabase setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. If tables are missing, run migrations in Supabase SQL Editor:"
    echo "     - database/init-safe-migration.sql"
    echo "     - database/achievements-expanded.sql"
    echo "     - database/family-and-cultural-features.sql"
    echo ""
    echo "  2. If storage buckets are missing, run:"
    echo "     - database/storage-buckets.sql"
    echo ""
    echo "  3. Start development server:"
    echo "     npm run dev"
    echo ""
else
    echo ""
    echo -e "${RED}⚠️  Setup incomplete. Please check errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Verify Supabase credentials in .env.local"
    echo "  2. Run database migrations in Supabase Dashboard"
    echo "  3. Check Supabase project status"
    echo ""
    exit 1
fi
