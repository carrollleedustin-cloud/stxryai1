import { NextRequest, NextResponse } from 'next/server';
import { aiStoryAssistantService } from '@/services/aiStoryAssistantService';

export async function POST(req: NextRequest) {
  try {
    const { userId, content, storyId, chapterId, suggestionTypes } = await req.json();

    if (!userId || !content) {
      return NextResponse.json({ error: 'Missing userId or content' }, { status: 400 });
    }

    const suggestions = await aiStoryAssistantService.generateSuggestions(userId, content, {
      storyId,
      chapterId,
      suggestionTypes,
    });

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('API Error in suggestions route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
