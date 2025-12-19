---
description: Feature Implementation Templates & Code Starters
alwaysApply: false
---

# Implementation Templates for StxryAI Expansion Features

Ready-to-use templates for building the recommended features.

---

## 1. Social OAuth Login Setup

### Files to Create

**`src/lib/auth/oauth.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

export const setupOAuthProviders = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return {
    google: {
      signIn: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          },
        });
        return { data, error };
      },
    },
    github: {
      signIn: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          },
        });
        return { data, error };
      },
    },
    discord: {
      signIn: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'discord',
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          },
        });
        return { data, error };
      },
    },
  };
};
```

**`src/app/auth/callback/route.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
```

**`src/components/auth/OAuthButtons.tsx`**
```typescript
'use client';

import { setupOAuthProviders } from '@/lib/auth/oauth';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function OAuthButtons() {
  const { google, github, discord } = setupOAuthProviders();

  return (
    <div className="space-y-3">
      <Button 
        onClick={() => google.signIn()}
        variant="outline"
        className="w-full"
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      
      <Button 
        onClick={() => github.signIn()}
        variant="outline"
        className="w-full"
      >
        <Icons.github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
      
      <Button 
        onClick={() => discord.signIn()}
        variant="outline"
        className="w-full"
      >
        <Icons.discord className="mr-2 h-4 w-4" />
        Continue with Discord
      </Button>
    </div>
  );
}
```

### Env Variables to Add
```env
# Supabase OAuth (auto-configured in console)
NEXT_PUBLIC_OAUTH_REDIRECT_URL=http://localhost:4028/auth/callback
```

### Supabase Setup Steps
1. Go to Supabase console → Authentication → Providers
2. Enable Google, GitHub, Discord
3. Add OAuth credentials from each provider
4. Set redirect URL to `http://localhost:4028/auth/callback` (dev) and production URL

**Timeline**: 2 weeks  
**Difficulty**: Medium

---

## 2. Push Notifications System

### Files to Create

**`src/lib/firebase/init.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export function setupPushNotifications() {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    // Show notification to user
    if (payload.notification) {
      new Notification(payload.notification.title || 'StxryAI', {
        body: payload.notification.body,
        icon: '/logo.png',
      });
    }
  });
}

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const token = await messaging.getToken();
    return token;
  }
  return null;
}

export { messaging };
```

**`src/components/notifications/PushNotificationSetup.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, setupPushNotifications } from '@/lib/firebase/init';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function PushNotificationSetup() {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setupPushNotifications();
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token && user?.id) {
        // Save token to database
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, fcmToken: token }),
        });
        setIsEnabled(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold mb-2">Push Notifications</h3>
      <p className="text-sm text-gray-600 mb-4">
        Get instant alerts for friend activity, challenges, and achievements
      </p>
      <Button 
        onClick={handleEnableNotifications}
        disabled={loading || isEnabled}
      >
        {isEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
      </Button>
    </div>
  );
}
```

**`src/app/api/notifications/register/route.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const { userId, fcmToken } = await request.json();

  try {
    const { error } = await supabase
      .from('notification_tokens')
      .upsert({
        user_id: userId,
        fcm_token: fcmToken,
        created_at: new Date(),
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to register notification token' },
      { status: 500 }
    );
  }
}
```

### Env Variables to Add
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase Setup
1. Create Firebase project at console.firebase.google.com
2. Enable Cloud Messaging
3. Create web app and copy config
4. Generate server key in Project Settings

**Timeline**: 2-3 weeks  
**Difficulty**: Hard

---

## 3. Email Marketing Automation

### Files to Create

**`src/lib/email/templates.ts`**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailTemplates = {
  weeklyDigest: async (email: string, stories: any[]) => {
    return await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: '📚 Your Weekly Digest - New Stories You Might Love',
      html: `
        <h2>This Week on StxryAI</h2>
        <p>Hi there! Here are the trending stories this week:</p>
        ${stories.map(story => `
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
            <h3>${story.title}</h3>
            <p>${story.description}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/story/${story.id}">Read Now</a>
          </div>
        `).join('')}
      `,
    });
  },

  challengeReminder: async (email: string, challenge: any) => {
    return await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: `🏆 ${challenge.name} - Complete Today!`,
      html: `
        <h2>${challenge.name}</h2>
        <p>You're ${challenge.progress}% of the way there!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/challenges/${challenge.id}">
          Continue Challenge
        </a>
      `,
    });
  },

  friendActivity: async (email: string, activities: any[]) => {
    return await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: '👥 Your Friends Have Been Busy',
      html: `
        <h2>Friend Activity</h2>
        ${activities.map(act => `
          <p>${act.user_name} ${act.action}</p>
        `).join('')}
      `,
    });
  },
};
```

**`src/lib/email/scheduler.ts`**
```typescript
export async function scheduleWeeklyDigest() {
  // This would run every Sunday at 9 AM
  const users = await getUsersWithEmailNotifications();
  
  for (const user of users) {
    const trendingStories = await getTrendingStories(user.id, 7);
    await emailTemplates.weeklyDigest(user.email, trendingStories);
  }
}

