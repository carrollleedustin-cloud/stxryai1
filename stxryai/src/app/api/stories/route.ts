/**
 * API Route: Story Creation
 * POST: Create a new story
 * GET: Get user's stories
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      genre,
      difficulty,
      coverImageUrl,
      isPremium,
      estimatedDuration,
      storyMode,
      customChoiceTier,
      enableAICompanion,
      companionName,
      companionPersonality,
    } = body;

    // Validate required fields
    if (!title || !description || !genre) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, genre' },
        { status: 400 }
      );
    }

    // Create the story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        author_id: user.id,
        title,
        description,
        genre,
        difficulty: difficulty || 'beginner',
        cover_image_url: coverImageUrl || null,
        is_premium: isPremium || false,
        estimated_duration: estimatedDuration || 30,
        is_published: false,
        content: {
          storyMode: storyMode || 'static',
          customChoiceTier: customChoiceTier || 'none',
          enableAICompanion: enableAICompanion || false,
          companionName: companionName || null,
          companionPersonality: companionPersonality || null,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (storyError) {
      console.error('Error creating story:', storyError);
      return NextResponse.json(
        { error: 'Failed to create story' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: 'story_created',
        story_id: story.id,
        metadata: {
          story_title: title,
          genre,
        },
      });

    // Award XP using achievement service method
    try {
      const { achievementService } = await import('@/services/achievementService');
      await achievementService.awardXp(user.id, 50, 'story_created');
    } catch (xpError) {
      // Log but don't fail the story creation if XP award fails
      console.error('Failed to award XP:', xpError);
    }

    return NextResponse.json({
      success: true,
      story,
    });
  } catch (error) {
    console.error('Story creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create story', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const published = searchParams.get('published') === 'true';

    let query = supabase
      .from('stories')
      .select('*', { count: 'exact' })
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (published !== null) {
      query = query.eq('is_published', published);
    }

    const { data: stories, error, count } = await query;

    if (error) {
      console.error('Error fetching stories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stories,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Stories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories', details: String(error) },
      { status: 500 }
    );
  }
}
