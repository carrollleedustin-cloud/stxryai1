import { NextRequest, NextResponse } from 'next/server';

/**
 * Error Tracking Endpoint
 * Receives error reports from the client-side error tracker.
 * 
 * In production, these would be sent to Sentry or similar service.
 */

interface ErrorEvent {
  message: string;
  stack?: string;
  type: 'error' | 'warning' | 'info';
  source: 'client' | 'server' | 'api';
  userId?: string;
  sessionId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

// In-memory store for development
const errorsBuffer: ErrorEvent[] = [];
const MAX_BUFFER_SIZE = 500;

export async function POST(request: NextRequest) {
  try {
    const error = await request.json() as ErrorEvent;

    // Validate error structure
    if (!error.message) {
      return NextResponse.json(
        { error: 'Invalid error format' },
        { status: 400 }
      );
    }

    // Add to buffer
    errorsBuffer.push({
      ...error,
      timestamp: error.timestamp || Date.now(),
    });

    // Keep buffer size manageable
    if (errorsBuffer.length > MAX_BUFFER_SIZE) {
      errorsBuffer.splice(0, errorsBuffer.length - MAX_BUFFER_SIZE);
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Error:', error.message, error.source);
    }

    // In production, you would send to Sentry here:
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(new Error(error.message), {
    //     extra: error.metadata,
    //     tags: { source: error.source },
    //   });
    // }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process error:', error);
    return NextResponse.json(
      { error: 'Failed to process error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development or for admins
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const source = searchParams.get('source');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let filteredErrors = errorsBuffer;
  
  if (type) {
    filteredErrors = filteredErrors.filter(e => e.type === type);
  }
  if (source) {
    filteredErrors = filteredErrors.filter(e => e.source === source);
  }

  // Get recent errors
  const recentErrors = filteredErrors.slice(-limit).reverse();

  // Calculate summary
  const summary = {
    total: errorsBuffer.length,
    byType: {
      error: errorsBuffer.filter(e => e.type === 'error').length,
      warning: errorsBuffer.filter(e => e.type === 'warning').length,
      info: errorsBuffer.filter(e => e.type === 'info').length,
    },
    bySource: {
      client: errorsBuffer.filter(e => e.source === 'client').length,
      server: errorsBuffer.filter(e => e.source === 'server').length,
      api: errorsBuffer.filter(e => e.source === 'api').length,
    },
  };

  return NextResponse.json({
    errors: recentErrors,
    summary,
  });
}

