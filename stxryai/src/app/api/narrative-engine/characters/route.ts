import { NextRequest, NextResponse } from 'next/server';
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';

/**
 * GET /api/narrative-engine/characters
 * Get all characters for a series
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('seriesId');

    if (!seriesId) {
      return NextResponse.json({ error: 'seriesId is required' }, { status: 400 });
    }

    const characters = await persistentNarrativeEngine.getSeriesCharacters(seriesId);

    return NextResponse.json({
      characters: characters.map((c) => ({
        id: c.id,
        name: c.name,
        aliases: c.aliases,
        title: c.title,
        role: c.characterRole,
        status: c.currentStatus,
        firstAppearsBook: c.firstAppearsBook,
        ageAtSeriesStart: c.ageAtSeriesStart,
        corePersonality: c.corePersonality,
        physicalDescription: c.physicalDescription,
        dialogueStyle: c.dialogueStyle,
        speechPatterns: c.speechPatterns,
        canonLockLevel: c.canonLockLevel,
        lockedAttributes: c.lockedAttributes,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

/**
 * POST /api/narrative-engine/characters
 * Create a new character
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      seriesId,
      authorId,
      name,
      aliases,
      title,
      corePersonality,
      backstory,
      motivation,
      fatalFlaw,
      physicalDescription,
      ageAtSeriesStart,
      characterRole,
      firstAppearsBook,
      dialogueStyle,
      speechPatterns,
      canonLockLevel,
      lockedAttributes,
    } = body;

    if (!seriesId || !authorId || !name) {
      return NextResponse.json(
        { error: 'seriesId, authorId, and name are required' },
        { status: 400 }
      );
    }

    const character = await persistentNarrativeEngine.createCharacter({
      seriesId,
      authorId,
      name,
      aliases: aliases || [],
      title,
      corePersonality: corePersonality || { traits: [], values: [], fears: [], desires: [] },
      backstory,
      motivation,
      fatalFlaw,
      physicalDescription: physicalDescription || { distinguishingFeatures: [] },
      ageAtSeriesStart,
      characterRole: characterRole || 'supporting',
      firstAppearsBook: firstAppearsBook || 1,
      dialogueStyle,
      speechPatterns: speechPatterns || [],
      canonLockLevel: canonLockLevel || 'soft',
      lockedAttributes: lockedAttributes || [],
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error('Failed to create character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
