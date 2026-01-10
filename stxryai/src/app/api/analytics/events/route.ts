import { NextRequest, NextResponse } from 'next/server';

/**
 * User Analytics Events Endpoint
 * Receives user interaction events from the client.
 *
 * In production, these would be sent to PostHog, Mixpanel, or Amplitude.
 */

interface UserEvent {
  eventName: string;
  category: 'navigation' | 'interaction' | 'conversion' | 'engagement';
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

// In-memory store for development
const eventsBuffer: UserEvent[] = [];
const MAX_BUFFER_SIZE = 2000;

export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as UserEvent;

    // Validate event structure
    if (!event.eventName || !event.category) {
      return NextResponse.json({ error: 'Invalid event format' }, { status: 400 });
    }

    // Add to buffer
    eventsBuffer.push({
      ...event,
      timestamp: event.timestamp || Date.now(),
    });

    // Keep buffer size manageable
    if (eventsBuffer.length > MAX_BUFFER_SIZE) {
      eventsBuffer.splice(0, eventsBuffer.length - MAX_BUFFER_SIZE);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event:', event.eventName, event.category);
    }

    // In production, send to PostHog:
    // if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    //   posthog.capture(event.eventName, {
    //     ...event.properties,
    //     category: event.category,
    //   });
    // }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process event:', error);
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development or for admins
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const eventName = searchParams.get('eventName');
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  let filteredEvents = eventsBuffer;

  if (category) {
    filteredEvents = filteredEvents.filter((e) => e.category === category);
  }
  if (eventName) {
    filteredEvents = filteredEvents.filter((e) => e.eventName === eventName);
  }

  // Get recent events
  const recentEvents = filteredEvents.slice(-limit).reverse();

  // Calculate summary
  const eventCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {
    navigation: 0,
    interaction: 0,
    conversion: 0,
    engagement: 0,
  };

  for (const event of eventsBuffer) {
    eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
    categoryCounts[event.category]++;
  }

  // Top events
  const topEvents = Object.entries(eventCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return NextResponse.json({
    events: recentEvents,
    summary: {
      total: eventsBuffer.length,
      byCategory: categoryCounts,
      topEvents,
    },
  });
}
