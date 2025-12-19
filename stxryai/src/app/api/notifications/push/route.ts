/**
 * Push Notification API Route
 * Handles sending push notifications to users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lazy load web-push (only on server-side)
let webpush: typeof import('web-push') | null = null;

async function getWebPush() {
  if (typeof window !== 'undefined') {
    throw new Error('web-push can only be used server-side');
  }

  if (!webpush) {
    try {
      webpush = await import('web-push');
      
      // Configure web-push with VAPID keys
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      const vapidEmail = process.env.VAPID_EMAIL || 'mailto:notifications@stxryai.com';

      if (vapidPublicKey && vapidPrivateKey) {
        webpush.default.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
      } else {
        console.warn('VAPID keys not configured. Push notifications will not work.');
      }
    } catch (error) {
      console.error('Failed to load web-push:', error);
      throw new Error('web-push package not installed. Run: npm install web-push');
    }
  }

  return webpush.default;
}

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  notificationType?: 'story_update' | 'friend_activity' | 'engagement_reminder' | 'social' | 'personalized_recommendation';
}

/**
 * POST /api/notifications/push
 * Send push notification to a user
 */
export async function POST(request: NextRequest) {
  try {
    const requestBody: PushNotificationRequest = await request.json();
    const {
      userId,
      title,
      body: notificationBody,
      icon,
      badge,
      image,
      url,
      data,
      tag,
      requireInteraction,
      notificationType,
    } = requestBody;

    // Validate required fields
    if (!userId || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, body' },
        { status: 400 }
      );
    }

    // Check if user should receive this notification
    if (notificationType) {
      const { data: shouldSend, error: checkError } = await supabase.rpc(
        'should_send_push_notification',
        {
          p_user_id: userId,
          p_notification_type: notificationType,
        }
      );

      if (checkError) {
        console.error('Error checking push preferences:', checkError);
        // Continue anyway - don't block notification
      } else if (shouldSend === false) {
        return NextResponse.json(
          { message: 'User has disabled this notification type', sent: false },
          { status: 200 }
        );
      }
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'User has no push subscriptions', sent: false },
        { status: 200 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      image,
      url: url || '/',
      data: data || {},
      tag: tag || 'default',
      requireInteraction: requireInteraction || false,
    });

    // Send to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          const wp = await getWebPush();
          await wp.sendNotification(subscription, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // If subscription is invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      message: 'Push notifications sent',
      sent: successful > 0,
      successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send push notification', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/push/test
 * Test push notification (for development)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Send test notification
  const response = await POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        title: 'Test Notification',
        body: 'This is a test push notification from StxryAI',
        url: '/user-dashboard',
        notificationType: 'engagement_reminder',
      }),
    })
  );

  return response;
}

