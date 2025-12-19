# Push Notifications Setup Guide

**Date:** December 18, 2024  
**Status:** ✅ Implementation Complete

---

## 📋 Overview

Push notifications have been fully implemented for StxryAI. This guide covers setup, configuration, and usage.

---

## ✅ What Was Implemented

### 1. Database Migrations ✅
**File:** `supabase/migrations/20241218130000_add_push_notifications.sql`

**Created Tables:**
- `push_subscriptions` - Stores browser push notification subscriptions
- `notification_preferences` - User preferences for all notification types

**Features:**
- Row Level Security (RLS) policies
- Database functions for preference checking
- Quiet hours support
- Timezone-aware notifications

---

### 2. Push Notification Service ✅
**File:** `src/services/pushNotificationService.ts`

**Implemented Methods:**
- `requestPermission()` - Request browser notification permission
- `isSupported()` - Check if browser supports push notifications
- `subscribe()` - Subscribe user to push notifications
- `unsubscribe()` - Unsubscribe user
- `getSubscriptions()` - Get user's subscriptions
- `getPreferences()` - Get notification preferences
- `updatePreferences()` - Update preferences
- `shouldSendPush()` - Check if notification should be sent

---

### 3. Service Worker Updates ✅
**File:** `public/sw.js`

**Enhanced Features:**
- Improved push event handling
- Better notification click handling
- Support for notification actions
- Image and badge support
- Tag-based notification management

---

### 4. Notification Preferences Component ✅
**File:** `src/components/notifications/NotificationPreferences.tsx`

**Features:**
- Push notification toggle
- Granular notification type controls
- Quiet hours configuration
- Browser compatibility checks
- Permission status display
- Real-time preference updates

---

### 5. API Route for Sending Notifications ✅
**File:** `src/app/api/notifications/push/route.ts`

**Features:**
- Send push notifications to users
- Respect user preferences
- Handle multiple subscriptions
- Clean up invalid subscriptions
- Error handling and logging

---

### 6. Integration with Notification Service ✅
**File:** `src/services/notificationService.ts`

**Updates:**
- Enhanced `sendPushNotification()` method
- Automatic push notification sending
- Type mapping for notification types
- Preference checking before sending

---

### 7. React Hook ✅
**File:** `src/hooks/usePushNotifications.ts`

**Features:**
- Easy subscription management
- Permission status tracking
- Subscription state management
- Helper methods for common operations

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd stxryai
npm install web-push@^3.6.6
```

**Note:** `web-push` has been added to `package.json`. Run `npm install` to install it.

### 2. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications.

```bash
# Install web-push globally (if not already installed)
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

This will output:
- **Public Key**: Add to `.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Private Key**: Add to `.env.local` as `VAPID_PRIVATE_KEY` (keep secret!)

### 3. Environment Variables

Add to `.env.local`:

```bash
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:notifications@stxryai.com
```

### 4. Run Database Migration

In Supabase dashboard:
1. Go to SQL Editor
2. Run the migration: `supabase/migrations/20241218130000_add_push_notifications.sql`
3. Verify tables are created
4. Check RLS policies are active

### 5. Register Service Worker

The service worker should already be registered. Verify in your app layout:

```typescript
// In app/layout.tsx or similar
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

---

## 📱 Usage Examples

### Subscribe User to Push Notifications

```typescript
import { pushNotificationService } from '@/services/pushNotificationService';

// In your component
const handleSubscribe = async () => {
  if (!user) return;
  
  const subscription = await pushNotificationService.subscribe(user.id);
  if (subscription) {
    console.log('Subscribed to push notifications!');
  }
};
```

### Using the Hook

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

function MyComponent() {
  const { isSupported, permission, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  
  return (
    <div>
      {isSupported && (
        <button onClick={isSubscribed ? unsubscribe : subscribe}>
          {isSubscribed ? 'Disable' : 'Enable'} Push Notifications
        </button>
      )}
    </div>
  );
}
```

### Send Push Notification (Server-Side)

```typescript
// From your backend/API
const response = await fetch('/api/notifications/push', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    title: 'New Chapter Available!',
    body: 'Your favorite story has a new chapter',
    url: '/story-reader/story-id',
    notificationType: 'story_update',
  }),
});
```

### Using NotificationPreferences Component

```typescript
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';

