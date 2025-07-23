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
        id: uuidv4(),
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

    // Generate video using Luma AI with image-to-video - strict preservation prompts
    let aiPrompt: string;
    
    switch (effect) {
      case 'arcAroundObject':
        aiPrompt = 'CRITICAL: This is a camera movement only - do not change, add, or remove any objects, furniture, or room elements. Use the provided image as the exact starting frame. Create a smooth camera arc that moves around the existing room while keeping every single object (bed, couch, tables, decor) in exactly the same position. The room layout, furniture placement, and all objects must remain completely unchanged. Only the camera perspective should shift in a gentle arc motion, maintaining the same room and objects throughout.';
        break;
      case 'zoomIn':
        aiPrompt = 'CRITICAL: This is a camera movement only - do not change, add, or remove any objects, furniture, or room elements. Use the provided image as the exact starting frame. Create a smooth camera zoom-in movement while keeping every single object (bed, couch, tables, decor) in exactly the same position. The room layout, furniture placement, and all objects must remain completely unchanged. Only the camera should move closer to the scene, maintaining the same room and objects throughout.';
        break;
      case 'zoomOut':
        aiPrompt = 'CRITICAL: This is a camera movement only - do not change, add, or remove any objects, furniture, or room elements. Use the provided image as the exact starting frame. Create a smooth camera zoom-out movement while keeping every single object (bed, couch, tables, decor) in exactly the same position. The room layout, furniture placement, and all objects must remain completely unchanged. Only the camera should move further from the scene, maintaining the same room and objects throughout.';
        break;
      default:
        aiPrompt = `Use the provided image as the exact starting frame. Create a ${effect} camera movement while preserving every object, furniture piece, and room element exactly as shown. Do not modify, add, or remove anything from the original scene.`;
    }

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