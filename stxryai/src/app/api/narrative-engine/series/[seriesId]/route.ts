import { NextRequest, NextResponse } from 'next/server';
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/narrative-engine/series/[seriesId]
 * Get a single series with full details
 */
export async function GET(request: NextRequest, { params }: { params: { seriesId: string } }) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { seriesId } = params;

    const overview = await persistentNarrativeEngine.getSeriesOverview(seriesId);

    if (!overview.series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...overview.series,
      books: overview.books,
      characterCount: overview.characterCount,
      worldElementCount: overview.worldElementCount,
      activeArcCount: overview.activeArcCount,
      totalWordCount: overview.totalWordCount,
      continuityNotes: overview.continuityNotes,
      pendingViolations: overview.pendingViolations,
    });
  } catch (error) {
    console.error('Failed to fetch series:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

/**
 * PATCH /api/narrative-engine/series/[seriesId]
 * Update a series
 */
export async function PATCH(request: NextRequest, { params }: { params: { seriesId: string } }) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { seriesId } = params;
    const body = await request.json();

    const updated = await persistentNarrativeEngine.updateSeries(seriesId, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update series:', error);
    return NextResponse.json({ error: 'Failed to update series' }, { status: 500 });
  }
}
