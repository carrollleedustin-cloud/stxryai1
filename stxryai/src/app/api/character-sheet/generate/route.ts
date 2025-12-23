import { NextRequest, NextResponse } from 'next/server';
import { generateCompletion } from '@/lib/ai/client';

/**
 * API Route: Generate Character Sheet using OpenAI
 * Creates an accurate astrological character sheet based on birth data
 */

interface BirthData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthState?: string;
  birthCountry: string;
}

const CHARACTER_SHEET_PROMPT = `You are an expert astrologer and character analyst. Based on the birth information provided, generate a detailed CHARACTER SHEET following this EXACT format. 

IMPORTANT: Calculate the actual astrological placements based on the birth date, time, and location provided. Use accurate ephemeris data for planetary positions.

You must respond with ONLY valid JSON (no markdown, no backticks, just raw JSON) in this exact structure:

{
  "coreAlignment": {
    "sunSign": "Sign name (e.g., Gemini)",
    "sunDegree": "Degree and minutes (e.g., 29°20')",
    "moonSign": "Sign name",
    "moonDegree": "Degree and minutes",
    "risingSign": "Sign name",
    "tagline": "A poetic one-liner capturing the essence (e.g., 'The Wordsmith in Armor. A storm of thought hidden behind stone.')"
  },
  "personalityArchetype": {
    "title": "A unique archetype title (e.g., 'The Alchemical Realist')",
    "essence": "A 2-3 sentence description of their core essence",
    "modeOfOperation": "A short phrase describing their pattern (e.g., 'Speak. Build. Retreat. Repeat.')"
  },
  "strengths": [
    "Strength 1 - short phrase",
    "Strength 2 - short phrase",
    "Strength 3 - short phrase",
    "Strength 4 - short phrase",
    "Strength 5 - short phrase"
  ],
  "weaknesses": [
    "Weakness 1 - short phrase",
    "Weakness 2 - short phrase",
    "Weakness 3 - short phrase",
    "Weakness 4 - short phrase",
    "Weakness 5 - short phrase"
  ],
  "loveProfile": {
    "venusSign": "Sign name",
    "venusDescription": "2-3 sentences about Venus placement",
    "marsSign": "Sign name",
    "marsDescription": "2-3 sentences about Mars placement",
    "keyAspect": "Notable aspect description (e.g., 'Venus opposite Neptune – Dreamy romanticism and high ideals in love')",
    "romanticArchetype": "A title (e.g., 'The Devoted Dreamer')",
    "traits": [
      "Trait about romantic needs",
      "Trait about emotional safety",
      "Trait about love style"
    ]
  },
  "emotionalProfile": {
    "moonDescription": "2-3 sentences about Moon placement and emotional nature",
    "keyTrait": "A key emotional characteristic",
    "emotionalArchetype": "A title (e.g., 'The Ice Fortress')",
    "traits": [
      "How they build trust",
      "How they show care"
    ]
  },
  "vocationProfile": {
    "keyPlacements": "Description of career-relevant placements (Saturn, Uranus, Neptune, etc.)",
    "jupiterPlacement": "Jupiter sign and meaning",
    "northNode": "North Node sign and life path",
    "careerThemes": [
      "Career theme 1",
      "Career theme 2",
      "Career theme 3"
    ]
  },
  "shadowProfile": {
    "plutoSign": "Sign name",
    "plutoDescription": "2-3 sentences about Pluto placement",
    "lilithSign": "Sign name (if applicable)",
    "lilithDescription": "1-2 sentences about Lilith placement",
    "keyAspect": "Notable challenging aspect",
    "shadowArchetype": "A title (e.g., 'The Haunted Idealist')",
    "traits": [
      "Shadow trait 1",
      "Shadow trait 2",
      "Shadow trait 3"
    ]
  },
  "aestheticProfile": {
    "colors": ["Color 1", "Color 2", "Color 3"],
    "style": "Description of aesthetic style",
    "symbols": ["Symbol 1", "Symbol 2", "Symbol 3", "Symbol 4", "Symbol 5"],
    "playlistEnergy": "Description of music/vibe"
  },
  "signatureQuote": "A deeply personal quote that captures their essence, written in first person with quotation marks"
}

GUIDELINES:
1. Be accurate with astrological calculations based on the birth data
2. Make everything deeply personalized and specific to this individual
3. The archetype titles should be unique and evocative
4. The signature quote should feel like something they would actually say
5. All descriptions should be insightful and psychologically rich
6. Use poetic language but keep it grounded
7. The character sheet should feel like a mirror - deeply accurate to who they are`;

export async function POST(request: NextRequest) {
  try {
    const birthData: BirthData = await request.json();

    // Validate required fields
    if (!birthData.name || !birthData.birthDate || !birthData.birthTime || !birthData.birthCity || !birthData.birthCountry) {
      return NextResponse.json(
        { error: 'Missing required birth data fields' },
        { status: 400 }
      );
    }

    // Format birth location
    const birthLocation = birthData.birthState 
      ? `${birthData.birthCity}, ${birthData.birthState}, ${birthData.birthCountry}`
      : `${birthData.birthCity}, ${birthData.birthCountry}`;

    // Format the birth date for display
    const dateObj = new Date(birthData.birthDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Create the user prompt with birth data
    const userPrompt = `Generate a CHARACTER SHEET for:

Name: ${birthData.name}
Birth Date: ${formattedDate}
Birth Time: ${birthData.birthTime} (local time)
Birth Location: ${birthLocation}

Please calculate the accurate astrological placements for this birth data and create a deeply personalized character sheet. Remember to return ONLY valid JSON with no additional text or formatting.`;

    // Call OpenAI
    const response = await generateCompletion({
      messages: [
        { role: 'system', content: CHARACTER_SHEET_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 3000,
    });

    // Parse the response
    let characterSheetData;
    try {
      // Clean the response - remove any markdown code blocks if present
      let cleanedContent = response.content.trim();
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }
      characterSheetData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.content);
      return NextResponse.json(
        { error: 'Failed to parse character sheet data', raw: response.content },
        { status: 500 }
      );
    }

    // Add metadata
    const characterSheet = {
      id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: birthData.name,
      birthDate: birthData.birthDate,
      birthTime: birthData.birthTime,
      birthPlace: birthLocation,
      ...characterSheetData,
      privacySettings: {
        hideLocation: false,
        hideBirthTime: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, characterSheet });
  } catch (error) {
    console.error('Character sheet generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate character sheet', details: String(error) },
      { status: 500 }
    );
  }
}

