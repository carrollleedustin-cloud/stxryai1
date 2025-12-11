# StxryAI Integrations Setup Guide

This guide provides complete setup instructions for all integrations used in the StxryAI platform.

---

## Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Stripe Payment Integration](#stripe-payment-integration)
3. [Analytics Integration](#analytics-integration)
4. [Email Service (Resend)](#email-service-resend)
5. [Storage Configuration](#storage-configuration)
6. [Environment Variables](#environment-variables)
7. [Deployment](#deployment)

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Enter project details:
   - Name: `stxryai`
   - Database Password: *Generate a strong password*
   - Region: Choose closest to your users

### 2. Get API Keys

1. Go to Project Settings → API
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (Keep secret!)

### 3. Run Database Schema

1. Go to SQL Editor in Supabase Dashboard
2. Create a new query
3. Copy the entire content from `supabase/schema.sql`
4. Run the query
5. Verify tables are created in Table Editor

### 4. Configure Storage Buckets

1. Go to Storage in Supabase Dashboard
2. Create three public buckets:
   - `story-assets` - For story content files
   - `cover-images` - For story cover images
   - `user-avatars` - For user profile pictures

3. Set bucket policies:
   - Make all buckets public for reading
   - Restrict uploads to authenticated users

### 5. Enable Authentication Providers

1. Go to Authentication → Providers
2. Enable Email provider (enabled by default)
3. Optional: Enable social auth providers:

**Google OAuth:**
```
- Go to Google Cloud Console
- Create OAuth 2.0 credentials
- Add redirect URL: https://[YOUR-PROJECT].supabase.co/auth/v1/callback
- Copy Client ID and Secret to Supabase
```

**GitHub OAuth:**
```
- Go to GitHub Settings → Developer settings → OAuth Apps
- Create new OAuth App
- Authorization callback URL: https://[YOUR-PROJECT].supabase.co/auth/v1/callback
- Copy Client ID and Secret to Supabase
```

**Discord OAuth:**
```
- Go to Discord Developer Portal
- Create new application
- Add redirect: https://[YOUR-PROJECT].supabase.co/auth/v1/callback
- Copy Client ID and Secret to Supabase
```

### 6. Configure Email Templates (Optional)

1. Go to Authentication → Email Templates
2. Customize:
   - Confirm Signup
   - Magic Link
   - Reset Password
   - Change Email

---

## Stripe Payment Integration

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete business verification

### 2. Get API Keys

1. Go to Developers → API keys
2. Copy:
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`

### 3. Create Products and Prices

1. Go to Products → Add Product

**Premium Tier:**
```
- Name: Premium
- Price: $7.14/month
- Recurring: Monthly
- Copy the Price ID → STRIPE_PREMIUM_PRICE_ID
```

**Creator Pro Tier:**
```
- Name: Creator Pro
- Price: $15.00/month
- Recurring: Monthly
- Copy the Price ID → STRIPE_CREATOR_PRO_PRICE_ID
```

### 4. Setup Webhook

1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 5. Test Mode

- Use test mode during development
- Test cards: `4242 4242 4242 4242` (any future date, any CVC)
- Switch to live mode for production

---

## Analytics Integration

### PostHog Setup

1. Go to [posthog.com](https://posthog.com) and create account
2. Create new project
3. Copy Project API Key → `NEXT_PUBLIC_POSTHOG_KEY`
4. (Optional) Self-host PostHog for data privacy

**Features:**
- Session recordings
- Feature flags
- A/B testing
- User analytics
- Funnel analysis

### Google Analytics 4 Setup

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create new GA4 property
3. Get Measurement ID → `NEXT_PUBLIC_GA_MEASUREMENT_ID`
4. Add to `app/layout.tsx`:

```tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
  strategy="afterInteractive"
/>
```

---

## Email Service (Resend)

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email

### 2. Add Domain

1. Go to Domains → Add Domain
2. Enter your domain: `stxryai.com`
3. Add DNS records to your domain provider:
   - SPF record
   - DKIM records
   - DMARC record (optional)
4. Wait for verification (usually 15 minutes)

### 3. Get API Key

1. Go to API Keys
2. Create new API key
3. Copy key → `RESEND_API_KEY`

### 4. Set From Address

- Update `.env`: `EMAIL_FROM=noreply@stxryai.com`
- Or use: `EMAIL_FROM=onboarding@resend.dev` (for testing)

---

## Storage Configuration

### Supabase Storage Buckets

All storage is handled through Supabase Storage. Ensure buckets are created:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('story-assets', 'story-assets', true),
  ('cover-images', 'cover-images', true),
  ('user-avatars', 'user-avatars', true);
```

### Storage Policies

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cover-images');

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cover-images');

-- Users can update own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Environment Variables

### Development (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PREMIUM_PRICE_ID=price_xxx
STRIPE_CREATOR_PRO_PRICE_ID=price_xxx

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@stxryai.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Production Environment

1. **Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Use production keys (not test keys)

2. **Environment-specific:**
   - `NEXT_PUBLIC_APP_URL` = your production domain
   - `NODE_ENV` = production
   - Use live Stripe keys
   - Use production Supabase project

---

## Deployment

### Pre-Deployment Checklist

- [ ] Database schema applied
- [ ] Storage buckets created
- [ ] Stripe products created
- [ ] Webhook endpoints configured
- [ ] Domain verified for email
- [ ] Environment variables set
- [ ] OAuth providers configured (optional)
- [ ] Analytics properties created

### Deploy to Vercel

1. **Connect Repository:**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables:**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all production variables

3. **Configure Domains:**
   - Add custom domain in Vercel
   - Update DNS records
   - Enable HTTPS

4. **Post-Deployment:**
   - Test authentication flow
   - Test payment flow (use test mode first)
   - Verify email sending
   - Check analytics tracking
   - Test file uploads

### Database Migrations

For future schema changes:

```bash
# Generate migration
npx supabase migration new your_migration_name

# Apply migration
npx supabase db push
```

---

## Testing Integrations

### Test Supabase Connection

```typescript
import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();
const { data, error } = await supabase.from('users').select('count');
console.log('Supabase connected:', !error);
```

### Test Stripe Connection

```typescript
import { stripe } from '@/lib/stripe/server';

const products = await stripe.products.list();
console.log('Stripe connected:', products.data.length > 0);
```

### Test Email Sending

```typescript
import { sendEmail, emailTemplates } from '@/lib/email/resend';

const result = await sendEmail({
  to: 'test@example.com',
  ...emailTemplates.welcome('TestUser'),
});
console.log('Email sent:', result.success);
```

### Test Analytics

```typescript
import { analytics } from '@/lib/analytics/posthog';

analytics.storyViewed('story-123', 'Test Story');
// Check PostHog dashboard for event
```

---

## Common Issues

### Supabase

**Issue:** `Auth session missing`
- **Solution:** Check middleware is configured correctly
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Issue:** RLS policies blocking queries
- **Solution:** Review RLS policies in Supabase
- Use service role client for admin operations

### Stripe

**Issue:** Webhook signature verification failed
- **Solution:** Ensure raw body is passed to webhook handler
- Check `STRIPE_WEBHOOK_SECRET` is correct

**Issue:** Subscription not updating user tier
- **Solution:** Verify webhook is receiving events
- Check Stripe dashboard → Developers → Events

### Email

**Issue:** Emails not sending
- **Solution:** Verify domain DNS records
- Check `RESEND_API_KEY` is correct
- Ensure "From" address is verified

**Issue:** Emails going to spam
- **Solution:** Add SPF, DKIM, and DMARC records
- Warm up domain by sending gradually increasing volumes

---

## Security Best Practices

### Environment Variables

- Never commit `.env.local` or `.env`
- Use `.env.example` as template
- Rotate secrets regularly
- Use different keys for dev/prod

### API Keys

- Store service role keys securely
- Never expose in client code
- Use environment variables
- Restrict API key permissions

### Webhooks

- Always verify signatures
- Use HTTPS endpoints
- Log webhook events
- Handle idempotency

### Database

- Enable RLS on all tables
- Test policies thoroughly
- Use parameterized queries
- Regular backups

---

## Monitoring

### Supabase Dashboard

- Monitor database performance
- Track API usage
- Review auth logs
- Check storage usage

### Stripe Dashboard

- Monitor successful/failed payments
- Track MRR (Monthly Recurring Revenue)
- Review customer disputes
- Analyze churn rate

### Analytics Dashboard

- User acquisition metrics
- Feature adoption rates
- User retention cohorts
- Conversion funnels

### Error Tracking (Optional)

Consider adding Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Support Resources

### Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)
- [PostHog Docs](https://posthog.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Community

- Supabase Discord
- Stripe Support
- Next.js Discussions
- StxryAI GitHub Issues

---

## Next Steps

After completing setup:

1. **Test all integrations** in development
2. **Create test accounts** for each user tier
3. **Run through user flows:**
   - Sign up → Onboarding → First story
   - Subscribe → Premium features
   - Create story → Publish → Analytics
4. **Monitor initial production usage**
5. **Set up alerts** for critical errors
6. **Document any customizations**

---

## Maintenance

### Regular Tasks

- **Weekly:**
  - Review error logs
  - Check webhook delivery
  - Monitor API usage

- **Monthly:**
  - Review Stripe metrics
  - Analyze user growth
  - Update dependencies
  - Database maintenance

- **Quarterly:**
  - Rotate API keys
  - Review security policies
  - Audit user permissions
  - Performance optimization

---

## Conclusion

With all integrations configured, your StxryAI platform is ready for production use. Monitor all services closely during the first few weeks and be prepared to adjust configurations based on real-world usage patterns.

For questions or issues, refer to the documentation links above or open an issue on GitHub.

Happy storytelling! 📚✨
