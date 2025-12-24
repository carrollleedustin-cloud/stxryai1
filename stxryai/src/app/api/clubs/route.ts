/**
 * API Route: Reading Clubs Management
 * POST: Create a new reading club
 * GET: Get clubs (with filtering and pagination)
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
      name,
      description,
      category,
      isPrivate,
      coverImageUrl,
      tags,
    } = body;

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category' },
        { status: 400 }
      );
    }

    // Create the club
    const { data: club, error: clubError } = await supabase
      .from('reading_clubs')
      .insert({
        name,
        description,
        category,
        is_private: isPrivate || false,
        cover_image_url: coverImageUrl || null,
        tags: tags || [],
        created_by: user.id,
        member_count: 1,
      })
      .select()
      .single();

    if (clubError) {
      console.error('Error creating club:', clubError);
      return NextResponse.json(
        { error: 'Failed to create club' },
        { status: 500 }
      );
    }

    // Add creator as first member
    const { error: memberError } = await supabase
      .from('club_members')
      .insert({
        club_id: club.id,
        user_id: user.id,
        role: 'admin',
      });

    if (memberError) {
      console.error('Error adding creator as member:', memberError);
    }

    // Log activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: 'club_created',
        metadata: {
          club_id: club.id,
          club_name: name,
        },
      });

    return NextResponse.json({
      success: true,
      club,
    });
  } catch (error) {
    console.error('Club creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create club', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('reading_clubs')
      .select('*', { count: 'exact' })
      .eq('is_private', false)
      .order('member_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: clubs, error, count } = await query;

    if (error) {
      console.error('Error fetching clubs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clubs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clubs,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Clubs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs', details: String(error) },
      { status: 500 }
    );
  }
}
