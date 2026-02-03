import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiStoryAssistantService } from '@/services/aiStoryAssistantService';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, storyId, chapterId, suggestionTypes } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const suggestions = await aiStoryAssistantService.generateSuggestions(user.id, content, {
      storyId,
      chapterId,
      suggestionTypes,
    });

    return NextResponse.json({ suggestions });
  } catch (error: unknown) {
    console.error('API Error in suggestions route:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
