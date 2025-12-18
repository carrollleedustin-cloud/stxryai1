# 📢 Google AdSense Setup Guide for StxryAI

## 🎯 Overview

This guide will help you set up Google AdSense to monetize free users while providing an ad-free experience for Premium and Creator Pro subscribers.

---

## 📋 Prerequisites

Before starting, you'll need:
- [ ] A Google account
- [ ] StxryAI domain verified
- [ ] Minimum content (at least 10-20 stories published)
- [ ] Traffic (recommended: 100+ daily visitors)
- [ ] Privacy Policy and Terms of Service pages

---

## 🚀 Step 1: Create Google AdSense Account

### 1.1 Sign Up
1. Go to https://www.google.com/adsense
2. Click "Get Started"
3. Enter your website URL: `your-stxryai-domain.com`
4. Select your country
5. Accept terms and conditions

### 1.2 Connect Your Site
1. Copy the AdSense code snippet
2. Add it to your site's `<head>` section
3. We'll do this in Step 3 below

### 1.3 Wait for Approval
- Review time: 1-2 weeks
- Google will review your site
- You'll receive email notification

---

## ⚙️ Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_HEADER=1234567890
NEXT_PUBLIC_ADSENSE_FOOTER=1234567891
NEXT_PUBLIC_ADSENSE_SIDEBAR=1234567892
NEXT_PUBLIC_ADSENSE_CONTENT=1234567893
NEXT_PUBLIC_ADSENSE_STORY=1234567894
```

**Replace with your actual values:**
- `ADSENSE_CLIENT`: Your AdSense Publisher ID (starts with `ca-pub-`)
- `ADSENSE_*`: Ad slot IDs from AdSense dashboard

---

## 📝 Step 3: Add AdSense to Your App

### 3.1 Update Root Layout

Edit `src/app/layout.tsx`:

```tsx
import Script from 'next/script';
import { GOOGLE_ADSENSE_CONFIG } from '@/lib/ads/googleAdsense';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        {GOOGLE_ADSENSE_CONFIG.ENABLED && (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CONFIG.CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3.2 Add Banner Ads to Pages

Example: Story Library Page

```tsx
import BannerAd, { ResponsiveBannerAd } from '@/components/ads/BannerAd';
import { GOOGLE_ADSENSE_CONFIG } from '@/lib/ads/googleAdsense';
import { useAuth } from '@/contexts/AuthContext';

export default function StoryLibrary() {
  const { user } = useAuth();
  const isPremium = user?.subscription_tier !== 'free';

  return (
    <div>
      {/* Top Banner */}
      <ResponsiveBannerAd
        position="top"
        adClient={GOOGLE_ADSENSE_CONFIG.CLIENT_ID}
        adSlot={GOOGLE_ADSENSE_CONFIG.AD_SLOTS.HEADER_BANNER}
        isPremium={isPremium}
        showCloseButton={true}
      />

      {/* Page Content */}
      <main>
        {/* Your content */}
      </main>

      {/* Bottom Banner */}
      <BannerAd
        position="bottom"
        size="leaderboard"
        adClient={GOOGLE_ADSENSE_CONFIG.CLIENT_ID}
        adSlot={GOOGLE_ADSENSE_CONFIG.AD_SLOTS.FOOTER_BANNER}
        isPremium={isPremium}
      />
    </div>
  );
}
```

### 3.3 Add Sidebar Ads

```tsx
import { SidebarAd } from '@/components/ads/BannerAd';

<aside className="w-64">
  <SidebarAd
    adClient={GOOGLE_ADSENSE_CONFIG.CLIENT_ID}
    adSlot={GOOGLE_ADSENSE_CONFIG.AD_SLOTS.SIDEBAR}
    isPremium={isPremium}
  />
</aside>
```

### 3.4 Add In-Content Ads

```tsx
import { InContentAd } from '@/components/ads/BannerAd';

<div>
  <p>Story content...</p>

  {/* Ad between content sections */}
  <InContentAd
    adClient={GOOGLE_ADSENSE_CONFIG.CLIENT_ID}
    adSlot={GOOGLE_ADSENSE_CONFIG.AD_SLOTS.IN_CONTENT}
    isPremium={isPremium}
  />

  <p>More content...</p>
</div>
```

---

## 🎨 Step 4: Create Ad Units in AdSense

### 4.1 Log into AdSense Dashboard
1. Go to https://www.google.com/adsense
2. Navigate to "Ads" → "By ad unit"

### 4.2 Create Display Ads

Create these ad units:

#### Header Banner (Leaderboard)
- **Name**: StxryAI - Header Banner
- **Size**: Responsive or 728x90
- **Type**: Display ad

#### Footer Banner
- **Name**: StxryAI - Footer Banner
- **Size**: Responsive or 728x90
- **Type**: Display ad

#### Sidebar Ad
- **Name**: StxryAI - Sidebar
- **Size**: 300x250 or 336x280
- **Type**: Display ad

#### In-Content Ad
- **Name**: StxryAI - In-Content
- **Size**: 300x250
- **Type**: In-article ad

#### Story Page Ad
- **Name**: StxryAI - Story Page
- **Size**: Responsive
- **Type**: In-article ad

### 4.3 Copy Ad Slot IDs
1. For each ad unit, copy the "data-ad-slot" value
2. Add to your `.env.local` file
3. Restart your dev server

---

## 📊 Step 5: Configure Ad Placements

### Recommended Ad Placements:

#### Homepage
- ✅ Header banner (top of page)
- ✅ Sidebar (right side, sticky)
- ❌ Footer (optional)
- ❌ In-content (avoid on homepage)

#### Story Library
- ✅ Header banner
- ✅ Sidebar
- ✅ In-content (between story cards, every 6 stories)
- ❌ Footer

#### Story Reader
- ❌ Header (don't distract readers)
- ❌ Sidebar (keep reading area clean)
- ✅ In-content (between chapters only)
- ✅ Footer (after story ends)

#### Dashboard
- ❌ Header
- ✅ Sidebar
- ❌ In-content
- ✅ Footer

---

## 🎯 Step 6: Optimize Ad Performance

### Best Practices

#### 1. Ad Density
- **Maximum 3 ads per page** for best UX
- Don't overwhelm users with ads
- Space ads naturally in content

#### 2. Ad Placement
- Above the fold: 1 ad maximum
- Sidebar: Sticky ads perform well
- In-content: Natural breaks only
- End of content: High viewability

#### 3. Responsive Design
- Use responsive ad units
- Test on mobile, tablet, desktop
- Ensure ads don't break layout

#### 4. Page Speed
- Lazy load ads below the fold
- Use async loading (already implemented)
- Monitor Core Web Vitals

### Ad Performance Tips

1. **Enable Auto Ads** (optional)
   - AdSense automatically places ads
   - Good for testing optimal placements
   - Can be overridden with manual ads

2. **Use Matched Content**
   - Shows related stories
   - Better engagement than display ads
   - Recommended for story pages

3. **Enable Link Ads**
   - Text-based ads
   - Less intrusive
   - Good for story reader pages

---

## 💰 Step 7: Monetization Strategy

### Revenue Estimates

Based on industry averages:

| Page Views/Day | Est. Monthly Revenue |
|----------------|---------------------|
| 1,000 | $10-30 |
| 5,000 | $50-150 |
| 10,000 | $100-300 |
| 50,000 | $500-1,500 |
| 100,000 | $1,000-3,000 |

**Factors affecting revenue:**
- Geographic location of users
- Content niche
- Ad placement
- User engagement
- Premium user ratio

### Conversion Strategy

**Goal**: Convert free users to Premium ($5/month)

**Ad frequency to encourage upgrades:**
- Show 2-3 ads per session
- Increase frequency for heavy users
- Offer "Remove Ads" CTA in ad banners
- Display upgrade prompts after 5 stories read

---

## 🔒 Step 8: Privacy & Compliance

### Required Pages

#### 1. Privacy Policy
Must include:
- Google AdSense usage
- Cookie disclosure
- Third-party advertiser notice
- User data collection
- GDPR/CCPA compliance

#### 2. Terms of Service
Must include:
- Ad-supported content notice
- Premium tier benefits
- Refund policy

### Cookie Consent

Implement cookie consent banner:

```tsx
import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    // Initialize AdSense
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use cookies and third-party services like Google AdSense to improve your experience.
        </p>
        <button
          onClick={acceptCookies}
          className="px-6 py-2 bg-primary text-white rounded-lg"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
```

---

## 🧪 Step 9: Testing

### Test Ads in Development

1. **Enable Test Mode**
   ```env
   NODE_ENV=development
   ```

2. **Use AdSense Test Ads**
   - AdSense automatically shows test ads in development
   - Or use `data-adtest="on"` attribute

3. **Test Different Scenarios**
   - Free user (sees ads)
   - Premium user (no ads)
   - Mobile vs desktop
   - Different ad placements

### Verify Installation

1. **Check Browser Console**
   - No AdSense errors
   - Ads loading successfully

2. **Use AdSense Preview Tool**
   - AdSense dashboard → Tools → Preview

3. **Test Responsive Behavior**
   - Resize browser
   - Check mobile devices
   - Verify ad sizes adjust

---

## 📈 Step 10: Monitor Performance

### AdSense Dashboard Metrics

Track these daily:
- **Page RPM**: Revenue per 1,000 pageviews
- **CTR**: Click-through rate
- **CPC**: Cost per click
- **Impressions**: Total ad views
- **Invalid Traffic**: Monitor for click fraud

### Google Analytics Integration

Track ad performance:
```javascript
// Track ad impressions
gtag('event', 'ad_impression', {
  ad_slot: slotId,
  ad_position: position
});

// Track ad clicks
gtag('event', 'ad_click', {
  ad_slot: slotId,
  ad_position: position,
  value: estimatedRevenue
});
```

### A/B Testing

Test different ad configurations:
- Ad density (1 vs 2 vs 3 ads per page)
- Ad placement (sidebar vs in-content)
- Ad sizes (responsive vs fixed)
- Ad formats (display vs native)

---

## 🚨 Troubleshooting

### Ads Not Showing

**Problem**: Ads don't display
**Solutions**:
1. Check AdSense approval status
2. Verify ad code is correct
3. Check browser ad blockers
4. Review AdSense policy violations
5. Wait 24 hours after adding code

### Low Revenue

**Problem**: Revenue below expectations
**Solutions**:
1. Improve ad placement
2. Increase traffic
3. Enhance user engagement
4. Try different ad formats
5. Enable auto ads
6. Check for invalid traffic

### Policy Violations

**Problem**: AdSense policy warning
**Solutions**:
1. Review AdSense policies
2. Remove prohibited content
3. Fix implementation issues
4. Appeal if wrongly flagged
5. Contact AdSense support

---

## ✅ Checklist

### Pre-Launch
- [ ] AdSense account approved
- [ ] Ad units created
- [ ] Environment variables configured
- [ ] Ads added to key pages
- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] Tested on multiple devices
- [ ] Premium users don't see ads
- [ ] Analytics tracking added

### Post-Launch
- [ ] Monitor ad performance daily
- [ ] Check for policy violations
- [ ] Optimize ad placements
- [ ] A/B test configurations
- [ ] Track revenue vs Premium conversions
- [ ] Adjust ad frequency based on data
- [ ] Review monthly earnings report

---

## 💡 Pro Tips

1. **Balance Revenue and UX**
   - Don't sacrifice user experience for ads
   - Premium conversions > ad revenue long-term
   - Use ads to highlight Premium benefits

2. **Strategic Ad Placement**
   - Place upgrade CTAs near ads
   - Show fewer ads to engaged users
   - Increase ads for casual browsers

3. **Conversion Optimization**
   - Track free-to-premium conversion rate
   - If >5%, reduce ads (UX is good)
   - If <2%, ads might be too aggressive

4. **Seasonal Adjustments**
   - Higher ad revenue in Q4 (holidays)
   - Adjust ad density seasonally
   - Promote Premium during high-revenue periods

---

## 📚 Resources

- [Google AdSense Help Center](https://support.google.com/adsense)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)
- [AdSense Best Practices](https://support.google.com/adsense/answer/17957)
- [AdSense Program Policies](https://support.google.com/adsense/answer/23921)

---

## 🎯 Summary

**Your monetization strategy:**
1. Free users see 2-3 ads per session
2. Ads encourage Premium upgrades ($5/month)
3. Premium removes all ads
4. Creator Pro ($15/month) gets monetization tools
5. Balance ad revenue with user experience
6. Optimize for Premium conversions over ad clicks

**Expected results:**
- Ad revenue: $100-500/month (at 10k daily visitors)
- Premium conversions: 2-5% of active users
- Combined revenue significantly > ads alone
- Better long-term user retention

---

*Setup Date: December 9, 2025*
*Version: 1.0*
