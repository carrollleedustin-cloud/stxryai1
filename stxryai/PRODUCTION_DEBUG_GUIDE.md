# 🔍 Production Debug Guide - Stuck at Landing Page

If you're stuck at https://stxryai.com/, follow these steps to diagnose and fix the issue.

---

## 🚨 Quick Checks (Do These First)

### 1. Check Browser Console
**Open Developer Tools (F12) and check for errors:**

1. Press `F12` or right-click → "Inspect"
2. Go to **Console** tab
3. Look for red errors
4. **Common errors:**
   - `Missing required environment variables` → Netlify env vars not set
   - `Supabase is not configured` → Supabase keys missing
   - `Cannot access 'T' before initialization` → Build/code issue
   - `Failed to fetch` → Network/API issue

**What to do:**
- Copy any red error messages
- Check the **Network** tab for failed requests

---

### 2. Check Netlify Build Logs

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Deploys** tab
4. Click on the latest deploy
5. Check the build log for:
   - ❌ Build failures
   - ⚠️ Warnings about missing env vars
   - ❌ TypeScript/compilation errors

**What to look for:**
```
Error: Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL
```

---

### 3. Verify Environment Variables in Netlify

1. Go to **Site settings** → **Environment variables**
2. Verify these are set:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `NEXT_PUBLIC_APP_URL` (should be `https://stxryai.com`)

**If missing:**
- Add them using the values from your `.env.local`
- Trigger a new deploy after adding

---

## 🔧 Common Issues & Fixes

### Issue 1: Blank Page / Nothing Loads

**Symptoms:**
- Page is completely white/blank
- No content appears

**Possible Causes:**
1. **Missing Supabase keys** → App can't initialize
2. **Build failed** → Broken JavaScript
3. **Environment variables not set** → App crashes on load

**Fix:**
1. Check Netlify build logs (see above)
2. Verify all required env vars are set
3. Check browser console for errors
4. Trigger a new deploy

---

### Issue 2: Page Loads But Buttons Don't Work

**Symptoms:**
- Landing page shows but clicking "Get Started" or "Sign In" does nothing
- Navigation doesn't work

**Possible Causes:**
1. **JavaScript errors** → Check console
2. **Router not working** → Next.js routing issue
3. **Auth context not initialized** → Check for auth errors

**Fix:**
1. Open browser console (F12)
2. Look for JavaScript errors
3. Try clicking buttons and watch console
4. Check if `/authentication` route exists

---

### Issue 3: Redirect Loop

**Symptoms:**
- Page keeps refreshing
- URL changes but page doesn't load
- "Redirecting..." message appears

**Possible Causes:**
1. **Middleware redirect loop** → Auth check issue
2. **Dashboard redirecting back** → Auth state not set
3. **Environment variables wrong** → Auth can't verify user

**Fix:**
1. Check middleware.ts logic
2. Verify Supabase keys are correct
3. Clear browser cookies for stxryai.com
4. Try incognito/private window

---

### Issue 4: "Missing Environment Variables" Error

**Symptoms:**
- Error message about missing env vars
- Build succeeds but app doesn't work

**Fix:**
1. Run `npm run prepare-netlify` locally to see what's needed
2. Add all variables to Netlify
3. Make sure variable names match exactly (case-sensitive!)
4. Trigger new deploy

---

## 📋 Step-by-Step Fix Process

### Step 1: Verify Netlify Environment Variables

```bash
# Run this locally to see what you need
cd stxryai
npm run prepare-netlify
```

Then in Netlify:
1. Site settings → Environment variables
2. Add each variable from the output
3. **Important:** Update `NEXT_PUBLIC_APP_URL` to `https://stxryai.com`

---

### Step 2: Check Latest Code is Deployed

1. Go to Netlify → **Deploys**
2. Check the latest deploy:
   - ✅ Is it successful?
   - ✅ When was it deployed?
   - ✅ Does it include your latest fixes?

3. If not latest:
   - Push your latest code to GitHub
   - Or trigger a new deploy manually

---

### Step 3: Trigger Fresh Deploy

After adding/changing environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete
4. Check build logs for errors
5. Test the site again

---

### Step 4: Test in Browser

1. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear cached images and files
   - Or use incognito/private window

2. **Open site:**
   - Go to https://stxryai.com
   - Open Developer Tools (F12)
   - Check Console tab for errors

3. **Test navigation:**
   - Click "Get Started" button
   - Should go to `/authentication?mode=signup`
   - Click "Sign In" button
   - Should go to `/authentication?mode=login`

---

## 🆘 Still Not Working?

### Get More Information

1. **Browser Console Errors:**
   - Copy all red error messages
   - Check Network tab for failed requests

2. **Netlify Build Logs:**
   - Copy any error messages from the build
   - Check if build completed successfully

3. **Network Requests:**
   - Open Network tab in DevTools
   - Look for failed requests (red)
   - Check what URLs are failing

### What to Share

If you need help, share:
- ✅ Browser console errors (screenshot or copy text)
- ✅ Netlify build log errors
- ✅ What happens when you click buttons
- ✅ Any error messages you see

---

## ✅ Quick Checklist

Before asking for help, verify:

- [ ] All required env vars are set in Netlify
- [ ] `NEXT_PUBLIC_APP_URL` is set to `https://stxryai.com`
- [ ] Latest code is deployed (check deploy date)
- [ ] Build completed successfully (no errors)
- [ ] Browser console checked (no JavaScript errors)
- [ ] Tried clearing cache/incognito mode
- [ ] Tested clicking "Get Started" and "Sign In" buttons

---

## 🎯 Most Likely Issues

Based on "stuck at landing page", most common causes are:

1. **#1 Most Common:** Environment variables not set in Netlify
   - **Fix:** Add all variables from `.env.local` to Netlify

2. **#2 Most Common:** `NEXT_PUBLIC_APP_URL` is wrong
   - **Fix:** Set to `https://stxryai.com` (not localhost)

3. **#3 Most Common:** Supabase keys are incorrect
   - **Fix:** Verify keys match your Supabase project

4. **#4 Most Common:** Latest code not deployed
   - **Fix:** Push to GitHub or trigger new deploy

---

**Start with Step 1 above and work through each step. Most issues are fixed by setting environment variables correctly in Netlify!**

