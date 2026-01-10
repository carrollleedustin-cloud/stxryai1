import { NextRequest, NextResponse } from 'next/server';

/**
 * Analytics Metrics Endpoint
 * Receives performance metrics from the client-side monitoring system.
 *
 * In production, these would be stored in a time-series database
 * or sent to a service like Datadog/New Relic.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

// In-memory store for development (replace with proper storage in production)
const metricsBuffer: PerformanceMetric[] = [];
const MAX_BUFFER_SIZE = 1000;

export async function POST(request: NextRequest) {
  try {
    const metric = (await request.json()) as PerformanceMetric;

    // Validate metric structure
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json({ error: 'Invalid metric format' }, { status: 400 });
    }

    // Add to buffer (in production, send to analytics service)
    metricsBuffer.push({
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    });

    // Keep buffer size manageable
    if (metricsBuffer.length > MAX_BUFFER_SIZE) {
      metricsBuffer.splice(0, metricsBuffer.length - MAX_BUFFER_SIZE);
    }

    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Metric:', metric.name, metric.value, metric.unit);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process metric:', error);
    return NextResponse.json({ error: 'Failed to process metric' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development or for admins
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  let filteredMetrics = metricsBuffer;

  if (name) {
    filteredMetrics = metricsBuffer.filter((m) => m.name === name);
  }

  // Get recent metrics
  const recentMetrics = filteredMetrics.slice(-limit);

  // Calculate summary statistics
  const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
  for (const metric of recentMetrics) {
    if (!summary[metric.name]) {
      summary[metric.name] = { avg: 0, min: Infinity, max: -Infinity, count: 0 };
    }
    summary[metric.name].min = Math.min(summary[metric.name].min, metric.value);
    summary[metric.name].max = Math.max(summary[metric.name].max, metric.value);
    summary[metric.name].avg =
      (summary[metric.name].avg * summary[metric.name].count + metric.value) /
      (summary[metric.name].count + 1);
    summary[metric.name].count++;
  }

  return NextResponse.json({
    metrics: recentMetrics,
    summary,
    bufferSize: metricsBuffer.length,
  });
}
