import { db } from '@/lib/db';
import { imageStorage } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

// Function to create image storage table
export async function createImageStorageTable() {
  try {
    // This function is used for setup - the table is already created via Drizzle migrations
    // We'll just verify the table exists by doing a simple query
    await db.select().from(imageStorage).limit(1);
    return true;
  } catch (error) {
    console.error('Error creating image storage table:', error);
    throw new Error('Failed to create image storage table');
  }
}

// Function to upload image to Neon and get public URL
export async function uploadImageToNeon(imageFile: File): Promise<string> {
  try {
    const blob = await put(imageFile.name, imageFile, { access: 'public' });

    // Insert image data into Neon using Drizzle ORM
    await db.insert(imageStorage).values({
      imageData: blob.url, // Store the public URL
      mimeType: imageFile.type,
    });
    
    return blob.url;
  } catch (error) {
    console.error('Error uploading image to Neon:', error);
    throw new Error('Failed to upload image');
  }
}

// Function to get image from Neon storage
export async function getImageFromNeon(imageId: string): Promise<{ data: string; mimeType: string }> {
  try {
    const result = await db.select({
      imageData: imageStorage.imageData,
      mimeType: imageStorage.mimeType,
    })
    .from(imageStorage)
    .where(eq(imageStorage.id, imageId))
    .limit(1);
    
    if (result.length === 0) {
      throw new Error('Image not found');
    }
    
    return {
      data: result[0].imageData,
      mimeType: result[0].mimeType
    };
  } catch (error) {
    console.error('Error getting image from Neon:', error);
    throw new Error('Failed to get image');
  }
} 