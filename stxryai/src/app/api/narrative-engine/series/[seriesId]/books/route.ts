import { NextRequest, NextResponse } from 'next/server';
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/narrative-engine/series/[seriesId]/books
 * Get all books in a series
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

    const books = await persistentNarrativeEngine.getSeriesBooks(seriesId);

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Failed to fetch books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

/**
 * POST /api/narrative-engine/series/[seriesId]/books
 * Create a new book in a series
 */
export async function POST(request: NextRequest, { params }: { params: { seriesId: string } }) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { seriesId } = params;
    const body = await request.json();

    const {
      authorId,
      bookNumber,
      title,
      subtitle,
      bookPremise,
      bookConflict,
      storyMode,
      targetWordCount,
      targetChapterCount,
      timelineStart,
      timelineEnd,
      timeSkipFromPrevious,
    } = body;

    if (!authorId || !title || !bookNumber) {
      return NextResponse.json(
        { error: 'authorId, title, and bookNumber are required' },
        { status: 400 }
      );
    }

    const book = await persistentNarrativeEngine.createBook({
      seriesId,
      authorId,
      bookNumber,
      title,
      subtitle,
      bookPremise,
      bookConflict,
      storyMode: storyMode || 'book',
      targetWordCount,
      targetChapterCount,
      timelineStart,
      timelineEnd,
      timeSkipFromPrevious,
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Failed to create book:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
