import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateText } from '@/lib/ai/client';
import { isAIAvailable } from '@/lib/ai/client';

/**
 * Generate story continuation suggestions using AI
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if AI is available
    if (!isAIAvailable()) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { prompt, context, count = 3 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a creative writing assistant helping to continue an interactive story. 
Genre: ${context?.genre || 'Adventure'}
Tone: ${context?.tone || 'engaging'}

Generate ${count} unique continuation suggestions for the story. Each suggestion should:
1. Be coherent with the existing narrative
2. Offer different narrative directions
3. Be engaging and well-written
4. Include a clear hook or tension

Respond with a JSON array of objects with this structure:
[
  {
    "id": "unique-id",
    "type": "scene|dialogue|chapter|choice|description",
    "title": "Brief title",
    "content": "The full continuation text (2-3 paragraphs)",
    "preview": "First 100 characters...",
    "tone": "the emotional tone",
    "wordCount": number,
    "confidence": 0.0-1.0,
    "tags": ["relevant", "tags"]
  }
]`;

    try {
      const response = await generateText(prompt, systemPrompt, 0.8);
      
      // Parse the JSON response
      let suggestions;
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON array found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Return a structured fallback
        suggestions = [{
          id: `suggestion-${Date.now()}`,
          type: 'scene',
          title: 'Continue the Story',
          content: response,
          preview: response.slice(0, 100) + '...',
          tone: context?.tone || 'engaging',
          wordCount: response.split(/\s+/).length,
          confidence: 0.7,
          tags: ['continuation'],
        }];
      }

      return NextResponse.json({ suggestions });
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      return NextResponse.json(
        { error: 'AI generation failed', suggestions: [] },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Continue story error:', error);
    return NextResponse.json(
      { error: 'Failed to generate continuation' },
      { status: 500 }
    );
  }
}

