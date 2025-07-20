import { NextRequest, NextResponse } from 'next/server';
import { LumaAI } from 'lumaai';
import { uploadImageToNeon } from '@/lib/neon-storage';
import { db } from '@/lib/db';
import { videos, users } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const client = new LumaAI({
  authToken: process.env.LUMAAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const effect = formData.get('effect') as string;
    let userId = formData.get('userId') as string;

    if (!imageFile || !effect) {
      return NextResponse.json(
        { error: 'Image and effect are required' },
        { status: 400 }
      );
    }

    // If no userId is provided, create a new temporary user
    if (!userId) {
      const newUser = await db.insert(users).values({
        email: `user_${uuidv4()}@example.com`,
        name: 'Anonymous User',
      }).returning();
      userId = newUser[0].id;
    } else {
      // Check if the user exists, if not create one
      const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userExists.length === 0) {
        const newUser = await db.insert(users).values({
          id: userId,
          email: `user_${userId}@example.com`,
          name: 'Anonymous User',
        }).returning();
        userId = newUser[0].id;
      }
    }

    // Upload image to Neon and get public URL
    const imageUrl = await uploadImageToNeon(imageFile);

    // Generate video using Luma AI with image-to-video
    const aiPrompt = effect === 'arcAroundObject' ? 'Create a video with a smooth camera arc/circular pan around the object from left to right' : `Transform this image with ${effect} effect`;

    const generation = await client.generations.create({
      model: "ray-1-6",
      prompt: aiPrompt,
      keyframes: {
        frame0: {
          type: "image",
          url: imageUrl
        }
      }
    });

    // Store video generation record in Neon database
    const videoRecord = await db.insert(videos).values({
      userId: userId,
      originalImageUrl: imageUrl,
      effect: effect,
      lumaGenerationId: generation.id,
      status: 'pending',
      aiPromptUsed: aiPrompt,
    }).returning();

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      videoId: videoRecord[0].id,
      message: 'Video generation started successfully'
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
} 