export async function scheduleChallengeReminders() {
  // This would run daily at 6 PM
  const activeUsers = await getUsersWithActiveChallenges();
  
  for (const user of activeUsers) {
    const challenge = await getUsersActiveChallenge(user.id);
    if (challenge.progress < 100) {
      await emailTemplates.challengeReminder(user.email, challenge);
    }
  }
}

export async function scheduleFriendActivityDigest() {
  // This would run daily at 8 AM
  const users = await getUsersWithFriends();
  
  for (const user of users) {
    const activities = await getFriendActivities(user.id, 24);
    if (activities.length > 0) {
      await emailTemplates.friendActivity(user.email, activities);
    }
  }
}
```

**`src/app/api/email/send-digest/route.ts`**
```typescript
import { scheduleWeeklyDigest } from '@/lib/email/scheduler';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Verify this is from Vercel Cron (production)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await scheduleWeeklyDigest();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send digest' }, { status: 500 });
  }
}
```

### Vercel Cron Configuration

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/email/send-digest",
      "schedule": "0 9 * * 0"
    },
    {
      "path": "/api/email/send-reminders",
      "schedule": "0 18 * * *"
    }
  ]
}
```

**Timeline**: 1-2 weeks  
**Difficulty**: Medium

---

## 4. Recommendation Engine (Basic Version)

### Files to Create

**`src/lib/recommendations/engine.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
) {
  // Get user's reading history
  const { data: readingHistory } = await supabase
    .from('reading_progress')
    .select('story_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!readingHistory || readingHistory.length === 0) {
    // Return trending stories for new users
    return getTrendingStories(limit);
  }

  // Get genres from read stories
  const storyIds = readingHistory.map(r => r.story_id);
  const { data: stories } = await supabase
    .from('stories')
    .select('id, genre')
    .in('id', storyIds);

  const genreWeights: Record<string, number> = {};
  stories?.forEach(story => {
    genreWeights[story.genre] = (genreWeights[story.genre] || 0) + 1;
  });

  // Get top genres
  const topGenres = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);

  // Get stories in similar genres not yet read
  const { data: recommendations } = await supabase
    .from('stories')
    .select('*')
    .in('genre', topGenres)
    .not('id', 'in', `(${storyIds.join(',')})`)
    .order('rating', { ascending: false })
    .limit(limit);

  return recommendations || [];
}

export async function getTrendingStories(limit: number = 10) {
  const { data } = await supabase
    .from('stories')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('view_count', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getSimilarStories(storyId: string, limit: number = 5) {
  // Get the story's genre and tags
  const { data: story } = await supabase
    .from('stories')
    .select('genre, tags')
    .eq('id', storyId)
    .single();

  if (!story) return [];

  // Get similar stories
  const { data: similar } = await supabase
    .from('stories')
    .select('*')
    .eq('genre', story.genre)
    .neq('id', storyId)
    .order('rating', { ascending: false })
    .limit(limit);

  return similar || [];
}
```

**`src/components/recommendations/RecommendedStories.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { getPersonalizedRecommendations } from '@/lib/recommendations/engine';
import { StoryCard } from '@/components/story/StoryCard';
import { useAuth } from '@/contexts/AuthContext';

export function RecommendedStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchRecommendations = async () => {
      const recs = await getPersonalizedRecommendations(user.id);
      setStories(recs);
      setLoading(false);
    };

    fetchRecommendations();
  }, [user?.id]);

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
```

**Timeline**: 3-4 weeks  
**Difficulty**: Hard (if adding ML), Medium (basic version)

---

## 5. Referral System

### Files to Create

