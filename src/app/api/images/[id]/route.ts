import { NextRequest, NextResponse } from 'next/server';
import { getImageFromNeon } from '@/lib/neon-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const imageData = await getImageFromNeon(id);
    
    // Convert base64 to buffer
    const buffer = Buffer.from(imageData.data, 'base64');
    
    // Return the image with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': imageData.mimeType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Image not found' },
      { status: 404 }
    );
  }
} 