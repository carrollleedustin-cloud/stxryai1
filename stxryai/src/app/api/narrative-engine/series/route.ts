import { NextRequest, NextResponse } from 'next/server';
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';

/**
 * GET /api/narrative-engine/series
 * Get all series for an author
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');

    if (!authorId) {
      return NextResponse.json(
        { error: 'authorId is required' },
        { status: 400 }
      );
    }

    const series = await persistentNarrativeEngine.getAuthorSeries(authorId);

    // Transform to overview format
    const seriesOverviews = await Promise.all(
      series.map(async (s) => {
        try {
          const overview = await persistentNarrativeEngine.getSeriesOverview(s.id);
          return {
            id: s.id,
            title: s.title,
            description: s.description,
            genre: s.genre,
            bookCount: overview.books.length,
            targetBooks: s.targetBookCount,
            characterCount: overview.characterCount,
            worldElementCount: overview.worldElementCount,
            activeArcs: overview.activeArcCount,
            pendingViolations: overview.pendingViolations,
            totalWordCount: overview.totalWordCount,
            status: s.seriesStatus,
            coverImageUrl: s.coverImageUrl,
          };
        } catch {
          return {
            id: s.id,
            title: s.title,
            description: s.description,
            genre: s.genre,
            bookCount: s.currentBookCount,
            targetBooks: s.targetBookCount,
            characterCount: 0,
            worldElementCount: 0,
            activeArcs: 0,
            pendingViolations: 0,
            totalWordCount: 0,
            status: s.seriesStatus,
            coverImageUrl: s.coverImageUrl,
          };
        }
      })
    );

    return NextResponse.json({ series: seriesOverviews });
  } catch (error) {
    console.error('Failed to fetch series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/narrative-engine/series
 * Create a new series
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      authorId,
      title,
      description,
      premise,
      genre,
      targetBookCount,
      tone,
      pacing,
      targetAudience,
      contentRating,
      primaryThemes,
      secondaryThemes,
      mainConflict,
      plannedEnding,
    } = body;

    if (!authorId || !title || !genre) {
      return NextResponse.json(
        { error: 'authorId, title, and genre are required' },
        { status: 400 }
      );
    }

    const series = await persistentNarrativeEngine.createSeries({
      authorId,
      title,
      description,
      premise,
      genre,
      targetBookCount: targetBookCount || 1,
      tone: tone || 'balanced',
      pacing: pacing || 'moderate',
      targetAudience: targetAudience || 'adult',
      contentRating: contentRating || 'teen',
      primaryThemes: primaryThemes || [],
      secondaryThemes: secondaryThemes || [],
      mainConflict,
      plannedEnding,
    });

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error('Failed to create series:', error);
    return NextResponse.json(
      { error: 'Failed to create series' },
      { status: 500 }
    );
  }
}