**`src/lib/referrals/service.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateReferralCode(userId: string): Promise<string> {
  const code = uuidv4().slice(0, 8).toUpperCase();
  
  await supabase
    .from('referral_codes')
    .insert({
      user_id: userId,
      code,
      created_at: new Date(),
    });

  return code;
}

export async function getReferralCode(userId: string) {
  const { data } = await supabase
    .from('referral_codes')
    .select('code, created_at')
    .eq('user_id', userId)
    .single();

  return data?.code || null;
}

export async function trackReferral(code: string, newUserId: string) {
  // Get referrer
  const { data: referral } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', code)
    .single();

  if (!referral) return null;

  // Record the referral
  const { data } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referral.user_id,
      referred_user_id: newUserId,
      code,
      status: 'pending',
      created_at: new Date(),
    })
    .select()
    .single();

  return data;
}

export async function completeReferral(referralId: string) {
  // Mark as complete
  await supabase
    .from('referrals')
    .update({ status: 'completed', completed_at: new Date() })
    .eq('id', referralId);

  // Grant reward to referrer (1 month free)
  const { data: referral } = await supabase
    .from('referrals')
    .select('referrer_id')
    .eq('id', referralId)
    .single();

  if (referral) {
    await supabase
      .from('referral_rewards')
      .insert({
        user_id: referral.referrer_id,
        referral_id: referralId,
        reward_type: 'premium_month',
        claimed: false,
      });
  }
}

export async function getReferralStats(userId: string) {
  const { data: stats } = await supabase
    .rpc('get_referral_stats', { user_id: userId });

  return stats;
}
```

**`src/components/referrals/ReferralWidget.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { getReferralCode } from '@/lib/referrals/service';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Copy, Share2 } from 'lucide-react';

export function ReferralWidget() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCode = async () => {
      const code = await getReferralCode(user.id);
      setReferralCode(code || '');
    };

    fetchCode();
  }, [user?.id]);

  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join StxryAI',
        text: 'Join me on StxryAI - the interactive fiction platform',
        url: referralUrl,
      });
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
      <h3 className="font-bold mb-2">Invite Friends & Earn Rewards</h3>
      <p className="text-sm text-gray-600 mb-4">
        Get 1 month free Premium for every friend who joins
      </p>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={referralUrl}
          readOnly
          className="flex-1 px-3 py-2 border rounded bg-white text-sm"
        />
        <Button size="sm" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <Button onClick={handleShare} className="w-full" variant="outline">
        <Share2 className="w-4 h-4 mr-2" />
        Share Link
      </Button>
    </div>
  );
}
```

**Timeline**: 1-2 weeks  
**Difficulty**: Low

---

## 6. Database Migrations

### Run These Migrations

```sql
-- Notification tokens table
CREATE TABLE notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Referral codes
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, expired
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Referral rewards
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  reward_type TEXT, -- premium_month, energy_boost, etc
  claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email preferences
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  challenge_reminders BOOLEAN DEFAULT TRUE,
  friend_activity BOOLEAN DEFAULT TRUE,
  promotions BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Checklist

### Before Starting
- [ ] Read full feature documentation
- [ ] Get team alignment
- [ ] Plan API contracts
- [ ] Design database schema
- [ ] Create feature branch

### During Development
- [ ] Write tests as you go
- [ ] Document APIs
- [ ] Get code reviews
- [ ] Test with real data
- [ ] Monitor performance

### Before Launch
- [ ] Load testing
- [ ] Security audit
- [ ] User testing
- [ ] Documentation
- [ ] Monitoring setup
- [ ] Rollback plan

---

## Testing Templates

### Unit Test Example
```typescript
import { generateReferralCode } from '@/lib/referrals/service';

describe('Referral Service', () => {
  it('should generate a valid referral code', async () => {
    const code = await generateReferralCode('test-user-id');
    expect(code).toMatch(/^[A-Z0-9]{8}$/);
  });

  it('should track referral completion', async () => {
    // Test implementation
  });
});
```

### Integration Test Example
```typescript
describe('OAuth Flow', () => {
  it('should complete OAuth sign-in', async () => {
    const response = await fetch('/api/auth/callback?code=test-code');
    expect(response.status).toBe(302);
  });
});
```

---

## Performance Optimization Tips

1. **Caching**: Use Redis for recommendation results
2. **Batching**: Process email sends in batches
3. **Pagination**: Implement pagination on all list endpoints
4. **Indexes**: Add database indexes on frequently queried columns
5. **CDN**: Use Vercel Edge Functions for OAuth callbacks

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| OAuth callback loop | Check redirect URLs match |
| Notifications not appearing | Verify FCM token is fresh |
| Email not sending | Check Resend API key and sender |
| Slow recommendations | Add database caching |
| High infrastructure costs | Implement request deduplication |

---

See `COMPREHENSIVE_PLATFORM_ANALYSIS.md` for more details on each feature.
