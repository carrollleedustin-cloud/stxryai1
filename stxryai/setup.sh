#!/bin/bash

# ============================================
# StoryAI Quick Start Setup Script
# Automates the initial setup process
# ============================================

set -e

echo "🚀 StoryAI Quick Start Setup"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Creating .env.local template..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-openai-key-here

# Optional: Stripe
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
EOF
    echo -e "${GREEN}✓ Created .env.local template${NC}"
    echo -e "${YELLOW}⚠️  Please update .env.local with your actual keys${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Check environment variables
echo "🔍 Checking environment variables..."
if grep -q "OPENAI_API_KEY=sk-" .env.local; then
    echo -e "${GREEN}✓ OPENAI_API_KEY configured${NC}"
else
    echo -e "${RED}✗ OPENAI_API_KEY not configured${NC}"
    echo "  Please add your OpenAI API key to .env.local"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local; then
    echo -e "${GREEN}✓ SUPABASE_URL configured${NC}"
else
    echo -e "${RED}✗ SUPABASE_URL not configured${NC}"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local; then
    echo -e "${GREEN}✓ SUPABASE_ANON_KEY configured${NC}"
else
    echo -e "${RED}✗ SUPABASE_ANON_KEY not configured${NC}"
fi

echo ""
echo "📋 Setup Checklist:"
echo "===================="
echo ""
echo "1. Database Setup:"
echo "   [ ] Run supabase/CREATE_ALL_TABLES.sql"
echo "   [ ] Run supabase/CREATE_PET_TABLES.sql"
echo "   [ ] Run supabase/STXRYAI_RLS_POLICIES.sql"
echo "   [ ] Run supabase/VERIFY_DATABASE.sql"
echo ""
echo "2. Storage Setup:"
echo "   [ ] Create 'avatars' bucket (public)"
echo "   [ ] Create 'user-avatars' bucket (public)"
echo "   [ ] Create 'story-assets' bucket (public)"
echo "   [ ] Add RLS policies to each bucket"
echo ""
echo "3. Environment Setup:"
echo "   [ ] Update OPENAI_API_KEY in .env.local"
echo "   [ ] Update SUPABASE_URL in .env.local"
echo "   [ ] Update SUPABASE_ANON_KEY in .env.local"
echo "   [ ] Update SUPABASE_SERVICE_ROLE_KEY in .env.local"
echo ""
echo "4. Testing:"
echo "   [ ] Run: npm run dev"
echo "   [ ] Test character sheet: /profile/character-sheet"
echo "   [ ] Test story generation: Create a story"
echo "   [ ] Test pet: Look for pet panel (bottom-right)"
echo ""

echo "📚 Documentation:"
echo "=================="
echo "- COMPLETE_SETUP_GUIDE.md - Comprehensive setup guide"
echo "- QUICK_SETUP_CHECKLIST.md - Quick reference"
echo "- IMPLEMENTATION_COMPLETE.md - What's been done"
echo ""

echo "🎯 Next Steps:"
echo "=============="
echo "1. Update .env.local with your API keys"
echo "2. Run database migrations in Supabase"
echo "3. Create storage buckets"
echo "4. Run: npm run dev"
echo "5. Test all features"
echo ""

echo -e "${GREEN}✓ Setup script complete!${NC}"
echo ""
echo "For detailed instructions, see COMPLETE_SETUP_GUIDE.md"
