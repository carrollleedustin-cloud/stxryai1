/**
 * Canon-Aware AI Generation API Route
 * Provides REST endpoints for AI content generation with full narrative context
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { canonAwareAIService, CanonAwareGenerationOptions } from '@/services/canonAwareAIService';

// Helper to create authenticated Supabase client
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle cookies in Server Component
          }
        },
      },
    }
  );
}

// POST: Generate content with canon awareness
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      seriesId,
      bookId,
      chapterNumber,
      type,
      currentContent,
      previousContent,
      prompt,
      characterIds,
      wordCount,
      creativity,
    } = body;

    // Validate required fields
    if (!seriesId) {
      return NextResponse.json({ error: 'seriesId is required' }, { status: 400 });
    }

    if (
      !type ||
      !['continuation', 'dialogue', 'description', 'action', 'chapter_outline', 'scene'].includes(
        type
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Valid type is required: continuation, dialogue, description, action, chapter_outline, scene',
        },
        { status: 400 }
      );
    }

    // Verify user owns this series
    const { data: series, error: seriesError } = await supabase
      .from('story_series')
      .select('id, author_id')
      .eq('id', seriesId)
      .single();

    if (seriesError || !series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    if (series.author_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to generate content for this series' },
        { status: 403 }
      );
    }

    // Generate content
    const options: CanonAwareGenerationOptions = {
      seriesId,
      bookId,
      chapterNumber,
      type,
      currentContent,
      previousContent,
      prompt,
      characterIds,
      wordCount,
      creativity,
    };

    const result = await canonAwareAIService.generateWithContext(options);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    console.error('Canon-aware generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET: Get generation context preview (for debugging/UI)
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('seriesId');
    const bookId = searchParams.get('bookId');

    if (!seriesId) {
      return NextResponse.json({ error: 'seriesId is required' }, { status: 400 });
    }

    // Verify access
    const { data: series, error: seriesError } = await supabase
      .from('story_series')
      .select('id, author_id, series_title')
      .eq('id', seriesId)
      .single();

    if (seriesError || !series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    if (series.author_id !== user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Get context summary
    const { data: characters } = await supabase
      .from('persistent_characters')
      .select('id, name, character_role, current_status')
      .eq('series_id', seriesId);

    const { data: arcs } = await supabase
      .from('narrative_arcs')
      .select('id, arc_name, arc_type, status, completion_percentage')
      .eq('series_id', seriesId)
      .neq('status', 'abandoned');

    const { data: rules } = await supabase
      .from('canon_rules')
      .select('id, rule_type, rule_description')
      .eq('series_id', seriesId)
      .eq('is_active', true);

    const { data: worldElements } = await supabase
      .from('world_elements')
      .select('id, element_name, element_type, importance_level')
      .eq('series_id', seriesId);

    return NextResponse.json({
      success: true,
      context: {
        series: {
          id: series.id,
          title: series.series_title,
        },
        characters: characters || [],
        activeArcs: (arcs || []).filter((a) => a.status === 'active'),
        canonRules: rules || [],
        worldElements: worldElements || [],
      },
    });
  } catch (error) {
    console.error('Context preview error:', error);
    return NextResponse.json({ error: 'Failed to get context' }, { status: 500 });
  }
}
