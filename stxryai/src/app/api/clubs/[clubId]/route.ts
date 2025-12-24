/**
 * API Route: Club Membership Management
 * POST: Join a club
 * DELETE: Leave a club
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
    const { clubId } = body;

    if (!clubId) {
      return NextResponse.json(
        { error: 'Missing clubId' },
        { status: 400 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this club' },
        { status: 400 }
      );
    }

    // Add user to club
    const { error: joinError } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: user.id,
        role: 'member',
      });

    if (joinError) {
      console.error('Error joining club:', joinError);
      return NextResponse.json(
        { error: 'Failed to join club' },
        { status: 500 }
      );
    }

    // Increment member count
    const { data: club } = await supabase
      .from('reading_clubs')
      .select('member_count')
      .eq('id', clubId)
      .single();

    if (club) {
      await supabase
        .from('reading_clubs')
        .update({ member_count: (club.member_count || 0) + 1 })
        .eq('id', clubId);
    }

    // Log activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: 'club_joined',
        metadata: {
          club_id: clubId,
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined club',
    });
  } catch (error) {
    console.error('Club join error:', error);
    return NextResponse.json(
      { error: 'Failed to join club', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { clubId } = body;

    if (!clubId) {
      return NextResponse.json(
        { error: 'Missing clubId' },
        { status: 400 }
      );
    }

    // Remove user from club
    const { error: leaveError } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', user.id);

    if (leaveError) {
      console.error('Error leaving club:', leaveError);
      return NextResponse.json(
        { error: 'Failed to leave club' },
        { status: 500 }
      );
    }

    // Decrement member count
    const { data: club } = await supabase
      .from('reading_clubs')
      .select('member_count')
      .eq('id', clubId)
      .single();

    if (club && club.member_count > 0) {
      await supabase
        .from('reading_clubs')
        .update({ member_count: club.member_count - 1 })
        .eq('id', clubId);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully left club',
    });
  } catch (error) {
    console.error('Club leave error:', error);
    return NextResponse.json(
      { error: 'Failed to leave club', details: String(error) },
      { status: 500 }
    );
  }
}
