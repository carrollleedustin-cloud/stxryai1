# COMPLETE SETUP GUIDE - StxryAI Platform
## Production Deployment Guide - January 2026

This comprehensive guide will walk you through setting up the StxryAI platform from scratch to production deployment.

---

## TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Storage Configuration](#storage-configuration)
5. [Authentication Setup](#authentication-setup)
6. [Payment Integration](#payment-integration)
7. [CI/CD Configuration](#cicd-configuration)
8. [Feature Initialization](#feature-initialization)
9. [Testing Setup](#testing-setup)
10. [Production Deployment](#production-deployment)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)

---

## PREREQUISITES

### Required Accounts
- [ ] GitHub account (for code repository)
- [ ] Supabase account (for database and auth)
- [ ] Netlify account (for hosting)
- [ ] Stripe account (for payments)
- [ ] SendGrid account (for emails)
- [ ] PostHog account (for analytics)
- [ ] Google Analytics account (optional)

### Required Software
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] PostgreSQL client (psql) installed
- [ ] Code editor (VS Code recommended)

### Required Knowledge
- Basic understanding of Next.js
- Familiarity with React
- Basic SQL knowledge
- Understanding of REST APIs

---

## ENVIRONMENT SETUP

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-username/stxryai.git
cd stxryai

# Install dependencies
npm install

# Verify installation
npm run type-check
```

### Step 2: Create Environment Files

Create `.env.local` in the `stxryai` directory:

```bash
# Copy example environment file
cp .env.example .env.local
```

### Step 3: Configure Environment Variables

Edit `.env.local` with your values:

```env
# ============================================================================
# APPLICATION
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:4028
NODE_ENV=development

# ============================================================================
# SUPABASE
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================================================
# AUTHENTICATION
# ============================================================================
JWT_SECRET=your-jwt-secret-here-min-32-characters
ENCRYPTION_KEY=your-encryption-key-here-64-hex-characters

# ============================================================================
# STRIPE PAYMENTS
# ============================================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_CREATOR_PRO_PRICE_ID=price_...

# ============================================================================
# EMAIL (SendGrid)
# ============================================================================
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@stxryai.com
SENDGRID_FROM_NAME=StxryAI

# ============================================================================
# AI SERVICES
# ============================================================================
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# ============================================================================
# ANALYTICS
# ============================================================================
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# ============================================================================
# FEATURE FLAGS
# ============================================================================
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_SOCIAL=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# ============================================================================
# SECURITY
# ============================================================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

---

## DATABASE CONFIGURATION

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `stxryai-production`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### Step 2: Get Database Credentials

1. Go to Project Settings → API
2. Copy the following:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Initialize Database Schema

```bash
# Navigate to database directory
cd stxryai/database

# Connect to Supabase (replace with your credentials)
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Or use Supabase SQL Editor in the dashboard
```

In Supabase SQL Editor, run:

```sql
-- Run the initialization script
\i init.sql

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should see 20+ tables
```

### Step 4: Configure Row-Level Security

The `init.sql` script already enables RLS. Verify it's working:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All tables should show rowsecurity = true
```

### Step 5: Create Admin User

```sql
-- Insert your admin user (after signing up through the app)
UPDATE user_profiles 
SET role = 'owner', is_admin = true 
WHERE email = 'your-email@example.com';
```

---

## STORAGE CONFIGURATION

### Step 1: Create Storage Buckets

In Supabase SQL Editor, run:

```sql
\i storage-buckets.sql
```

### Step 2: Verify Buckets

1. Go to Storage in Supabase Dashboard
2. You should see 5 buckets:
   - `user-avatars`
   - `story-covers`
   - `user-uploads`
   - `story-assets`
   - `system-assets`

### Step 3: Test Upload

```typescript
// Test file upload
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Upload test file
const { data, error } = await supabase.storage
  .from('user-avatars')
  .upload('test/test.png', file);

console.log('Upload result:', { data, error });
```

---

## AUTHENTICATION SETUP

### Step 1: Configure Supabase Auth

1. Go to Authentication → Settings in Supabase Dashboard
2. Configure the following:

**Site URL:**
```
http://localhost:4028 (development)
https://stxryai.com (production)
```

**Redirect URLs:**
```
http://localhost:4028/**
https://stxryai.com/**
```

**Email Templates:**
- Customize confirmation email
- Customize password reset email
- Customize magic link email

### Step 2: Enable Auth Providers

1. Go to Authentication → Providers
2. Enable desired providers:
   - [x] Email (enabled by default)
   - [ ] Google OAuth (optional)
   - [ ] GitHub OAuth (optional)
   - [ ] Twitter OAuth (optional)

### Step 3: Configure Email Settings

If using custom SMTP:

1. Go to Authentication → Settings → SMTP Settings
2. Configure SendGrid SMTP:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: Your SendGrid API key

### Step 4: Test Authentication

```bash
# Start development server
npm run dev

# Navigate to http://localhost:4028/authentication
# Try signing up with a test email
# Check email for confirmation link
```

---

## PAYMENT INTEGRATION

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account or sign in
3. Complete business verification

### Step 2: Get API Keys

1. Go to Developers → API keys
2. Copy keys to `.env.local`:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### Step 3: Create Products & Prices

```bash
# Using Stripe CLI
stripe products create \
  --name="Premium" \
  --description="Premium subscription with advanced features"

stripe prices create \
  --product=prod_xxx \
  --unit-amount=999 \
  --currency=usd \
  --recurring[interval]=month

# Copy price ID to STRIPE_PREMIUM_PRICE_ID
```

Or use Stripe Dashboard:
1. Go to Products
2. Click "Add product"
3. Fill in details:
   - Name: Premium
   - Price: $9.99/month
   - Recurring: Monthly
4. Copy Price ID

Repeat for Creator Pro ($19.99/month).

### Step 4: Configure Webhooks

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### Step 5: Test Payments

```bash
# Use Stripe test cards
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002

# Test in development
npm run dev
# Navigate to /pricing
# Click "Subscribe to Premium"
# Use test card
```

---

## CI/CD CONFIGURATION

### Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Grant repository access

### Step 2: Create Netlify Site

1. Click "Add new site"
2. Import from Git
3. Select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: `stxryai`

### Step 3: Configure Environment Variables

In Netlify Dashboard → Site settings → Environment variables:

Add all variables from `.env.local` (except `NEXT_PUBLIC_APP_URL`)

### Step 4: Configure GitHub Actions

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_GA_MEASUREMENT_ID
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
NETLIFY_STAGING_SITE_ID
LHCI_GITHUB_APP_TOKEN (optional)
```

### Step 5: Get Netlify Tokens

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Get auth token
netlify status

# Get site ID
netlify sites:list
```

### Step 6: Test CI/CD

```bash
# Create a test branch
git checkout -b test-cicd

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "test: CI/CD pipeline"
git push origin test-cicd

# Create pull request on GitHub
# Watch the pipeline run
```

---

## FEATURE INITIALIZATION

### Step 1: Initialize Performance Monitoring

Edit `stxryai/src/app/layout.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { initializePerformanceOptimizations } from '@/lib/performance/bundleOptimization';
import { initializeAccessibility } from '@/lib/accessibility/wcag';
import { initializeSecurity } from '@/lib/security/enhanced';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize all features
    initializePerformanceOptimizations();
    initializeAccessibility();
    initializeSecurity();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Step 2: Configure Analytics

```typescript
// In _app.tsx or layout.tsx
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}
```

### Step 3: Set Up Error Tracking

```typescript
// Create src/lib/monitoring/errorTracking.ts
export function initializeErrorTracking() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // Send to error tracking service
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Send to error tracking service
    });
  }
}
```

---

## TESTING SETUP

### Step 1: Install Testing Dependencies

```bash
cd stxryai
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Step 2: Create Test Files

```bash
# Create __tests__ directory
mkdir -p src/__tests__

# Create example test
cat > src/__tests__/example.test.ts << 'EOF'
describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
EOF
```

### Step 3: Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Step 4: Set Up E2E Testing (Optional)

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Initialize Playwright
npx playwright install

# Create E2E test
mkdir -p e2e
cat > e2e/example.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:4028');
  await expect(page).toHaveTitle(/StxryAI/);
});
EOF
```

---

## PRODUCTION DEPLOYMENT

### Step 1: Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database initialized and tested
- [ ] Storage buckets created
- [ ] Authentication working
- [ ] Payments tested (test mode)
- [ ] CI/CD pipeline passing
- [ ] Tests passing
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] SSL certificate ready

### Step 2: Deploy to Staging

```bash
# Merge to staging branch
git checkout staging
git merge main
git push origin staging

# Netlify will automatically deploy
# Check staging URL: https://staging--your-site.netlify.app
```

### Step 3: Staging Testing

1. **Functional Testing:**
   - Sign up / Sign in
   - Create story
   - Read story
   - Update profile
   - Test payments (test mode)

2. **Performance Testing:**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Test on mobile devices

3. **Security Testing:**
   - Check security headers
   - Test authentication flows
   - Verify RLS policies

### Step 4: Deploy to Production

```bash
# Merge to main branch
git checkout main
git merge staging
git push origin main

# Netlify will automatically deploy to production
```

### Step 5: Post-Deployment Verification

```bash
# Check health endpoint
curl https://stxryai.com/api/health

# Verify database connection
# Verify storage access
# Test critical user flows
```

---

## MONITORING & MAINTENANCE

### Daily Monitoring

1. **Check Error Rates:**
   - Review error logs in Netlify
   - Check Supabase logs
   - Monitor PostHog errors

2. **Performance Metrics:**
   - Core Web Vitals
   - API response times
   - Database query performance

3. **User Activity:**
   - Active users
   - New signups
   - Story creations
   - Payment conversions

### Weekly Tasks

1. **Security Updates:**
   ```bash
   npm audit
   npm update
   ```

2. **Database Maintenance:**
   ```sql
   -- Check database size
   SELECT pg_size_pretty(pg_database_size('postgres'));
   
   -- Vacuum tables
   VACUUM ANALYZE;
   ```

3. **Backup Verification:**
   - Verify Supabase automatic backups
   - Test restore procedure

### Monthly Tasks

1. **Performance Audit:**
   - Run Lighthouse CI
   - Analyze bundle size
   - Review slow queries

2. **Security Audit:**
   - Review access logs
   - Check for suspicious activity
   - Update dependencies

3. **Cost Analysis:**
   - Review Supabase usage
   - Check Netlify bandwidth
   - Analyze Stripe fees

---

## TROUBLESHOOTING

### Common Issues

#### Database Connection Errors

```bash
# Check connection
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# If fails, check:
# 1. Password is correct
# 2. IP is whitelisted (Supabase → Settings → Database → Connection pooling)
# 3. Database is not paused
```

#### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

#### Authentication Issues

```sql
-- Check user exists
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- Check user profile
SELECT * FROM user_profiles WHERE email = 'user@example.com';

-- Reset password
UPDATE auth.users 
SET encrypted_password = crypt('newpassword', gen_salt('bf'))
WHERE email = 'user@example.com';
```

#### Payment Failures

```bash
# Check Stripe webhook logs
stripe listen --forward-to localhost:4028/api/webhooks/stripe

# Verify webhook secret matches
echo $STRIPE_WEBHOOK_SECRET

# Test webhook manually
stripe trigger payment_intent.succeeded
```

---

## ADDITIONAL RESOURCES

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

### Support
- GitHub Issues: https://github.com/your-username/stxryai/issues
- Discord Community: (create one)
- Email Support: support@stxryai.com

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter
npm run type-check       # Check TypeScript
npm test                 # Run tests

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset database

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
```

---

## CONCLUSION

You now have a complete setup guide for the StxryAI platform. Follow each section carefully, and you'll have a production-ready application.

**Estimated Setup Time:**
- Basic setup: 2-3 hours
- Full configuration: 1 day
- Testing & optimization: 2-3 days
- Production deployment: 1 day

**Total: 4-7 days for complete setup**

For questions or issues, refer to the troubleshooting section or create an issue on GitHub.

---

**Document Version:** 1.0.0  
**Last Updated:** January 2, 2026  
**Maintained By:** StxryAI Development Team