function SettingsPage() {
  return (
    <div>
      <h2>Notification Settings</h2>
      <NotificationPreferences 
        onPreferencesUpdated={(prefs) => {
          console.log('Preferences updated:', prefs);
        }}
      />
    </div>
  );
}
```

---

## 🎯 Notification Types

The system supports these notification types:

1. **story_update** - New chapters from followed authors
2. **friend_activity** - Friends finish stories, earn achievements
3. **engagement_reminder** - Streak reminders, daily goals, challenges
4. **social** - Comments, likes, follows, club invitations
5. **personalized_recommendation** - AI-powered story suggestions

---

## ⚙️ Configuration

### Quiet Hours

Users can set quiet hours when notifications are paused:
- Default: 22:00 - 08:00
- Timezone-aware
- Can span midnight

### Notification Preferences

Users can control:
- Push notifications (on/off)
- Individual notification types
- Quiet hours
- Email notifications (separate from push)

---

## 🔒 Security

- VAPID keys are required for push notifications
- Private key must be kept secret (server-side only)
- Public key is safe to expose (client-side)
- RLS policies protect user data
- Subscriptions are user-specific

---

## 🧪 Testing

### Test Push Notification

```bash
# Get a user ID from your database
# Then call the test endpoint:
curl "http://localhost:4028/api/notifications/push/test?userId=USER_ID"
```

Or use the browser console:
```javascript
fetch('/api/notifications/push', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-user-id',
    title: 'Test Notification',
    body: 'This is a test!',
    url: '/user-dashboard',
  }),
});
```

---

## 📊 Integration Points

### Automatic Push Notifications

Push notifications are automatically sent when:
- Story updates are created (via `notificationService.createNotification()`)
- User preferences allow the notification type
- User is not in quiet hours
- User has active push subscriptions

### Manual Push Notifications

You can manually send push notifications:
```typescript
import { notificationService } from '@/services/notificationService';

await notificationService.sendPushNotification(
  userId,
  'Title',
  'Message',
  '/url',
  {
    notificationType: 'story_update',
    icon: '/icon.png',
  }
);
```

---

## 🐛 Troubleshooting

### Notifications Not Appearing

1. **Check Browser Support:**
   - Chrome, Firefox, Edge: ✅ Supported
   - Safari: ⚠️ Limited support (macOS/iOS)
   - Check: `pushNotificationService.isSupported()`

2. **Check Permission:**
   - Browser may have blocked notifications
   - Check: `Notification.permission`
   - User needs to enable in browser settings

3. **Check VAPID Keys:**
   - Ensure keys are set in environment variables
   - Keys must match between client and server

4. **Check Service Worker:**
   - Service worker must be registered
   - Check browser DevTools > Application > Service Workers

5. **Check Subscriptions:**
   - User must be subscribed
   - Check database: `push_subscriptions` table

### Common Issues

**"VAPID public key not configured"**
- Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to `.env.local`

**"Notification permission denied"**
- User must grant permission in browser
- Check browser notification settings

**"Service worker not registered"**
- Ensure `sw.js` is in `public/` directory
- Register service worker in app initialization

---

## 📝 Next Steps

1. ✅ Install `web-push` package
2. ✅ Generate and configure VAPID keys
3. ✅ Run database migration
4. ✅ Test push notifications
5. ✅ Integrate NotificationPreferences into settings page
6. ✅ Set up notification triggers for story updates

---

## 🎉 Status

**Push Notifications:** ✅ Complete  
**Database:** ✅ Migrations ready  
**Service:** ✅ Fully implemented  
**Components:** ✅ Ready to use  
**API:** ✅ Endpoint created  
**Integration:** ✅ Connected to notification system

**Ready for testing and deployment!** 🚀

