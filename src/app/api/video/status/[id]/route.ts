import { NextRequest, NextResponse } from 'next/server';
import LumaAI from 'lumaai';
import { db } from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const client = new LumaAI({
  authToken: process.env.LUMAAI_API_KEY,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      );
    }

    // Get generation status from Luma AI
    const generation = await client.generations.get(id);

    console.log('Luma AI Generation Status:', JSON.stringify(generation, null, 2));

    // Update the video record in Neon database
    await db.update(videos)
      .set({
        status: generation.state,
        generatedVideoUrl: generation.assets?.video,
      })
      .where(eq(videos.lumaGenerationId, id));

    return NextResponse.json({
      id: generation.id,
      status: generation.state,
      videoUrl: generation.assets?.video,
    });

  } catch (error) {
    console.error('Status check error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
} 