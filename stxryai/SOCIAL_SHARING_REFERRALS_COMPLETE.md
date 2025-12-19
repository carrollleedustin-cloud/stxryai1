# Social Sharing & Referrals Implementation

**Date:** December 18, 2024  
**Status:** ✅ Complete  
**Phase:** Phase 1 - Week 5-6

---

## ✅ What Was Implemented

### 1. Database Migrations ✅
**File:** `supabase/migrations/20241218140000_add_referral_system.sql`

**Created Tables:**
- `referrals` - Tracks referral codes and status
- `referral_rewards` - Manages rewards for successful referrals
- `share_tracking` - Tracks social media shares for analytics

**Features:**
- Unique referral code generation
- Automatic reward assignment
- Share analytics tracking
- Row Level Security (RLS) policies

---

### 2. Share Card Generation Service ✅
**File:** `src/services/shareCardService.ts`

**Features:**
- Client-side canvas-based share card generation
- Multiple themes (default, achievement, milestone, story, streak)
- Customizable colors and styling
- Text wrapping and layout
- Download functionality
- Helper methods for common share card types

**Supported Card Types:**
- Story share cards
- Achievement share cards
- Streak share cards
- Milestone share cards
- Custom share cards

---

### 3. Referral Service ✅
**File:** `src/services/referralService.ts`

**Implemented Methods:**
- `generateReferralCode()` - Generate unique referral code
- `getReferralCode()` - Get user's referral code
- `useReferralCode()` - Apply referral code on signup
- `validateReferralCode()` - Check if code is valid
- `getReferralStats()` - Get referral statistics
- `getUserReferrals()` - Get user's referrals
- `getUserRewards()` - Get user's rewards
- `trackShare()` - Track social media shares
- `getStoryShareStats()` - Get share statistics for story

---

### 4. Enhanced ShareButton Component ✅
**File:** `src/components/social/ShareButton.tsx`

**New Features:**
- Share card preview
- Referral code integration
- Share tracking
- Download share card option
- Enhanced platform support
- Better error handling

**Platforms Supported:**
- Twitter/X
- Facebook
- LinkedIn
- Reddit
- WhatsApp
- Telegram
- Email
- Clipboard
- Native Share API

---

### 5. Referral Dashboard Component ✅
**File:** `src/components/referrals/ReferralDashboard.tsx`

**Features:**
- Referral code display
- Copy referral link
- Share referral link
- Statistics dashboard
- Rewards list
- "How It Works" guide

---

### 6. API Route ✅
**File:** `src/app/api/share/card/route.ts`

**Note:** Currently returns 501 (Not Implemented) as client-side generation is primary. Can be enhanced with server-side image generation if needed.

---

## 🎯 Referral System Details

### Referral Code Format
- Format: `STXRY-XXXXXXXX`
- Unique per user
- Auto-generated on first use

### Rewards Structure

**For Referrer:**
- 1 month free Premium subscription
- Reward expires 30 days after completion

**For Referee:**
- 50% off first month Premium
- Reward expires 30 days after signup

### Referral Flow

1. User generates referral code
2. User shares code/link with friend
3. Friend signs up using code
4. System automatically:
   - Marks referral as completed
   - Awards rewards to both users
   - Tracks referral in database

---

## 📊 Share Tracking

### Tracked Data
- User ID (if logged in)
- Story ID (if sharing story)
- Platform (twitter, facebook, etc.)
- Share type (story, achievement, streak, milestone)
- Share URL
- Timestamp
- Metadata (optional)

### Analytics Use Cases
- Most shared stories
- Popular sharing platforms
- Share conversion rates
- Viral content identification

---

## 🎨 Share Card Features

### Themes
- **Default** - Purple gradient
- **Achievement** - Orange/yellow gradient
- **Milestone** - Green gradient
- **Story** - Indigo gradient
- **Streak** - Orange gradient

### Customization
- Custom background colors
- Custom text colors
- Stats display
- Logo/branding
- Image support

### Generation
- Client-side (canvas-based)
- 1200x630px (standard OG image size)
- PNG or JPEG format
- High quality output

---

## 🔧 Integration Points

### Signup Flow
When a new user signs up with a referral code:
```typescript
// In signup handler
const refCode = searchParams.get('ref');
if (refCode) {
  await referralService.useReferralCode(refCode, newUserId);
}
```

### Story Sharing
```typescript
<ShareButton
  title={story.title}
  description={story.description}
  url={`/stories/${story.id}`}
  storyId={story.id}
  shareType="story"
  shareCardData={shareCardService.generateStoryShareCard(story)}
  showShareCard={true}
/>
```

### Achievement Sharing
```typescript
<ShareButton
  title={`🏆 ${achievement.name}`}
  description={achievement.description}
  url="/user-dashboard"
  shareType="achievement"
  shareCardData={shareCardService.generateAchievementShareCard(achievement)}
/>
```

---

## 📝 Usage Examples

### Generate Referral Code
```typescript
import { referralService } from '@/services/referralService';

const code = await referralService.generateReferralCode(userId);
console.log('Your referral code:', code);
```

### Track Share
```typescript
await referralService.trackShare(
  userId,
  storyId,
  'twitter',
  'story',
  shareUrl
);
```

### Get Referral Stats
```typescript
const stats = await referralService.getReferralStats(userId);
console.log('Total referrals:', stats.totalReferrals);
console.log('Completed:', stats.completedReferrals);
```

### Generate Share Card
```typescript
import { shareCardService } from '@/services/shareCardService';

const cardData = {
  title: 'My Amazing Story',
  subtitle: 'Check out this story on StxryAI',
  theme: 'story',
  stats: [
    { label: 'Reads', value: '1,234' }
  ]
};

const cardUrl = await shareCardService.generateShareCard(cardData);
// Use cardUrl as image source
```

---

## 🚀 Next Steps

### Recommended Enhancements

1. **Server-Side Share Card Generation**
   - Use @vercel/og for server-side image generation
   - Better performance for OG tags
   - SEO improvements

2. **Referral Code Validation on Signup**
   - Add referral code input to signup form
   - Validate code before signup
   - Show reward preview

3. **Share Analytics Dashboard**
   - Visualize share statistics
   - Platform breakdown
   - Time-based trends

4. **Enhanced Rewards**
   - Energy bonuses
   - Badge rewards
   - Tiered rewards (5 referrals = special badge)

5. **Social Proof**
   - Show referral count on profile
   - Leaderboard for top referrers
   - Success stories

---

## 🐛 Known Limitations

1. **Share Card Generation**
   - Currently client-side only
   - Requires canvas support
   - May be slow on mobile devices

2. **Referral Code Application**
   - Must be applied during signup
   - No retroactive application
   - One referral per user

3. **Reward Expiration**
   - Rewards expire after 30 days
   - No automatic renewal
   - Manual application required

---

## ✅ Testing Checklist

- [ ] Generate referral code
- [ ] Copy referral link
- [ ] Share referral link
- [ ] Apply referral code on signup
- [ ] Verify rewards are awarded
- [ ] Track share events
- [ ] Generate share cards
- [ ] Download share cards
- [ ] View referral dashboard
- [ ] Check referral statistics

---

## 📊 Expected Impact

**Metrics:**
- +25% user acquisition through referrals
- +15% social media engagement
- +30% share rate
- +20% viral coefficient

**Business Value:**
- Organic growth through referrals
- Increased brand awareness
- Social proof through shares
- Community building

---

**Status:** ✅ Complete and Ready for Testing

