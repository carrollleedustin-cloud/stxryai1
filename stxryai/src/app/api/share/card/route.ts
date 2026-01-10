/**
 * Share Card Generation API Route
 * Generates share cards server-side (optional - client-side generation is primary)
 */

import { NextRequest, NextResponse } from 'next/server';

// Note: For production, you might want to use a library like @vercel/og
// or canvas on the server. For now, this is a placeholder that returns
// instructions to use client-side generation.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, options } = body;

    // In production, you could use @vercel/og or node-canvas here
    // For now, return an error suggesting client-side generation
    return NextResponse.json(
      {
        error: 'Server-side share card generation not implemented',
        message: 'Please use client-side generation via shareCardService',
      },
      { status: 501 }
    );
  } catch (error: any) {
    console.error('Error generating share card:', error);
    return NextResponse.json(
      { error: 'Failed to generate share card', details: error.message },
      { status: 500 }
    );
  }
}
