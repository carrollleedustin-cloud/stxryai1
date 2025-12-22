# 🚀 Netlify Environment Variables Setup Guide

Quick guide to add your environment variables to Netlify for production deployment.

---

## 📋 Quick Setup (5 minutes)

### Step 1: Prepare Your Variables

Run this command to see all your variables formatted for Netlify:

```bash
npm run prepare-netlify
```

This will:
- ✅ Show all your environment variables
- ✅ Categorize them (Required/Recommended/Optional)
- ✅ Create a reference file (`netlify-env-vars.json`)
- ✅ Display them in a format ready to copy

---

### Step 2: Add to Netlify Dashboard

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Sign in to your account

2. **Select Your Site**
   - Click on your StxryAI site

3. **Navigate to Environment Variables**
   - Click **Site settings** (gear icon in the top menu)
   - Scroll down to **Environment variables** in the left sidebar
   - Click on it

4. **Add Each Variable**
   - Click **Add a variable** button
   - For each variable from your `.env.local`:
     - **Key:** The variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
     - **Value:** Your actual value (copy from `.env.local`)
     - **Scopes:** Leave as "All scopes" (or select specific if needed)
   - Click **Save**

---

## 📝 Variables to Add

Based on your current setup, add these variables:

### 🔴 Required (Must Have)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 🟡 Recommended (Should Have)
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your production domain, e.g., `https://stxryai.com`)

### 🟢 Optional (Nice to Have)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PREMIUM_PRICE_ID`
- `STRIPE_CREATOR_PRO_PRICE_ID`
- `OPEN_AI_SECRET_KEY`
- `OPEN_AI_SERVICE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_ADSENSE_CLIENT`
- `NEXT_PUBLIC_ADSENSE_ID`

---

## ⚠️ Important Production Notes

### 1. Use Production Keys
- **Stripe:** Use `pk_live_...` and `sk_live_...` (not test keys)
- **Supabase:** Can use same project or create a production project
- **OpenAI:** Same key works for both dev and production

### 2. Update App URL
- Set `NEXT_PUBLIC_APP_URL` to your actual production domain
- Example: `https://stxryai.com` (not `http://localhost:4028`)

### 3. Stripe Webhook
- Make sure your Stripe webhook endpoint is set to: `https://your-domain.netlify.app/api/webhooks/stripe`
- Get the webhook secret from Stripe Dashboard → Webhooks

### 4. Email Domain
- Make sure your `EMAIL_FROM` domain is verified in Resend
- Example: If using `noreply@stxryai.com`, verify `stxryai.com` in Resend

---

## ✅ Verification Steps

### 1. Check Variables Are Set
After adding all variables:
- Go to **Site settings** → **Environment variables**
- Verify all variables are listed
- Check that values are correct (they'll be masked for security)

### 2. Trigger a New Deploy
- Go to **Deploys** tab
- Click **Trigger deploy** → **Deploy site**
- This will rebuild with your new environment variables

### 3. Check Build Logs
- Watch the deploy process
- Look for any "Missing required environment variables" errors
- If you see errors, double-check the variable names match exactly

### 4. Test Production Site
- Visit your production URL
- Test key features:
  - ✅ Can create/login to account
  - ✅ Dashboard loads
  - ✅ Database connections work
  - ✅ Payments work (if using Stripe)

---

## 🆘 Troubleshooting

### "Missing required environment variables" Error
- **Fix:** Check variable names match exactly (case-sensitive)
- **Check:** No extra spaces in variable names or values
- **Verify:** Variables are set for the correct scope

### Build Works But App Doesn't
- **Check:** `NEXT_PUBLIC_APP_URL` is set to production domain
- **Verify:** Supabase URL and keys are correct
- **Test:** Check browser console for errors

### Stripe Payments Not Working
- **Verify:** Using live keys (not test keys) in production
- **Check:** Webhook endpoint is correct in Stripe Dashboard
- **Test:** Check Stripe Dashboard → Events for webhook calls

### Email Not Sending
- **Verify:** Domain is verified in Resend
- **Check:** `EMAIL_FROM` matches verified domain
- **Test:** Check Resend Dashboard → Logs

---

## 📚 Quick Reference

### Netlify Dashboard Links
- **Environment Variables:** `https://app.netlify.com/sites/YOUR_SITE/settings/deploys#environment-variables`
- **Deploys:** `https://app.netlify.com/sites/YOUR_SITE/deploys`
- **Site Settings:** `https://app.netlify.com/sites/YOUR_SITE/configuration/general`

### Variable Naming
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without `NEXT_PUBLIC_` are server-side only (more secure)
- All variable names are **case-sensitive**

---

## 🎯 Next Steps After Setup

1. ✅ All variables added to Netlify
2. ✅ Triggered new deploy
3. ✅ Build completed successfully
4. ✅ Tested production site
5. ✅ All features working

**You're ready to go live! 🚀**

---

## 💡 Pro Tips

- **Use Netlify's Environment Variable UI** - It's easier than editing config files
- **Test in Deploy Preview First** - Netlify creates previews for each PR
- **Keep Dev and Prod Separate** - Use different Stripe keys for test vs live
- **Monitor Build Logs** - They'll show if variables are missing
- **Use Netlify's Secrets** - For sensitive keys, consider using Netlify's secrets feature

---

**Need Help?** Run `npm run prepare-netlify` to see your variables formatted for easy copying!

