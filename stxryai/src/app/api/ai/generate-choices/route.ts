import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateText, isAIAvailable } from '@/lib/ai/client';

/**
 * Generate choice options for story branching
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
    const { context, count = 3 } = body;

    if (!context?.situation) {
      return NextResponse.json(
        { error: 'Situation context is required' },
        { status: 400 }
      );
    }

    const characterContext = context.characters?.length > 0
      ? `Characters involved: ${context.characters.map((c: any) => c.name || c).join(', ')}`
      : '';

    const systemPrompt = `You are a creative writing assistant helping to create meaningful choices for an interactive story.

Genre: ${context.genre || 'Adventure'}
${characterContext}

Generate ${count} distinct choice options for this situation. Each choice should:
1. Be meaningful and have different consequences
2. Reflect character personality where applicable
3. Lead to interesting narrative branches
4. Be clearly written and actionable

Respond with a JSON array of objects with this structure:
[
  {
    "id": "unique-id",
    "text": "The choice text the reader sees",
    "consequence": "Brief description of what this choice leads to",
    "tone": "brave|cautious|clever|aggressive|diplomatic|etc",
    "riskLevel": "low|medium|high",
    "affectedCharacters": ["character names affected"],
    "narrativeImpact": "Brief description of story impact"
  }
]`;

    const prompt = `Current situation: ${context.situation}

Generate ${count} meaningful choices for the reader.`;

    try {
      const response = await generateText(prompt, systemPrompt, 0.8);
      
      // Parse the JSON response
      let choices;
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          choices = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON array found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Generate fallback choices
        choices = [
          {
            id: `choice-${Date.now()}-1`,
            text: 'Take the direct approach',
            consequence: 'Face the challenge head-on',
            tone: 'brave',
            riskLevel: 'high',
            affectedCharacters: [],
            narrativeImpact: 'Leads to immediate confrontation',
          },
          {
            id: `choice-${Date.now()}-2`,
            text: 'Find another way',
            consequence: 'Look for an alternative solution',
            tone: 'clever',
            riskLevel: 'medium',
            affectedCharacters: [],
            narrativeImpact: 'Opens new possibilities',
          },
          {
            id: `choice-${Date.now()}-3`,
            text: 'Wait and observe',
            consequence: 'Gather more information before acting',
            tone: 'cautious',
            riskLevel: 'low',
            affectedCharacters: [],
            narrativeImpact: 'May reveal hidden details',
          },
        ].slice(0, count);
      }

      return NextResponse.json({ choices });
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      return NextResponse.json(
        { error: 'AI generation failed', choices: [] },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generate choices error:', error);
    return NextResponse.json(
      { error: 'Failed to generate choices' },
      { status: 500 }
    );
  }
}

